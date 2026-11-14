"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameContext, GameCtx, WinType } from "./ctx";
import { Face } from "./Face";
import { Ico } from "./apps/Icons";
import { DocWin, Explorer, ListWin, PhotoWin, ScanWin, VideoWin } from "./apps/Evidence";
import { HumanDB } from "./apps/HumanDB";
import { Registry } from "./apps/Registry";
import { Terminal } from "./apps/Terminal";
import { Help, Notes, Profile } from "./apps/Misc";
import { Management } from "./apps/Management";
import { buildMission, Mission } from "@/game/missions";
import { GRADES, MISSIONS_PER_GRADE, gradeIndex } from "@/game/grades";
import { Save, clearSave, ensureCadre, loadSave, newSave, writeSave } from "@/game/save";
import { Clue, VType, displayName, fullName, getWorld, normStr } from "@/game/world";

interface ChatMsg {
  from: "agent" | "me" | "sys";
  text: string;
  file?: string;
}
interface WinState {
  key: string;
  type: WinType;
  title: string;
  props: Record<string, unknown>;
  x: number;
  y: number;
  z: number;
  min: boolean;
}
type Overlay =
  | { type: "success"; score: number; promoted: boolean; next: Save }
  | { type: "fail"; next: Save };

const SIZES: Record<WinType, [number, number]> = {
  explorer: [520, 330],
  video: [560, 520],
  scan: [340, 470],
  photo: [460, 440],
  doc: [440, 320],
  list: [380, 470],
  humandb: [660, 520],
  registry: [700, 560],
  terminal: [560, 380],
  notes: [380, 420],
  profile: [430, 560],
  manage: [780, 560],
  help: [520, 480],
};
const TITLES: Partial<Record<WinType, string>> = {
  explorer: "Explorateur de fichiers",
  humandb: "HumanDB",
  registry: "Registre des assurances",
  terminal: "HAL",
  notes: "Carnet d'enquête",
  profile: "Dossier opérateur",
  manage: "Direction des opérateurs",
  help: "Aide",
};

