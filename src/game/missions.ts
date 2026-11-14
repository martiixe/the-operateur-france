import { mulberry32, pick, ri, shuffle } from "./rng";
import {
  Clue,
  FaceTraits,
  Person,
  VLABEL,
  VType,
  Vehicle,
  describeClue,
  displayName,
  getWorld,
  personMatchesAll,
} from "./world";

export type Scene = "bar" | "parking" | "road" | "street" | "dock" | "airfield";
export type EvKind = "list" | "video" | "photo" | "face" | "doc";

export interface Evidence {
  id: string;
  kind: EvKind;
  title: string;
  clues: Clue[];
  list?: number[];
  video?: { cam: string; scene: Scene; good: number; reveal: "face" | "body"; duration: number; subject: number };
  photo?: { vtype: VType; color: string; plate: string; caption: string };
  doc?: { from: string; text: string };
  noise?: boolean;
}

export interface Agent {
  name: string;
  last: string;
  id: string;
  traits: FaceTraits;
}

export interface Mission {
  n: number;
  attempt: number;
  caseNo: number;
  title: string;
  folder: string;
  scene: Scene;
  objective: string;
  submitLabel: string;
  agent: Agent;
  victim: Person | null;
  culpritId: number;
  evidences: Evidence[];
  intro: string[];
  allClues: Clue[];
  needed: number;
  difficulty: number;
}

interface Scenario {
  title: string;
  folder: string;
  scene: Scene;
  vtype?: VType;
  fraud?: boolean;
  victim: boolean;
  objective: string;
  submit: string;
  listTitle: string;
  intro: (victim: string) => string[];
}

const SCEN: Scenario[] = [
  {
    title: "Meurtre au bar",
    folder: "Bar",
    scene: "bar",
    victim: true,
    objective: "TROUVER LE NOM DU TUEUR",
    submit: "ENVOYER LE NOM DU TUEUR",
    listTitle: "LISTE_NOMS",
    intro: (v) => [
      "Salut.",
      "Opérateur {op}, c'est ça ?",
      "J'ai un 10-35 dans un bar du centre-ville.",
      `L'homme, ${v}, a été tué vers 2h du matin, juste avant la fermeture.`,
      "J'ai récupéré la caméra de surveillance et la liste des clients présents ce soir-là.",
      "Pouvez-vous m'envoyer le nom du tueur ?",
    ],
  },
  {
    title: "Meurtre dans un parking",
    folder: "Parking",
    scene: "parking",
    victim: true,
    objective: "TROUVER LE NOM DU TUEUR",
    submit: "ENVOYER LE NOM DU TUEUR",
    listTitle: "LISTE_BADGES",
    intro: (v) => [
      "Opérateur {op} ? Ici votre agent de terrain.",
      `Nous avons retrouvé ${v} mort dans un parking souterrain.`,
      "La caméra du niveau -2 a tout filmé, mais l'image est de très mauvaise qualité.",
      "Voici la liste des badges d'accès enregistrés cette nuit.",
      "Aidez-moi à identifier le tueur.",
    ],
  },
  {
    title: "Délit de fuite",
    folder: "Route",
    scene: "road",
    vtype: "voiture",
    victim: true,
    objective: "TROUVER LE CONDUCTEUR",
    submit: "ENVOYER LE NOM DU CONDUCTEUR",
    listTitle: "LISTE_PROPRIÉTAIRES",
    intro: (v) => [
      "Opérateur {op}, j'ai besoin de vous.",
      `Un délit de fuite sur la route 9. La victime, ${v}, n'a pas survécu.`,
      "Un véhicule a pris la fuite. Il nous faut le propriétaire.",
      "Utilisez le registre d'assurance des voitures, les témoins ont vu quelques détails.",
    ],
  },
  {
    title: "Braquage à moto",
    folder: "Braquage",
    scene: "street",
    vtype: "moto",
    victim: false,
    objective: "TROUVER LE BRAQUEUR",
    submit: "ENVOYER LE NOM DU BRAQUEUR",
    listTitle: "LISTE_PROPRIÉTAIRES",
    intro: () => [
      "Opérateur {op}, c'est urgent.",
      "Une bijouterie a été braquée par un homme à moto, en plein jour.",
      "Il s'est enfui avant l'arrivée de la police.",
      "Consultez le registre des motos et croisez avec les images de la rue.",
    ],
  },
  {
    title: "Contrebande au port",
    folder: "Port",
    scene: "dock",
    vtype: "bateau",
    victim: false,
    objective: "TROUVER LE SKIPPER",
    submit: "ENVOYER LE NOM DU SKIPPER",
    listTitle: "LISTE_PLAISANCIERS",
    intro: () => [
      "Opérateur {op}, on a un gros dossier.",
      "Un bateau a déchargé une cargaison illégale cette nuit, au port.",
      "Le skipper est en fuite. Il nous faut son identité.",
      "Le registre des bateaux est à vous, bon courage.",
    ],
  },
  {
    title: "Vol d'avion",
    folder: "Aérodrome",
    scene: "airfield",
    vtype: "avion",
    victim: false,
    objective: "TROUVER LE PILOTE",
    submit: "ENVOYER LE NOM DU PILOTE",
    listTitle: "LISTE_PILOTES",
    intro: () => [
      "Opérateur {op}, une première pour moi.",
      "Un avion de tourisme a décollé de l'aérodrome sans autorisation, cette nuit.",
      "Le registre aérien est à vous, plus quelques éléments de la tour de contrôle.",
      "Retrouvez le pilote.",
    ],
  },
  {
    title: "Fraude à l'assurance",
    folder: "Fraude",
    scene: "street",
    fraud: true,
    victim: false,
    objective: "TROUVER LE FRAUDEUR",
    submit: "ENVOYER LE NOM DU FRAUDEUR",
    listTitle: "LISTE_DÉCLARANTS",
    intro: () => [
      "Opérateur {op}, vous aimez les registres ?",
      "Quelqu'un a déclaré un accident avec un véhicule qui n'était plus couvert.",
      "Il a falsifié ses papiers d'assurance. Retrouvez le fraudeur.",
    ],
  },
];

