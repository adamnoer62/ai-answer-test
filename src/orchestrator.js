import { EventEmitter } from "node:events";
import crypto from "node:crypto";
import { runModel } from "./runner.js";
import { roundSimilarity } from "./similarity.js";
import { saveTranscript } from "./store.js";

export const sessions = new Map();

function formatHistory(rounds) {
  const lines = [];
  rounds.forEach((round, i) => {
    lines.push(`--- Ronde ${i + 1} ---`);
    for (const entry of round.entries) {
      lines.push(`[${entry.label}]: ${entry.text}`);
    }
  });
  return lines.join("\n\n");
}

function dbToolHint() {
  return [
    "Kamu punya akses ke tool MCP read-only bernama \"wrapstation-db\" (list_tables, describe_table, query) yang tersambung ke database bisnis nyata Wrapstation (penjualan, produk, customer, booking, dll).",
    "Kalau topik diskusi menyangkut data/angka/prediksi bisnis, PAKAI tool itu untuk mengambil data nyata dan dasarkan jawabanmu pada data tersebut, bukan tebakan. Kalau topiknya tidak berkaitan dengan data bisnis, abaikan saja tool ini.",
    "",
  ];
}

function personaBlock(participant) {
  if (!participant.persona) return [];
  return [
    `PERAN KHUSUS kamu di diskusi ini: ${participant.persona}`,
    "Jawab selalu dari sudut pandang peran ini secara konsisten di setiap ronde, walaupun tetap jujur dan berbasis argumen yang masuk akal.",
    "",
  ];
}

function buildParticipantPrompt(topic, rounds, participant) {
  if (rounds.length === 0) {
    return [
      `Topik diskusi: "${topic}"`,
      "",
      ...dbToolHint(),
      ...personaBlock(participant),
      `Kamu adalah "${participant.label}", salah satu peserta diskusi multi-AI.`,
      "Berikan posisi awalmu terhadap topik ini secara jelas dan ringkas (maksimal beberapa paragraf).",
      "Jangan cuma menyimpulkan, ambil sikap yang konkret dan berikan alasannya.",
    ].join("\n");
  }
  return [
    `Topik diskusi: "${topic}"`,
    "",
    "Berikut transkrip diskusi sejauh ini antar beberapa AI:",
    "",
    formatHistory(rounds),
    "",
    ...dbToolHint(),
    ...personaBlock(participant),
    `Kamu adalah "${participant.label}". Baca seluruh histori di atas, lalu berikan tanggapan ronde barumu.`,
    "Instruksi penting:",
    "- JANGAN cuma bilang \"setuju\" atau mengulang poin yang sudah ada.",
    "- Kritik, koreksi, atau tambahkan perspektif/informasi baru yang belum dibahas.",
    "- Kalau kamu memang setuju pada satu poin, jelaskan kenapa dengan argumen tambahan, atau persempit ke sub-poin yang masih bisa diperdebatkan.",
    "- Tetap ringkas dan langsung ke inti.",
  ].join("\n");
}

function buildJudgePrompt(topic, rounds, participants) {
  const schema = `{
  "summaries": [ { "model": "Nama Model", "position": "ringkasan posisi utamanya" } ],
  "agreements": ["poin yang disepakati semua peserta"],
  "disagreements": [ { "point": "poin yang diperdebatkan", "reason": "kenapa mereka beda pendapat" } ],
  "recommendation": "rekomendasi/jawaban akhir menurut kamu sebagai juri",
  "scores": [ { "model": "Nama Model", "accuracy": 1-10, "depth": 1-10, "relevance": 1-10, "notes": "catatan singkat" } ]
}`;
  return [
    "PERAN: Kamu BUKAN peserta diskusi. Tugasmu murni menganalisis dan menyimpulkan diskusi berikut secara netral dan objektif.",
    ...dbToolHint(),
    `Topik: "${topic}"`,
    `Peserta diskusi: ${participants.map((p) => p.label).join(", ")}.`,
    "",
    "Transkrip lengkap diskusi:",
    "",
    formatHistory(rounds),
    "",
    "Analisis transkrip di atas lalu keluarkan HANYA satu objek JSON valid (tanpa markdown fence, tanpa teks lain sebelum/sesudahnya) dengan skema persis berikut:",
    schema,
    "",
    "Ketentuan:",
    "- summaries: satu entri per peserta, ringkas posisi utamanya secara netral.",
    "- agreements: poin-poin yang benar-benar disepakati oleh SEMUA peserta.",
    "- disagreements: poin yang masih diperdebatkan beserta alasan perbedaan pendapatnya.",
    "- recommendation: jawaban/rekomendasi akhir terbaik menurut analisismu, boleh berbeda dari semua peserta kalau perlu.",
    "- scores: rubric 1-10 untuk akurasi, kedalaman, relevansi tiap peserta, netral dan berbasis bukti dari transkrip.",
    "- Jangan memihak satu model karena namanya; nilai murni dari isi argumennya.",
  ].join("\n");
}