function Win({
  w,
  focused,
  onFocus,
  onClose,
  onMin,
  onMove,
  children,
}: {
  w: WinState;
  focused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMin: () => void;
  onMove: (x: number, y: number) => void;
  children: React.ReactNode;
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const size = SIZES[w.type];
  return (
    <div
      className="win"
      onPointerDown={onFocus}
      style={{
        left: w.x,
        top: w.y,
        width: size[0],
        height: size[1],
        maxWidth: "98%",
        maxHeight: "calc(100% - 6px)",
        zIndex: w.z,
        display: w.min ? "none" : "flex",
        boxShadow: focused ? undefined : "none",
        opacity: focused ? 1 : 0.96,
      }}
    >
      <div
        className="win-head"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = { dx: e.clientX - w.x, dy: e.clientY - w.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          onMove(Math.max(-size[0] + 140, e.clientX - drag.current.dx), Math.max(0, e.clientY - drag.current.dy));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <span>{w.title}</span>
        <span>
          <button onClick={onMin}>–</button>
          <button onClick={onClose}>✕</button>
        </span>
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}

export default function Game() {
  const [save, setSave] = useState<Save | null>(null);
  const [stored, setStored] = useState<Save | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("E. TANNER");
  const [startGrade, setStartGrade] = useState(0);

  useEffect(() => {
    setStored(loadSave());
    setReady(true);
  }, []);

  const update = useCallback((f: (s: Save) => Save) => {
    setSave((s) => {
      if (!s) return s;
      const n = ensureCadre(f(s));
      writeSave(n);
      return n;
    });
  }, []);

  if (!ready) return <div className="desk h-screen" />;

  if (!playing || !save) {
    return (
      <div className="desk crt grid h-screen place-items-center">
        <div className="win !relative w-[560px] max-w-[95vw]">
          <div className="win-head" style={{ cursor: "default" }}><span>FBI — Terminal opérateur sécurisé</span><span className="mono text-[11px]">v2.4.1</span></div>
          <div className="p-6">
            <div className="text-[34px] font-black tracking-wide">THE <span className="text-[#2cff8a]">OPERATOR</span></div>
            <p className="mt-1 text-[13px] text-[#5fa8bb]">Vous êtes opérateur au FBI. Aidez les agents de terrain à résoudre leurs enquêtes depuis votre bureau : vidéos, scans, base HumanDB et registres d&apos;assurance.</p>
            {stored && (
              <div className="mt-5 border border-[#2cff8a]/50 p-3">
                <div className="text-[12px] text-[#5fa8bb]">PARTIE SAUVEGARDÉE</div>
                <div className="font-bold">{stored.name} — {GRADES[gradeIndex(stored.completed)].name} — {stored.completed} affaires résolues</div>
                <button className="btn green mt-2" onClick={() => { setSave(stored); setPlaying(true); }}>▶ Continuer</button>
              </div>
            )}
            <div className="mt-5">
              <label className="lbl">Nom d&apos;opérateur</label>
              <input className="inp mono" value={name} onChange={(e) => setName(e.target.value)} maxLength={22} />
            </div>
            <div className="mt-3 flex items-end gap-3">
              <button
                className="btn yellow"
                onClick={() => {
                  const n = newSave(name.trim() || "E. TANNER", startGrade);
                  writeSave(n);
                  setSave(n);
                  setPlaying(true);
                }}
              >
                Nouvelle carrière
              </button>
              <div>
                <label className="lbl">Mode test : démarrer au grade</label>
                <select className="inp" value={startGrade} onChange={(e) => setStartGrade(Number(e.target.value))}>
                  {GRADES.map((g, i) => <option key={g.name} value={i}>{i + 1}. {g.name}</option>)}
                </select>
              </div>
              {stored && <button className="btn red ml-auto" onClick={() => { clearSave(); setStored(null); }}>Effacer la sauvegarde</button>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Play save={save} update={update} onExit={() => { setStored(save); setPlaying(false); }} />;
}

function Play({ save, update, onExit }: { save: Save; update: (f: (s: Save) => Save) => void; onExit: () => void }) {
  const w = getWorld();
  const [mission, setMission] = useState<Mission>(() => buildMission(save.completed, save.attempt));
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [wins, setWins] = useState<WinState[]>([]);
  const [listIds, setListIdsS] = useState<number[] | null>(null);
  const [listFilter, setListFilter] = useState(false);
  const [wrong, setWrong] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [guess, setGuess] = useState("");
  const [menu, setMenu] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const zRef = useRef(10);
  const timers = useRef<number[]>([]);
  const qRef = useRef(0);
  const revealedRef = useRef<Record<string, boolean>>({});
  const missionRef = useRef<Mission>(mission);
  const chatEnd = useRef<HTMLDivElement>(null);

  const grade = gradeIndex(save.completed);
  const clearance = GRADES[grade].clearance;
  const opName = save.name.toUpperCase();
  const lastName = opName.split(/\s+/).slice(-1)[0];

  const say = useCallback((msgs: ChatMsg[]) => {
    msgs.forEach((m) => {
      const now = Date.now();
      const at = Math.max(now, qRef.current) + 750;
      qRef.current = at;
      timers.current.push(window.setTimeout(() => setChat((c) => [...c, m]), at - now));
    });
  }, []);

  const begin = useCallback(
    (m: Mission) => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
      qRef.current = 0;
      revealedRef.current = {};
      missionRef.current = m;
      setRevealed({});
      setChat([{ from: "sys", text: `[ AFFAIRE #${m.caseNo} — ${m.title} ]` }]);
      setListIdsS(null);
      setListFilter(false);
      setWrong(0);
      setPenalty(0);
      setElapsed(0);
      setOverlay(null);
      setSubmitOpen(false);
      setGuess("");
      setMission(m);
      zRef.current += 1;
      setWins([{ key: "explorer", type: "explorer", title: TITLES.explorer as string, props: {}, x: 40, y: 150, z: zRef.current, min: false }]);
      const intro: ChatMsg[] = [];
      m.intro.forEach((t, i) => {
        intro.push({ from: "agent", text: t.replace("{op}", lastName) });
        if (i === 1) intro.push({ from: "me", text: "C'est bien moi !" });
      });
      intro.push({ from: "me", text: "Je m'en occupe." });
      intro.push({ from: "agent", text: "Voici les fichiers.", file: "folder" });
      if (m.n === 0 && m.attempt === 0) {
        intro.push({ from: "sys", text: "TUTORIEL : ouvrez les fichiers de l'explorateur puis analysez-les" });
        intro.push({ from: "agent", text: "Astuce : sur une vidéo, cherchez l'image la plus nette (qualité > 70%) avant de capturer." });
      }
      say(intro);
    },
    [say, lastName],
  );

  useEffect(() => {
    begin(mission);
    return () => timers.current.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (overlay) return;
    const i = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(i);
  }, [overlay]);

  const visibleCount = Math.min(mission.evidences.length, 2 + Object.keys(revealed).length);

  const openWin = useCallback((key: string, type: WinType, title: string, props: Record<string, unknown> = {}) => {
    setWins((ws) => {
      zRef.current += 1;
      const z = zRef.current;
      const ex = ws.find((x) => x.key === key);
      if (ex) return ws.map((x) => (x.key === key ? { ...x, z, min: false, props: { ...x.props, ...props } } : x));
      const k = ws.length % 7;
      return [...ws, { key, type, title, props, x: 50 + k * 30, y: 20 + k * 28, z, min: false }];
    });
  }, []);

  const reveal = useCallback(
    (id: string) => {
      const m = missionRef.current;
      if (revealedRef.current[id]) return;
      revealedRef.current = { ...revealedRef.current, [id]: true };
      setRevealed(revealedRef.current);
      const ev = m.evidences.find((e) => e.id === id);
      if (!ev) return;
      const msgs: ChatMsg[] = [];
      if (ev.clues.length) {
        msgs.push({ from: "me", text: `Résultat de l'analyse : ${ev.clues.length} élément(s) ajouté(s) au carnet.` });
        msgs.push({ from: "agent", text: ["Merci pour votre aide, opérateur " + lastName + ".", "Bon travail. On avance.", "Intéressant... Notez-le bien.", "Ça nous donne une piste, merci."][ev.id.charCodeAt(1) % 4] });
      }
      const cnt = Object.keys(revealedRef.current).length;
      const before = Math.min(m.evidences.length, 2 + cnt - 1);
      const after = Math.min(m.evidences.length, 2 + cnt);
      if (after > before) {
        msgs.push({ from: "agent", text: "Je vous envoie un autre fichier.", file: m.evidences[after - 1].id });
      }
      const clueEvs = m.evidences.filter((e) => e.clues.length);
      if (ev.clues.length && clueEvs.every((e) => revealedRef.current[e.id])) {
        msgs.push({ from: "agent", text: "Je crois que vous avez tout. Croisez vos indices avec HumanDB et les registres, puis envoyez-moi le nom." });
      }
      if (msgs.length) say(msgs);
    },
    [say, lastName],
  );

  const openEv = useCallback(
    (id: string) => {
      const m = missionRef.current;
      const idx = m.evidences.findIndex((e) => e.id === id);
      if (idx < 0 || idx >= 2 + Object.keys(revealedRef.current).length) return;
      const ev = m.evidences[idx];
      const type: WinType = ev.kind === "list" ? "list" : ev.kind === "video" ? "video" : ev.kind === "doc" ? "doc" : "photo";
      openWin(`ev:${id}`, type, ev.title, { evId: id });
    },
    [openWin],
  );

  const openApp = useCallback(
    (type: WinType, props: Record<string, unknown> = {}) => {
      if (type === "scan") {
        const ev = missionRef.current.evidences.find((e) => e.id === props.evId);
        openWin(`scan:${props.evId}`, "scan", ev?.video?.reveal === "body" ? "ANALYSE MORPHOLOGIQUE" : "SUSPECT", props);
        return;
      }
      openWin(type, type, TITLES[type] ?? type, props);
    },
    [openWin],
  );

  const clues: Clue[] = useMemo(() => mission.evidences.filter((e) => revealed[e.id]).flatMap((e) => e.clues), [mission, revealed]);

  const ctx: GameCtx = {
    mission,
    revealed,
    visibleCount,
    reveal,
    openEv,
    openApp,
    openProfile: (id) => openWin("humandb", "humandb", TITLES.humandb as string, { profileId: id, nonce: Date.now() }),
    openRegistry: (vtype: VType, plate?: string) => openWin("registry", "registry", TITLES.registry as string, { vtype, plate, nonce: Date.now() }),
    listIds,
    setListIds: setListIdsS,
    listFilter,
    setListFilter,
    clues,
    penalize: (n) => setPenalty((p) => p + n),
    save,
    updateSave: update,
    grade,
    clearance,
    opName,
  };

  const submit = () => {
    const c = w.people[mission.culpritId];
    const g = normStr(guess).replace(/\s+/g, " ");
    if (!g) return;
    const ok = g === normStr(fullName(c)) || g === normStr(`${c.last} ${c.first}`);
    setSubmitOpen(false);
    setGuess("");
    if (ok) {
      const score = Math.max(20, 100 - wrong * 15 - penalty);
      const ns = ensureCadre({
        ...save,
        completed: save.completed + 1,
        attempt: 0,
        score: save.score + score,
        budget: save.budget + score * 5,
        rep: Math.min(100, save.rep + 1),
      });
      update(() => ns);
      say([{ from: "me", text: `Le coupable est ${displayName(c)}.` }, { from: "agent", text: "C'est bien lui ! Excellent travail, on l'interpelle tout de suite." }]);
      timers.current.push(window.setTimeout(() => setOverlay({ type: "success", score, promoted: gradeIndex(ns.completed) > grade, next: ns }), 2200));
    } else {
      const nw = wrong + 1;
      setWrong(nw);
      setChat((ch) => [...ch, { from: "me", text: `Le coupable est ${guess}.` }]);
      if (nw >= 3) {
        const ns = { ...save, failed: save.failed + 1, attempt: save.attempt + 1, rep: Math.max(0, save.rep - 3) };
        update(() => ns);
        say([{ from: "agent", text: "Négatif... Ce n'est pas lui. On a perdu sa trace. L'affaire est classée." }]);
        timers.current.push(window.setTimeout(() => setOverlay({ type: "fail", next: ns }), 2200));
      } else {
        say([{ from: "agent", text: `Négatif, ce n'est pas lui. Vérifiez vos informations. Il vous reste ${3 - nw} essai(s).` }]);
      }
    }
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const top = wins.length ? Math.max(...wins.filter((x) => !x.min).map((x) => x.z), 0) : 0;
  const agent = mission.agent;

  const content = (x: WinState) => {
    const p = x.props as Record<string, never>;
    switch (x.type) {
      case "explorer": return <Explorer />;
      case "video": return <VideoWin evId={p.evId as string} />;
      case "scan": return <ScanWin evId={p.evId as string} />;
      case "photo": return <PhotoWin evId={p.evId as string} />;
      case "doc": return <DocWin evId={p.evId as string} />;
      case "list": return <ListWin evId={p.evId as string} />;
      case "humandb": return <HumanDB profileId={p.profileId as number | undefined} nonce={p.nonce as number | undefined} />;
      case "registry": return <Registry vtype={p.vtype as VType | undefined} plate={p.plate as string | undefined} nonce={p.nonce as number | undefined} />;
      case "terminal": return <Terminal />;
      case "notes": return <Notes />;
      case "profile": return <Profile />;
      case "manage": return <Management />;
      case "help": return <Help />;
    }
  };

  const apps: [string, string, WinType][] = [
    ["Explorateur de fichiers", "folder", "explorer"],
    ["HumanDB", "db", "humandb"],
    ["Registre des assurances", "car", "registry"],
    ["HAL (terminal)", "term", "terminal"],
    ["Carnet d'enquête", "docs", "notes"],
    ["Dossier opérateur", "cases", "profile"],
    ...(grade >= GRADES.length - 1 ? ([["Direction des opérateurs", "team", "manage"]] as [string, string, WinType][]) : []),
  ];

  return (
    <GameContext.Provider value={ctx}>
      <div className="crt flex h-screen min-w-[1100px] flex-col">
        {/* TOP BAR */}
        <div className="topbar relative">
          <button className="tb-btn !border-l-0 !text-[20px]" onClick={() => setMenu(!menu)}>☰ Applications</button>
          <div className="objective">{mission.objective}</div>
          <button className="send-btn" onClick={() => setSubmitOpen(true)}>{mission.submitLabel}</button>
          <button className="tb-btn !px-3" onClick={() => openApp("help")}>?</button>
          <div className="flex-1" />
          <button className="tb-btn active">☎ {agent.name} {agent.last}</button>
          <button className="tb-btn" onClick={() => openApp("profile")}>☎ Superviseur</button>
          <button className="tb-btn" onClick={() => openApp("profile")}>
            <span className="text-[#6fdcff]">✪</span>
            <span className="leading-tight">{opName}<div className="text-[9px] font-normal text-[#ffd23a]">{GRADES[grade].short}</div></span>
          </button>
          <div className="mono flex items-center px-4 text-[22px] font-bold text-[#2cff8a]">{mm}:{ss}</div>
          {menu && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setMenu(false)} />
              <div className="absolute left-0 top-[46px] z-[100] w-[270px] border-2 border-[#1fc3e6] bg-[#031722] shadow-xl">
                {apps.map(([l, ic, t]) => (
                  <button key={t} className="tb-btn !w-full !border-l-0 !py-2 !normal-case" onClick={() => { openApp(t); setMenu(false); }}>
                    <Ico kind={ic} size={22} /> {l}
                  </button>
                ))}
                <button className="tb-btn !w-full !border-l-0 !py-2 !normal-case !text-[#ffd23a]" onClick={() => { setMenu(false); onExit(); }}>
                  ⏻ Sauvegarder et quitter
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex min-h-0 flex-1">
          {/* DESKTOP */}
          <div className="desk relative min-w-0 flex-1 overflow-hidden">
            <div className="absolute left-3 top-3 z-[1] flex max-w-[640px] flex-wrap gap-2">
              <button className="icon" onClick={() => openApp("notes")}><Ico kind="docs" /><span>Documents</span></button>
              <button className="icon" onClick={() => openApp("profile")}><Ico kind="cases" /><span>Affaires</span></button>
              <button className="icon" onClick={() => openApp("explorer")}><Ico kind="folder" /><span>{mission.folder}</span></button>
              <button className="icon" onClick={() => openApp("humandb")}><Ico kind="db" /><span>HumanDB</span></button>
              <button className="icon" onClick={() => openApp("registry")}><Ico kind="car" /><span>Assurances</span></button>
              <button className="icon" onClick={() => openApp("terminal")}><Ico kind="term" /><span>HAL</span></button>
              {grade >= GRADES.length - 1 && (
                <button className="icon" onClick={() => openApp("manage")}><Ico kind="team" /><span>Direction</span></button>
              )}
            </div>
            <div className="absolute bottom-3 left-3 z-[1]">
              <div className="icon" style={{ cursor: "default" }}><Ico kind="trash" /><span>Corbeille</span></div>
            </div>
            {wins.map((x) => (
              <Win
                key={x.key}
                w={x}
                focused={x.z === top}
                onFocus={() => {
                  if (x.z === zRef.current) return;
                  zRef.current += 1;
                  const z = zRef.current;
                  setWins((ws) => ws.map((q) => (q.key === x.key ? { ...q, z } : q)));
                }}
                onClose={() => setWins((ws) => ws.filter((q) => q.key !== x.key))}
                onMin={() => setWins((ws) => ws.map((q) => (q.key === x.key ? { ...q, min: true } : q)))}
                onMove={(nx, ny) => setWins((ws) => ws.map((q) => (q.key === x.key ? { ...q, x: nx, y: ny } : q)))}
              >
                {content(x)}
              </Win>
            ))}
          </div>

          {/* RIGHT PANEL */}
          <aside className="flex w-[340px] shrink-0 flex-col border-l-2 border-[#1fc3e6] bg-[#031722]">
            <div className="flex gap-3 p-3">
              <div className="h-[92px] w-[76px] shrink-0 overflow-hidden border border-[#1fc3e6]/60">
                <Face t={agent.traits} className="h-full w-full" />
              </div>
              <div className="flex-1">
                <div className="text-[19px] font-black leading-tight">{agent.name} {agent.last}</div>
                <div className="text-[13px] text-[#5fa8bb]">Agent #{agent.id}</div>
                <div className="kv mt-2">
                  <span>IP</span><span className="mono">222.54.1.{(mission.caseNo % 90) + 10}</span>
                  <span>Sécurisé</span><span>VRAI</span>
                  <span>État</span><span className="font-bold text-[#2cff8a]">CONNECTÉ</span>
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
              {chat.map((m, i) => (
                <div key={i} className="flex flex-col">
                  {m.from === "sys" ? (
                    <div className="chat sys">{m.text}</div>
                  ) : (
                    <div className={`chat ${m.from}`}>{m.text}</div>
                  )}
                  {m.file && (
                    <button className="icon self-start" onClick={() => (m.file === "folder" ? openApp("explorer") : openEv(m.file as string))}>
                      <Ico kind={m.file === "folder" ? "folder" : (mission.evidences.find((e) => e.id === m.file)?.kind ?? "doc")} />
                      <span>{m.file === "folder" ? mission.folder : mission.evidences.find((e) => e.id === m.file)?.title.slice(0, 16)}</span>
                    </button>
                  )}
                </div>
              ))}
              <div ref={chatEnd} />
            </div>
            <div className="flex justify-between border-t border-[#1fc3e6]/40 px-3 py-1 text-[11px] text-[#5fa8bb]">
              <span>Essais : {Math.max(0, 3 - wrong)}/3</span>
              <span>Pièces : {Object.keys(revealed).length}/{mission.evidences.length}</span>
              <span>Affaire n°{save.completed + 1}</span>
            </div>
          </aside>
        </div>

        {/* TASKBAR */}
        <div className="taskbar">
          {wins.map((x) => (
            <button
              key={x.key}
              className={`task ${!x.min && x.z === top ? "on" : ""}`}
              onClick={() => {
                zRef.current += 1;
                const z = zRef.current;
                setWins((ws) => ws.map((q) => (q.key === x.key ? { ...q, z, min: !q.min && q.z === top ? true : false } : q)));
              }}
            >
              {x.title}
            </button>
          ))}
        </div>

        {/* SUBMIT */}
        {submitOpen && (
          <div className="modal-bg" onClick={() => setSubmitOpen(false)}>
            <div className="win !relative w-[460px]" onClick={(e) => e.stopPropagation()}>
              <div className="win-head" style={{ cursor: "default" }}><span>{mission.submitLabel}</span><button onClick={() => setSubmitOpen(false)}>✕</button></div>
              <form className="p-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <label className="lbl">Prénom et nom (ex : Henry Jenkins)</label>
                <input className="inp !py-2 !text-[15px]" autoFocus value={guess} onChange={(e) => setGuess(e.target.value)} />
                <p className="mt-2 text-[11px] text-[#ffd23a]">Attention : il vous reste {3 - wrong} essai(s). Vérifiez avec HumanDB avant d&apos;envoyer.</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" className="btn" onClick={() => setSubmitOpen(false)}>Annuler</button>
                  <button type="submit" className="btn yellow">Envoyer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RESULT */}
        {overlay && (
          <div className="modal-bg">
            <div className="win !relative w-[520px] max-w-[95vw]">
              <div className="win-head" style={{ cursor: "default" }}>
                <span>{overlay.type === "success" ? "Affaire résolue" : "Affaire classée"}</span>
              </div>
              <div className="p-6 text-center">
                {overlay.type === "success" ? (
                  <>
                    <div className="text-[32px] font-black text-[#2cff8a]">AFFAIRE RÉSOLUE</div>
                    <p className="mt-1">Score : <b className="text-[#ffd23a]">{overlay.score}</b> / 100 — {overlay.next.completed} affaire(s) résolue(s)</p>
                    {overlay.promoted && (
                      <div className="mt-4 border-2 border-[#ffd23a] p-3">
                        <div className="text-[12px] uppercase text-[#ffd23a]">★ Promotion ★</div>
                        <div className="text-[22px] font-black">{GRADES[gradeIndex(overlay.next.completed)].name}</div>
                        <div className="text-[12px] text-[#8fe9ff]">{GRADES[gradeIndex(overlay.next.completed)].blurb}</div>
                        {gradeIndex(overlay.next.completed) === GRADES.length - 1 && (
                          <div className="mt-2 text-[13px] text-[#2cff8a]">Vous dirigez désormais les autres opérateurs. Ouvrez « Direction » depuis le bureau.</div>
                        )}
                      </div>
                    )}
                    {!overlay.promoted && gradeIndex(overlay.next.completed) < GRADES.length - 1 && (
                      <p className="mt-2 text-[12px] text-[#5fa8bb]">Prochaine promotion dans {MISSIONS_PER_GRADE - (overlay.next.completed % MISSIONS_PER_GRADE)} affaire(s).</p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-[30px] font-black text-[#ff4d4d]">ÉCHEC DE L&apos;ENQUÊTE</div>
                    <p className="mt-1 text-[13px]">Le suspect a disparu. Le dossier est archivé. Une nouvelle affaire vous attend.</p>
                  </>
                )}
                <button
                  className="btn green mt-5"
                  onClick={() => {
                    setWins([]);
                    begin(buildMission(overlay.next.completed, overlay.next.attempt));
                  }}
                >
                  Affaire suivante ▶
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameContext.Provider>
  );
}
