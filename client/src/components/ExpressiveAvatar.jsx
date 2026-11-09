import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useLottieData } from "../useLottieData.js";
import LottiePlayer from "./LottiePlayer.jsx";

const eyeVariants = {
  idle: { scaleY: 1, x: 0 },
  thinking: { scaleY: 1, x: [-2, 2, -2], transition: { x: { repeat: Infinity, duration: 1.3, ease: "easeInOut" } } },
  happy: { scaleY: 0.8, x: 0 },
  angry: { scaleY: 0.55, x: 0 },
};

const browVariants = {
  idle: { rotate: 0, y: 0, opacity: 0.85 },
  thinking: { rotate: 0, y: 0, opacity: 0.85 },
  happy: { rotate: 0, y: -1, opacity: 0.85 },
};
// left/right brows rotate opposite ways to form an angry "V"
const browVariantsLeft = { ...browVariants, angry: { rotate: 16, y: 2, opacity: 1 } };
const browVariantsRight = { ...browVariants, angry: { rotate: -16, y: 2, opacity: 1 } };

const mouthVariants = {
  idle: { scaleY: 1, scaleX: 1, borderRadius: "0 0 10px 10px", height: 5 },
  thinking: { scaleY: [1, 0.6, 1], scaleX: 1, borderRadius: "0 0 4px 4px", height: 4, transition: { scaleY: { repeat: Infinity, duration: 1.1 } } },
  happy: { scaleY: 1, scaleX: 1.15, borderRadius: "0 0 14px 14px", height: 7 },
  angry: { scaleY: -1, scaleX: 1, borderRadius: "0 0 10px 10px", height: 6 },
};

const ExpressiveAvatar = forwardRef(function ExpressiveAvatar(
  { label, color, colorDark, size = 46, mood = "idle" },
  ref
) {
  const wrapRef = useRef(null);
  const [showClash, setShowClash] = useState(false);
  const clashAnim = useLottieData(() => import("../assets/lottie/clash.json"));

  useImperativeHandle(ref, () => ({
    playClash() {
      const el = wrapRef.current;
      if (!el) return;
      setShowClash(true);
      gsap.killTweensOf(el);
      gsap
        .timeline()
        .to(el, { x: -7, duration: 0.05, ease: "power1.out" })
        .to(el, { x: 6, duration: 0.08, ease: "power1.out" })
        .to(el, { x: -4, duration: 0.08, ease: "power1.out" })
        .to(el, { x: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" });
      gsap.fromTo(
        el,
        { boxShadow: "0 0 0 0 rgba(255,75,75,0.9)" },
        { boxShadow: "0 0 0 14px rgba(255,75,75,0)", duration: 0.6, ease: "power1.out" }
      );
    },
  }));

  const eyeSize = Math.max(4, size * 0.11);
  const eyeGap = size * 0.28;
  const browW = size * 0.2;

  return (
    <div
      ref={wrapRef}
      className={`xavatar${mood === "thinking" ? " is-active" : ""}`}
      style={{ "--c": color, "--cd": colorDark || color, width: size, height: size, background: color }}
      title={label}
    >
      <motion.div
        className="xavatar__brow xavatar__brow--l"
        style={{ width: browW, left: `calc(50% - ${eyeGap / 2 + browW / 2}px)` }}
        animate={mood}
        variants={browVariantsLeft}
      />
      <motion.div
        className="xavatar__brow xavatar__brow--r"
        style={{ width: browW, left: `calc(50% + ${eyeGap / 2 - browW / 2}px)` }}
        animate={mood}
        variants={browVariantsRight}
      />
      <div className="xavatar__eyes">
        <motion.span className="xavatar__eye" style={{ width: eyeSize, height: eyeSize }} animate={mood} variants={eyeVariants} />
        <motion.span className="xavatar__eye" style={{ width: eyeSize, height: eyeSize }} animate={mood} variants={eyeVariants} />
      </div>
      <motion.div className="xavatar__mouth" animate={mood} variants={mouthVariants} />
      {showClash && (
        <LottiePlayer
          animationData={clashAnim}
          loop={false}
          size={size * 2.2}
          className="xavatar__clash"
          onComplete={() => setShowClash(false)}
        />
      )}
    </div>
  );
});

export default ExpressiveAvatar;