const AGENTS: Agent[] = [
  { name: "Alexandra", last: "PENDELL", id: "F5051", traits: { sex: "F", skin: 5, hair: "noir", beard: false, glasses: false, eyes: "marron", age: 34 } },
  { name: "Xavier", last: "SKINNER", id: "F3320", traits: { sex: "H", skin: 2, hair: "brun", beard: false, glasses: true, eyes: "bleu", age: 45 } },
  { name: "Mike", last: "TRENCH", id: "F7718", traits: { sex: "H", skin: 3, hair: "chauve", beard: true, glasses: false, eyes: "marron", age: 52 } },
  { name: "Laura", last: "HAYES", id: "F2104", traits: { sex: "F", skin: 1, hair: "roux", beard: false, glasses: true, eyes: "vert", age: 29 } },
  { name: "Daniel", last: "ORTEGA", id: "F9082", traits: { sex: "H", skin: 4, hair: "noir", beard: false, glasses: false, eyes: "noisette", age: 38 } },
  { name: "Grace", last: "MORROW", id: "F4467", traits: { sex: "F", skin: 2, hair: "blond", beard: false, glasses: false, eyes: "bleu", age: 41 } },
];

const NOISE = [
  { from: "RAPPORT BALISTIQUE", text: "Aucune douille exploitable n'a été retrouvée. Aucune information utile sur l'identité du suspect." },
  { from: "BULLETIN MÉTÉO", text: "Ciel dégagé, visibilité 10 km, vent faible. Conditions normales au moment des faits." },
  { from: "NOTE INTERNE", text: "Le commissariat local réclame un retour rapide. Ne tenez pas compte des rumeurs du quartier." },
  { from: "RELEVÉ TÉLÉPHONIQUE", text: "Aucun appel suspect dans la zone. Les relevés ne permettent pas d'identifier le suspect." },
  { from: "RAPPORT DE PATROUILLE", text: "Patrouille arrivée sur place 14 minutes après l'alerte. Zone sécurisée, aucun suspect interpellé." },
  { from: "COURRIER ANONYME", text: "« Vous cherchez au mauvais endroit. » Courrier non signé, probablement un canular." },
];

function partialPlate(r: () => number, plate: string, n: number): string {
  const idx = plate.split("").map((c, i) => (/[A-Z0-9]/.test(c) ? i : -1)).filter((i) => i >= 0);
  const known = Math.max(3, Math.round(idx.length * (0.75 - Math.min(n, 70) * 0.004)));
  const hide = shuffle(r, idx).slice(0, idx.length - known);
  return plate.split("").map((c, i) => (hide.includes(i) ? "?" : c)).join("");
}

interface Opt {
  group: string;
  clue: Clue;
}

