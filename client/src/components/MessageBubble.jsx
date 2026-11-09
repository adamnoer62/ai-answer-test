import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Clock } from "lucide-react";
import { fmtDuration, initials, mdLite } from "../utils.js";
import { useLottieData } from "../useLottieData.js";
import LottiePlayer from "./LottiePlayer.jsx";

const THINKING_PHRASES = ["Membaca konteks diskusi", "Menyusun argumen", "Menimbang sudut pandang lain", "Merapikan jawaban"];

function ThinkingLine() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef(Date.now());
  const thinkingAnim = useLottieData(() => import("../assets/lottie/thinking.json"));

  useEffect(() => {
    const timer = setInterval(() => {
      const s = (Date.now() - startedRef.current) / 1000;
      setElapsed(s);
      setPhraseIdx(Math.floor(s / 1.6) % THINKING_PHRASES.length);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="thinking-status">
      <LottiePlayer animationData={thinkingAnim} size={22} />
      <span>{THINKING_PHRASES[phraseIdx]}&hellip;</span>
      <span className="thinking-status__timer">{elapsed.toFixed(1)}s</span>
    </div>
  );
}

function TypedText({ text }) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: text.length,
      duration: Math.min(2.4, Math.max(0.35, text.length / 110)),
      ease: "none",
      onUpdate: () => setRevealed(Math.floor(obj.n)),
    });
    return () => tween.kill();
  }, [text]);

  const done = revealed >= text.length;
  if (done) return <div className="bubble__text" dangerouslySetInnerHTML={{ __html: mdLite(text) }} />;
  return (
    <div className="bubble__text">
      {text.slice(0, revealed)}
      <span className="typing-caret" />
    </div>
  );
}

export default function MessageBubble({ entry, provider, modelVariant }) {
  const isThinking = entry.status === "thinking";
  const isError = entry.status === "done" && !entry.ok;

  return (
    <motion.div
      className={`bubble-row${isThinking ? " is-thinking" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="bubble__avatar" style={{ background: entry.color }}>
        {initials(entry.label)}
      </div>
      <div className={`bubble${isThinking ? " is-thinking" : ""}${isError ? " is-error" : ""}`} style={{ "--c": entry.color, "--cd": entry.colorDark || entry.color }}>
        <div className="bubble__head">
          <span className="bubble__label">{entry.label}</span>
          {modelVariant && <span className="bubble__engine">{modelVariant}</span>}
          {!isThinking && (
            <span className="bubble__time">
              <Clock size={12} />
              {fmtDuration(entry.durationMs)}
            </span>
          )}
        </div>
        {isThinking ? (
          <ThinkingLine />
        ) : isError ? (
          <div className="bubble__text is-error-text" dangerouslySetInnerHTML={{ __html: mdLite(entry.text) }} />
        ) : (
          <TypedText text={entry.text} />
        )}
      </div>
    </motion.div>
  );
}
