"use client";

type ArtProgram = { art_name: string; level: string; fee_per_month: number | "" };

type Props = {
  programs: ArtProgram[];
  add: () => void;
  remove: (idx: number) => void;
  set: (idx: number, field: keyof ArtProgram, value: string | number | "") => void;
  isAdmin?: boolean;
};

import { fieldsetClass, legendClass, inputClass, addButtonClass, removeButtonClass } from "./styles";

export default function ArtProgramsSection({ programs, add, remove, set, isAdmin = false }: Props) {
  return (
    <fieldset className={fieldsetClass}>
      <div className={legendClass}>Art Programs</div>
      <div className="space-y-3">
        {programs.map((p, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <input className={inputClass} placeholder="Art Name"
                   value={p.art_name} onChange={(e) => set(idx, "art_name", e.target.value)} />
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