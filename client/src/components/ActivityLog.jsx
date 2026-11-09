import { useEffect, useRef } from "react";
import { Gavel } from "lucide-react";

function initials(label) {
  const parts = label.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function timeNow() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// Turns the arena's round/liveEntries state into a flat, chronological,
// Slack-style activity feed. Each participant gets ONE line per round that
// updates in place (pulsing while "thinking" -> final snippet once "done"),
// instead of separate start/done lines — that's the real granularity our
// SSE stream gives us.
function useTimestamps() {
  const seenRef = useRef(new Map());
  return (key) => {
    if (!seenRef.current.has(key)) seenRef.current.set(key, timeNow());
    return seenRef.current.get(key);
  };
}

export default function ActivityLog({
  rounds,
  liveEntries,
  currentRound,
  maxRounds,
  judgeThinking,
  judgeLabel,
  stoppedEarly,
  errorMessage,
}) {
  const stampFor = useTimestamps();
  const scrollRef = useRef(null);

  const lines = [];
  const roundsToRender = [...rounds.map((r, i) => ({ round: i + 1, entries: r.entries, live: false }))];
  if (currentRound > rounds.length && liveEntries.length > 0) {
    roundsToRender.push({ round: currentRound, entries: liveEntries, live: true });
  }

  for (const r of roundsToRender) {
    lines.push({ kind: "round", key: `round-${r.round}`, round: r.round });
    for (const entry of r.entries) {
      const key = `${r.round}-${entry.id}`;
      lines.push({
        kind: "entry",
        key,
        ts: stampFor(key),
        label: entry.label,
        color: entry.color,
        status: entry.status || "done",
        ok: entry.ok,
        text: entry.text,
      });
    }
  }

  if (judgeThinking) {
    lines.push({ kind: "judge", key: "judge", ts: stampFor("judge"), label: judgeLabel });
  }
  if (stoppedEarly) {
    lines.push({ kind: "system", key: "stopped", text: "Diskusi dihentikan lebih awal — jawaban mulai berulang (agreement loop)." });
  }
  if (errorMessage) {
    lines.push({ kind: "system", key: "error", text: `Error: ${errorMessage}`, danger: true });
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines.length, judgeThinking]);

  return (
    <div className="activity-log">
      <div className="activity-log__head">
        <span>AKTIVITAS</span>
        <span className="activity-log__round">
          Ronde {Math.min(currentRound, maxRounds) || 0}/{maxRounds}
        </span>
      </div>
      <div className="activity-log__body" ref={scrollRef}>
        {lines.map((line) => {
          if (line.kind === "round") {
            return (
              <div className="log-divider" key={line.key}>
                Ronde {line.round}
              </div>
            );
          }
          if (line.kind === "judge") {
            return (
              <div className="log-entry" key={line.key}>
                <div className="log-entry__avatar log-entry__avatar--judge">
                  <Gavel size={13} />
                </div>
                <div className="log-entry__body">
                  <div className="log-entry__meta">
                    <span className="log-entry__name">{line.label || "Juri"}</span>
                    <span className="log-entry__time">{line.ts}</span>
                  </div>
                  <p className="log-entry__text is-pulsing">membaca transkrip &amp; menyusun kesimpulan…</p>
                </div>
              </div>
            );
          }
          if (line.kind === "system") {
            return (
              <div className={`log-system${line.danger ? " is-danger" : ""}`} key={line.key}>
                {line.text}
              </div>
            );
          }
          const thinking = line.status === "thinking";
          const failed = line.status === "done" && line.ok === false;
          const snippet = line.text ? (line.text.length > 140 ? line.text.slice(0, 140) + "…" : line.text) : "";
          return (
            <div className="log-entry" key={line.key}>
              <div className="log-entry__avatar" style={{ background: line.color }}>
                {initials(line.label)}
              </div>
              <div className="log-entry__body">
                <div className="log-entry__meta">
                  <span className="log-entry__name" style={{ color: line.color }}>{line.label}</span>
                  <span className="log-entry__time">{line.ts}</span>
                </div>
                {thinking && <p className="log-entry__text is-pulsing">sedang menjawab…</p>}
                {!thinking && failed && <p className="log-entry__text log-entry__text--danger">gagal merespons</p>}
                {!thinking && !failed && <p className="log-entry__text">{snippet}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
