import { AnimatePresence, motion } from "framer-motion";
import { Shirt, X } from "lucide-react";
import { SKINS, HAIRS, CLOTHING, defaultOutfit } from "../office/characterCatalog.js";
import { swatchStyle } from "../office/spriteGrid.js";
import PixelCharacter from "./PixelCharacter.jsx";

function SwatchRow({ title, items, selectedId, onPick, focus = "full" }) {
  if (!items.length) return null;
  return (
    <div className="picker-row">
      <span className="field-label">{title}</span>
      <div className="picker-swatches">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`picker-swatch${selectedId === item.id ? " is-selected" : ""}`}
            title={item.label}
            onClick={() => onPick(item.id)}
          >
            <div style={swatchStyle(item.file, 40, focus)} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CharacterPicker({ open, label, color, appearance, onChange, onClose }) {
  if (!appearance) return null;
  const gender = appearance.gender;
  const clothing = CLOTHING[gender];

  function patch(fields) {
    onChange({ ...appearance, ...fields });
  }

  function setGender(g) {
    if (g === gender) return;
    onChange(defaultOutfit(g));
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
            className="modal__card picker-card"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
          >
            <div className="modal__head">
              <Shirt />
              <h3>Ganti Baju — {label}</h3>
              <button type="button" className="modal__close" onClick={onClose} aria-label="Tutup">
                <X size={16} />
              </button>
            </div>

            <div className="picker-preview">
              <PixelCharacter appearance={appearance} mood="idle" scale={4} label={label} color={color} />
            </div>

            <div className="picker-row">
              <span className="field-label">Gender</span>
              <div className="engine-picker">
                <div
                  className={`engine-chip${gender === "male" ? " is-selected" : ""}`}
                  onClick={() => setGender("male")}
                >
                  Pria
                </div>
                <div
                  className={`engine-chip${gender === "female" ? " is-selected" : ""}`}
                  onClick={() => setGender("female")}
                >
                  Wanita
                </div>
              </div>
            </div>

            <SwatchRow title="Kulit" items={SKINS[gender]} selectedId={appearance.skin} onPick={(id) => patch({ skin: id })} />
            <SwatchRow title="Rambut" items={HAIRS[gender]} selectedId={appearance.hair} onPick={(id) => patch({ hair: id })} />
            <SwatchRow title="Atasan" items={clothing.top} selectedId={appearance.top} onPick={(id) => patch({ top: id })} />
            <SwatchRow title="Bawahan" items={clothing.bottom} selectedId={appearance.bottom} onPick={(id) => patch({ bottom: id })} />
            <SwatchRow title="Kaos Kaki" items={clothing.socks} selectedId={appearance.socks} onPick={(id) => patch({ socks: id })} focus="feet" />
            <SwatchRow title="Sepatu" items={clothing.shoes} selectedId={appearance.shoes} onPick={(id) => patch({ shoes: id })} focus="feet" />

            <div className="modal__actions">
              <button type="button" className="btn-3d btn-3d--blue" onClick={onClose}>
                Selesai
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
