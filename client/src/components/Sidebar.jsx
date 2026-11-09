import { useState } from "react";
import { Zap, RotateCcw, Users, Plus, History } from "lucide-react";
import RosterItem from "./RosterItem.jsx";
import ContextMenu from "./ContextMenu.jsx";

export default function Sidebar({
  models,
  selectedParticipants,
  judgeId,
  onToggleParticipant,
  onSetJudge,
  onDelete,
  onAddAgent,
  onEditAgent,
  onNewDiscussion,
}) {
  const [menu, setMenu] = useState(null); // { x, y, model }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Zap />
        <span>Orchestrator</span>
      </div>

      <button type="button" className="sidebar__new" onClick={onNewDiscussion}>
        <RotateCcw size={16} />
        Diskusi Baru
      </button>

      <div className="sidebar__section">
        <div className="sidebar__section-head">
          <Users />
          <span>Peserta &amp; Juri</span>
        </div>
        <p className="sidebar__hint">Klik untuk pilih peserta. Tanda bintang menentukan juri. Klik kanan untuk edit.</p>
        <div className="roster">
          {models.map((m) => (
            <RosterItem
              key={m.id}
              model={m}
              selected={selectedParticipants.has(m.id)}
              isJudge={judgeId === m.id}
              onToggle={() => onToggleParticipant(m.id)}
              onSetJudge={() => onSetJudge(m.id)}
              onDelete={() => onDelete(m.id)}
              onContextMenu={(x, y) => setMenu({ x, y, model: m })}
            />
          ))}
        </div>
        <button type="button" className="sidebar__add" onClick={onAddAgent}>
          <Plus size={16} />
          Tambah Agent
        </button>
      </div>

      <div className="sidebar__section sidebar__section--grow">
        <div className="sidebar__section-head">
          <History />
          <span>Riwayat Transkrip</span>
        </div>
        <p className="sidebar__hint">
          Transkrip lengkap tersimpan otomatis di folder <code>transcripts/</code> setelah tiap sesi selesai.
        </p>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          model={menu.model}
          onClose={() => setMenu(null)}
          onEdit={() => {
            onEditAgent(menu.model);
            setMenu(null);
          }}
          onDelete={() => {
            onDelete(menu.model.id);
            setMenu(null);
          }}
        />
      )}
    </aside>
  );
}
