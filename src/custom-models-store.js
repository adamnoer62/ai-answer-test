import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const FILE = path.join(process.cwd(), "custom-models.json");

export async function loadCustomModels() {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveCustomModels(list) {
  await writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
}

export async function addCustomModel({ label, engineId, modelVariant, persona, color, colorDark }) {
  const list = await loadCustomModels();
  const base = slugify(label) || "agent";
  let id = `${base}-${crypto.randomBytes(3).toString("hex")}`;
  while (list.some((m) => m.id === id)) id = `${base}-${crypto.randomBytes(3).toString("hex")}`;

  const entry = {
    id,
    label: label.trim(),
    engineId,
    modelVariant: (modelVariant || "").trim(),
    persona: persona && persona.trim() ? persona.trim() : null,
    color: color || "#1CB0F6",
    colorDark: colorDark || "#1899D6",
    builtin: false,
  };
  list.push(entry);
  await saveCustomModels(list);
  return entry;
}

export async function upsertCustomModel(id, patch) {
  const list = await loadCustomModels();
  const idx = list.findIndex((m) => m.id === id);
  const clean = { ...patch };
  if (clean.label !== undefined) clean.label = clean.label.trim();
  if (clean.modelVariant !== undefined) clean.modelVariant = (clean.modelVariant || "").trim();
  if (clean.persona !== undefined) clean.persona = clean.persona && clean.persona.trim() ? clean.persona.trim() : null;

  if (idx === -1) {
    const entry = { id, ...clean };
    list.push(entry);
    await saveCustomModels(list);
    return entry;
  }
  list[idx] = { ...list[idx], ...clean };
  await saveCustomModels(list);
  return list[idx];
}

export async function deleteCustomModel(id) {
  const list = await loadCustomModels();
  const next = list.filter((m) => m.id !== id);
  if (next.length === list.length) return false;
  await saveCustomModels(next);
  return true;
}
