"use client";

type Props = {
  values: {
    name: string;
    type: "Art" | "Sports" | "";
    phone: string;
    wabsite: string;
    academy_startat: string;
    average_rating: number | "";
  };
  onChange: (field: keyof Props["values"], value: Props["values"][keyof Props["values"]]) => void;
};

import { fieldsetClass, gridTwoCols, legendClass, inputClass, selectClass } from "./styles";

export default function BasicInfo({ values, onChange }: Props) {
  return (
    <fieldset className={fieldsetClass}>
      <legend className={`${legendClass} pb-4`}>Basic Info</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block md:col-span-2">
          <span className="text-sm text-slate-700">Name *</span>
          <input
            className={inputClass}
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Type *</span>
          <select
            className={selectClass}
            value={values.type}
            onChange={(e) => onChange("type", e.target.value as Props["values"]["type"])}
            required
          >
            <option value="">Select</option>
            <option value="Art">Art</option>
            <option value="Sports">Sports</option>
          </select>
        </label>
      </div>

      <div className={gridTwoCols}>
        <label className="block">
          <span className="text-sm text-slate-700">Phone *</span>
          <input
            className={inputClass}
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Website *</span>
          <input
            className={inputClass}
            placeholder="example.com or https://example.com"
            value={values.wabsite}
            onChange={(e) => onChange("wabsite", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Academy Start Date *</span>
          <input
            type="date"
            className={inputClass}
            value={values.academy_startat}
            onChange={(e) => onChange("academy_startat", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Average Rating</span>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            className={inputClass}
            value={values.average_rating}
            onChange={(e) => onChange("average_rating", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
      </div>
    </fieldset>
  );
}