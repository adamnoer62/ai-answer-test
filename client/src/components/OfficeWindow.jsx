import OfficeScene from "./OfficeScene.jsx";
import ActivityLog from "./ActivityLog.jsx";

export default function OfficeWindow({
  officeSceneRef,
  participants,
  topic,
  status,
  rounds,
  liveEntries,
  currentRound,
  maxRounds,
  judgeThinking,
  judgeLabel,
  stoppedEarly,
  errorMessage,
}) {
  const statusLabel = status === "done" ? "SELESAI" : status === "error" ? "ERROR" : "LIVE";
  const statusClass = status === "done" ? "is-done" : status === "error" ? "is-error" : "is-live";

  return (
    <div className="office-window">
      <div className="office-window__titlebar">
        <div className="office-window__dots">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
        </div>
        <span className="office-window__title">{topic || "DISKUSI AI"}</span>
        <span className={`office-window__status ${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="office-window__body">
        <div className="office-window__room">
          <OfficeScene ref={officeSceneRef} participants={participants} />
        </div>
        <ActivityLog
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
    </div>
  );
}
