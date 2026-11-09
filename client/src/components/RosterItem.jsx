import { Star, Trash2 } from "lucide-react";
import { initials } from "../utils.js";

export default function RosterItem({ model, selected, isJudge, onToggle, onSetJudge, onDelete, onContextMenu }) {
  return (
    <div
      className={`roster-item${selected ? " is-selected" : ""}`}
      style={{ "--c": model.color }}
      onClick={onToggle}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e.clientX, e.clientY);
      }}
    >
      <div className="roster-item__avatar" style={{ background: model.color }}>
        {initials(model.label)}
      </div>
      <div className="roster-item__body">
        <div className="roster-item__label">
          {model.label}
          {model.persona && <span className="roster-item__persona-dot" title="Punya persona kustom" />}
        </div>
        <div className="roster-item__meta">{[model.modelVariant, model.provider].filter(Boolean).join(" · ")}</div>
      </div>
      <div className="roster-item__actions">
        <button
          type="button"
          className={`roster-item__judge-btn${isJudge ? " is-judge" : ""}`}
          title="Jadikan juri"
          onClick={(e) => {
            e.stopPropagation();
            onSetJudge();
          }}
        >
          <Star size={15} />
        </button>
        {!model.builtin && (
          <button
            type="button"
            className="roster-item__del-btn"
            title="Hapus agent"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
