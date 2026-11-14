"use client";
import { useEffect, useMemo, useState } from "react";
import { useGame } from "../ctx";
import { Face } from "../Face";
import { VLABEL, displayName, getWorld, heightLabel, normStr, skinLabel } from "@/game/world";

const EMPTY = { last: "", first: "", sex: "", amin: "", amax: "", hmin: "", hmax: "", eyes: "", hair: "", skin: "", beard: "", glasses: "", job: "" };

export function HumanDB({ profileId, nonce }: { profileId?: number; nonce?: number }) {
  const g = useGame();
  const w = getWorld();
  const [q, setQ] = useState(EMPTY);
  const [sel, setSel] = useState<number | null>(profileId ?? null);
  useEffect(() => {
    if (profileId !== undefined) setSel(profileId);
  }, [profileId, nonce]);

  const hasCrit = Object.values(q).some((x) => x !== "") || (g.listFilter && g.listIds);
  const results = useMemo(() => {
    if (!hasCrit) return [];
    const out = w.people.filter((p) => {
      if (g.listFilter && g.listIds && !g.listIds.includes(p.id)) return false;
      if (q.last && !normStr(p.last).includes(normStr(q.last))) return false;
      if (q.first && !normStr(p.first).includes(normStr(q.first))) return false;
      if (q.sex && p.sex !== q.sex) return false;
      if (q.amin && p.age < Number(q.amin)) return false;
      if (q.amax && p.age > Number(q.amax)) return false;
      if (q.hmin && p.height < Number(q.hmin)) return false;
      if (q.hmax && p.height > Number(q.hmax)) return false;
      if (q.eyes && p.eyes !== q.eyes) return false;
      if (q.hair && p.hair !== q.hair) return false;
      if (q.skin && p.skin !== Number(q.skin)) return false;
      if (q.beard && p.beard !== (q.beard === "1")) return false;
      if (q.glasses && p.glasses !== (q.glasses === "1")) return false;
      if (q.job && !normStr(p.job).includes(normStr(q.job))) return false;
      return true;
    });
    return out;
  }, [q, g.listFilter, g.listIds, hasCrit, w.people]);

  const set = (k: keyof typeof EMPTY, v: string) => setQ((o) => ({ ...o, [k]: v }));

  if (sel !== null) {
    const p = w.people[sel];
    const locked = p.clearance > g.clearance;
    const vs = w.vehiclesOf[p.id];
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <button className="btn" onClick={() => setSel(null)}>← Retour</button>
          <div className="text-right text-[10px] font-bold leading-tight">
            FEDERAL DEPARTMENT OF INTELLIGENCE
            <div className="font-normal text-[#5fa8bb]">HUMAN_DB v1.2.116</div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-[130px] w-[100px] shrink-0 overflow-hidden border border-[#1fc3e6]/60">
            <Face t={p} bg="#8b97a0" className="h-full w-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[20px] font-black">{displayName(p)}</span>
              <span className="text-[12px] text-[#5fa8bb]">
                STATUT <b className={p.status === "Décédé" ? "text-[#ff9d4d]" : "text-[#2cff8a]"}>{p.status.toUpperCase()}</b>
              </span>
            </div>
            {!locked && (
              <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1 text-[12px]">
                {[
                  ["Sexe", p.sex === "H" ? "Homme" : "Femme"],
                  ["Âge", String(p.age)],
                  ["Peau", skinLabel(p.skin)],
                  ["Yeux", p.eyes],
                  ["Taille", heightLabel(p.height)],
                  ["Poids", `${p.weight} kg`],
                  ["Cheveux", p.hair],
                  ["Barbe", p.beard ? "Oui" : "Non"],
                  ["Lunettes", p.glasses ? "Oui" : "Non"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[10px] uppercase text-[#5fa8bb]">{k}</div>
                    <div className="font-bold capitalize">{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {locked ? (
          <div className="mt-6 flex items-center gap-5 px-4">
            <div className="text-center text-[#ff4d4d]">
              <div className="text-[34px] leading-none">⚠</div>
              <div className="mt-1 font-black">ERREUR 403</div>
              <div className="text-[12px] font-bold">ACCÈS INTERDIT</div>
            </div>
            <div className="text-[13px] font-bold text-[#6fdcff]">
              Vous n&apos;avez pas le niveau d&apos;habilitation requis pour consulter ce profil. (Requis : niveau {p.clearance} — votre niveau : {g.clearance})
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
            <div className="border border-[#1fc3e6]/30 p-2">
              <div className="mb-1 text-[10px] uppercase text-[#5fa8bb]">Informations</div>
              <div>Profession : <b>{p.job}</b></div>
              <div>Adresse : {p.address}, {p.city}</div>
              <div>Téléphone : {p.phone}</div>
              <div>Casier : <b className={p.record === "Aucun" ? "" : "text-[#ff9d4d]"}>{p.record}</b></div>
            </div>
            <div className="border border-[#1fc3e6]/30 p-2">
              <div className="mb-1 text-[10px] uppercase text-[#5fa8bb]">Véhicules enregistrés</div>
              {vs.length === 0 && <div className="text-[#5fa8bb]">Aucun</div>}
              {vs.map((v) => (
                <button key={v.id} className="block w-full text-left hover:text-white hover:underline" onClick={() => g.openRegistry(v.type, v.plate)}>
                  ▸ {VLABEL[v.type]} {v.color} — {v.make} {v.model} — <span className="mono">{v.plate}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const sel2 = (k: keyof typeof EMPTY, opts: [string, string][], label: string) => (
    <div>
      <label className="lbl">{label}</label>
      <select className="inp" value={q[k]} onChange={(e) => set(k, e.target.value)}>
        <option value="">—</option>
        {opts.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
  const txt = (k: keyof typeof EMPTY, label: string, type = "text") => (
    <div>
      <label className="lbl">{label}</label>
      <input className="inp" type={type} value={q[k]} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] text-[#5fa8bb]">Recherche multicritères — niveau d&apos;habilitation {g.clearance}</div>
        <button className="btn" onClick={() => setQ(EMPTY)}>Réinitialiser</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {txt("last", "Nom")}
        {txt("first", "Prénom")}
        {sel2("sex", [["H", "Homme"], ["F", "Femme"]], "Sexe")}
        {txt("job", "Profession")}
        {txt("amin", "Âge min", "number")}
        {txt("amax", "Âge max", "number")}
        {txt("hmin", "Taille min (cm)", "number")}
        {txt("hmax", "Taille max (cm)", "number")}
        {sel2("eyes", ["marron", "bleu", "vert", "noisette", "gris"].map((x) => [x, x]), "Yeux")}
        {sel2("hair", ["noir", "brun", "blond", "roux", "gris", "chauve"].map((x) => [x, x]), "Cheveux")}
        {sel2("skin", [1, 2, 3, 4, 5, 6].map((x) => [String(x), skinLabel(x)]), "Peau")}
        <div className="grid grid-cols-2 gap-1">
          {sel2("beard", [["1", "Oui"], ["0", "Non"]], "Barbe")}
          {sel2("glasses", [["1", "Oui"], ["0", "Non"]], "Lunettes")}
        </div>
      </div>
      {g.listIds && (
        <label className="mt-2 flex items-center gap-2 text-[12px] text-[#ffd23a]">
          <input type="checkbox" checked={g.listFilter} onChange={(e) => g.setListFilter(e.target.checked)} />
          Limiter la recherche à la liste importée ({g.listIds.length} noms)
        </label>
      )}
      <div className="mt-3 text-[11px] text-[#5fa8bb]">{hasCrit ? `${results.length} résultat(s)${results.length > 60 ? " — affichage limité à 60" : ""}` : "Entrez au moins un critère."}</div>
      <div className="mt-1 max-h-[250px] overflow-auto">
        <table className="tbl">
          <thead>
            <tr><th>Nom</th><th>Sexe</th><th>Âge</th><th>Taille</th><th>Yeux</th><th>Cheveux</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {results.slice(0, 60).map((p) => (
              <tr key={p.id} className="row" onClick={() => setSel(p.id)}>
                <td className="font-bold">{displayName(p)}{p.clearance > g.clearance && <span className="badge bad ml-2">403</span>}</td>
                <td>{p.sex}</td>
                <td>{p.age}</td>
                <td>{heightLabel(p.height)}</td>
                <td>{p.eyes}</td>
                <td>{p.hair}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
