import { FaceTraits, Sex } from "./world";
import { MISSIONS_PER_GRADE } from "./grades";

export interface Operator {
  id: number;
  name: string;
  skill: number;
  fatigue: number;
  done: number;
  ok: number;
  traits: FaceTraits;
}
export interface CaseOffer {
  id: number;
  title: string;
  diff: number;
}
export interface Save {
  name: string;
  completed: number;
  attempt: number;
  failed: number;
  score: number;
  budget: number;
  rep: number;
  ops: Operator[];
  cases: CaseOffer[];
  nextId: number;
}

const OP_NAMES = ["Nora KLEIN", "Ethan VOSS", "Lena MARCH", "Marcus BELL", "Iris COLE", "Tom HARLOW", "Zoe REYES", "Dan KOWAL", "Maya STONE", "Leo FARRELL"];
const HAIRS = ["noir", "brun", "blond", "roux", "gris"];
const EYES = ["marron", "bleu", "vert", "noisette"];
export const CASE_TITLES = [
  "Meurtre au bar",
  "Meurtre dans un parking",
  "Délit de fuite",
  "Braquage à moto",
  "Contrebande au port",
  "Vol d'avion",
  "Fraude à l'assurance",
  "Disparition suspecte",
  "Enlèvement",
];

export function makeOperator(id: number, seed: number): Operator {
  const sex: Sex = seed % 2 === 0 ? "F" : "H";
  return {
    id,
    name: OP_NAMES[(id + seed) % OP_NAMES.length],
    skill: 35 + ((seed * 7 + id * 13) % 30),
    fatigue: 0,
    done: 0,
    ok: 0,
    traits: {
      sex,
      skin: 1 + ((seed + id) % 6),
      hair: HAIRS[(seed + id * 3) % HAIRS.length],
      beard: sex === "H" && id % 3 === 0,
      glasses: id % 4 === 0,
      eyes: EYES[(seed + id) % EYES.length],
      age: 26 + ((seed * 3 + id * 5) % 25),
    },
  };
}

export function makeCase(id: number, completed: number): CaseOffer {
  const base = Math.max(10, completed);
  const diff = Math.max(5, base + ((id * 37) % 21) - 10);
  return { id, title: CASE_TITLES[(id * 5 + 3) % CASE_TITLES.length], diff };
}

export function newSave(name: string, grade: number): Save {
  const completed = grade * MISSIONS_PER_GRADE;
  const s: Save = {
    name,
    completed,
    attempt: 0,
    failed: 0,
    score: 0,
    budget: 5000,
    rep: 50,
    ops: [],
    cases: [],
    nextId: 1,
  };
  return ensureCadre(s);
}

export function ensureCadre(s: Save): Save {
  if (s.completed < MISSIONS_PER_GRADE * 5 || s.ops.length > 0) return s;
  const ops = [1, 2, 3, 4, 5].map((i) => makeOperator(i, 3));
  const cases: CaseOffer[] = [];
  let nextId = s.nextId;
  for (let i = 0; i < 4; i++) cases.push(makeCase(nextId++, s.completed));
  return { ...s, ops, cases, nextId };
}

const KEY = "operator_save_v1";
export function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return ensureCadre(JSON.parse(raw) as Save);
  } catch {
    return null;
  }
}
export function writeSave(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
