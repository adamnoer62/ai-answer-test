import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Building2, SmilePlus } from "lucide-react";
import BattleStrip from "./BattleStrip.jsx";
import OfficeWindow from "./OfficeWindow.jsx";
import MessageBubble from "./MessageBubble.jsx";
import LottiePlayer from "./LottiePlayer.jsx";
import { useLottieData } from "../useLottieData.js";

export default function ArenaView({
  battleStripRef,
  officeSceneRef,
  participants,
  topic,
  status,
  maxRounds,
  currentRound,
  doneRounds,
  stoppedRound,
  rounds,
  liveEntries,
  stoppedEarly,
  errorMessage,
  judgeThinking,
  participantsById,
}) {
  const statusPillClass = status === "done" ? "pill pill--done" : status === "error" ? "pill pill--error" : "pill pill--live";
  const statusLabel = status === "done" ? "Selesai" : status === "error" ? "Error" : "Berlangsung";
  const [sceneView, setSceneView] = useState("office");
  const judgeLabel = Object.values(participantsById).find((p) => !participants.some((ap) => ap.id === p.id))?.label;

  const gavelAnim = useLottieData(() => import("../assets/lottie/judge-gavel.json"));
  const sleepAnim = useLottieData(() => import("../assets/lottie/sleep.json"));
  const noConnectionAnim = useLottieData(() => import("../assets/lottie/no-connection.json"));

  return (
    <motion.section className="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="arena-head">
        <div className="round-progress">
          {Array.from({ length: maxRounds }).map((_, i) => {
            const idx = i + 1;
            let cls = "round-dot";
            if (stoppedRound === idx) cls += " is-stopped";
            else if (idx < currentRound || doneRounds.has(idx)) cls += " is-done";
            else if (idx === currentRound) cls += " is-current";
            return (
              <div className={cls} key={idx}>
                <div className="round-dot__fill" />
              </div>
            );
          })}
        </div>
        {sceneView === "faces" && (
          <div className="arena-head__meta">
            <span className="arena-head__topic">{topic}</span>
            <span className={statusPillClass}>{statusLabel}</span>
          </div>
        )}
        <div className="scene-toggle">
          <button
            type="button"
            className={`scene-toggle__btn${sceneView === "office" ? " is-active" : ""}`}
            onClick={() => setSceneView("office")}
          >
            <Building2 size={13} /> Kantor
          </button>
          <button
            type="button"
            className={`scene-toggle__btn${sceneView === "faces" ? " is-active" : ""}`}
            onClick={() => setSceneView("faces")}
          >
            <SmilePlus size={13} /> Wajah
          </button>
        </div>
        <div style={{ display: sceneView === "office" ? "block" : "none" }}>
          <OfficeWindow
            officeSceneRef={officeSceneRef}
            participants={participants}
            topic={topic}
            status={status}
            rounds={rounds}
            liveEntries={liveEntries}
            currentRound={currentRound}
            maxRounds={maxRounds}
            judgeThinking={judgeThinking}
            judgeLabel={judgeLabel}
            stoppedEarly={stoppedEarly}
            errorMessage={errorMessage}
          />
        </div>
        <div style={{ display: sceneView === "faces" ? "block" : "none" }}>
          <BattleStrip ref={battleStripRef} participants={participants} />
        </div>
      </div>

      {stoppedEarly && (
        <div className="banner banner--warn">
          <LottiePlayer animationData={sleepAnim} size={28} loop={false} />
          <span>Diskusi dihentikan lebih awal — model-model mulai mengulang jawaban yang sama (agreement loop).</span>
        </div>
      )}
      {errorMessage && (
        <div className="banner banner--warn">
          <LottiePlayer animationData={noConnectionAnim} size={28} loop={false} />
          <span>Terjadi error: {errorMessage}</span>
        </div>
      )}

      <div className="transcript">
        {rounds.map((round, i) => (
          <div key={i}>
            <div className="round-divider">
              <Swords size={14} />
              Ronde {i + 1}
            </div>
            {round.entries.map((entry) => (
              <MessageBubble key={entry.id} entry={{ ...entry, status: "done" }} modelVariant={participantsById[entry.id]?.modelVariant} />
            ))}
          </div>
        ))}
        {currentRound > rounds.length && liveEntries.length > 0 && (
          <div>
            <div className="round-divider">
              <Swords size={14} />
              Ronde {currentRound}
            </div>
            {liveEntries.map((entry) => (
              <MessageBubble key={entry.id} entry={entry} modelVariant={participantsById[entry.id]?.modelVariant} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {judgeThinking && (
          <motion.div
            className="judge-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="judge-overlay__card"
              initial={{ scale: 0.9, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <LottiePlayer animationData={gavelAnim} size={72} className="judge-overlay__icon" />
              <p>Juri sedang membaca seluruh transkrip dan menyusun ranking&hellip;</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
