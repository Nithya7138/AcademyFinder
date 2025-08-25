"use client";

type Trainer = { name: string; experience: number | ""; specialization: string };

type Props = {
  trainers: Trainer[];
  addTrainer: () => void;
  removeTrainer: (idx: number) => void;
  setTrainer: (idx: number, field: keyof Trainer, value: string | number | "") => void;
  isAdmin?: boolean;
};

import { fieldsetClass, legendClass, inputClass, addButtonClass, removeButtonClass } from "./styles";

export default function TrainersSection({ trainers, addTrainer, removeTrainer, setTrainer, isAdmin = false }: Props) {
  return (
    <fieldset className={fieldsetClass}>
      <legend className={legendClass}>Trainers</legend>
      <div className="space-y-3">
        {trainers.map((t, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <input className={inputClass} placeholder="Name"
                   value={t.name} onChange={(e) => setTrainer(idx, "name", e.target.value)} />
            <input className={inputClass} type="number" placeholder="Experience (years)"
                   value={t.experience} onChange={(e) => setTrainer(idx, "experience", e.target.value === "" ? "" : Number(e.target.value))} />
            <input className={inputClass} placeholder="Specialization"
                   value={t.specialization} onChange={(e) => setTrainer(idx, "specialization", e.target.value)} />
            {isAdmin && (
              <button type="button" onClick={() => removeTrainer(idx)} className={removeButtonClass}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addTrainer} className={addButtonClass}>+ Add Trainer</button>
      </div>
    </fieldset>
  );
}