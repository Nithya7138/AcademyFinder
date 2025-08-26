"use client";

type Props = {
  lat: number | "";
  lng: number | "";
  onChange: (field: "lat" | "lng", value: number | "") => void;
};

import { fieldsetClass, legendClass, inputClass, gridTwoCols } from "./styles";

export default function CoordinatesSection({ lat, lng, onChange }: Props) {
  return (
    <fieldset className={fieldsetClass}>
      <div className={legendClass}>Location Coordinates *</div>
      <div className={gridTwoCols}>
        <input type="number" placeholder="Latitude" className={inputClass}
               value={lat} onChange={(e) => onChange("lat", e.target.value === "" ? "" : Number(e.target.value))} required />
        <input type="number" placeholder="Longitude" className={inputClass}
               value={lng} onChange={(e) => onChange("lng", e.target.value === "" ? "" : Number(e.target.value))} required />
      </div>
    </fieldset>
  );
}