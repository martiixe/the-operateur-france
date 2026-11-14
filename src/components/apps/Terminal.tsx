"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../ctx";
import { displayName, getWorld, matchPlate, normStr, personMatchesAll, VLABEL } from "@/game/world";

interface Line {
  k: "in" | "out" | "hal";
  t: string;
}

export function Terminal() {
  const g = useGame();
  const w = getWorld();
  const [lines, setLines] = useState<Line[]>([
    { k: "hal", t: "HAL> Bonjour, opérateur. Tapez 'aide' pour la liste des commandes." },
    { k: "hal", t: "HAL> Je n'ai pas le temps d'entrer dans les détails, alors soyez bref." },
  ]);
  const [v, setV] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView(), [lines]);

  const run = (cmd: string) => {
    const [c, ...rest] = cmd.trim().split(/\s+/);
    const arg = rest.join(" ");
    const out: Line[] = [{ k: "in", t: `${g.opName.toLowerCase().replace(/\s+/g, "")}> ${cmd}` }];
    const add = (t: string, k: Line["k"] = "hal") => out.push({ k, t });
    switch ((c ?? "").toLowerCase()) {
      case "":
        break;
      case "aide":
        add("HAL> Commandes : aide | nom <texte> | plaque <motif> | candidats | effacer");
        add("HAL> 'candidats' compte les suspects compatibles avec vos indices (-5 pts).");
        break;
      case "nom": {
        if (!arg) { add("HAL> Usage : nom <texte>"); break; }
        const m = w.people.filter((p) => normStr(`${p.first} ${p.last}`).includes(normStr(arg)));
        add(`HAL> ${m.length} résultat(s).`);
        m.slice(0, 8).forEach((p) => add(`  ${displayName(p)} — ${p.age} ans — ${p.job}`, "out"));
        break;
      }
      case "plaque": {
        if (!arg) { add("HAL> Usage : plaque <motif> (ex : AB-1?3-C?)"); break; }
        const m = w.vehicles.filter((x) => matchPlate(x.plate, arg));
        add(`HAL> ${m.length} résultat(s).`);
        m.slice(0, 8).forEach((x) => add(`  ${x.plate} — ${VLABEL[x.type]} ${x.color} ${x.make} — ${displayName(w.people[x.ownerId])} — ${x.status}`, "out"));
        break;
      }
      case "candidats": {
        if (!g.clues.length) { add("HAL> Aucun indice relevé pour l'instant."); break; }
        g.penalize(5);
        const all = w.people.filter((p) => p.status === "Vivant" && personMatchesAll(p, g.clues));
        add(`HAL> ${all.length} personne(s) correspondent à vos ${g.clues.length} indice(s).`);
        if (g.listIds) {
          const inList = all.filter((p) => g.listIds!.includes(p.id));
          add(`HAL> Dont ${inList.length} figurent dans la liste importée.`);
        }
        break;
      }
      case "effacer":
        setLines([]);
        return;
      default:
        add(`HAL> Commande inconnue : ${c}. Tapez 'aide'.`);
    }
    setLines((l) => [...l, ...out]);
  };

  return (
    <div className="mono flex h-full flex-col text-[13px] text-[#2cff8a]">
      <div className="min-h-0 flex-1 overflow-auto">
        {lines.map((l, i) => (
          <div key={i} className={`whitespace-pre-wrap ${l.k === "in" ? "text-[#8fe9ff]" : l.k === "out" ? "text-[#b4f7d3]" : ""}`}>
            {l.t}
          </div>
        ))}
        <div ref={end} />
      </div>
      <form
        className="mt-2 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(v);
          setV("");
        }}
      >
        <span>{g.opName.toLowerCase().replace(/\s+/g, "")}&gt;</span>
        <input className="inp mono flex-1" autoFocus value={v} onChange={(e) => setV(e.target.value)} />
      </form>
    </div>
  );
}
