import { motion } from "framer-motion";
import { Minus, Plus, Star } from "lucide-react";
import { initials } from "../utils.js";
import { useLottieData } from "../useLottieData.js";
import LottiePlayer from "./LottiePlayer.jsx";

export default function SetupView({ models, selectedParticipants, judgeId, rounds, settings, error, onRoundsChange, prompt, onPromptChange }) {
  const participants = Array.from(selectedParticipants).map((id) => models.find((m) => m.id === id)).filter(Boolean);
  const judge = models.find((m) => m.id === judgeId);
  const conversationAnim = useLottieData(() => import("../assets/lottie/conversation.json"));

  return (
    <motion.section className="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="hero">
        <LottiePlayer animationData={conversationAnim} loop size={180} className="hero__lottie" />
        <h1 className="hero__title">Achilles</h1>
        <p className="hero__subtitle">

        </p>
      </div>

      <div className="card card--form">
        <label className="field-label" htmlFor="promptInput">
          Topik / Pertanyaan
        </label>
        <textarea
          id="promptInput"
          className="prompt-box"
          placeholder="Contoh: Apakah startup sebaiknya pakai microservices sejak hari pertama?"
          rows={3}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />

        <div className="form-row">
          <div className="field-group">
            <label className="field-label">Jumlah Ronde</label>
            <div className="stepper">
              <button
                type="button"
                className="stepper__btn"
                aria-label="Kurangi"
                onClick={() => onRoundsChange(Math.max(settings.minRounds, rounds - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="stepper__value">{rounds}</span>
              <button
                type="button"
                className="stepper__btn"
                aria-label="Tambah"
                onClick={() => onRoundsChange(Math.min(settings.maxRounds, rounds + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="field-group field-group--grow">
            <label className="field-label">Line-up saat ini</label>
            <div className="lineup">
              {participants.length === 0 && <span className="lineup-empty">Belum ada peserta dipilih</span>}
              {participants.map((m) => (
                <div className="lineup-chip" key={m.id} style={{ "--c": m.color }}>
                  <span className="lineup-chip__avatar" style={{ background: m.color }}>
                    {initials(m.label)}
                  </span>
                  {m.label}
                </div>
              ))}
              {judge && (
                <div className="lineup-chip is-judge" style={{ "--c": judge.color }}>
                  <span className="lineup-chip__avatar" style={{ background: judge.color }}>
                    {initials(judge.label)}
                  </span>
                  {judge.label}
                  <span className="judge-tag" title="Juri">
                    <Star size={12} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="error-text">{error}</p>
      </div>
    </motion.section>
  );
}
