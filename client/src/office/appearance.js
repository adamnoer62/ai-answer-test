import { SKINS, HAIRS, CLOTHING, defaultOutfit, firstOr } from "./characterCatalog.js";

const STORAGE_PREFIX = "office-appearance:v1:";

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Deterministic starting look derived from the agent id, so every agent has
// a distinct-ish appearance out of the box without asking the user anything.
export function defaultAppearance(seed) {
  const h = hashString(String(seed));
  const gender = h % 2 === 0 ? "male" : "female";
  const skin = SKINS[gender][h % SKINS[gender].length];
  const hair = HAIRS[gender][Math.floor(h / 7) % HAIRS[gender].length];
  const c = CLOTHING[gender];
  const top = c.top.length ? c.top[Math.floor(h / 3) % c.top.length] : null;
  const bottom = c.bottom.length ? c.bottom[Math.floor(h / 11) % c.bottom.length] : null;
  const socks = firstOr(c.socks, null);
  const shoes = firstOr(c.shoes, null);
  return {
    gender,
    skin: skin.id,
    hair: hair.id,
    top: top?.id || null,
    bottom: bottom?.id || null,
    socks: socks?.id || null,
    shoes: shoes?.id || null,
  };
}

export function loadAppearance(id) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt/blocked storage, fall through to default
  }
  return defaultAppearance(id);
}

export function saveAppearance(id, appearance) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(appearance));
  } catch {
    // storage unavailable (private mode, quota) — cosmetic only, safe to drop
  }
}

export function switchGender(appearance, gender) {
  if (appearance.gender === gender) return appearance;
  return { ...defaultOutfit(gender) };
}
