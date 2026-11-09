import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

export default function ContextMenu({ x, y, model, onEdit, onDelete, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      left: Math.max(8, Math.min(x, window.innerWidth - rect.width - 10)),
      top: Math.max(8, Math.min(y, window.innerHeight - rect.height - 10)),
    });
  }, [x, y]);

  useEffect(() => {
    const onClick = () => onClose();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={ref}
        className="context-menu"
        style={{ left: pos.left, top: pos.top }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="context-menu__item" onClick={onEdit}>
          <Pencil size={15} />
          Edit Agent
        </button>
        {!model.builtin && (
          <button type="button" className="context-menu__item context-menu__item--danger" onClick={onDelete}>
            <Trash2 size={15} />
            Hapus Agent
          </button>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
