import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import PixelCharacter from "./PixelCharacter.jsx";
import CharacterPicker from "./CharacterPicker.jsx";
import { roomUrl } from "../office/spriteGrid.js";
import { loadAppearance, saveAppearance } from "../office/appearance.js";

const OfficeScene = forwardRef(function OfficeScene({ participants }, ref) {
  const [moods, setMoods] = useState({});
  const [appearances, setAppearances] = useState({});
  const [pickerId, setPickerId] = useState(null);
  const loadedIds = useRef(new Set());

  useEffect(() => {
    setAppearances((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const p of participants) {
        if (!loadedIds.current.has(p.id)) {
          next[p.id] = loadAppearance(p.id);
          loadedIds.current.add(p.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [participants]);

  useImperativeHandle(ref, () => ({
    reset() {
      setMoods(Object.fromEntries(participants.map((p) => [p.id, "idle"])));
    },
    setThinking(id) {
      setMoods((m) => ({ ...m, [id]: "thinking" }));
    },
    resolve(id, { clash }) {
      setMoods((m) => ({ ...m, [id]: clash ? "angry" : "happy" }));
    },
  }));

  function updateAppearance(id, appearance) {
    setAppearances((prev) => ({ ...prev, [id]: appearance }));
    saveAppearance(id, appearance);
  }

  if (participants.length === 0) return null;
  const pickerParticipant = participants.find((p) => p.id === pickerId) || null;

  return (
    <div className="office-scene">
      <div className="office-scene__wall">
        <div style={{ backgroundImage: `url(${roomUrl("bookshelf.png")})` }} className="office-prop office-prop--bookshelf" />
        <div style={{ backgroundImage: `url(${roomUrl("door.png")})` }} className="office-prop office-prop--door" />
        <div style={{ backgroundImage: `url(${roomUrl("clock.png")})` }} className="office-prop office-prop--clock" />
      </div>
      <div className="office-scene__floor">
        <div className="office-scene__desks">
          {participants.map((p) => {
            const mood = moods[p.id] || "idle";
            const appearance = appearances[p.id];
            if (!appearance) return null;
            return (
              <div key={p.id} className={`office-desk${mood !== "idle" ? " is-live" : ""}`}>
                <button
                  type="button"
                  className="office-desk__edit"
                  title="Ganti baju"
                  onClick={() => setPickerId(p.id)}
                >
                  <Pencil size={12} />
                </button>
                <div className="office-desk__char">
                  <PixelCharacter appearance={appearance} mood={mood} scale={2.5} label={p.label} color={p.color} />
                </div>
                <div className="office-desk__furniture">
                  <div style={{ backgroundImage: `url(${roomUrl("desk.png")})` }} className="office-prop office-prop--desk" />
                  <div style={{ backgroundImage: `url(${roomUrl("chair.png")})` }} className="office-prop office-prop--chair" />
                </div>
                <span className="office-desk__label" style={{ "--c": p.color }}>{p.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <CharacterPicker
        open={!!pickerParticipant}
        label={pickerParticipant?.label}
        color={pickerParticipant?.color}
        appearance={pickerParticipant ? appearances[pickerParticipant.id] : null}
        onChange={(next) => pickerParticipant && updateAppearance(pickerParticipant.id, next)}
        onClose={() => setPickerId(null)}
      />
    </div>
  );
});

export default OfficeScene;
