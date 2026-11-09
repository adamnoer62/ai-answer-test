// Lightweight, honest heuristic: flags a response as a "pushback" when it contains
// visible disagreement/refutation language, purely to drive a cosmetic reaction —
// never used to judge correctness.
const CLASH_PATTERNS = [
  /tidak setuju/i,
  /tidak sependapat/i,
  /kurang tepat/i,
  /kurang akurat/i,
  /\bkeliru\b/i,
  /salah besar/i,
  /salah kaprah/i,
  /salah paham/i,
  /sesat pikir/i,
  /menyesatkan/i,
  /menggelikan/i,
  /justru sebaliknya/i,
  /sebenarnya salah/i,
  /bertentangan/i,
  /saya (ingin |harus |perlu )?(mengoreksi|koreksi)/i,
  /tidak akurat/i,
  /tidak berdasar/i,
  /menyamakan .+ dengan .+ padahal/i,
  /\bnaif\b/i,
  /disagree/i,
  /incorrect/i,
  /\bflawed\b/i,
  /\bwrong\b/i,
  /misleading/i,
];

export function isClashResponse(text) {
  if (!text) return false;
  return CLASH_PATTERNS.some((re) => re.test(text));
}
