"use client";

type SportsProgram = { sport_name: string; level: string; fee_per_month: number | "" };

type Props = {
  programs: SportsProgram[];
  add: () => void;
  remove: (idx: number) => void;
  set: (idx: number, field: keyof SportsProgram, value: string | number | "") => void;
  isAdmin?: boolean;
};

import { fieldsetClass, legendClass, inputClass, addButtonClass, removeButtonClass } from "./styles";

export default function SportsProgramsSection({ programs, add, remove, set, isAdmin = false }: Props) {
  return (
    <fieldset className={fieldsetClass}>
      <legend className={legendClass}>Sports Programs</legend>
      <div className="space-y-3">
        {programs.map((p, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <input className={inputClass} placeholder="Sport Name"
                   value={p.sport_name} onChange={(e) => set(idx, "sport_name", e.target.value)} />
            <input className={inputClass} placeholder="Level"
                   value={p.level} onChange={(e) => set(idx, "level", e.target.value)} />
            <input className={inputClass} type="number" placeholder="Fee per month"
                   value={p.fee_per_month} onChange={(e) => set(idx, "fee_per_month", e.target.value === "" ? "" : Number(e.target.value))} />
            {isAdmin && (
              <button type="button" onClick={() => remove(idx)} className={removeButtonClass}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={add} className={addButtonClass}>+ Add Program</button>
      </div>
    </fieldset>
  );
}