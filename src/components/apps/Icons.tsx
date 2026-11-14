"use client";

export function Ico({ kind, size = 44 }: { kind: string; size?: number }) {
  const s = { width: size, height: size };
  const c = "#6fdcff";
  switch (kind) {
    case "folder":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M4 12 H20 L24 17 H44 V40 H4Z" fill={c} opacity=".85" />
          <path d="M4 20 H44 V40 H4Z" fill="#a8ecff" />
        </svg>
      );
    case "docs":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M8 6 H30 L38 14 V40 H8Z" fill={c} opacity=".8" />
          <path d="M14 12 H34 V44 H14Z" fill="#a8ecff" />
          <path d="M18 22 H30 M18 28 H30 M18 34 H26" stroke="#04202c" strokeWidth="2" />
        </svg>
      );
    case "cases":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <rect x="6" y="8" width="36" height="9" fill={c} />
          <rect x="6" y="19" width="36" height="9" fill="#a8ecff" />
          <rect x="6" y="30" width="36" height="9" fill={c} />
          <rect x="20" y="11" width="8" height="3" fill="#04202c" />
          <rect x="20" y="22" width="8" height="3" fill="#04202c" />
          <rect x="20" y="33" width="8" height="3" fill="#04202c" />
        </svg>
      );
    case "video":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M8 6 H30 L38 14 V42 H8Z" fill="#a8ecff" />
          <circle cx="23" cy="27" r="9" fill="#04202c" />
          <path d="M20 22 L29 27 L20 32Z" fill={c} />
        </svg>
      );
    case "photo":
    case "face":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M8 6 H30 L38 14 V42 H8Z" fill="#a8ecff" />
          <path d="M12 36 L20 24 L26 32 L30 27 L34 36Z" fill="#04202c" />
          <circle cx="28" cy="20" r="3" fill="#04202c" />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M8 6 H30 L38 14 V42 H8Z" fill="#a8ecff" />
          <path d="M13 18 H33 M13 24 H33 M13 30 H33 M13 36 H27" stroke="#04202c" strokeWidth="2.5" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M8 6 H30 L38 14 V42 H8Z" fill="#a8ecff" />
          <path d="M13 20 H33 M13 26 H33 M13 32 H24" stroke="#04202c" strokeWidth="2" />
        </svg>
      );
    case "db":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <ellipse cx="24" cy="12" rx="15" ry="6" fill="#a8ecff" />
          <path d="M9 12 V34 C9 38 38 38 39 34 V12 C38 16 10 16 9 12Z" fill={c} />
          <ellipse cx="24" cy="22" rx="15" ry="4" fill="none" stroke="#04202c" strokeWidth="1.5" />
        </svg>
      );
    case "car":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M5 30 L8 22 Q10 18 16 18 L22 12 H32 L38 18 Q43 19 43 26 V32 H5Z" fill="#a8ecff" />
          <circle cx="14" cy="33" r="5" fill="#04202c" stroke={c} strokeWidth="2" />
          <circle cx="35" cy="33" r="5" fill="#04202c" stroke={c} strokeWidth="2" />
        </svg>
      );
    case "term":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <rect x="5" y="8" width="38" height="32" fill="#031018" stroke={c} strokeWidth="2.5" />
          <path d="M11 17 L19 24 L11 31 M23 32 H35" stroke="#2cff8a" strokeWidth="3" fill="none" />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <path d="M12 12 H36 L34 42 H14Z" fill="none" stroke={c} strokeWidth="3" />
          <path d="M8 12 H40 M19 12 V7 H29 V12" stroke={c} strokeWidth="3" fill="none" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 48 48" style={s}>
          <circle cx="16" cy="16" r="6" fill="#a8ecff" />
          <circle cx="33" cy="18" r="5" fill={c} />
          <path d="M4 40 Q4 26 16 26 Q28 26 28 40Z" fill="#a8ecff" />
          <path d="M28 40 Q29 29 36 28 Q44 28 44 40Z" fill={c} />
        </svg>
      );
    default:
      return <svg viewBox="0 0 48 48" style={s} />;
  }
}
