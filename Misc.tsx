"use client";
import { useGame } from "../ctx";
import { GRADES, MISSIONS_PER_GRADE } from "@/game/grades";
import { describeClue } from "@/game/world";

export function Notes() {
  const g = useGame();
  const evs = g.mission.evidences.filter((e) => g.revealed[e.id] && e.clues.length);
  return (
    <div className="text-[13px]">
      <div className="mb-2 text-[11px] text-[#5fa8bb]">
        AFFAIRE #{g.mission.caseNo} — {g.mission.title.toUpperCase()} — {evs.length}/{g.mission.needed} pièces analysées
      </div>
      {g.listIds && <div className="mb-2 border-l-2 border-[#ffd23a] pl-2 text-[#ffd23a]">Liste importée : {g.listIds.length} noms. Utilisez HumanDB pour filtrer.</div>}
      {evs.length === 0 && <p className="text-[#5fa8bb]">Aucune information relevée. Ouvrez et analysez les fichiers de l&apos;affaire.</p>}
      {evs.map((e) => (
        <div key={e.id} className="mb-3">
          <div className="text-[11px] font-bold uppercase text-[#5fa8bb]">{e.title}</div>
          {e.clues.map((c, i) => (
            <div key={i} className="text-[#b4f7d3]">▸ {describeClue(c)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Profile() {
  const g = useGame();
  const s = g.save;
  const inGrade = g.grade >= GRADES.length - 1 ? s.completed - MISSIONS_PER_GRADE * (GRADES.length - 1) : s.completed % MISSIONS_PER_GRADE;
  const pct = g.grade >= GRADES.length - 1 ? 100 : (inGrade / MISSIONS_PER_GRADE) * 100;
  return (
    <div className="text-[13px]">
      <div className="text-[11px] uppercase text-[#5fa8bb]">Opérateur</div>
      <div className="text-[22px] font-black">{g.opName}</div>
      <div className="text-[#ffd23a]">{GRADES[g.grade].name} — habilitation niveau {g.clearance}</div>
      <div className="mt-3 text-[11px] uppercase text-[#5fa8bb]">
        {g.grade >= GRADES.length - 1 ? "Enquêtes personnelles résolues en tant que cadre" : `Progression vers ${GRADES[g.grade + 1].name}`}
      </div>
      <div className="mt-1 h-3 border border-[#1fc3e6]">
        <div className="h-full bg-[#2cff8a]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[12px]">
        {g.grade >= GRADES.length - 1 ? inGrade : `${inGrade} / ${MISSIONS_PER_GRADE}`} missions
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[["Réussies", s.completed], ["Échecs", s.failed], ["Score", s.score]].map(([k, v]) => (
          <div key={k as string} className="border border-[#1fc3e6]/40 p-2">
            <div className="text-[18px] font-black">{v}</div>
            <div className="text-[10px] uppercase text-[#5fa8bb]">{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-[11px] uppercase text-[#5fa8bb]">Hiérarchie</div>
      {GRADES.map((gr, i) => (
        <div key={gr.name} className={`mt-1 border px-2 py-1 ${i === g.grade ? "border-[#2cff8a] bg-[#2cff8a]/10" : "border-[#1fc3e6]/25"} ${i > g.grade ? "opacity-50" : ""}`}>
          <b>{i + 1}. {gr.name}</b> <span className="text-[11px] text-[#5fa8bb]">({i * MISSIONS_PER_GRADE}+ missions)</span>
          <div className="text-[11px] text-[#5fa8bb]">{gr.blurb}</div>
        </div>
      ))}
    </div>
  );
}

export function Help() {
  return (
    <div className="space-y-2 text-[13px] leading-relaxed">
      <p><b className="text-[#ffd23a]">Objectif :</b> identifiez le coupable puis cliquez sur le bouton jaune en haut pour envoyer son nom. Vous avez 3 essais par affaire.</p>
      <p><b>1. Fichiers.</b> Ouvrez le dossier de l&apos;affaire (Explorateur). Chaque fichier analysé en débloque d&apos;autres.</p>
      <p><b>2. Vidéos.</b> Faites défiler la vidéo, trouvez l&apos;instant où la <i>qualité</i> dépasse 70% puis capturez : le scan du visage ou de la silhouette révèle des indices.</p>
      <p><b>3. Photos.</b> Utilisez « Scanner » sur les photos de véhicules, de plaques et de gros plans.</p>
      <p><b>4. HumanDB.</b> Filtrez par sexe, âge, taille, yeux, cheveux, etc. Certains profils sont interdits (erreur 403) selon votre grade.</p>
      <p><b>5. Registre d&apos;assurance.</b> Voitures, motos, bateaux, avions. Les plaques partielles utilisent <span className="mono">?</span> pour un caractère inconnu.</p>
      <p><b>6. HAL.</b> Terminal d&apos;aide : <span className="mono">candidats</span> compte les suspects compatibles (coûte des points).</p>
      <p><b>Grades.</b> 15 affaires réussies = promotion. Au sommet, vous devenez Cadre et gérez les autres opérateurs.</p>
    </div>
  );
}
