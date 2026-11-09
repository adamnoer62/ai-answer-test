import Lottie from "lottie-react";

/**
 * Thin wrapper so call sites don't import lottie-react directly.
 * Pass the parsed JSON from LottieFiles as `animationData`.
 *
 * <LottiePlayer animationData={thinkingAnim} loop size={28} />
 */
export default function LottiePlayer({ animationData, loop = true, autoplay = true, size = 32, className, style, onComplete }) {
  if (!animationData) return null;
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      onComplete={onComplete}
      className={`lottie-player${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}
