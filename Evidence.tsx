"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../ctx";
import { Ico } from "./Icons";
import { FaceScan } from "../Face";
import { EyeArt, SceneArt, Silhouette, VehicleArt } from "../Art";
import { describeClue, getWorld, displayName, normStr } from "@/game/world";
import type { Evidence } from "@/game/missions";

function useEv(id: string): Evidence {
  const { mission } = useGame();
  return mission.evidences.find((e) => e.id === id) as Evidence;
}

export function Explorer() {
  const g = useGame();
  const { mission } = g;
  return (
    <div>
      <div className="mono mb-3 inline-block bg-[#ffd23a] px-2 py-0.5 text-[12px] font-bold text-black">
        ./{g.opName.replace(/\s+/g, "")}/Affaires/{mission.agent.last}/{mission.folder}
      </div>
      <div className="flex flex-wrap gap-3">
        {mission.evidences.slice(0, g.visibleCount).map((e) => (
          <button key={e.id} className="icon" onClick={() => g.openEv(e.id)} title={e.title}>
            <Ico kind={e.kind} />
            <span>{e.title.length > 18 ? e.title.slice(0, 17) + "…" : e.title}</span>
            {g.revealed[e.id] && <span className="absolute right-1 top-1 text-[14px] font-black text-[#2cff8a]">✓</span>}
          </button>
        ))}
        {g.visibleCount < mission.evidences.length && (
          <div className="icon opacity-40" style={{ cursor: "default" }}>
            <Ico kind="folder" />
            <span>Verrouillé…</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-[11px] text-[#5fa8bb]">
        Ouvrez chaque fichier et analysez-le. Chaque analyse réussie débloque de nouveaux fichiers.
      </p>
    </div>
  );
}

export function VideoWin({ evId }: { evId: string }) {
  const g = useGame();
  const ev = useEv(evId);
  const v = ev.video!;
  const [t, setT] = useState(0.03);
  const [play, setPlay] = useState(false);
  const [msg, setMsg] = useState("");
  const done = !!g.revealed[ev.id];

  useEffect(() => {
    if (!play) return;
    const i = setInterval(() => setT((x) => (x + 0.004 > 1 ? 0 : x + 0.004)), 60);
    return () => clearInterval(i);
  }, [play]);

  const quality = Math.round(Math.max(8, 95 - Math.abs(t - v.good) * 330));
  const frame = Math.round(t * v.duration * 6);
  const secs = t * v.duration;
  const ts = `${Math.floor(secs / 60)}' ${String(Math.floor(secs % 60)).padStart(2, "0")}"`;
  const info: [string, string][] = [
    ["TEMPS", ts], ["IMAGE", String(frame)], ["IP", String(70 + (frame % 90))],
    ["CODEC", "MC4"], ["QUALITÉ", `${quality}%`], ["DÉF.", "720x405"],
    ["AFFAIRE", `#${g.mission.caseNo}`], ["SOURCE", v.cam], ["IPS", "6"],
  ];

  const capture = () => {
    setPlay(false);
    if (quality < 70) {
      setMsg("Image trop floue pour une analyse. Cherchez le moment où la qualité est la meilleure.");
      return;
    }
    setMsg("");
    g.openApp("scan", { evId: ev.id });
  };

  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#1fc3e6]/60 bg-black">
        <SceneArt scene={v.scene} t={t} />
        <div className="noise" />
        <div className="mono absolute left-2 top-2 bg-black/60 px-1 text-[12px] text-white">
          01/17 {String(1 + Math.floor(secs / 3600)).padStart(2, "0")}:{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(Math.floor(secs % 60)).padStart(2, "0")}
        </div>
        <div className="mono absolute right-2 top-2 text-[12px] font-bold text-red-400"><span className="blink">●</span> REC</div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button className="btn" onClick={() => setPlay(!play)}>{play ? "❚❚" : "▶"}</button>
        <input type="range" className="range" min={0} max={1000} value={Math.round(t * 1000)} onChange={(e) => { setPlay(false); setT(Number(e.target.value) / 1000); }} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {info.map(([k, val]) => (
          <div key={k} className="flex text-[11px]">
            <span className="w-[62px] bg-[#1fc3e6]/12 px-1 py-0.5 text-[10px] text-[#5fa8bb]">{k}</span>
            <span className="mono flex-1 bg-[#1fc3e6]/8 px-1 py-0.5" style={k === "QUALITÉ" ? { color: quality >= 70 ? "#2cff8a" : "#ff9d4d" } : undefined}>{val}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="btn green" onClick={capture}>
          {v.reveal === "face" ? "◉ Capturer le visage" : "◉ Analyse morphologique"}
        </button>
        {done && <span className="badge ok">ANALYSE EFFECTUÉE</span>}
      </div>
      {msg && <p className="mt-2 text-[12px] text-[#ff9d4d]">{msg}</p>}
      {!msg && !done && <p className="mt-2 text-[11px] text-[#5fa8bb]">Astuce : faites défiler la vidéo, puis capturez l&apos;image quand la qualité dépasse 70%.</p>}
    </div>
  );
}

export function ScanWin({ evId }: { evId: string }) {
  const g = useGame();
  const ev = useEv(evId);
  const v = ev.video!;
  const w = getWorld();
  const subject = w.people[v.subject];
  const [phase, setPhase] = useState<"scan" | "done">(g.revealed[ev.id] ? "done" : "scan");
  useEffect(() => {
    if (phase === "done") return;
    const i = setTimeout(() => {
      setPhase("done");
      g.reveal(ev.id);
    }, 2400);
    return () => clearTimeout(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div className="relative aspect-[5/6] w-full overflow-hidden border border-[#1fc3e6]/60">
        {v.reveal === "face" ? <FaceScan t={subject} scanning={phase === "scan"} /> : <Silhouette t={subject} scanning={phase === "scan"} />}
      </div>
      <div className="mono mt-2 text-[12px]">
        {phase === "scan" ? (
          <span className="text-[#2cff8a]">ANALYSE EN COURS<span className="blink">_</span></span>
        ) : (
          <div>
            <div className="mb-1 text-[#2cff8a]">ANALYSE TERMINÉE — résultats ajoutés au carnet</div>
            {ev.clues.map((c, i) => (
              <div key={i} className="text-[#b4f7d3]">▸ {describeClue(c)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PhotoWin({ evId }: { evId: string }) {
  const g = useGame();
  const ev = useEv(evId);
  const [scanning, setScanning] = useState(false);
  const done = !!g.revealed[ev.id];
  const run = () => {
    if (scanning || done) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      g.reveal(ev.id);
    }, 2200);
  };
  const w = getWorld();
  void w;
  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#1fc3e6]/60 bg-black">
        <div style={{ filter: done || scanning ? "grayscale(1) brightness(.8) sepia(1) hue-rotate(70deg) saturate(3)" : "saturate(.7)" }} className="h-full w-full">
          {ev.kind === "photo" && ev.photo && <VehicleArt vtype={ev.photo.vtype} color={ev.photo.color} plate={ev.photo.plate} />}
          {ev.kind === "face" && <EyeArt eyes={(ev.clues[0] as { v: string }).v} />}
        </div>
        {(done || scanning) && (
          <div className="pointer-events-none absolute inset-6">
            <div className="absolute left-0 top-0 h-5 w-5 border-l-[3px] border-t-[3px] border-[#2cff8a]" />
            <div className="absolute right-0 top-0 h-5 w-5 border-r-[3px] border-t-[3px] border-[#2cff8a]" />
            <div className="absolute bottom-0 left-0 h-5 w-5 border-b-[3px] border-l-[3px] border-[#2cff8a]" />
            <div className="absolute bottom-0 right-0 h-5 w-5 border-b-[3px] border-r-[3px] border-[#2cff8a]" />
          </div>
        )}
        {scanning && <div className="scanline" />}
        <div className="noise" />
      </div>
      <p className="mt-2 text-[12px] text-[#8fe9ff]">
        {ev.photo?.caption ?? "Gros plan sur le suspect, photo haute résolution de l'iris."}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button className="btn green" onClick={run} disabled={scanning || done}>
          {scanning ? "Scan en cours…" : done ? "Scan effectué" : "◉ Scanner"}
        </button>
      </div>
      {done && (
        <div className="mono mt-2 text-[12px]">
          {ev.clues.map((c, i) => (
            <div key={i} className="text-[#b4f7d3]">▸ {describeClue(c)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocWin({ evId }: { evId: string }) {
  const g = useGame();
  const ev = useEv(evId);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const t = setTimeout(() => g.reveal(ev.id), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div className="mb-2 border-b border-[#1fc3e6]/50 pb-1 text-[12px] font-bold tracking-wider text-[#5fa8bb]">
        {ev.doc?.from} — AFFAIRE #{g.mission.caseNo}
      </div>
      <p className="mono text-[13px] leading-relaxed text-[#b4f7d3]">{ev.doc?.text}</p>
      {ev.clues.length > 0 && g.revealed[ev.id] && (
        <div className="mt-4 border border-[#2cff8a]/50 p-2 text-[12px]">
          <div className="mb-1 font-bold text-[#2cff8a]">ÉLÉMENTS RELEVÉS</div>
          {ev.clues.map((c, i) => (
            <div key={i}>▸ {describeClue(c)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListWin({ evId }: { evId: string }) {
  const g = useGame();
  const ev = useEv(evId);
  const w = getWorld();
  const [q, setQ] = useState("");
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    g.setListIds(ev.list ?? []);
    g.reveal(ev.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ids = (ev.list ?? []).filter((id) => normStr(`${w.people[id].first} ${w.people[id].last}`).includes(normStr(q)));
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex gap-2">
        <input className="inp" placeholder="Chercher dans le document…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-[#5fa8bb]">
        <span>{ev.list?.length} noms — cliquez pour ouvrir le profil</span>
        <button
          className="btn yellow"
          onClick={() => {
            g.setListFilter(true);
            g.openApp("humandb");
          }}
        >
          Filtrer HumanDB
        </button>
      </div>
      <div className="min-h-0 flex-1 columns-2 gap-3 overflow-auto text-[13px]">
        {ids.map((id) => (
          <button key={id} className="block w-full break-inside-avoid py-0.5 text-left text-[#b9f1ff] hover:text-white hover:underline" onClick={() => g.openProfile(id)}>
            {w.people[id].first} {w.people[id].last}
          </button>
        ))}
      </div>
      <span className="hidden">{displayName(w.people[0])}</span>
    </div>
  );
}
