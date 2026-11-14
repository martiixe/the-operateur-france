"use client";
import { COLOR_HEX, FaceTraits, VType } from "@/game/world";
import { EYE_HEX } from "./Face";
import type { Scene } from "@/game/missions";

export function VehicleArt({ vtype, color, plate }: { vtype: VType; color: string; plate: string }) {
  const c = COLOR_HEX[color] ?? "#888";
  const txt = plate.replace(/\?/g, "▒");
  const dark = "#111418";
  return (
    <svg viewBox="0 0 300 170" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`sky-${vtype}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={vtype === "bateau" ? "#52728a" : "#3a4a58"} />
          <stop offset="1" stopColor="#1c242c" />
        </linearGradient>
      </defs>
      <rect width="300" height="170" fill={`url(#sky-${vtype})`} />
      {vtype === "bateau" ? <rect y="105" width="300" height="65" fill="#25465c" /> : <rect y="120" width="300" height="50" fill="#2a2e33" />}
      {vtype === "voiture" && (
        <g>
          <path d="M40 112 L45 90 Q50 82 70 80 L105 60 Q115 55 150 55 L195 56 Q215 58 225 78 L255 84 Q265 90 265 108 L265 118 L40 118Z" fill={c} stroke="#000" strokeOpacity=".4" />
          <path d="M112 64 L150 60 L150 80 L100 80Z" fill="#9db7c7" opacity=".75" />
          <path d="M158 60 L192 61 Q205 62 212 80 L158 80Z" fill="#9db7c7" opacity=".75" />
          <circle cx="90" cy="118" r="17" fill={dark} />
          <circle cx="90" cy="118" r="8" fill="#555" />
          <circle cx="220" cy="118" r="17" fill={dark} />
          <circle cx="220" cy="118" r="8" fill="#555" />
          <rect x="125" y="96" width="62" height="16" rx="2" fill="#f3f0dc" stroke="#222" />
          <text x="156" y="108" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#111" fontWeight="bold">{txt}</text>
        </g>
      )}
      {vtype === "moto" && (
        <g>
          <circle cx="85" cy="118" r="25" fill="none" stroke={dark} strokeWidth="7" />
          <circle cx="220" cy="118" r="25" fill="none" stroke={dark} strokeWidth="7" />
          <path d="M85 118 L120 88 L175 88 L220 118 M150 88 L140 70 L175 62 L185 88Z" stroke="#222" strokeWidth="5" fill={c} />
          <path d="M120 88 Q135 62 175 66 L182 88Z" fill={c} stroke="#000" strokeOpacity=".4" />
          <path d="M205 100 L218 70 L232 70" stroke="#222" strokeWidth="4" fill="none" />
          <rect x="45" y="96" width="46" height="14" rx="2" fill="#f3f0dc" stroke="#222" />
          <text x="68" y="107" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#111" fontWeight="bold">{txt}</text>
        </g>
      )}
      {vtype === "bateau" && (
        <g>
          <path d="M30 100 L270 90 L240 135 L70 135Z" fill={c} stroke="#000" strokeOpacity=".4" />
          <path d="M100 90 L110 58 L190 58 L205 90Z" fill="#dfe6ea" opacity=".9" />
          <rect x="118" y="66" width="68" height="14" fill="#6f8ea3" />
          <path d="M150 58 L150 28 M150 32 L185 50 L150 50" stroke="#ccc" strokeWidth="2" fill="none" />
          <rect x="75" y="104" width="84" height="18" rx="2" fill="#f3f0dc" stroke="#222" />
          <text x="117" y="117" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="#111" fontWeight="bold">{txt}</text>
          <path d="M20 135 Q60 128 100 135 T180 135 T260 135 T300 135" stroke="#7fb3cc" strokeWidth="2" fill="none" />
        </g>
      )}
      {vtype === "avion" && (
        <g>
          <path d="M40 98 Q50 74 110 72 L230 76 L268 52 L276 52 L268 92 Q240 108 150 108 L70 106Z" fill={c} stroke="#000" strokeOpacity=".4" />
          <path d="M92 74 L120 72 L120 88 L84 90Z" fill="#9db7c7" opacity=".75" />
          <path d="M130 90 L205 90 L150 138 L140 138Z" fill={c} stroke="#000" strokeOpacity=".4" />
          <path d="M40 98 L40 70 L30 70 L30 104Z" fill="#333" />
          <circle cx="60" cy="125" r="8" fill={dark} />
          <rect x="105" y="92" width="86" height="14" rx="2" fill="#f3f0dc" stroke="#222" />
          <text x="148" y="103" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#111" fontWeight="bold">{txt}</text>
        </g>
      )}
    </svg>
  );
}

export function EyeArt({ eyes }: { eyes: string }) {
  const iris = EYE_HEX[eyes] ?? "#444";
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="120" fill="#3a2e28" />
      <path d="M10 60 Q100 -10 190 60 Q100 130 10 60Z" fill="#f3ece6" />
      <circle cx="100" cy="60" r="34" fill={iris} />
      <circle cx="100" cy="60" r="34" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="3" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <line key={i} x1={100 + Math.cos(a) * 12} y1={60 + Math.sin(a) * 12} x2={100 + Math.cos(a) * 32} y2={60 + Math.sin(a) * 32} stroke="#000" strokeOpacity=".18" />;
      })}
      <circle cx="100" cy="60" r="12" fill="#050505" />
      <circle cx="90" cy="50" r="5" fill="#fff" opacity=".8" />
      <path d="M10 60 Q100 -10 190 60" stroke="#1a1210" strokeWidth="6" fill="none" />
    </svg>
  );
}

