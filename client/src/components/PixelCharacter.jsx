import { useEffect, useState } from "react";
import { MessageCircle, Sparkles, AlertTriangle } from "lucide-react";
import { CELL_W, CELL_H, ROWS, frameLayerStyle } from "../office/spriteGrid.js";
import { resolveLayers } from "../office/characterCatalog.js";

const MOOD_ICON = {
  thinking: MessageCircle,
  happy: Sparkles,
  angry: AlertTriangle,
};

export default function PixelCharacter({ appearance, mood = "idle", scale = 3, label, color }) {
  const [frame, setFrame] = useState(0);
  const frames = ROWS.idle.frames;
  const speed = mood === "thinking" ? 260 : 480;

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % frames), speed);
    return () => clearInterval(id);
  }, [frames, speed]);

  const layers = resolveLayers(appearance);
  const w = CELL_W * scale;
  const h = CELL_H * scale;
  const Icon = MOOD_ICON[mood];

  return (
    <div className="pixel-char" title={label}>
      <div
        className={`pixel-char__stage${mood === "thinking" ? " is-thinking" : ""}`}
        style={{ width: w, height: h, "--mood-color": color || "var(--blue)" }}
      >
        <div key={mood} className={`pixel-char__body pixel-char__body--${mood}`}>
          {layers.map((file) => (
            <div key={file} style={frameLayerStyle(file, frame, ROWS.idle.row, scale)} />
          ))}
        </div>
        {Icon && (
          <div key={`badge-${mood}`} className={`pixel-char__badge pixel-char__badge--${mood}`}>
            <Icon size={12} />
          </div>
        )}
        <div className="pixel-char__shadow" style={{ width: w * 0.32 }} />
      </div>
    </div>
  );
}
