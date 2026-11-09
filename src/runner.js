import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import crypto from "node:crypto";

function buildArgs(template, prompt, outFile) {
  return template.map((token) => {
    if (token === "{PROMPT}") return prompt;
    if (token === "{OUTFILE}") return outFile;
    return token;
  });
}

function readPath(obj, dotted) {
  if (!dotted) return undefined;
  return dotted.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

/**
 * Runs one model's CLI on a prompt and normalizes the result.
 * Never throws - failures come back as { ok: false, text: "[no response] ..." }
 * so one dead provider never takes down a round.
 */
export async function runModel(model, prompt, { cwd, timeoutMs, signal } = {}) {
  const started = Date.now();
  let outFile = null;
  let workDir = cwd;
  let cleanupWorkDir = false;

  if (!workDir) {
    workDir = await mkdtemp(path.join(tmpdir(), "arena-"));
    cleanupWorkDir = true;
  }

  if (model.output.type === "last-message-file") {
    outFile = path.join(workDir, `last-${crypto.randomUUID()}.txt`);
  }

  const args = buildArgs(model.args, prompt, outFile);

  try {
    const { stdout, stderr, code, timedOut, errorMessage } = await execCapture(model.command, args, {
      cwd: workDir,
      timeoutMs: timeoutMs ?? 300000,
      signal,
    });

    if (errorMessage) {
      return {
        ok: false,
        text: `[no response] ${model.label} gagal dijalankan: ${errorMessage}`,
        raw: stdout,
        durationMs: Date.now() - started,
      };
    }

    if (timedOut) {
      return {
        ok: false,
        text: `[no response] ${model.label} timed out setelah ${Math.round((timeoutMs ?? 300000) / 1000)}s.`,
        raw: stdout,
        durationMs: Date.now() - started,
      };
    }

    if (code !== 0 && model.output.type !== "last-message-file") {
      return {
        ok: false,
        text: `[no response] ${model.label} keluar dengan kode ${code}. ${stderr.slice(0, 400)}`.trim(),
        raw: stdout,
        durationMs: Date.now() - started,
      };
    }

    if (model.output.type === "json") {
      let parsed;
      try {
        parsed = JSON.parse(stdout.trim());
      } catch {
        return {
          ok: false,
          text: `[no response] ${model.label} tidak mengembalikan JSON valid.`,
          raw: stdout,
          durationMs: Date.now() - started,
        };
      }
      // Check text FIRST: a CLI can report a non-success status (e.g. one MCP tool
      // call among several hit a transient error) yet still recover within the same
      // turn and produce a perfectly good final answer. Only treat status/errorFlag
      // as disqualifying when there's no usable text to fall back on - otherwise a
      // good answer gets thrown away over a cosmetic status flag.
      const text = readPath(parsed, model.output.textPath);
      if (text && String(text).trim()) {
        return {
          ok: true,
          text: String(text).trim(),
          usage: parsed.usage ?? null,
          durationMs: Date.now() - started,
        };
      }
      if (model.output.statusPath && model.output.okStatus) {
        const status = readPath(parsed, model.output.statusPath);
        if (status !== model.output.okStatus) {
          return {
            ok: false,
            text: `[no response] ${model.label} status: ${status ?? "unknown"}.`,
            raw: stdout,
            durationMs: Date.now() - started,
          };
        }
      }
      if (model.output.errorFlagPath && readPath(parsed, model.output.errorFlagPath)) {
        return {
          ok: false,
          text: `[no response] ${model.label} melaporkan error.`,
          raw: stdout,
          durationMs: Date.now() - started,
        };
      }
      return {
        ok: false,
        text: `[no response] ${model.label} memberi jawaban kosong.`,
        raw: stdout,
        durationMs: Date.now() - started,
      };
    }

    if (model.output.type === "last-message-file") {
      let fileText = "";
      try {
        fileText = (await readFile(outFile, "utf8")).trim();
      } catch {
        fileText = "";
      }
      if (!fileText) {
        return {
          ok: false,
          text: `[no response] ${model.label} tidak menghasilkan output.`,
          raw: stdout,
          durationMs: Date.now() - started,
        };
      }
      return { ok: true, text: fileText, usage: null, durationMs: Date.now() - started };
    }

    return { ok: true, text: stdout.trim(), usage: null, durationMs: Date.now() - started };
  } catch (err) {
    return {
      ok: false,
      text: `[no response] ${model.label} gagal dijalankan: ${err.message}`,
      raw: "",
      durationMs: Date.now() - started,
    };
  } finally {
    if (outFile) {
      await rm(outFile, { force: true }).catch(() => {});
    }
    if (cleanupWorkDir) {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

function killTree(child) {
  // Some CLIs (agy, in particular) spawn their own MCP-server subprocess. If we only
  // kill the direct child, that grandchild can be left holding our stdout/stderr
  // pipes open, and Node's 'close' event then never fires - the call hangs forever
  // even though the model process is long dead. `detached: true` puts the child in
  // its own process group, so a negative-pid kill reaches the whole tree.
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

function execCapture(command, args, { cwd, timeoutMs, signal }) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
      detached: true,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(forceTimer);
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve(result);
    };

    // Hard backstop: even if killing the process tree somehow fails to make the
    // 'close' event fire, never keep a round waiting past timeoutMs by more than
    // a few seconds.
    let forceTimer = null;

    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
      forceTimer = setTimeout(() => finish({ stdout, stderr, code: null, timedOut: true }), 5000);
    }, timeoutMs);

    const onAbort = () => {
      killTree(child);
    };
    if (signal) signal.addEventListener("abort", onAbort, { once: true });

    child.stdin.end();

    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8");
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8");
    });

    child.on("error", (err) => {
      finish({ stdout, stderr, code: null, timedOut, errorMessage: err.message });
    });

    // Some CLIs (agy, notably) spawn their own MCP-server subprocess without
    // giving it fully independent stdio, so that grandchild can outlive the CLI
    // itself and keep holding our stdout/stderr pipes open. Node's 'close' event
    // waits for those pipes to fully drain, so it can hang forever even though
    // our direct child is long gone. 'exit' fires as soon as *our* child
    // terminates, regardless of what its own children are still doing - wait one
    // tick after that for any already-buffered output, then finalize on 'exit'
    // rather than risking 'close' never arriving. 'close' is still the resolve
    // path in the common case where it arrives first.
    child.on("exit", (code) => {
      // Best-effort cleanup of any grandchild (e.g. an MCP-server subprocess) left
      // behind in the same process group, so they don't pile up as orphans.
      killTree(child);
      setImmediate(() => finish({ stdout, stderr, code, timedOut }));
    });

    child.on("close", (code) => {
      finish({ stdout, stderr, code, timedOut });
    });
  });
}
