import { readFile, writeFile } from "node:fs/promises";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import path from "node:path";

const scryptAsync = promisify(scrypt);
const PIN_FILE = path.join(process.cwd(), ".builder-pin.json");

// Valid unlock tokens live only in memory - restarting the server re-locks everyone,
// which is the right default for a "hidden, personal" feature.
const validTokens = new Set();

async function hashPin(pin) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(pin, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyHash(pin, stored) {
  const [salt, hex] = stored.split(":");
  const derived = await scryptAsync(pin, salt, 64);
  const stored_ = Buffer.from(hex, "hex");
  if (derived.length !== stored_.length) return false;
  return timingSafeEqual(derived, stored_);
}

export async function hasPinSet() {
  try {
    await readFile(PIN_FILE, "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function setPin(pin) {
  if (await hasPinSet()) {
    throw new Error("PIN sudah pernah diset. Hapus file .builder-pin.json manual kalau mau ganti.");
  }
  if (!pin || pin.length < 4) {
    throw new Error("PIN minimal 4 karakter.");
  }
  const hash = await hashPin(pin);
  await writeFile(PIN_FILE, JSON.stringify({ hash }), "utf8");
}

export async function verifyPin(pin) {
  let stored;
  try {
    stored = JSON.parse(await readFile(PIN_FILE, "utf8"));
  } catch {
    throw new Error("Belum ada PIN yang diset.");
  }
  const ok = await verifyHash(pin || "", stored.hash);
  if (!ok) return null;
  const token = randomBytes(24).toString("hex");
  validTokens.add(token);
  return token;
}

export function isValidToken(token) {
  return !!token && validTokens.has(token);
}
