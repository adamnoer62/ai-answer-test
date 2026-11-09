import { useEffect, useRef, useState } from "react";
import { PencilLine, Swords, Trophy } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import SetupView from "./components/SetupView.jsx";
import ArenaView from "./components/ArenaView.jsx";
import VerdictView from "./components/VerdictView.jsx";
import AgentModal from "./components/AgentModal.jsx";
import { getConfig, createSession, addModel, patchModel, deleteModel, subscribeToSession } from "./api.js";
import { isClashResponse } from "./clash.js";

const STEPS = [
  { key: "setup", label: "Siapkan", icon: PencilLine },
  { key: "arena", label: "Diskusi", icon: Swords },
  { key: "verdict", label: "Kesimpulan", icon: Trophy },
];

export default function App() {
  const [config, setConfig] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState(new Set());
  const [judgeId, setJudgeId] = useState(null);
  const [rounds, setRounds] = useState(3);
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState("setup");
  const [sessionId, setSessionId] = useState(null);
  const [setupError, setSetupError] = useState("");
  const [starting, setStarting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModel, setEditModel] = useState(null);

  const [arenaTopic, setArenaTopic] = useState("");
  const [arenaStatus, setArenaStatus] = useState("live");
  const [arenaParticipants, setArenaParticipants] = useState([]);
  const [maxRounds, setMaxRounds] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [doneRounds, setDoneRounds] = useState(new Set());
  const [stoppedRound, setStoppedRound] = useState(null);
  const [roundsData, setRoundsData] = useState([]);
  const [liveEntries, setLiveEntries] = useState([]);
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [judgeThinking, setJudgeThinking] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [participantsById, setParticipantsById] = useState({});
  const [participantsByLabel, setParticipantsByLabel] = useState({});

  const battleStripRef = useRef(null);
  const officeSceneRef = useRef(null);
  const unsubRef = useRef(null);

  async function refreshConfig() {
    const cfg = await getConfig();
    setConfig(cfg);
    setModels(cfg.models);
    setSelectedParticipants((prev) => (prev.size ? prev : new Set(cfg.defaultParticipantIds)));
    setJudgeId((prev) => prev || cfg.defaultJudgeId);
    setRounds((prev) => prev || cfg.settings.defaultRounds);
    return cfg;
  }

  useEffect(() => {
    refreshConfig();
    return () => unsubRef.current?.();
  }, []);

  function toggleParticipant(id) {
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDelete(id) {
    await deleteModel(id);
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setJudgeId((prev) => (prev === id ? config?.defaultJudgeId : prev));
    await refreshConfig();
  }

  async function handleAgentSubmit(payload) {
    if (editModel) {
      await patchModel(editModel.id, payload);
    } else {
      const { model } = await addModel(payload);
      setSelectedParticipants((prev) => new Set(prev).add(model.id));
    }
    await refreshConfig();
    setModalOpen(false);
    setEditModel(null);
  }

  function openAddAgent() {
    setEditModel(null);
    setModalOpen(true);
  }
  function openEditAgent(model) {
    setEditModel(model);
    setModalOpen(true);
  }

  async function startSession() {
    setSetupError("");
    if (!prompt.trim()) return setSetupError("Isi dulu topik/pertanyaannya ya.");
    if (selectedParticipants.size < 2) return setSetupError("Pilih minimal 2 peserta diskusi di panel kiri.");

    setStarting(true);
    try {
      const { sessionId: id } = await createSession({
        prompt: prompt.trim(),
        rounds,
        participantIds: Array.from(selectedParticipants),
        judgeId,
      });
      setSessionId(id);
      enterArena(id, prompt.trim());
    } catch (err) {
      setSetupError(err.message);
    } finally {
      setStarting(false);
    }
  }

  function enterArena(id, topic) {
    setStep("arena");
    setArenaTopic(topic);
    setArenaStatus("live");
    setRoundsData([]);
    setLiveEntries([]);
    setDoneRounds(new Set());
    setStoppedRound(null);
    setStoppedEarly(false);
    setErrorMessage("");
    setJudgeThinking(false);
    setVerdict(null);
    setCurrentRound(0);
    setParticipantsById({});
    setParticipantsByLabel({});

    unsubRef.current?.();
    unsubRef.current = subscribeToSession(id, {
      "session-start": (data) => {
        setMaxRounds(data.maxRounds);
        const byId = {};
        const byLabel = {};
        [...data.participants, data.judge].forEach((p) => {
          byId[p.id] = p;
          byLabel[p.label] = p;
        });
        setParticipantsById(byId);
        setParticipantsByLabel(byLabel);
        setArenaParticipants(data.participants);
        battleStripRef.current?.reset();
        officeSceneRef.current?.reset();
      },
      "round-start": (data) => {
        setCurrentRound(data.round);
        setLiveEntries([]);
        battleStripRef.current?.reset();
        officeSceneRef.current?.reset();
      },
      "participant-start": (data) => {
        setLiveEntries((prev) => [...prev, { ...data, status: "thinking" }]);
        battleStripRef.current?.setThinking(data.id);
        officeSceneRef.current?.setThinking(data.id);
      },
      "participant-done": (data) => {
        const clash = data.ok && isClashResponse(data.text);
        setLiveEntries((prev) => prev.map((e) => (e.id === data.id ? { ...e, ...data, status: "done" } : e)));
        battleStripRef.current?.resolve(data.id, { clash });
        officeSceneRef.current?.resolve(data.id, { clash });
      },
      "round-end": (data) => {
        setRoundsData((prev) => [...prev, { entries: data.entries }]);
        setDoneRounds((prev) => new Set(prev).add(data.round));
      },
      "stopped-early": (data) => {
        setStoppedEarly(true);
        setStoppedRound(data.round);
      },
      "judge-start": () => setJudgeThinking(true),
      "session-done": (data) => {
        setJudgeThinking(false);
        setArenaStatus("done");
        setVerdict(data.verdict);
        setTimeout(() => setStep("verdict"), 500);
      },
      "session-error": (data) => {
        setJudgeThinking(false);
        setArenaStatus("error");
        setErrorMessage(data.message);
      },
    });
  }

  function restart() {
    unsubRef.current?.();
    setSessionId(null);
    setStep("setup");
  }

  if (!config) return null;

  return (
    <div className="shell">
      <Sidebar
        models={models}
        selectedParticipants={selectedParticipants}
        judgeId={judgeId}
        onToggleParticipant={toggleParticipant}
        onSetJudge={setJudgeId}
        onDelete={handleDelete}
        onAddAgent={openAddAgent}
        onEditAgent={openEditAgent}
        onNewDiscussion={restart}
      />

      <div className="main">
        <header className="topbar">
          <div className="topbar__steps">
            {STEPS.map(({ key, label, icon: Icon }, i) => {
              const order = STEPS.map((s) => s.key);
              const cls =
                "step" +
                (step === key ? " is-active" : "") +
                (order.indexOf(key) < order.indexOf(step) ? " is-done" : "");
              return (
                <span className={cls} key={key}>
                  <Icon size={14} />
                  {label}
                </span>
              );
            })}
          </div>
        </header>

        <main id="app">
          {step === "setup" && (
            <SetupView
              models={models}
              selectedParticipants={selectedParticipants}
              judgeId={judgeId}
              rounds={rounds}
              settings={config.settings}
              error={setupError}
              onRoundsChange={setRounds}
              prompt={prompt}
              onPromptChange={setPrompt}
            />
          )}
          {step === "arena" && (
            <ArenaView
              battleStripRef={battleStripRef}
              officeSceneRef={officeSceneRef}
              participants={arenaParticipants}
              topic={arenaTopic}
              status={arenaStatus}
              maxRounds={maxRounds}
              currentRound={currentRound}
              doneRounds={doneRounds}
              stoppedRound={stoppedRound}
              rounds={roundsData}
              liveEntries={liveEntries}
              stoppedEarly={stoppedEarly}
              errorMessage={errorMessage}
              judgeThinking={judgeThinking}
              participantsById={participantsById}
            />
          )}
          {step === "verdict" && (
            <VerdictView
              verdict={verdict}
              stoppedEarly={stoppedEarly}
              participantsByLabel={participantsByLabel}
              onDownloadMd={() => sessionId && (window.location.href = `/api/session/${sessionId}/transcript.md`)}
              onDownloadJson={() => sessionId && (window.location.href = `/api/session/${sessionId}/transcript.json`)}
              onRestart={restart}
            />
          )}
        </main>

        {step === "setup" && (
          <footer className="app-footer">
            <button className="btn-3d btn-3d--green btn-3d--wide" onClick={startSession} disabled={starting}>
              {starting ? "MENYIAPKAN…" : "MULAI DISKUSI"}
            </button>
          </footer>
        )}
      </div>

      <AgentModal
        open={modalOpen}
        engines={config.engines}
        palette={config.palette}
        editModel={editModel}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgentSubmit}
      />
    </div>
  );
}