function parseVerdict(rawText) {
  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  let parsed = tryParse(rawText.trim());
  if (!parsed) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) parsed = tryParse(match[0]);
  }
  if (!parsed) return { raw: rawText };
  return parsed;
}

function emit(session, type, data) {
  const event = { type, data, ts: Date.now() };
  session.log.push(event);
  session.bus.emit("event", event);
}

export function createSession({ prompt, rounds, participants, judge, settings }) {
  const id = crypto.randomUUID();
  const session = {
    id,
    prompt,
    createdAt: Date.now(),
    maxRounds: rounds,
    participants,
    judge,
    rounds: [],
    verdict: null,
    stoppedEarly: false,
    status: "pending",
    log: [],
    bus: new EventEmitter(),
    settings,
  };
  session.bus.setMaxListeners(50);
  sessions.set(id, session);
  return session;
}

export async function runSession(session) {
  session.status = "running";
  const brief = (p) => ({
    id: p.id,
    label: p.label,
    color: p.color,
    colorDark: p.colorDark,
    provider: p.provider,
    modelVariant: p.modelVariant,
    persona: p.persona,
  });
  emit(session, "session-start", {
    prompt: session.prompt,
    participants: session.participants.map(brief),
    judge: brief(session.judge),
    maxRounds: session.maxRounds,
  });

  const { agreementThreshold, agreementStreakToStop, timeoutMs } = session.settings;
  let similarStreak = 0;

  try {
    for (let r = 0; r < session.maxRounds; r++) {
      emit(session, "round-start", { round: r + 1 });
      const round = { entries: [] };

      const results = await Promise.all(
        session.participants.map(async (participant) => {
          emit(session, "participant-start", { round: r + 1, id: participant.id, label: participant.label });
          const prompt = buildParticipantPrompt(session.prompt, session.rounds, participant);
          const result = await runModel(participant, prompt, { timeoutMs });
          const entry = {
            id: participant.id,
            label: participant.label,
            color: participant.color,
            colorDark: participant.colorDark,
            ok: result.ok,
            text: result.text,
            durationMs: result.durationMs,
          };
          emit(session, "participant-done", { round: r + 1, ...entry });
          return entry;
        })
      );

      round.entries = results;
      session.rounds.push(round);
      emit(session, "round-end", { round: r + 1, entries: results });

      if (session.rounds.length >= 2) {
        const prev = {};
        const curr = {};
        for (const e of session.rounds[session.rounds.length - 2].entries) prev[e.id] = e;
        for (const e of round.entries) curr[e.id] = e;
        const sim = roundSimilarity(prev, curr);
        if (sim >= agreementThreshold) {
          similarStreak++;
        } else {
          similarStreak = 0;
        }
        emit(session, "similarity", { round: r + 1, score: sim, streak: similarStreak });
        if (similarStreak >= agreementStreakToStop) {
          session.stoppedEarly = true;
          emit(session, "stopped-early", {
            round: r + 1,
            reason: "Jawaban antar model terlalu mirip beberapa ronde berturut-turut (agreement loop).",
          });
          break;
        }
      }
    }

    emit(session, "judge-start", { label: session.judge.label });
    const judgePrompt = buildJudgePrompt(session.prompt, session.rounds, session.participants);
    const judgeResult = await runModel(session.judge, judgePrompt, { timeoutMs });

    if (judgeResult.ok) {
      session.verdict = parseVerdict(judgeResult.text);
    } else {
      session.verdict = { raw: judgeResult.text };
    }
    emit(session, "judge-done", { ok: judgeResult.ok, verdict: session.verdict });

    const { mdPath, jsonPath } = await saveTranscript(session, session.settings.transcriptDir);
    session.transcript = { mdPath, jsonPath };
    session.status = "done";
    emit(session, "session-done", { transcript: session.transcript, verdict: session.verdict, stoppedEarly: session.stoppedEarly });
  } catch (err) {
    session.status = "error";
    emit(session, "session-error", { message: err.message });
  }
}
