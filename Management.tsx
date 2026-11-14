"use client";
import { useState } from "react";
import { useGame } from "../ctx";
import { Face } from "../Face";
import { CaseOffer, Operator, makeCase, makeOperator } from "@/game/save";

const chance = (o: Operator, c: CaseOffer) =>
  Math.min(0.95, Math.max(0.08, 0.5 + (o.skill - 40 - c.diff * 0.45) / 100 - o.fatigue / 250));

export function Management() {
  const g = useGame();
  const s = g.save;
  const [sel, setSel] = useState<Record<number, number>>({});
  const [log, setLog] = useState<string[]>([]);

  const push = (t: string) => setLog((l) => [t, ...l].slice(0, 8));

  const assign = (c: CaseOffer) => {
    const opId = sel[c.id];
    const o = s.ops.find((x) => x.id === opId);
    if (!o) return;
    if (o.fatigue >= 80) {
      push(`${o.name} est épuisé(e) : accordez-lui du repos.`);
      return;
    }
    const ok = Math.random() < chance(o, c);
    g.updateSave((st) => {
      const nextId = st.nextId;
      return {
        ...st,
        nextId: nextId + 1,
        budget: st.budget + (ok ? 600 + c.diff * 8 : -300),
        rep: Math.max(0, Math.min(100, st.rep + (ok ? 2 : -3))),
        ops: st.ops.map((x) =>
          x.id === o.id ? { ...x, fatigue: Math.min(100, x.fatigue + 25), done: x.done + 1, ok: x.ok + (ok ? 1 : 0), skill: ok ? Math.min(99, x.skill + 1) : x.skill } : x,
        ),
        cases: st.cases.map((x) => (x.id === c.id ? makeCase(nextId, st.completed + Math.floor(nextId / 3)) : x)),
      };
    });
    setSel((m) => {
      const n = { ...m };
      delete n[c.id];
      return n;
    });
    push(ok ? `✔ ${o.name} a résolu « ${c.title} » (+${600 + c.diff * 8} $).` : `✘ ${o.name} a échoué sur « ${c.title} » (-300 $).`);
  };

  const rest = (o: Operator) => g.updateSave((st) => ({ ...st, ops: st.ops.map((x) => (x.id === o.id ? { ...x, fatigue: Math.max(0, x.fatigue - 50) } : x)) }));
  const train = (o: Operator) => {
    if (s.budget < 500) return push("Budget insuffisant pour la formation (500 $).");
    g.updateSave((st) => ({ ...st, budget: st.budget - 500, ops: st.ops.map((x) => (x.id === o.id ? { ...x, skill: Math.min(99, x.skill + 4), fatigue: Math.min(100, x.fatigue + 10) } : x)) }));
    push(`${o.name} a suivi une formation (+4 compétence).`);
  };
  const fire = (o: Operator) => {
    g.updateSave((st) => ({ ...st, rep: Math.max(0, st.rep - 2), ops: st.ops.filter((x) => x.id !== o.id) }));
    push(`${o.name} a été remercié(e).`);
  };
  const hire = () => {
    if (s.budget < 1200) return push("Budget insuffisant pour recruter (1200 $).");
    if (s.ops.length >= 8) return push("L'équipe est complète (8 opérateurs).");
    g.updateSave((st) => {
      const id = st.nextId;
      const op = makeOperator(id, id + 5);
      return { ...st, nextId: id + 1, budget: st.budget - 1200, ops: [...st.ops, { ...op, skill: Math.min(75, op.skill + 5) }] };
    });
    push("Un nouvel opérateur a rejoint l'équipe.");
  };
  const endDay = () => {
    g.updateSave((st) => ({ ...st, ops: st.ops.map((x) => ({ ...x, fatigue: Math.max(0, x.fatigue - 30) })), budget: st.budget - st.ops.length * 150 }));
    push(`Fin de journée : salaires versés (-${s.ops.length * 150} $), l'équipe récupère.`);
  };

  return (
    <div className="text-[12px]">
      <div className="mb-3 grid grid-cols-4 gap-2 text-center">
        <div className="border border-[#1fc3e6]/40 p-2"><div className="text-[18px] font-black text-[#2cff8a]">{s.budget} $</div><div className="text-[10px] uppercase text-[#5fa8bb]">Budget</div></div>
        <div className="border border-[#1fc3e6]/40 p-2"><div className="text-[18px] font-black">{s.rep}/100</div><div className="text-[10px] uppercase text-[#5fa8bb]">Réputation</div></div>
        <div className="border border-[#1fc3e6]/40 p-2"><div className="text-[18px] font-black">{s.ops.length}</div><div className="text-[10px] uppercase text-[#5fa8bb]">Opérateurs</div></div>
        <div className="flex flex-col gap-1">
          <button className="btn green" onClick={hire}>Recruter (1200 $)</button>
          <button className="btn" onClick={endDay}>Fin de journée</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase text-[#5fa8bb]">Équipe</div>
          <div className="space-y-2">
            {s.ops.map((o) => (
              <div key={o.id} className="flex gap-2 border border-[#1fc3e6]/30 p-1.5">
                <div className="h-[56px] w-[44px] shrink-0 overflow-hidden"><Face t={o.traits} className="h-full w-full" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{o.name} <span className="text-[10px] font-normal text-[#5fa8bb]">{o.ok}/{o.done} réussies</span></div>
                  <div className="flex items-center gap-1 text-[10px]">COMP <div className="h-1.5 w-20 border border-[#1fc3e6]"><div className="h-full bg-[#2cff8a]" style={{ width: `${o.skill}%` }} /></div> {o.skill}</div>
                  <div className="flex items-center gap-1 text-[10px]">FATIGUE <div className="h-1.5 w-20 border border-[#1fc3e6]"><div className="h-full bg-[#ff9d4d]" style={{ width: `${o.fatigue}%` }} /></div> {o.fatigue}</div>
                  <div className="mt-1 flex gap-1">
                    <button className="btn !px-2 !py-0" onClick={() => rest(o)}>Repos</button>
                    <button className="btn !px-2 !py-0" onClick={() => train(o)}>Former</button>
                    <button className="btn red !px-2 !py-0" onClick={() => fire(o)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase text-[#5fa8bb]">Affaires entrantes</div>
          <div className="space-y-2">
            {s.cases.map((c) => {
              const o = s.ops.find((x) => x.id === sel[c.id]);
              return (
                <div key={c.id} className="border border-[#1fc3e6]/30 p-2">
                  <div className="font-bold">{c.title} <span className="text-[10px] text-[#5fa8bb]">#{c.id * 311} — difficulté {c.diff}</span></div>
                  <div className="mt-1 flex gap-1">
                    <select className="inp" value={sel[c.id] ?? ""} onChange={(e) => setSel((m) => ({ ...m, [c.id]: Number(e.target.value) }))}>
                      <option value="">Assigner…</option>
                      {s.ops.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                    </select>
                    <button className="btn green" disabled={!o} onClick={() => assign(c)}>Lancer</button>
                  </div>
                  {o && <div className="mt-1 text-[10px] text-[#ffd23a]">Chances de réussite estimées : {Math.round(chance(o, c) * 100)}%</div>}
                </div>
              );
            })}
          </div>
          <div className="mb-1 mt-3 text-[11px] font-bold uppercase text-[#5fa8bb]">Journal</div>
          <div className="mono text-[11px] text-[#b4f7d3]">
            {log.length === 0 && <div className="text-[#5fa8bb]">Aucune activité.</div>}
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <p className="mt-2 text-[10px] text-[#5fa8bb]">Vous pouvez toujours mener vos propres enquêtes de terrain via l&apos;explorateur de fichiers.</p>
        </div>
      </div>
    </div>
  );
}
