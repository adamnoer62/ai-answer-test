import { motion } from "framer-motion";
import { Trophy, MessagesSquare, CircleCheckBig, Check, Swords, Flag, FileText, FileDown, Braces, RotateCcw } from "lucide-react";
import { initials, mdLite } from "../utils.js";
import { useLottieData } from "../useLottieData.js";
import LottiePlayer from "./LottiePlayer.jsx";

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

function colorFor(participantsByLabel, label) {
  return participantsByLabel[label]?.color || "#1CB0F6";
}

function Leaderboard({ scores, participantsByLabel }) {
  const ranked = scores
    .map((s) => ({ ...s, total: (s.accuracy || 0) + (s.depth || 0) + (s.relevance || 0) }))
    .sort((a, b) => b.total - a.total);

  return (
    <motion.div className="vcard vcard--leaderboard" {...cardMotion} transition={{ delay: 0.05 }}>
      <h2>
        <Trophy size={19} />
        Ranking Jawaban
      </h2>
      <div className="lb-list">
        {ranked.map((s, i) => {
          const c = colorFor(participantsByLabel, s.model);
          const pct = Math.round((s.total / 30) * 100);
          return (
            <div className="lb-row" data-rank={i + 1} key={s.model}>
              <div className="lb-rank">{i + 1}</div>
              <div className="lb-avatar" style={{ background: c }}>
                {initials(s.model)}
              </div>
              <div className="lb-body">
                <div className="lb-name">{s.model}</div>
                <div className="lb-bar-track">
                  <motion.div
                    className="lb-bar-fill"
                    style={{ background: c }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="lb-score">
                {s.total}
                <span style={{ fontSize: ".65rem", color: "var(--ink-faint)" }}>/30</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function VerdictView({ verdict, stoppedEarly, participantsByLabel, onDownloadMd, onDownloadJson, onRestart }) {
  const hasStructured = verdict && (verdict.summaries || verdict.agreements || verdict.disagreements || verdict.recommendation);
  const confettiAnim = useLottieData(() => import("../assets/lottie/trophy-confetti.json"));

  return (
    <motion.section className="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="verdict-hero">
        <div className="verdict-hero__badge-wrap">
          <LottiePlayer animationData={confettiAnim} loop={false} size={220} className="verdict-hero__confetti" />
          <motion.div
            className="verdict-hero__badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
          >
            <Trophy />
          </motion.div>
        </div>
        <h1>Diskusi Selesai</h1>
        <p>
          {stoppedEarly
            ? "Diskusi berhenti lebih awal karena semua model mulai sepakat — juri tetap membaca seluruh transkrip dan meranking jawabannya."
            : "Ini ranking dan kesimpulan dari juri setelah membaca seluruh transkrip."}
        </p>
      </div>

      <div className="verdict-grid">
        {!hasStructured && (
          <motion.div className="vcard vcard--raw" {...cardMotion}>
            <h2>
              <FileText size={19} />
              Kesimpulan Juri
            </h2>
            <pre>{verdict?.raw || "Tidak ada kesimpulan yang bisa diparsing."}</pre>
          </motion.div>
        )}

        {verdict?.scores?.length > 0 && <Leaderboard scores={verdict.scores} participantsByLabel={participantsByLabel} />}

        {verdict?.summaries?.length > 0 && (
          <motion.div className="vcard vcard--summaries" {...cardMotion} transition={{ delay: 0.1 }}>
            <h2>
              <MessagesSquare size={19} />
              Ringkasan Posisi
            </h2>
            {verdict.summaries.map((s) => (
              <div className="summary-item" key={s.model}>
                <div className="summary-item__avatar" style={{ background: colorFor(participantsByLabel, s.model) }}>
                  {initials(s.model)}
                </div>
                <div>
                  <div className="summary-item__label">{s.model}</div>
                  <div className="summary-item__text" dangerouslySetInnerHTML={{ __html: mdLite(s.position) }} />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {verdict?.agreements?.length > 0 && (
          <motion.div className="vcard vcard--agree" {...cardMotion} transition={{ delay: 0.15 }}>
            <h2>
              <CircleCheckBig size={19} />
              Poin Disepakati
            </h2>
            <ul className="check-list">
              {verdict.agreements.map((a, i) => (
                <li key={i}>
                  <Check size={16} />
                  <span dangerouslySetInnerHTML={{ __html: mdLite(a) }} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {verdict?.disagreements?.length > 0 && (
          <motion.div className="vcard vcard--disagree" {...cardMotion} transition={{ delay: 0.2 }}>
            <h2>
              <Swords size={19} />
              Poin Diperdebatkan
            </h2>
            {verdict.disagreements.map((d, i) => (
              <div className="disagree-item" key={i}>
                <div className="disagree-item__point" dangerouslySetInnerHTML={{ __html: mdLite(d.point) }} />
                <div className="disagree-item__reason" dangerouslySetInnerHTML={{ __html: mdLite(d.reason) }} />
              </div>
            ))}
          </motion.div>
        )}

        {verdict?.recommendation && (
          <motion.div className="vcard vcard--recommend" {...cardMotion} transition={{ delay: 0.25 }}>
            <h2>
              <Flag size={19} />
              Rekomendasi Akhir
            </h2>
            <p dangerouslySetInnerHTML={{ __html: mdLite(verdict.recommendation) }} />
          </motion.div>
        )}
      </div>

      <div className="verdict-actions">
        <button className="btn-3d btn-3d--blue" onClick={onDownloadMd}>
          <FileDown size={16} />
          Unduh Transkrip
        </button>
        <button className="btn-3d btn-3d--ghost" onClick={onDownloadJson}>
          <Braces size={16} />
          Unduh JSON
        </button>
        <button className="btn-3d btn-3d--green" onClick={onRestart}>
          <RotateCcw size={16} />
          Diskusi Baru
        </button>
      </div>
    </motion.section>
  );
}