export function SceneArt({ scene, t }: { scene: Scene; t: number }) {
  const x = 40 + ((t * 2) % 1) * 240;
  const y = 120 + Math.sin(t * 12) * 6;
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice" style={{ filter: "grayscale(1) contrast(1.3)" }}>
      <rect width="320" height="200" fill="#2a2d30" />
      {scene === "bar" && (
        <g>
          <rect y="0" width="320" height="60" fill="#3d4044" />
          <rect x="10" y="30" width="300" height="14" fill="#777" />
          {[30, 60, 90, 130, 170, 210, 250].map((bx) => (
            <rect key={bx} x={bx} y="12" width="8" height="18" fill="#bbb" />
          ))}
          {[[40, 90], [150, 80], [250, 100], [90, 160], [210, 165]].map(([tx, ty], i) => (
            <g key={i}>
              <rect x={tx} y={ty} width="60" height="30" fill="#8a8d90" />
              <rect x={tx + 20} y={ty + 30} width="6" height="22" fill="#555" />
            </g>
          ))}
        </g>
      )}
      {scene === "parking" && (
        <g>
          <rect y="0" width="320" height="40" fill="#1d1f21" />
          {[40, 130, 220, 300].map((px) => (
            <rect key={px} x={px - 8} y="0" width="16" height="200" fill="#4a4d50" />
          ))}
          {[20, 90, 160, 230, 290].map((lx) => (
            <rect key={lx} x={lx} y="60" width="3" height="50" fill="#ddd" />
          ))}
          <rect x="95" y="62" width="60" height="30" rx="6" fill="#666" />
          <rect x="215" y="140" width="60" height="30" rx="6" fill="#555" />
        </g>
      )}
      {(scene === "road" || scene === "street") && (
        <g>
          <rect y="0" width="320" height="70" fill={scene === "road" ? "#1b1d20" : "#484b4f"} />
          {scene === "street" && [20, 100, 180, 250].map((bx, i) => <rect key={bx} x={bx} y={10 + i * 4} width="60" height="60" fill="#5b5f63" />)}
          {scene === "road" && [30, 110, 190, 270].map((lx) => <rect key={lx} x={lx} y="150" width="40" height="5" fill="#ddd" />)}
          <rect y="70" width="320" height="130" fill="#35383b" />
          <rect x="80" y="86" width="70" height="26" rx="6" fill="#777" />
        </g>
      )}
      {scene === "dock" && (
        <g>
          <rect y="0" width="320" height="80" fill="#202428" />
          <rect y="80" width="320" height="120" fill="#33414a" />
          <rect x="0" y="110" width="320" height="18" fill="#6d6256" />
          {[20, 70, 120, 170, 220, 270].map((px) => <rect key={px} x={px} y="110" width="3" height="18" fill="#222" />)}
          <path d="M190 160 L290 156 L270 180 L205 180Z" fill="#999" />
        </g>
      )}
      {scene === "airfield" && (
        <g>
          <rect y="0" width="320" height="70" fill="#1f2328" />
          <rect x="220" y="30" width="80" height="50" fill="#555" />
          <rect y="95" width="320" height="105" fill="#3a3c3e" />
          {[10, 70, 130, 190, 250].map((lx) => <rect key={lx} x={lx} y="150" width="35" height="4" fill="#eee" />)}
          <path d="M60 110 L120 108 L140 92 L145 92 L140 118 L70 120Z" fill="#aaa" />
        </g>
      )}
      <g>
        <ellipse cx={x} cy={y + 38} rx="14" ry="3" fill="rgba(0,0,0,.4)" />
        <rect x={x - 8} y={y - 8} width="16" height="34" rx="6" fill="#d8d8d8" />
        <circle cx={x} cy={y - 16} r="8" fill="#e8e8e8" />
        <rect x={x - 9} y={y + 24} width="7" height="14" fill="#bbb" />
        <rect x={x + 2} y={y + 24} width="7" height="14" fill="#bbb" />
      </g>
      <rect x={x - 17} y={y - 28} width="34" height="70" fill="none" stroke="#2cff8a" strokeWidth="1.2" strokeDasharray="4 3" />
    </svg>
  );
}

export function Silhouette({ t, scanning }: { t: FaceTraits; scanning: boolean }) {
  const h = t.sex === "H" ? 1 : 0.96;
  void h;
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <rect width="200" height="240" fill="#0b1318" />
      <g stroke="#2cff8a" strokeWidth="1" opacity=".25">
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="0" y1={i * 20} x2="200" y2={i * 20} />)}
      </g>
      <g fill="rgba(44,255,138,.25)" stroke="#2cff8a" strokeWidth="1.5">
        <circle cx="100" cy="52" r="18" />
        <path d="M70 80 Q100 70 130 80 L138 150 L122 152 L118 220 L104 220 L100 160 L96 220 L82 220 L78 152 L62 150Z" />
      </g>
      <g stroke="#ffd23a" strokeWidth="1.2" fill="#ffd23a" fontSize="9" fontFamily="monospace">
        <line x1="40" y1="34" x2="40" y2="222" />
        <line x1="34" y1="34" x2="46" y2="34" />
        <line x1="34" y1="222" x2="46" y2="222" />
        <text x="46" y="130" stroke="none">TAILLE</text>
      </g>
      {scanning && <rect x="0" y="0" width="200" height="3" fill="#2cff8a" className="sweep" />}
    </svg>
  );
}
