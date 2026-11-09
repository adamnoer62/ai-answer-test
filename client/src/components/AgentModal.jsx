import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";

export default function AgentModal({ open, engines, palette, editModel, onClose, onSubmit }) {
  const [label, setLabel] = useState("");
  const [engineId, setEngineId] = useState(engines[0]?.id);
  const [modelVariant, setModelVariant] = useState("");
  const [persona, setPersona] = useState("");
  const [color, setColor] = useState(palette[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (editModel) {
      setLabel(editModel.label);
      setEngineId(editModel.engineId);
      setModelVariant(editModel.modelVariant || "");
      setPersona(editModel.persona || "");
      setColor([editModel.color, editModel.colorDark]);
    } else {
      setLabel("");
      setEngineId(engines[0]?.id);
      setModelVariant("");
      setPersona("");
      setColor(palette[Math.floor(Math.random() * palette.length)]);
    }
  }, [open, editModel]);

  const engine = engines.find((e) => e.id === engineId);
  const locked = !!(editModel && editModel.builtin);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim()) return setError("Nama agent wajib diisi.");
    try {
      await onSubmit({
        label: label.trim(),
        engineId,
        modelVariant: modelVariant.trim(),
        persona: persona.trim(),
        color: color[0],
        colorDark: color[1],
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="modal__card"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
          >
            <div className="modal__head">
              <Bot />
              <h3>{editModel ? "Edit Agent" : "Tambah Agent"}</h3>
              <button type="button" className="modal__close" onClick={onClose} aria-label="Tutup">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="agentLabel">
                Nama Agent
              </label>
              <input
                id="agentLabel"
                className="text-input"
                placeholder="Contoh: Kritikus VC"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />

              <label className="field-label">
                Mesin Dasar {locked && <span className="field-hint">(terkunci untuk model bawaan)</span>}
              </label>
              <div className="engine-picker">
                {engines.map((e) => (
                  <div
                    key={e.id}
                    className={`engine-chip${engineId === e.id ? " is-selected" : ""}${locked ? " is-locked" : ""}`}
                    onClick={() => !locked && setEngineId(e.id)}
                  >
                    {e.engineLabel}
                  </div>
                ))}
              </div>

              <label className="field-label" htmlFor="agentModelVariant">
                Model <span className="field-hint">(opsional, kosongkan untuk default)</span>
              </label>
              <input
                id="agentModelVariant"
                className="text-input"
                list="modelSuggestions"
                placeholder={engine?.suggestedModels?.length ? `Contoh: ${engine.suggestedModels[0]}` : "Kosongkan untuk default"}
                value={modelVariant}
                onChange={(e) => setModelVariant(e.target.value)}
              />
              <datalist id="modelSuggestions">
                {(engine?.suggestedModels || []).map((m) => (
                  <option value={m} key={m} />
                ))}
              </datalist>

              <label className="field-label">Warna</label>
              <div className="color-picker">
                {palette.map(([c, cd]) => (
                  <button
                    type="button"
                    key={c}
                    className={`color-swatch${color[0] === c ? " is-selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => setColor([c, cd])}
                  />
                ))}
              </div>

              <label className="field-label" htmlFor="agentPersona">
                Persona / Peran <span className="field-hint">(opsional)</span>
              </label>
              <textarea
                id="agentPersona"
                className="text-input"
                rows={3}
                placeholder="Contoh: Kamu adalah investor VC skeptis yang selalu mencari risiko bisnis tersembunyi."
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              />

              <p className="error-text">{error}</p>

              <div className="modal__actions">
                <button type="button" className="btn-3d btn-3d--ghost" onClick={onClose}>
                  Batal
                </button>
                <button type="submit" className="btn-3d btn-3d--blue">
                  {editModel ? "Simpan Perubahan" : "Simpan Agent"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
