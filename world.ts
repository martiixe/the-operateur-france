import { Rng, mulberry32, pick, ri, wpick } from "./rng";

export type VType = "voiture" | "moto" | "bateau" | "avion";
export const VTYPES: VType[] = ["voiture", "moto", "bateau", "avion"];
export const VLABEL: Record<VType, string> = {
  voiture: "Voiture",
  moto: "Moto",
  bateau: "Bateau",
  avion: "Avion",
};
export const GAME_DATE = "2025-03-14";
export const COLORS = ["noir", "blanc", "gris", "rouge", "bleu", "vert", "jaune", "argent"];
export const COLOR_HEX: Record<string, string> = {
  noir: "#1d1d20",
  blanc: "#e9ecee",
  gris: "#7d8590",
  rouge: "#b02a2a",
  bleu: "#2a4fb0",
  vert: "#2a8a4a",
  jaune: "#d4b21c",
  argent: "#b8c0c8",
};
export const INSURERS = [
  "Allstate Fed",
  "Liberty Shield",
  "Atlas Mutual",
  "Pioneer Assurance",
  "Sentinel Re",
  "Harbor Trust",
  "NorthStar Cover",
];
export const MODELS: Record<VType, Record<string, string[]>> = {
  voiture: {
    Ford: ["Mustang", "Focus", "F-150"],
    Toyota: ["Corolla", "Camry", "RAV4"],
    Chevrolet: ["Impala", "Malibu", "Camaro"],
    Dodge: ["Charger", "Ram 1500"],
    Honda: ["Civic", "Accord"],
    BMW: ["M3", "X5"],
    Tesla: ["Model 3", "Model Y"],
  },
  moto: {
    "Harley-Davidson": ["Sportster", "Fat Boy"],
    Yamaha: ["R6", "MT-07"],
    Kawasaki: ["Ninja", "Z900"],
    Ducati: ["Monster", "Panigale"],
    Honda: ["CBR600", "Rebel"],
  },
  bateau: {
    "Sea Ray": ["Sundancer", "Sport 230"],
    Bayliner: ["Element", "VR5"],
    "Boston Whaler": ["Montauk", "Outrage"],
    Beneteau: ["Oceanis", "Antares"],
    "Yamaha Marine": ["AR190", "242X"],
  },
  avion: {
    Cessna: ["172 Skyhawk", "182 Skylane"],
    Piper: ["PA-28 Cherokee", "PA-46 Malibu"],
    Beechcraft: ["Bonanza", "Baron"],
    Cirrus: ["SR20", "SR22"],
    Diamond: ["DA40", "DA42"],
  },
};

export type Sex = "H" | "F";
export interface FaceTraits {
  sex: Sex;
  skin: number; // 1..6
  hair: string;
  beard: boolean;
  glasses: boolean;
  eyes: string;
  age: number;
}
export interface Person extends FaceTraits {
  id: number;
  first: string;
  last: string;
  height: number;
  weight: number;
  job: string;
  city: string;
  address: string;
  phone: string;
  status: "Vivant" | "Décédé";
  clearance: number;
  record: string;
}
export type InsStatus = "ASSURÉ" | "EXPIRÉ" | "NON ASSURÉ";
export interface Vehicle {
  id: number;
  type: VType;
  plate: string;
  make: string;
  model: string;
  color: string;
  year: number;
  ownerId: number;
  insurer: string;
  policy: string;
  expiry: string;
  status: InsStatus;
}
export interface World {
  people: Person[];
  vehicles: Vehicle[];
  vehiclesOf: Vehicle[][];
}

