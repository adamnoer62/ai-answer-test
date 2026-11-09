import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "sesi";
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes()
  )}${pad(d.getSeconds())}`;
}

function toMarkdown(session) {
  const lines = [];
  lines.push(`# Diskusi AI: ${session.prompt}`);
  lines.push("");
  lines.push(`- Tanggal: ${new Date(session.createdAt).toLocaleString("id-ID")}`);
  lines.push(`- Peserta: ${session.participants.map((p) => p.label).join(", ")}`);
  lines.push(`- Juri: ${session.judge.label}`);
  lines.push(`- Ronde: ${session.rounds.length}${session.stoppedEarly ? " (berhenti lebih awal)" : ""}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  session.rounds.forEach((round, i) => {
    lines.push(`## Ronde ${i + 1}`);
    lines.push("");
    for (const entry of round.entries) {
      lines.push(`### [${entry.label}]`);
      lines.push("");
      lines.push(entry.ok ? entry.text : `_${entry.text}_`);
      lines.push("");
    }
  });

  if (session.verdict) {
    lines.push("---");
    lines.push("");
    lines.push("## Kesimpulan Juri");
    lines.push("");
    if (session.verdict.summaries?.length) {
      lines.push("### Ringkasan Posisi");
      for (const s of session.verdict.summaries) lines.push(`- **${s.model}:** ${s.position}`);
      lines.push("");
    }
    if (session.verdict.agreements?.length) {
      lines.push("### Poin Disepakati");
      for (const a of session.verdict.agreements) lines.push(`- ${a}`);
      lines.push("");
    }
    if (session.verdict.disagreements?.length) {
      lines.push("### Poin Diperdebatkan");
      for (const d of session.verdict.disagreements) lines.push(`- **${d.point}** — ${d.reason}`);
      lines.push("");
    }
    if (session.verdict.recommendation) {
      lines.push("### Rekomendasi Akhir");
      lines.push(session.verdict.recommendation);
      lines.push("");
    }
    if (session.verdict.scores?.length) {
      lines.push("### Skor");
      lines.push("| Model | Akurasi | Kedalaman | Relevansi | Catatan |");
      lines.push("|---|---|---|---|---|");
      for (const s of session.verdict.scores) {
        lines.push(`| ${s.model} | ${s.accuracy ?? "-"} | ${s.depth ?? "-"} | ${s.relevance ?? "-"} | ${s.notes ?? ""} |`);
      }
      lines.push("");
    }
    if (session.verdict.raw && !session.verdict.summaries?.length) {
      lines.push(session.verdict.raw);
    }
  }

  return lines.join("\n");
}

export async function saveTranscript(session, transcriptDir) {
  await mkdir(transcriptDir, { recursive: true });
  const base = `${timestamp()}-${slugify(session.prompt)}`;
  const mdPath = path.join(transcriptDir, `${base}.md`);
  const jsonPath = path.join(transcriptDir, `${base}.json`);
  await writeFile(mdPath, toMarkdown(session), "utf8");
  await writeFile(jsonPath, JSON.stringify(session, null, 2), "utf8");
  return { mdPath, jsonPath };
}
