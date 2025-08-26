"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Trainer = { name: string; experience: number | ""; specialization: string };
type ArtProgram = { art_name: string; fees_per_month: number | ""; level: string };
type SportsProgram = { sport_name: string; fees_per_month: number | ""; level: string };

type FormState = {
  name: string;
  type: "Art" | "Sports" | "";
  phone: string;
  address: { line1: string; line2?: string; city: string; state?: string; country?: string; zip?: string; link?: string };
  average_rating: number | "";
  trainers: Trainer[];
  artprogram: ArtProgram[];
  sportsprogram: SportsProgram[];
  lat: number | "";
  lng: number | "";
};

// Type guard to validate academy type values
function isAcademyType(t: unknown): t is "Art" | "Sports" {
  return t === "Art" || t === "Sports";
}

// Payload types for PATCH /api/academy/[id]
// Keep in sync with server route to avoid 'any'
interface AddressPayload { line1: string; line2?: string; city: string; state?: string; country?: string; zip?: string; link?: string }
interface GeoLocation { type: "Point"; coordinates: [number, number] }
interface AcademyUpdatePayload {
  name: string;
  type?: "Art" | "Sports";
  phone: string;
  address: AddressPayload;
  average_rating?: number;
  artprogram?: ArtProgram[];
  sportsprogram?: SportsProgram[];
  location?: GeoLocation;
}

export default function EditAcademyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/academy/${id}`);
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const data = await res.json();
        setForm({
          name: data.name || "",
          type: isAcademyType(data.type) ? data.type : "",
          phone: data.phone || "",
          address: {
            line1: data.address?.line1 || "",
            line2: data.address?.line2 || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            country: data.address?.country || "",
            zip: data.address?.zip || "",
            link: data.address?.link || "",
          },
          average_rating: typeof data.average_rating === "number" ? data.average_rating : "",
          trainers: Array.isArray(data.trainers) ? data.trainers : [],
          artprogram: Array.isArray(data.artprogram) ? data.artprogram : [],
          sportsprogram: Array.isArray(data.sportsprogram) ? data.sportsprogram : [],
          lat: typeof data.location?.coordinates?.[1] === "number" ? data.location.coordinates[1] : "",
          lng: typeof data.location?.coordinates?.[0] === "number" ? data.location.coordinates[0] : "",
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }
  function updateAddress<K extends keyof FormState["address"]>(key: K, value: FormState["address"][K]) {
    setForm((prev) => (prev ? { ...prev, address: { ...prev.address, [key]: value } } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);

    
    try {
      setSaving(true);
      const payload: AcademyUpdatePayload = {
        name: form.name,
        type: form.type || undefined,
        phone: form.phone,
        address: {
          line1: form.address.line1,
          line2: form.address.line2 || undefined,
          city: form.address.city,
          state: form.address.state || undefined,
          country: form.address.country || undefined,
          zip: form.address.zip || undefined,
          link: form.address.link || undefined,
        },
        average_rating: form.average_rating === "" ? undefined : Number(form.average_rating),
        artprogram: form.type === "Art" ? form.artprogram : undefined,
        sportsprogram: form.type === "Sports" ? form.sportsprogram : undefined,
        location: form.lat !== "" && form.lng !== "" ? { type: "Point", coordinates: [Number(form.lng), Number(form.lat)] } : undefined,
      };

      const res = await fetch(`/api/academy/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setSuccess("Saved successfully");
      setTimeout(() => router.push(`/academy/${id}`), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-4xl px-6 md:px-10 py-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Edit Academy</h1>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>}
        {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 text-sm">{success}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-700">Name *</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Type *</span>
                <select className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.type} onChange={(e) => update("type", isAcademyType(e.target.value) ? e.target.value : "")} required>
                  <option value="">Select</option>
                  <option value="Art">Art</option>
                  <option value="Sports">Sports</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Phone *</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Average Rating</span>
                <input type="number" min={0} max={5} step={0.1} className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.average_rating} onChange={(e) => update("average_rating", e.target.value === "" ? "" : Number(e.target.value))} />
              </label>
            </div>
          </fieldset>

          

          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <legend className="px-2 text-lg font-semibold text-slate-900 pb-2">Address</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-700">Line 1 *</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.address.line1} onChange={(e) => updateAddress("line1", e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Line 2</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.address.line2} onChange={(e) => updateAddress("line2", e.target.value)} />
              </label>

            <label className="block">
                <span className="text-sm text-slate-700">Area *</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.address.city} onChange={(e) => updateAddress("city", e.target.value)} required />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">City *</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.address.city} onChange={(e) => updateAddress("city", e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">State</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.address.state} onChange={(e) => updateAddress("state", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Country *</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.address.country} onChange={(e) => updateAddress("country", e.target.value)} required />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Zip</span>
                <input className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.address.zip} onChange={(e) => updateAddress("zip", e.target.value)} />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Location Link</span>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.address.link ?? ""}
                  onChange={(e) => updateAddress("link", e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <legend className="px-2 text-lg font-semibold text-slate-900">Location</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-700">Latitude</span>
                <input type="number" className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.lat} onChange={(e) => update("lat", e.target.value === "" ? "" : Number(e.target.value))} />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Longitude</span>
                <input type="number" className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none" value={form.lng} onChange={(e) => update("lng", e.target.value === "" ? "" : Number(e.target.value))} />
              </label>
            </div>
          </fieldset>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 h-11 text-white font-medium shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 h-11 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}