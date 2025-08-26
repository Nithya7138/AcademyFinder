"use client";

type Address = {
  line1: string; line2: string;area:string ;city: string; state: string; Country: string; zip: string; link: string;
};

type Props = {
  address: Address;
  onChange: <K extends keyof Address>(key: K, value: Address[K]) => void;
};

import { fieldsetClass, gridTwoCols, legendClass, inputClass } from "./styles";

export default function AddressSection({ address, onChange }: Props) {
  return (
    <fieldset className={fieldsetClass}>
      <div className={legendClass}>Address *</div>
      <div className={gridTwoCols}>

        <label className="block md:col-span-2">
          <span className="text-sm text-slate-700">Line 1 *</span>
          <input className={inputClass}
                 value={address.line1} onChange={(e) => onChange("line1", e.target.value)} required />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Line 2</span>
          <input className={inputClass}
                 value={address.line2} onChange={(e) => onChange("line2", e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">area *</span>
          <input className={inputClass}
                 value={address.area} onChange={(e) => onChange("area", e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">City *</span>
          <input className={inputClass}
                 value={address.city} onChange={(e) => onChange("city", e.target.value)} required />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">State *</span>
          <input className={inputClass}
                 value={address.state} onChange={(e) => onChange("state", e.target.value)} required />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Country *</span>
          <input className={inputClass}
                 value={address.Country} onChange={(e) => onChange("Country", e.target.value)} required />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Zip *</span>
          <input className={inputClass}
                 value={address.zip} onChange={(e) => onChange("zip", e.target.value)} required />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm text-slate-700">Map Link *</span>
          <input className={inputClass}
                 value={address.link} onChange={(e) => onChange("link", e.target.value)} required />
        </label>
      </div>
    </fieldset>
  );
}