const MALE = ["James","Henry","Robert","Michael","William","David","Richard","Joseph","Thomas","Charles","Daniel","Matthew","Anthony","Mark","Paul","Steven","Andrew","Kevin","Brian","George","Edward","Ronald","Timothy","Jason","Jeffrey","Ryan","Jacob","Gary","Nicolas","Eric","Stephen","Larry","Justin","Scott","Brandon","Frank","Gregory","Raymond","Samuel","Patrick","Dario","Maximo","Bradley","Tanner","Xavier","Mike","Lucas","Hugo","Victor","Oscar"];
const FEMALE = ["Mary","Patricia","Jennifer","Linda","Elizabeth","Barbara","Susan","Jessica","Sarah","Karen","Nancy","Lisa","Margaret","Betty","Sandra","Ashley","Kimberly","Emily","Donna","Michelle","Carol","Amanda","Melissa","Deborah","Stephanie","Rebecca","Laura","Sharon","Cynthia","Kathleen","Amy","Angela","Shirley","Anna","Brenda","Pamela","Emma","Nicole","Helen","Samantha","Katherine","Christine","Debra","Rachel","Carolyn","Janet","Maria","Heather","Diane","Alexandra"];
const LAST = ["Jenkins","Parker","Marshall","Dixon","Skinner","Pendell","Trench","Tanner","Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez","Powell","Jenkins","Perry","Russell","Sullivan","Bell","Coleman","Butler","Henderson","Barnes","Fisher","Vasquez","Simmons","Romero","Jordan","Patterson","Alexander","Hamilton","Graham","Reynolds","Griffin","Wallace","Moreno","West","Cole","Hayes","Bryant","Herrera","Gibson","Ellis","Tran","Medina","Aguilar","Stevens","Murray","Ford","Castro","Marshall","Owens","Harrison","Fernandez","McDonald","Woods","Washington","Kennedy","Wells","Vargas","Henry","Chen","Freeman","Webb","Tucker","Guzman","Burns","Crawford","Olson","Simpson","Porter","Hunter","Gordon","Mendez","Silva","Shaw","Snyder","Mason","Dixon","Munoz","Hunt","Hicks","Holmes","Palmer","Wagner","Black","Robertson","Boyd","Rose","Stone","Salazar","Fox","Warren","Mills","Meyer","Rice","Schmidt","Garza","Daniels","Ferguson","Nichols","Stephens","Soto","Weaver","Ryan","Gardner","Payne","Grant","Dunn","Kelley","Spencer","Hawkins"];
export const JOBS = ["Mécanicien","Serveur","Comptable","Infirmier","Chauffeur routier","Électricien","Avocat","Pilote","Pêcheur","Professeur","Videur","Barman","Plombier","Informaticien","Photographe","Agent immobilier","Cuisinier","Docker","Coiffeur","Vendeur","Architecte","Boulanger","Livreur","Charpentier","Gardien de nuit","Taxi","Médecin","Journaliste"];
const CITIES = ["Seattle","Portland","Tacoma","Boise","Spokane","Salem","Eugene","Olympia","Bellevue","Everett"];
const STREETS = ["Maple St","Oak Ave","Pine Rd","Cedar Ln","Elm St","Harbor Dr","Lake View","Sunset Blvd","River Rd","Hillcrest Ave"];
const RECORDS = ["Aucun","Aucun","Aucun","Aucun","Vol simple","Conduite en état d'ivresse","Violences","Fraude","Trafic","Port d'arme illégal"];

const EYES: [string, number][] = [["marron", 40], ["bleu", 20], ["vert", 12], ["noisette", 20], ["gris", 8]];

export function plateMake(r: Rng, t: VType): string {
  const L = "ABCDEFGHJKLMNPRSTVWXYZ";
  const l = () => L[Math.floor(r() * L.length)];
  switch (t) {
    case "voiture":
      return `${l()}${l()}-${ri(r, 100, 999)}-${l()}${l()}`;
    case "moto":
      return `${ri(r, 100, 999)}-${l()}${l()}${l()}`;
    case "bateau":
      return `${l()}${l()}-${ri(r, 10000, 99999)}`;
    default:
      return `N${ri(r, 100, 999)}${l()}${l()}`;
  }
}

let W: World | null = null;