export function buildMission(n: number, attempt: number): Mission {
  const w = getWorld();
  const r = mulberry32(n * 7919 + attempt * 104729 + 17);
  const sc = n < SCEN.length ? SCEN[n] : pick(r, SCEN);
  const vt: VType | undefined = sc.vtype ?? (sc.fraud ? pick(r, ["voiture", "moto"] as VType[]) : undefined);
  const target = Math.min(10, 3 + Math.floor(n / 10));
  const useList = n < 40 || r() < 0.4;
  const listSize = Math.min(90, 12 + Math.floor(n * 1.1));
  const noiseCount = Math.min(3, Math.floor(n / 12));
  const alive = w.people.filter((p) => p.status === "Vivant");
  const dead = w.people.filter((p) => p.status === "Décédé" && p.clearance === 1);
  const okVeh = (v: Vehicle) => v.type === vt && (!sc.fraud || v.status !== "ASSURÉ");
  let pool = alive.filter((p) => p.clearance === 1);
  if (vt) pool = pool.filter((p) => w.vehiclesOf[p.id].some(okVeh));

  let culprit = pool[0];
  let chosen: Opt[] = [];
  let listIds: number[] | undefined;
  let veh: Vehicle | undefined;

  for (let tries = 0; tries < 150; tries++) {
    const c = pick(r, pool);
    const vs = w.vehiclesOf[c.id];
    let v: Vehicle | undefined;
    if (vt) v = pick(r, vs.filter(okVeh));
    else if (n >= 8 && vs.length) v = pick(r, vs);

    let lids: number[] | undefined;
    if (useList) {
      const base = vt ? alive.filter((p) => w.vehiclesOf[p.id].some((x) => x.type === vt)) : alive;
      const others = shuffle(r, base).filter((p) => p.id !== c.id).slice(0, listSize - 1).map((p) => p.id);
      lids = shuffle(r, [c.id, ...others]);
    }

    const o = (group: string, clue: Clue): Opt => ({ group, clue });
    const face = shuffle(r, [
      o("face", { k: "sex", v: c.sex }),
      o("face", { k: "hair", v: c.hair }),
      o("face", { k: "skin", v: c.skin }),
      o("face", { k: "glasses", v: c.glasses }),
      ...(c.sex === "H" ? [o("face", { k: "beard", v: c.beard })] : []),
    ]);
    const alo = c.age - ri(r, 1, 7);
    const hlo = c.height - ri(r, 1, 7);
    const body = [o("body", { k: "age", min: alo, max: alo + 8 }), o("body", { k: "height", min: hlo, max: hlo + 8 })];
    const others2 = shuffle(r, [...face, ...body, o("eyes", { k: "eyes", v: c.eyes }), o("job", { k: "job", v: c.job })]);
    let opts: Opt[] = others2;
    if (v) {
      const vA = o("vA", { k: "vehicle", vtype: v.type, color: v.color, make: v.make });
      const vB = o("vB", { k: "vehicle", vtype: v.type, plate: partialPlate(r, v.plate, n) });
      const vD =
        v.status !== "ASSURÉ"
          ? o("vD", { k: "vehicle", vtype: v.type, status: v.status, insurer: v.insurer !== "Aucun" && r() < 0.5 ? v.insurer : undefined })
          : o("vD", { k: "vehicle", vtype: v.type, insurer: v.insurer });
      if (sc.fraud) opts = [vD, vA, vB, ...others2];
      else if (vt) opts = [vA, vB, vD, ...others2];
      else opts = [...others2.slice(0, 2), vA, ...others2.slice(2, 4), vB, ...others2.slice(4), vD];
    }
    const check = lids ? lids.map((id) => w.people[id]) : alive;
    let found: Opt[] | null = null;
    for (let k = target; k <= opts.length; k++) {
      const cl = opts.slice(0, k).map((x) => x.clue);
      const m = check.filter((p) => personMatchesAll(p, cl));
      if (m.length === 1 && m[0].id === c.id) {
        found = opts.slice(0, k);
        break;
      }
    }
    culprit = c;
    veh = v;
    listIds = lids;
    if (found) {
      chosen = found;
      break;
    }
    chosen = opts;
  }

  // ---- Evidences ----
  const evs: Evidence[] = [];
  let ec = 0;
  const nid = () => `e${++ec}`;
  const usedCams = new Set<string>();
  const cam = () => {
    let c = `CAM_${String(ri(r, 2, 99)).padStart(3, "0")}`;
    while (usedCams.has(c)) c = `CAM_${String(ri(r, 2, 99)).padStart(3, "0")}`;
    usedCams.add(c);
    return c;
  };
  if (listIds) {
    const sorted = listIds.slice().sort((a, b) => w.people[a].last.localeCompare(w.people[b].last));
    evs.push({ id: nid(), kind: "list", title: sc.listTitle, clues: [], list: sorted });
  }
  const g = (name: string) => chosen.filter((x) => x.group === name).map((x) => x.clue);
  const done = new Set<string>();
  const pron = culprit.sex === "H" ? "il" : "elle";
  for (const x of chosen) {
    if (done.has(x.group)) continue;
    done.add(x.group);
    if (x.group === "face") {
      const fc = g("face");
      for (let i = 0; i < fc.length; i += 2) {
        const cm = cam();
        evs.push({
          id: nid(),
          kind: "video",
          title: `LECTEUR VIDÉO - ${cm}`,
          clues: fc.slice(i, i + 2),
          video: { cam: cm, scene: sc.scene, good: 0.1 + r() * 0.8, reveal: "face", duration: ri(r, 40, 120), subject: culprit.id },
        });
      }
    } else if (x.group === "body") {
      const cm = cam();
      evs.push({
        id: nid(),
        kind: "video",
        title: `ANALYSE - ${cm}`,
        clues: g("body"),
        video: { cam: cm, scene: sc.scene, good: 0.1 + r() * 0.8, reveal: "body", duration: ri(r, 40, 120), subject: culprit.id },
      });
    } else if (x.group === "eyes") {
      evs.push({ id: nid(), kind: "face", title: "PHOTO - GROS PLAN", clues: g("eyes") });
    } else if (x.group === "job") {
      evs.push({
        id: nid(),
        kind: "doc",
        title: "DÉPOSITION",
        clues: g("job"),
        doc: {
          from: "DÉPOSITION DE TÉMOIN",
          text: `« Je n'ai pas bien vu son visage, mais je l'ai déjà croisé dans le quartier. Je crois que ${pron} travaille comme ${culprit.job.toLowerCase()}. C'est tout ce dont je me souviens. »`,
        },
      });
    } else if (veh && x.group === "vA") {
      evs.push({
        id: nid(),
        kind: "photo",
        title: `PHOTO - ${VLABEL[veh.type].toUpperCase()}`,
        clues: g("vA"),
        photo: { vtype: veh.type, color: veh.color, plate: veh.plate.replace(/[A-Z0-9]/g, "?"), caption: `${VLABEL[veh.type]} aperçu(e) près de la scène. Le numéro est illisible.` },
      });
    } else if (veh && x.group === "vB") {
      const pl = (g("vB")[0] as { plate?: string }).plate ?? "";
      evs.push({
        id: nid(),
        kind: "photo",
        title: `PLAQUE - ${VLABEL[veh.type].toUpperCase()}`,
        clues: g("vB"),
        photo: { vtype: veh.type, color: veh.color, plate: pl, caption: "Gros plan sur l'immatriculation. Certains caractères sont effacés." },
      });
    } else if (veh && x.group === "vD") {
      const vc = g("vD")[0] as { status?: string; insurer?: string };
      const parts: string[] = [];
      if (vc.status) parts.push(`le véhicule du suspect était « ${vc.status} » au moment des faits`);
      if (vc.insurer) parts.push(`un reçu portant l'en-tête de ${vc.insurer} a été retrouvé dans la boîte à gants`);
      evs.push({
        id: nid(),
        kind: "doc",
        title: "RAPPORT ASSURANCE",
        clues: g("vD"),
        doc: { from: "RAPPORT DE POLICE", text: `Après vérification : ${parts.join(" ; ")}. Les détails du contrat sont consultables dans le registre d'assurance.` },
      });
    }
  }
  const noises = shuffle(r, NOISE).slice(0, noiseCount);
  for (const nz of noises) {
    const pos = ri(r, Math.min(1, evs.length), evs.length);
    evs.splice(pos, 0, { id: nid(), kind: "doc", title: nz.from, clues: [], noise: true, doc: { from: nz.from, text: nz.text } });
  }

  const victim = sc.victim && dead.length ? pick(r, dead) : null;
  const agent = pick(r, AGENTS);
  const clueEvCount = evs.filter((e) => e.clues.length).length;

  return {
    n,
    attempt,
    caseNo: ri(r, 1000, 99999),
    title: sc.title,
    folder: sc.folder,
    scene: sc.scene,
    objective: sc.objective,
    submitLabel: sc.submit,
    agent,
    victim,
    culpritId: culprit.id,
    evidences: evs,
    intro: sc.intro(victim ? displayName(victim) : "la victime"),
    allClues: chosen.map((x) => x.clue),
    needed: clueEvCount,
    difficulty: n,
  };
}

export function cluesText(clues: Clue[]): string {
  return clues.map(describeClue).join(" ; ");
}
