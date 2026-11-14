export interface Grade {
  name: string;
  short: string;
  clearance: number;
  blurb: string;
}

export const MISSIONS_PER_GRADE = 15;

export const GRADES: Grade[] = [
  { name: "Opérateur stagiaire", short: "STAGIAIRE", clearance: 1, blurb: "Accès de base à HumanDB. Enquêtes simples." },
  { name: "Opérateur", short: "OPÉRATEUR", clearance: 2, blurb: "Accès niveau 2. Plus de pièces à conviction par affaire." },
  { name: "Opérateur confirmé", short: "CONFIRMÉ", clearance: 3, blurb: "Accès niveau 3. Enquêtes multi-registres." },
  { name: "Opérateur principal", short: "PRINCIPAL", clearance: 4, blurb: "Accès niveau 4. Affaires criminelles complexes." },
  { name: "Chef d'unité", short: "CHEF D'UNITÉ", clearance: 5, blurb: "Accès niveau 5. Dossiers sensibles du Bureau." },
  { name: "Cadre dirigeant", short: "CADRE", clearance: 6, blurb: "Direction des opérateurs. Vous gérez l'équipe." },
];

export function gradeIndex(completed: number): number {
  return Math.min(GRADES.length - 1, Math.floor(completed / MISSIONS_PER_GRADE));
}