export function getWorld(): World {
  if (W) return W;
  const r = mulberry32(20251);
  const people: Person[] = [];
  const names = new Set<string>();
  const N = 700;
  while (people.length < N) {
    const sex: Sex = r() < 0.5 ? "H" : "F";
    const first = pick(r, sex === "H" ? MALE : FEMALE);
    const last = pick(r, LAST);
    const key = `${first} ${last}`;
    if (names.has(key)) continue;
    names.add(key);
    const age = ri(r, 19, 79);
    const height = sex === "H" ? ri(r, 163, 198) : ri(r, 152, 184);
    const weight = Math.round((height - 100) * (ri(r, 85, 125) / 100));
    let hair = wpick<string>(r, [["noir", 35], ["brun", 30], ["blond", 20], ["roux", 8]]);
    if (age > 62 && r() < 0.55) hair = "gris";
    if (sex === "H" && r() < 0.1) hair = "chauve";
    const dead = r() < 0.06;
    const p: Person = {
      id: people.length,
      first,
      last,
      sex,
      age,
      height,
      weight,
      eyes: wpick(r, EYES),
      skin: wpick<number>(r, [[1, 18], [2, 30], [3, 22], [4, 14], [5, 10], [6, 6]]),
      hair,
      beard: sex === "H" && r() < 0.3,
      glasses: r() < 0.28,
      job: pick(r, JOBS),
      city: pick(r, CITIES),
      address: `${ri(r, 10, 999)} ${pick(r, STREETS)}`,
      phone: `555-${ri(r, 1000, 9999)}`,
      status: dead ? "Décédé" : "Vivant",
      clearance: r() < 0.08 ? ri(r, 2, 5) : 1,
      record: pick(r, RECORDS),
    };
    people.push(p);
  }
  const vehicles: Vehicle[] = [];
  const vehiclesOf: Vehicle[][] = people.map(() => []);
  const plates = new Set<string>();
  const probs: [VType, number][] = [["voiture", 0.72], ["moto", 0.16], ["bateau", 0.11], ["avion", 0.05]];
  for (const p of people) {
    for (const [t, pr] of probs) {
      if (r() >= pr) continue;
      let pl = plateMake(r, t);
      while (plates.has(pl)) pl = plateMake(r, t);
      plates.add(pl);
      const make = pick(r, Object.keys(MODELS[t]));
      const roll = r();
      const status: InsStatus = roll < 0.74 ? "ASSURÉ" : roll < 0.87 ? "EXPIRÉ" : "NON ASSURÉ";
      const year = ri(r, 2002, 2024);
      const insurer = status === "NON ASSURÉ" ? "Aucun" : pick(r, INSURERS);
      const expiry =
        status === "ASSURÉ"
          ? `${ri(r, 2025, 2026)}-${String(ri(r, 1, 12)).padStart(2, "0")}-${String(ri(r, 1, 28)).padStart(2, "0")}`.replace(/^2025-0[1-3]/, "2026-06")
          : status === "EXPIRÉ"
            ? `${ri(r, 2023, 2024)}-${String(ri(r, 1, 12)).padStart(2, "0")}-${String(ri(r, 1, 28)).padStart(2, "0")}`
            : "—";
      const v: Vehicle = {
        id: vehicles.length,
        type: t,
        plate: pl,
        make,
        model: pick(r, MODELS[t][make]),
        color: pick(r, COLORS),
        year,
        ownerId: p.id,
        insurer,
        policy: status === "NON ASSURÉ" ? "—" : `POL-${ri(r, 100000, 999999)}`,
        expiry,
        status,
      };
      vehicles.push(v);
      vehiclesOf[p.id].push(v);
    }
  }
  W = { people, vehicles, vehiclesOf };
  return W;
}

export const fullName = (p: { first: string; last: string }) => `${p.first} ${p.last}`;
export const displayName = (p: { first: string; last: string }) => `${p.first} ${p.last.toUpperCase()}`;
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
export const skinLabel = (n: number) => `Type ${ROMAN[n - 1]}`;
export const heightLabel = (cm: number) => `1m${String(cm - 100).padStart(2, "0")}`;

