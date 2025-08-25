"use client";
// Purpose: Form page to create a new academy with validation and submission to API

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BasicInfo from "./components/BasicInfo";
import AddressSection from "./components/AddressSection";
import TrainersSection from "./components/TrainersSection";
import ArtProgramsSection from "./components/ArtProgramsSection";
import SportsProgramsSection from "./components/SportsProgramsSection";
import AchievementsSection from "./components/AchievementsSection";
import CoordinatesSection from "./components/CoordinatesSection";

type Trainer = { name: string; experience: number | ""; specialization: string };
type ArtProgram = { art_name: string; level: string ; fee_per_month: number | "" };
type SportsProgram = { sport_name: string; level: string ; fee_per_month: number | "" };

type FormState = {
  name: string;
  type: "Art" | "Sports" | "";
  phone: string;
  wabsite: string; 
  academy_startat: string; 
  address: {
    line1: string;
    line2: string; 
    city: string;
    state: string; 
    Country: string;
    zip: string; 
    link: string; 
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
    wabsite: "",
    academy_startat: "",
    address: { line1: "", line2: "", city: "", state: "", Country: "", zip: "", link: "" },
    average_rating: "",
    lat: "",
    lng: "",
    trainers: [{ name: "", experience: "", specialization: "" }],
    artprogram: [{ art_name: "", level: "", fee_per_month: "" }],
    sportsprogram: [{ sport_name: "", level: "", fee_per_month: "" }],
    achievements: { award: "", notable_alumni: "", recognition: "" },
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateAddress<K extends keyof FormState["address"]>(key: K, value: FormState["address"][K]) {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  }

  // Restrict BasicInfo onChange to only the keys it controls to keep strong typing
  type BasicInfoKeys = "name" | "type" | "phone" | "wabsite" | "academy_startat" | "average_rating";
  const handleBasicInfoChange = <K extends BasicInfoKeys>(field: K, value: FormState[K]) => {
    update(field, value);
  };

  const addTrainer = () => update("trainers", [...form.trainers, { name: "", experience: "", specialization: "" }]);
  const removeTrainer = (idx: number) => update("trainers", form.trainers.filter((_, i) => i !== idx));
  const setTrainer = (idx: number, field: keyof Trainer, value: string | number | "") => {
    const copy = form.trainers.slice();
    copy[idx] = { ...copy[idx], [field]: field === "experience" ? (value === "" ? "" : Number(value)) : value } as Trainer;
    update("trainers", copy);
  };

  const addArt = () => update("artprogram", [...form.artprogram, { art_name: "", level: "" , fee_per_month: ""}]);
  const removeArt = (idx: number) => update("artprogram", form.artprogram.filter((_, i) => i !== idx));
  const setArt = (idx: number, field: keyof ArtProgram, value: string | number | "") => {
    const copy = form.artprogram.slice();
    if (field === "fee_per_month") {
      copy[idx] = { ...copy[idx], fee_per_month: value === "" ? "" : Number(value) };
    } else {
      copy[idx] = { ...copy[idx], [field]: String(value) } as ArtProgram;
    }
    update("artprogram", copy);
  };

  const addSport = () => update("sportsprogram", [...form.sportsprogram, { sport_name: "", level: "",fee_per_month: "" }]);
  const removeSport = (idx: number) => update("sportsprogram", form.sportsprogram.filter((_, i) => i !== idx));
  const setSport = (idx: number, field: keyof SportsProgram, value: string | number | "") => {
    const copy = form.sportsprogram.slice();
    if (field === "fee_per_month") {
      copy[idx] = { ...copy[idx], fee_per_month: value === "" ? "" : Number(value) };
    } else {
      copy[idx] = { ...copy[idx], [field]: String(value) } as SportsProgram;
    }
    update("sportsprogram", copy);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.type || !form.phone || !form.wabsite || !form.academy_startat || !form.address.line1 || !form.address.line2 || !form.address.city || !form.address.state || !form.address.Country || !form.address.zip || !form.address.link) {
      setError("Please fill all required fields: Basic info, Website, Start date, Full address, and Map link.");
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
        wabsite: form.wabsite,
        academy_startat: form.academy_startat ? new Date(form.academy_startat).toISOString() : undefined,
        address: {
          line1: form.address.line1,
          line2: form.address.line2,
          city: form.address.city,
          state: form.address.state,
          country: form.address.Country,
          zip: form.address.zip,
          link: form.address.link,
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
        artprogram: form.type === "Art" ? form.artprogram
          .filter((p) => p.art_name && p.level)
          .map((p) => ({ art_name: p.art_name, level: p.level, fees_per_month: p.fee_per_month === "" ? 0 : Number(p.fee_per_month) })) : [],
        sportsprogram: form.type === "Sports" ? form.sportsprogram
          .filter((p) => p.sport_name && p.level)
          .map((p) => ({ sport_name: p.sport_name, level: p.level, fees_per_month: p.fee_per_month === "" ? 0 : Number(p.fee_per_month) })) : [],
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Add New Academy</h1>
            <p className="text-slate-500 mt-1">Provide details below and submit to create a new academy.</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                // After logout, redirect to academy page
                router.replace('/academy');
              } catch (err) {
                console.error('Logout failed:', err);
              }
            }}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Log out
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfo
            values={{
              name: form.name,
              type: form.type,
              phone: form.phone,
              wabsite: form.wabsite,
              academy_startat: form.academy_startat,
              average_rating: form.average_rating,
            }}
            onChange={handleBasicInfoChange}
          />

          <AddressSection address={form.address} onChange={updateAddress} />

          <CoordinatesSection
            lat={form.lat}
            lng={form.lng}
            onChange={(k: "lat" | "lng", v: number | "") => update(k, v)}
          />

          <TrainersSection
            trainers={form.trainers}
            addTrainer={addTrainer}
            removeTrainer={removeTrainer}
            setTrainer={setTrainer}
            isAdmin={false}
          />

          {form.type === "Art" && (
            <ArtProgramsSection
              programs={form.artprogram}
              add={addArt}
              remove={removeArt}
              set={setArt}
              isAdmin={false}
            />
          )}

          {form.type === "Sports" && (
            <SportsProgramsSection
              programs={form.sportsprogram}
              add={addSport}
              remove={removeSport}
              set={setSport}
              isAdmin={false}
            />
          )}

          <AchievementsSection
            values={form.achievements}
            onChange={(k, v) => update("achievements", { ...form.achievements, [k]: v })}
          />

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