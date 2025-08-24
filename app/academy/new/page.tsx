"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Trainer = { name: string; experience: number | ""; specialization: string };
type ArtProgram = { art_name: string; level: string };
type SportsProgram = { sport_name: string; level: string };

type FormState = {
  name: string;
  type: "Art" | "Sports" | "";
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
  };
  average_rating: number | "";
  lat: number | "";
  lng: number | "";
  trainers: Trainer[];
  artprogram: ArtProgram[];
  sportsprogram: SportsProgram[];
  achievements: {
    award: string;
    notable_alumni: string;
    recognition: string;
  };
};

export default function NewAcademyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    type: "",
    phone: "",
    address: { line1: "", line2: "", city: "", state: "", zip: "" },
    average_rating: "",
    lat: "",
    lng: "",
    trainers: [{ name: "", experience: "", specialization: "" }],
    artprogram: [{ art_name: "", level: "" }],
    sportsprogram: [{ sport_name: "", level: "" }],
    achievements: { award: "", notable_alumni: "", recognition: "" },
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateAddress<K extends keyof FormState["address"]>(key: K, value: FormState["address"][K]) {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  }

  const addTrainer = () => update("trainers", [...form.trainers, { name: "", experience: "", specialization: "" }]);
  const removeTrainer = (idx: number) => update("trainers", form.trainers.filter((_, i) => i !== idx));
  const setTrainer = (idx: number, field: keyof Trainer, value: string | number | "") => {
    const copy = form.trainers.slice();
    copy[idx] = { ...copy[idx], [field]: field === "experience" ? (value === "" ? "" : Number(value)) : value } as Trainer;
    update("trainers", copy);
  };

  const addArt = () => update("artprogram", [...form.artprogram, { art_name: "", level: "" }]);
  const removeArt = (idx: number) => update("artprogram", form.artprogram.filter((_, i) => i !== idx));
  const setArt = (idx: number, field: keyof ArtProgram, value: string) => {
    const copy = form.artprogram.slice();
    copy[idx] = { ...copy[idx], [field]: value };
    update("artprogram", copy);
  };

  const addSport = () => update("sportsprogram", [...form.sportsprogram, { sport_name: "", level: "" }]);
  const removeSport = (idx: number) => update("sportsprogram", form.sportsprogram.filter((_, i) => i !== idx));
  const setSport = (idx: number, field: keyof SportsProgram, value: string) => {
    const copy = form.sportsprogram.slice();
    copy[idx] = { ...copy[idx], [field]: value };
    update("sportsprogram", copy);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.type || !form.address.line1 || !form.address.city || !form.phone) {
      setError("Please fill all required fields: Name, Type, Address Line 1, City, Phone.");
      return;
    }
    if (form.lat === "" || form.lng === "") {
      setError("Please provide coordinates (latitude and longitude).");
      return;
    }

    try {
      setLoading(true);
      const id = crypto.randomUUID();

      const payload = {
        id,
        name: form.name,
        type: form.type,
        phone: form.phone,
        address: {
          line1: form.address.line1,
          line2: form.address.line2 || undefined,
          city: form.address.city,
          state: form.address.state || undefined,
          zip: form.address.zip || undefined,
        },
        trainers: form.trainers
          .filter((t) => t.name && t.experience !== "" && t.specialization)
          .map((t) => ({ name: t.name, experience: Number(t.experience), specialization: t.specialization })),
        achievements: {
          award: form.achievements.award || undefined,
          notable_alumni: form.achievements.notable_alumni
            ? form.achievements.notable_alumni.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
          recognition: form.achievements.recognition || undefined,
        },
        average_rating: form.average_rating === "" ? undefined : Number(form.average_rating),
        artprogram: form.type === "Art" ? form.artprogram.filter((p) => p.art_name && p.level) : [],
        sportsprogram: form.type === "Sports" ? form.sportsprogram.filter((p) => p.sport_name && p.level) : [],
        location: {
          type: "Point",
          coordinates: [Number(form.lng), Number(form.lat)],
        },
      };

      const res = await fetch("/api/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        const redirectTarget = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/academy/new";
        router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create academy");
      }

      setSuccess("Academy created successfully.");
      setTimeout(() => router.push("/academy"), 800);
    } catch (err: unknown) {
      let message = "Something went wrong";
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-4xl px-6 md:px-10 py-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Add New Academy</h1>
          <p className="text-slate-500 mt-1">Provide details below and submit to create a new academy.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <legend className="px-2 text-lg font-semibold text-slate-900 pb-4 ">Basic Info</legend>

                <span className="text-sm text-slate-700 ">Name *</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Type *</span>
                <select
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value as FormState["type"])}
                  required
                >
                  <option value="">Select</option>
                  <option value="Art">Art</option>
                  <option value="Sports">Sports</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Phone *</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
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
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.average_rating}
                  onChange={(e) => update("average_rating", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <legend className="px-2 text-lg font-semibold text-slate-900 pb-2">Address *</legend>
              <label className="block">
                <span className="text-sm text-slate-700">Line 1 *</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.address.line1}
                  onChange={(e) => updateAddress("line1", e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Line 2</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.address.line2}
                  onChange={(e) => updateAddress("line2", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">City *</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.address.city}
                  onChange={(e) => updateAddress("city", e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">State</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.address.state}
                  onChange={(e) => updateAddress("state", e.target.value)}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Zip</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.address.zip}
                  onChange={(e) => updateAddress("zip", e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <legend className="px-2 text-lg font-semibold text-slate-900">Location (required)</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-700">Latitude *</span>
                <input
                  type="number"
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.lat}
                  onChange={(e) => update("lat", e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Longitude *</span>
                <input
                  type="number"
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.lng}
                  onChange={(e) => update("lng", e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">

            <div className="space-y-3">
                          <legend className="px-2 text-lg font-semibold text-slate-900 pb-2">Trainers</legend>
              {form.trainers.map((t, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <label className="block">
                    <span className="text-sm text-slate-700">Name</span>
                    <input
                      className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                      value={t.name}
                      onChange={(e) => setTrainer(idx, "name", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">Experience (years)</span>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                      value={t.experience}
                      onChange={(e) => setTrainer(idx, "experience", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">Specialization</span>
                    <input
                      className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                      value={t.specialization}
                      onChange={(e) => setTrainer(idx, "specialization", e.target.value)}
                    />
                  </label>
                  <div className="flex md:justify-end">
                    <button
                      type="button"
                      onClick={() => removeTrainer(idx)}
                      className="h-11 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addTrainer}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                + Add trainer
              </button>
            </div>
          </fieldset>

          {form.type === "Art" && (
            <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
              <legend className="px-2 text-lg font-semibold text-slate-900">Art Programs</legend>
              <div className="space-y-3">
                {form.artprogram.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <label className="block">
                      <span className="text-sm text-slate-700">Art Name</span>
                      <input
                        className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        value={p.art_name}
                        onChange={(e) => setArt(idx, "art_name", e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-slate-700">Level</span>
                      <input
                        className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        value={p.level}
                        onChange={(e) => setArt(idx, "level", e.target.value)}
                      />
                    </label>
                    <div className="flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => removeArt(idx)}
                        className="h-11 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addArt}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  + Add art program
                </button>
              </div>
            </fieldset>
          )}

          {form.type === "Sports" && (
            <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
              <legend className="px-2 text-lg font-semibold text-slate-900">Sports Programs</legend>
              <div className="space-y-3">
                {form.sportsprogram.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <label className="block">
                      <span className="text-sm text-slate-700">Sport Name</span>
                      <input
                        className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        value={p.sport_name}
                        onChange={(e) => setSport(idx, "sport_name", e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-slate-700">Level</span>
                      <input
                        className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        value={p.level}
                        onChange={(e) => setSport(idx, "level", e.target.value)}
                      />
                    </label>
                    <div className="flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => removeSport(idx)}
                        className="h-11 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSport}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  + Add sports program
                </button>
              </div>
            </fieldset>
          )}

          <fieldset className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <legend className="px-2 text-lg font-semibold text-slate-900 pb-2">Achievements</legend>
              <label className="block">
                <span className="text-sm text-slate-700">Award</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.achievements.award}
                  onChange={(e) => update("achievements", { ...form.achievements, award: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Notable Alumni (comma separated)</span>
                <input
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.achievements.notable_alumni}
                  onChange={(e) => update("achievements", { ...form.achievements, notable_alumni: e.target.value })}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Recognition</span>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  value={form.achievements.recognition}
                  onChange={(e) => update("achievements", { ...form.achievements, recognition: e.target.value })}
                />
              </label>
            </div>
          </fieldset>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create Academy"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}