export function normStr(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function normPlate(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9?*]/g, "");
}

export function matchPlate(plate: string, pattern: string): boolean {
  const p = normPlate(plate);
  const q = normPlate(pattern);
  if (!q) return true;
  const src = q.replace(/\?/g, ".").replace(/\*/g, ".*");
  if (q.includes("*") || q.length === p.length) return new RegExp("^" + src + "$").test(p);
  return new RegExp(src).test(p);
}

// ---------- Indices ----------
export interface VehClue {
  k: "vehicle";
  vtype: VType;
  color?: string;
  make?: string;
  plate?: string;
  insurer?: string;
  status?: InsStatus;
}
export type Clue =
  | { k: "sex"; v: Sex }
  | { k: "skin"; v: number }
  | { k: "hair"; v: string }
  | { k: "beard"; v: boolean }
  | { k: "glasses"; v: boolean }
  | { k: "eyes"; v: string }
  | { k: "age"; min: number; max: number }
  | { k: "height"; min: number; max: number }
  | { k: "job"; v: string }
  | VehClue;

export function vehMatches(v: Vehicle, c: VehClue): boolean {
  if (v.type !== c.vtype) return false;
  if (c.color && v.color !== c.color) return false;
  if (c.make && v.make !== c.make) return false;
  if (c.insurer && v.insurer !== c.insurer) return false;
  if (c.status && v.status !== c.status) return false;
  if (c.plate && !matchPlate(v.plate, c.plate)) return false;
  return true;
}

export function personMatchesAll(p: Person, clues: Clue[]): boolean {
  const w = getWorld();
  const vc: VehClue[] = [];
  for (const c of clues) {
    switch (c.k) {
      case "sex": if (p.sex !== c.v) return false; break;
      case "skin": if (p.skin !== c.v) return false; break;
      case "hair": if (p.hair !== c.v) return false; break;
      case "beard": if (p.beard !== c.v) return false; break;
      case "glasses": if (p.glasses !== c.v) return false; break;
      case "eyes": if (p.eyes !== c.v) return false; break;
      case "age": if (p.age < c.min || p.age > c.max) return false; break;
      case "height": if (p.height < c.min || p.height > c.max) return false; break;
      case "job": if (p.job !== c.v) return false; break;
      case "vehicle": vc.push(c); break;
    }
  }
  if (vc.length) {
    return w.vehiclesOf[p.id].some((v) => vc.every((c) => vehMatches(v, c)));
  }
  return true;
}

export function describeClue(c: Clue): string {
  switch (c.k) {
    case "sex": return `Sexe : ${c.v === "H" ? "Homme" : "Femme"}`;
    case "skin": return `Peau : ${skinLabel(c.v)}`;
    case "hair": return c.v === "chauve" ? "Cheveux : aucun (chauve)" : `Cheveux : ${c.v}`;
    case "beard": return `Barbe : ${c.v ? "oui" : "non"}`;
    case "glasses": return `Lunettes : ${c.v ? "oui" : "non"}`;
    case "eyes": return `Yeux : ${c.v}`;
    case "age": return `Âge estimé : ${c.min} – ${c.max} ans`;
    case "height": return `Taille estimée : ${heightLabel(c.min)} – ${heightLabel(c.max)}`;
    case "job": return `Profession : ${c.v}`;
    case "vehicle": {
      const parts: string[] = [];
      if (c.color) parts.push(`couleur ${c.color}`);
      if (c.make) parts.push(`marque ${c.make}`);
      if (c.plate) parts.push(`plaque ${c.plate}`);
      if (c.insurer) parts.push(`assureur ${c.insurer}`);
      if (c.status) parts.push(`assurance ${c.status}`);
      return `Véhicule (${c.vtype}) : ${parts.join(", ")}`;
    }
  }
}
