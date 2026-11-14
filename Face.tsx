"use client";
import { FaceTraits } from "@/game/world";

const SKIN = ["#f6d9c4", "#efc5a2", "#d8a67d", "#b98055", "#8a5a3a", "#5a3a27"];
const HAIR: Record<string, string> = {
  noir: "#15110e",
  brun: "#4a2f1d",
  blond: "#d9b45f",
  roux: "#a8431f",
  gris: "#a0a0a0",
  chauve: "none",
};
export const EYE_HEX: Record<string, string> = {
  marron: "#5a3a1e",
  bleu: "#3b7bd1",
  vert: "#3f9a55",
  noisette: "#8a6a2e",
  gris: "#7b8794",
};

export function Face({ t, bg = "#1b3340", className = "" }: { t: FaceTraits; bg?: string; className?: string }) {
  const skin = SKIN[t.skin - 1];
  const dark = "rgba(0,0,0,.22)";
  const hair = HAIR[t.hair];
  const hairCol = hair === "none" ? "#3a3a3a" : hair;
  const female = t.sex === "F";
  return (
    <svg viewBox="0 0 100 120" className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="120" fill={bg} />
      {female && hair !== "none" && <path d="M22 50 Q18 108 30 112 L70 112 Q82 108 78 50 Z" fill={hair} />}
      <path d="M6 120 Q8 92 38 86 L62 86 Q92 92 94 120Z" fill={female ? "#3a2f4a" : "#26343f"} />
      <path d="M41 86 L50 106 L59 86Z" fill="#e8eef2" />
      {!female && <path d="M48 92 L52 92 L53 108 L50 112 L47 108Z" fill="#7a1f2a" />}
      <rect x="42" y="68" width="16" height="22" fill={skin} />
      <rect x="42" y="68" width="16" height="8" fill={dark} />
      <ellipse cx="27" cy="52" rx="3.2" ry="6" fill={skin} />
      <ellipse cx="73" cy="52" rx="3.2" ry="6" fill={skin} />
      <ellipse cx="50" cy="50" rx="23" ry="29" fill={skin} />
      {hair !== "none" && (
        <path
          d={female ? "M26 50 Q22 16 50 16 Q78 16 74 50 Q70 30 52 28 Q34 30 26 50Z" : "M26 46 Q26 18 50 18 Q74 18 74 46 Q70 32 50 30 Q30 32 26 46Z"}
          fill={hair}
        />
      )}
      {t.beard && <path d="M27 54 Q30 88 50 88 Q70 88 73 54 Q68 72 50 69 Q32 72 27 54Z" fill={hairCol} opacity=".85" />}
      {t.beard && <path d="M42 69 Q50 66 58 69 Q50 72 42 69Z" fill={hairCol} />}
      <ellipse cx="41" cy="50" rx="4.4" ry="2.6" fill="#fff" />
      <ellipse cx="59" cy="50" rx="4.4" ry="2.6" fill="#fff" />
      <circle cx="41" cy="50" r="2.3" fill={EYE_HEX[t.eyes] ?? "#333"} />
      <circle cx="59" cy="50" r="2.3" fill={EYE_HEX[t.eyes] ?? "#333"} />
      <circle cx="41" cy="50" r="1" fill="#111" />
      <circle cx="59" cy="50" r="1" fill="#111" />
      <path d="M35 44 Q41 41 46 44" stroke={hairCol} strokeWidth="1.6" fill="none" />
      <path d="M54 44 Q59 41 65 44" stroke={hairCol} strokeWidth="1.6" fill="none" />
      <path d="M50 52 L47 62 Q50 64 53 62" stroke="rgba(0,0,0,.35)" strokeWidth="1" fill="none" />
      <path d="M43 72 Q50 76 57 72" stroke={female ? "#a8323f" : "#7a3b3b"} strokeWidth={female ? 2.2 : 1.4} fill="none" />
      {t.age > 50 && (
        <g stroke="rgba(0,0,0,.25)" strokeWidth=".8" fill="none">
          <path d="M34 40 Q50 37 66 40" />
          <path d="M33 58 Q36 62 38 64" />
          <path d="M67 58 Q64 62 62 64" />
        </g>
      )}
      {t.glasses && (
        <g stroke="#0d0d0d" strokeWidth="1.4" fill="rgba(180,220,255,.12)">
          <circle cx="41" cy="50" r="7" />
          <circle cx="59" cy="50" r="7" />
          <path d="M48 50 L52 50" fill="none" />
        </g>
      )}
    </svg>
  );
}

const PTS: [number, number][] = [
  [34, 36], [50, 28], [66, 36], [28, 52], [41, 49], [59, 49], [72, 52], [50, 56],
  [43, 64], [57, 64], [50, 72], [33, 66], [67, 66], [40, 82], [60, 82], [50, 90], [50, 40],
];

export function ScanMesh({ active }: { active: boolean }) {
  const edges: [number, number][] = [];
  PTS.forEach((p, i) => {
    PTS.map((q, j) => ({ j, d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach((x) => edges.push([i, x.j]));
  });
  return (
    <svg viewBox="0 0 100 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="100" height="120" fill="rgba(0,255,120,.18)" />
      <g stroke="#2cff8a" strokeWidth=".5" opacity={active ? 0.9 : 0.6}>
        {edges.map((e, i) => (
          <line key={i} x1={PTS[e[0]][0]} y1={PTS[e[0]][1]} x2={PTS[e[1]][0]} y2={PTS[e[1]][1]} />
        ))}
      </g>
      {PTS.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.1" fill="#2cff8a" />
      ))}
      <g stroke="#2cff8a" strokeWidth="1.2" fill="none">
        <path d="M22 18 L22 12 L28 12" />
        <path d="M78 18 L78 12 L72 12" />
        <path d="M22 96 L22 102 L28 102" />
        <path d="M78 96 L78 102 L72 102" />
      </g>
    </svg>
  );
}

export function FaceScan({ t, scanning }: { t: FaceTraits; scanning: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#0b1318" }}>
      <div className="h-full w-full" style={{ filter: "grayscale(1) contrast(1.25) brightness(.95)" }}>
        <Face t={t} bg="#333" className="h-full w-full" />
      </div>
      <ScanMesh active={scanning} />
      {scanning && <div className="scanline" />}
      <div className="noise" />
    </div>
  );
}
