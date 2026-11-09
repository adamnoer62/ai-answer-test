import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Swords } from "lucide-react";
import ExpressiveAvatar from "./ExpressiveAvatar.jsx";

const BattleStrip = forwardRef(function BattleStrip({ participants }, ref) {
  const [moods, setMoods] = useState({});
  const avatarRefs = useRef({});
  const spokenRef = useRef(new Set());

  useImperativeHandle(ref, () => ({
    reset() {
      spokenRef.current = new Set();
      setMoods(Object.fromEntries(participants.map((p) => [p.id, "idle"])));
    },
    setThinking(id) {
      setMoods((m) => ({ ...m, [id]: "thinking" }));
    },
    resolve(id, { clash }) {
      setMoods((m) => ({ ...m, [id]: clash ? "angry" : "happy" }));
      if (clash) {
        avatarRefs.current[id]?.playClash();
        spokenRef.current.forEach((otherId) => {
          if (otherId !== id) avatarRefs.current[otherId]?.playClash();
        });
      }
      spokenRef.current.add(id);
    },
  }));

  if (participants.length === 0) return null;

  return (
    <div className="battle-strip">
      {participants.map((p, i) => {
        const mood = moods[p.id] || "idle";
        const nextMood = participants[i + 1] ? moods[participants[i + 1].id] || "idle" : null;
        const clashingLink = mood === "thinking" && nextMood === "thinking";
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "flex-start" }}>
            {i > 0 && (
              <div className={`battle-link${clashingLink ? " is-clashing" : ""}`}>
                <span className="battle-link__icon">
                  <Swords size={12} />
                </span>
              </div>
            )}
            <div className={`battle-slot${mood !== "idle" ? " is-live" : ""}`}>
              <ExpressiveAvatar
                ref={(el) => (avatarRefs.current[p.id] = el)}
                label={p.label}
                color={p.color}
                colorDark={p.colorDark}
                size={52}
                mood={mood}
              />
              <span className="battle-slot__label">{p.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default BattleStrip;
