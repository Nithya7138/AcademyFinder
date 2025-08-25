"use client";

type Achievements = { award: string; notable_alumni: string; recognition: string };

type Props = {
  values: Achievements;
  onChange: <K extends keyof Achievements>(key: K, value: Achievements[K]) => void;
};

import { fieldsetClass, legendClass, inputClass } from "./styles";

export default function AchievementsSection({ values, onChange }: Props) {
  return (
    <fieldset className={fieldsetClass}>
      <legend className={legendClass}>Achievements</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className={inputClass} placeholder="Awards"
               value={values.award} onChange={(e) => onChange("award", e.target.value)} />
        <input className={inputClass} placeholder="Notable Alumni (comma separated)"
               value={values.notable_alumni} onChange={(e) => onChange("notable_alumni", e.target.value)} />
        <input className={`${inputClass} md:col-span-2`} placeholder="Recognition"
               value={values.recognition} onChange={(e) => onChange("recognition", e.target.value)} />
      </div>
    </fieldset>
  );
}