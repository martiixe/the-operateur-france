"use client";
import { useEffect, useMemo, useState } from "react";
import { useGame } from "../ctx";
import { COLORS, INSURERS, VLABEL, VTYPES, VType, Vehicle, displayName, getWorld, matchPlate, normStr } from "@/game/world";

const EMPTY = { plate: "", owner: "", make: "", color: "", insurer: "", status: "" };

export function Registry({ vtype, plate, nonce }: { vtype?: VType; plate?: string; nonce?: number }) {
  const g = useGame();
  const w = getWorld();
  const [tab, setTab] = useState<VType>(vtype ?? "voiture");
  const [q, setQ] = useState({ ...EMPTY, plate: plate ?? "" });
  const [sel, setSel] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (vtype) {
      setTab(vtype);
      setQ({ ...EMPTY, plate: plate ?? "" });
      if (plate) setSel(w.vehicles.find((v) => v.plate === plate) ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vtype, plate, nonce]);

  const set = (k: keyof typeof EMPTY, v: string) => setQ((o) => ({ ...o, [k]: v }));
  const hasCrit = Object.values(q).some((x) => x !== "");
  const results = useMemo(() => {
    if (!hasCrit) return [];
    return w.vehicles.filter((v) => {
      if (v.type !== tab) return false;
      if (q.plate && !matchPlate(v.plate, q.plate)) return false;
      if (q.make && v.make !== q.make) return false;
      if (q.color && v.color !== q.color) return false;
      if (q.insurer && v.insurer !== q.insurer) return false;
      if (q.status && v.status !== q.status) return false;
      if (q.owner) {
        const o = w.people[v.ownerId];
        if (!normStr(`${o.first} ${o.last}`).includes(normStr(q.owner))) return false;
      }
      return true;
    });
  }, [q, tab, hasCrit, w]);

  const makes = Array.from(new Set(w.vehicles.filter((v) => v.type === tab).map((v) => v.make))).sort();
  const badge = (s: string) => (s === "ASSURÉ" ? "ok" : s === "EXPIRÉ" ? "warn" : "bad");

  return (
    <div>
      <div className="mb-2 flex gap-1">
        {VTYPES.map((t) => (
          <button key={t} className={`btn ${tab === t ? "green" : ""}`} onClick={() => { setTab(t); setSel(null); set("make", ""); }}>
            {VLABEL[t]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-2">
          <label className="lbl">Plaque / immatriculation (? = 1 car., * = suite)</label>
          <input className="inp mono" placeholder={tab === "voiture" ? "AB-1?3-C?" : "…"} value={q.plate} onChange={(e) => set("plate", e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="lbl">Propriétaire</label>
          <input className="inp" value={q.owner} onChange={(e) => set("owner", e.target.value)} />
        </div>
        <div>
          <label className="lbl">Marque</label>
          <select className="inp" value={q.make} onChange={(e) => set("make", e.target.value)}>
            <option value="">—</option>
            {makes.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Couleur</label>
          <select className="inp" value={q.color} onChange={(e) => set("color", e.target.value)}>
            <option value="">—</option>
            {COLORS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="col-span-3">
          <label className="lbl">Assureur</label>
          <select className="inp" value={q.insurer} onChange={(e) => set("insurer", e.target.value)}>
            <option value="">—</option>
            {INSURERS.map((m) => <option key={m}>{m}</option>)}
            <option>Aucun</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="lbl">Statut assurance</label>
          <select className="inp" value={q.status} onChange={(e) => set("status", e.target.value)}>
            <option value="">—</option>
            <option>ASSURÉ</option>
            <option>EXPIRÉ</option>
            <option>NON ASSURÉ</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn w-full" onClick={() => { setQ(EMPTY); setSel(null); }}>Reset</button>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-[#5fa8bb]">{hasCrit ? `${results.length} véhicule(s)${results.length > 50 ? " — affichage limité à 50" : ""}` : "Entrez au moins un critère."}</div>
      <div className="mt-1 max-h-[200px] overflow-auto">
        <table className="tbl">
          <thead>
            <tr><th>Plaque</th><th>Véhicule</th><th>Couleur</th><th>Propriétaire</th><th>Assurance</th></tr>
          </thead>
          <tbody>
            {results.slice(0, 50).map((v) => (
              <tr key={v.id} className="row" onClick={() => setSel(v)}>
                <td className="mono font-bold">{v.plate}</td>
                <td>{v.make} {v.model}</td>
                <td className="capitalize">{v.color}</td>
                <td>{displayName(w.people[v.ownerId])}</td>
                <td><span className={`badge ${badge(v.status)}`}>{v.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && (
        <div className="mt-3 border border-[#1fc3e6]/50 bg-[#1fc3e6]/5 p-2 text-[12px]">
          <div className="mb-1 flex items-center justify-between">
            <b className="mono text-[14px]">{sel.plate}</b>
            <span className={`badge ${badge(sel.status)}`}>{sel.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div>Type : {VLABEL[sel.type]}</div>
            <div>Modèle : {sel.make} {sel.model} ({sel.year})</div>
            <div>Couleur : {sel.color}</div>
            <div>Assureur : {sel.insurer}</div>
            <div>N° de police : <span className="mono">{sel.policy}</span></div>
            <div>Expiration : {sel.expiry}</div>
          </div>
          <button className="btn mt-2" onClick={() => g.openProfile(sel.ownerId)}>
            Profil du propriétaire : {displayName(w.people[sel.ownerId])}
          </button>
        </div>
      )}
    </div>
  );
}
