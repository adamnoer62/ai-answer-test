import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSession, runSession, sessions } from "./src/orchestrator.js";
import { resolveModel, serializeEntry } from "./src/model-resolver.js";
import { loadCustomModels, addCustomModel, upsertCustomModel, deleteCustomModel } from "./src/custom-models-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4173;

let CONFIG = null;
async function loadConfig() {
  const raw = await readFile(path.join(__dirname, "config.json"), "utf8");
  CONFIG = JSON.parse(raw);
}
await loadConfig();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function serveStatic(req, res, urlPath) {
  const rel = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.join(__dirname, "public", rel);
  if (!filePath.startsWith(path.join(__dirname, "public"))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function allEntries() {
  const custom = await loadCustomModels();
  const overridesById = new Map(custom.map((c) => [c.id, c]));
  const builtins = CONFIG.models.map((b) => {
    const override = overridesById.get(b.id);
    return override ? { ...b, ...override, id: b.id, engineId: b.engineId, builtin: true } : b;
  });
  const customOnly = custom.filter((c) => !CONFIG.models.some((b) => b.id === c.id));
  return [...builtins, ...customOnly];
}

async function pickModel(id) {
  const entries = await allEntries();
  const entry = entries.find((m) => m.id === id);
  return entry ? resolveModel(entry, CONFIG.engines) : null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === "/api/config" && req.method === "GET") {
      const entries = await allEntries();
      return json(res, 200, {
        settings: CONFIG.settings,
        defaultParticipantIds: CONFIG.defaultParticipantIds,
        defaultJudgeId: CONFIG.defaultJudgeId,
        palette: CONFIG.palette,
        engines: CONFIG.engines.map((e) => ({ id: e.id, engineLabel: e.engineLabel, suggestedModels: e.suggestedModels })),
        models: entries.map((e) => serializeEntry(e, CONFIG.engines)),
      });
    }

    if (url.pathname === "/api/models" && req.method === "POST") {
      const body = await readBody(req);
      const label = String(body.label || "").trim();
      const engineId = String(body.engineId || "").trim();
      if (!label) return json(res, 400, { error: "Nama agent wajib diisi." });
      if (!CONFIG.engines.some((e) => e.id === engineId)) return json(res, 400, { error: "Mesin dasar tidak valid." });

      const entry = await addCustomModel({
        label,
        engineId,
        modelVariant: body.modelVariant,
        persona: body.persona,
        color: body.color,
        colorDark: body.colorDark,
      });
      return json(res, 200, { model: serializeEntry(entry, CONFIG.engines) });
    }

    const modelIdMatch = url.pathname.match(/^\/api\/models\/([^/]+)$/);
    if (modelIdMatch && req.method === "PATCH") {
      const id = modelIdMatch[1];
      const isBuiltin = CONFIG.models.some((m) => m.id === id);
      const entries = await allEntries();
      if (!entries.some((m) => m.id === id)) return json(res, 404, { error: "Agent tidak ditemukan." });

      const body = await readBody(req);
      const patch = {};
      if (body.label !== undefined) {
        const label = String(body.label || "").trim();
        if (!label) return json(res, 400, { error: "Nama agent wajib diisi." });
        patch.label = label;
      }
      if (body.modelVariant !== undefined) patch.modelVariant = body.modelVariant;
      if (body.persona !== undefined) patch.persona = body.persona;
      if (body.color !== undefined) patch.color = body.color;
      if (body.colorDark !== undefined) patch.colorDark = body.colorDark;
      if (!isBuiltin && body.engineId !== undefined) {
        if (!CONFIG.engines.some((e) => e.id === body.engineId)) return json(res, 400, { error: "Mesin dasar tidak valid." });
        patch.engineId = body.engineId;
        patch.builtin = false;
      }

      await upsertCustomModel(id, patch);
      const updated = (await allEntries()).find((m) => m.id === id);
      return json(res, 200, { model: serializeEntry(updated, CONFIG.engines) });
    }

    if (modelIdMatch && req.method === "DELETE") {
      const id = modelIdMatch[1];
      if (CONFIG.models.some((m) => m.id === id)) {
        return json(res, 400, { error: "Model bawaan tidak bisa dihapus." });
      }
      const removed = await deleteCustomModel(id);
      if (!removed) return json(res, 404, { error: "Agent tidak ditemukan." });
      return json(res, 200, { ok: true });
    }

    if (url.pathname === "/api/session" && req.method === "POST") {
      const body = await readBody(req);
      const prompt = String(body.prompt || "").trim();
      if (!prompt) return json(res, 400, { error: "Prompt kosong." });

      const participantIds = Array.isArray(body.participantIds) && body.participantIds.length
        ? body.participantIds
        : CONFIG.defaultParticipantIds;
      const judgeId = body.judgeId || CONFIG.defaultJudgeId;

      const participants = (await Promise.all(participantIds.map(pickModel))).filter(Boolean);
      const judge = await pickModel(judgeId);

      if (participants.length < 2) return json(res, 400, { error: "Minimal 2 peserta diskusi." });
      if (!judge) return json(res, 400, { error: "Juri tidak valid." });

      const rounds = Math.min(
        Math.max(parseInt(body.rounds, 10) || CONFIG.settings.defaultRounds, CONFIG.settings.minRounds),
        CONFIG.settings.maxRounds
      );

      const session = createSession({ prompt, rounds, participants, judge, settings: CONFIG.settings });
      runSession(session).catch((err) => {
        session.status = "error";
        session.bus.emit("event", { type: "session-error", data: { message: err.message }, ts: Date.now() });
      });

      return json(res, 200, { sessionId: session.id });
    }

    const streamMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/stream$/);
    if (streamMatch && req.method === "GET") {
      const session = sessions.get(streamMatch[1]);
      if (!session) {
        res.writeHead(404);
        return res.end("Session not found");
      }
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(":ok\n\n");

      for (const event of session.log) {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
      }
      if (session.status === "done" || session.status === "error") {
        res.write(`event: stream-end\ndata: {}\n\n`);
        return res.end();
      }

      const onEvent = (event) => {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
        if (event.type === "session-done" || event.type === "session-error") {
          res.write(`event: stream-end\ndata: {}\n\n`);
          cleanup();
          res.end();
        }
      };
      const heartbeat = setInterval(() => res.write(":hb\n\n"), 15000);
      const cleanup = () => {
        clearInterval(heartbeat);
        session.bus.off("event", onEvent);
      };
      session.bus.on("event", onEvent);
      req.on("close", cleanup);
      return;
    }

    const downloadMatch = url.pathname.match(/^\/api\/session\/([^/]+)\/transcript\.(md|json)$/);
    if (downloadMatch && req.method === "GET") {
      const session = sessions.get(downloadMatch[1]);
      const ext = downloadMatch[2];
      if (!session || !session.transcript) return json(res, 404, { error: "Transkrip belum tersedia." });
      const filePath = ext === "md" ? session.transcript.mdPath : session.transcript.jsonPath;
      const data = await readFile(filePath);
      res.writeHead(200, {
        "Content-Type": ext === "md" ? "text/markdown; charset=utf-8" : "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
      });
      return res.end(data);
    }

    const sessionMatch = url.pathname.match(/^\/api\/session\/([^/]+)$/);
    if (sessionMatch && req.method === "GET") {
      const session = sessions.get(sessionMatch[1]);
      if (!session) return json(res, 404, { error: "Not found" });
      return json(res, 200, {
        id: session.id,
        status: session.status,
        prompt: session.prompt,
        rounds: session.rounds,
        verdict: session.verdict,
        stoppedEarly: session.stoppedEarly,
        transcript: session.transcript || null,
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return json(res, 404, { error: "Unknown endpoint" });
    }

    return serveStatic(req, res, url.pathname);
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n  Orchestrator jalan di http://localhost:${PORT}\n`);
});
