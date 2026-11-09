export function resolveModel(entry, engines) {
  const engine = engines.find((e) => e.id === entry.engineId);
  if (!engine) return null;
  const flagTokens = entry.modelVariant ? [engine.modelFlag, entry.modelVariant] : [];
  const args = engine.baseArgs.flatMap((tok) => (tok === "{MODELFLAGS}" ? flagTokens : [tok]));
  return {
    id: entry.id,
    label: entry.label,
    provider: engine.engineLabel,
    modelVariant: entry.modelVariant || "",
    color: entry.color,
    colorDark: entry.colorDark,
    persona: entry.persona || null,
    builtin: !!entry.builtin,
    command: engine.command,
    args,
    output: engine.output,
  };
}

export function serializeEntry(entry, engines) {
  const engine = engines.find((e) => e.id === entry.engineId);
  return {
    id: entry.id,
    label: entry.label,
    engineId: entry.engineId,
    provider: engine ? engine.engineLabel : entry.engineId,
    modelVariant: entry.modelVariant || "",
    color: entry.color,
    colorDark: entry.colorDark,
    persona: entry.persona || null,
    builtin: !!entry.builtin,
  };
}
