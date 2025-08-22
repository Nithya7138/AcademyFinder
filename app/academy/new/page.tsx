"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Minimal types to aid form state
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
    notable_alumni: string; // comma separated in UI
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
  const setTrainer = (idx: number, field: keyof Trainer, value: any) => {
    const copy = form.trainers.slice();
    // coerce experience to number or ""
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

    // Basic validation for required fields
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
          coordinates: [Number(form.lng), Number(form.lat)], // [lng, lat]
        },
      };

      const res = await fetch("/api/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ensure auth cookie is sent
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        // Not logged in: send to login and come back here
        const redirectTarget = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/academy/new";
        router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create academy");
      }

      setSuccess("Academy created successfully.");
      // Redirect to list or detail page
      setTimeout(() => router.push("/academy"), 800);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Add New Academy</h1>

      {error && (
        <div style={{ background: "#fde2e2", color: "#a10000", padding: 10, borderRadius: 6, marginBottom: 12 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#e7fbe7", color: "#0d6b0d", padding: 10, borderRadius: 6, marginBottom: 12 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <fieldset style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <legend>Basic Info</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div>Name *</div>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} required style={{ width: "100%" }} />
            </label>
            <label>
              <div>Type *</div>
              <select value={form.type} onChange={(e) => update("type", e.target.value as any)} required style={{ width: "100%" }}>
                <option value="">Select</option>
                <option value="Art">Art</option>
                <option value="Sports">Sports</option>
              </select>
            </label>
            <label>
              <div>Phone *</div>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} required style={{ width: "100%" }} />
            </label>
            <label>
              <div>Average Rating</div>
              <input type="number" min={0} max={5} step={0.1} value={form.average_rating} onChange={(e) => update("average_rating", e.target.value === "" ? "" : Number(e.target.value))} style={{ width: "100%" }} />
            </label>
          </div>
        </fieldset>

        {/* Address */}
        <fieldset style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <legend>Address *</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div>Line 1 *</div>
              <input value={form.address.line1} onChange={(e) => updateAddress("line1", e.target.value)} required style={{ width: "100%" }} />
            </label>
            <label>
              <div>Line 2</div>
              <input value={form.address.line2} onChange={(e) => updateAddress("line2", e.target.value)} style={{ width: "100%" }} />
            </label>
            <label>
              <div>City *</div>
              <input value={form.address.city} onChange={(e) => updateAddress("city", e.target.value)} required style={{ width: "100%" }} />
            </label>
            <label>
              <div>State</div>
              <input value={form.address.state} onChange={(e) => updateAddress("state", e.target.value)} style={{ width: "100%" }} />
            </label>
            <label>
              <div>Zip</div>
              <input value={form.address.zip} onChange={(e) => updateAddress("zip", e.target.value)} style={{ width: "100%" }} />
            </label>
          </div>
        </fieldset>

        {/* Location */}
        <fieldset style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <legend>Location (required)</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div>Latitude *</div>
              <input type="number" value={form.lat} onChange={(e) => update("lat", e.target.value === "" ? "" : Number(e.target.value))} required style={{ width: "100%" }} />
            </label>
            <label>
              <div>Longitude *</div>
              <input type="number" value={form.lng} onChange={(e) => update("lng", e.target.value === "" ? "" : Number(e.target.value))} required style={{ width: "100%" }} />
            </label>
          </div>
        </fieldset>

        {/* Trainers */}
        <fieldset style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <legend>Trainers</legend>
          {form.trainers.map((t, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: 8, alignItems: "end", marginBottom: 8 }}>
              <label>
                <div>Name</div>
                <input value={t.name} onChange={(e) => setTrainer(idx, "name", e.target.value)} />
              </label>
              <label>
                <div>Experience (years)</div>
                <input type="number" min={0} value={t.experience} onChange={(e) => setTrainer(idx, "experience", e.target.value)} />
              </label>
              <label>
                <div>Specialization</div>
                <input value={t.specialization} onChange={(e) => setTrainer(idx, "specialization", e.target.value)} />
              </label>
              <button type="button" onClick={() => removeTrainer(idx)} style={{ height: 30 }}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addTrainer}>+ Add trainer</button>
        </fieldset>

        {/* Programs (conditional) */}
        {form.type === "Art" && (
          <fieldset style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <legend>Art Programs</legend>
            {form.artprogram.map((p, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end", marginBottom: 8 }}>
                <label>
                  <div>Art Name</div>
                  <input value={p.art_name} onChange={(e) => setArt(idx, "art_name", e.target.value)} />
                </label>
                <label>
                  <div>Level</div>
                  <input value={p.level} onChange={(e) => setArt(idx, "level", e.target.value)} />
                </label>
                <button type="button" onClick={() => removeArt(idx)} style={{ height: 30 }}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addArt}>+ Add art program</button>
          </fieldset>
        )}

        {form.type === "Sports" && (
          <fieldset style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <legend>Sports Programs</legend>
            {form.sportsprogram.map((p, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end", marginBottom: 8 }}>
                <label>
                  <div>Sport Name</div>
                  <input value={p.sport_name} onChange={(e) => setSport(idx, "sport_name", e.target.value)} />
                </label>
                <label>
                  <div>Level</div>
                  <input value={p.level} onChange={(e) => setSport(idx, "level", e.target.value)} />
                </label>
                <button type="button" onClick={() => removeSport(idx)} style={{ height: 30 }}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addSport}>+ Add sports program</button>
          </fieldset>
        )}

        {/* Achievements */}
        <fieldset style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <legend>Achievements</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div>Award</div>
              <input value={form.achievements.award} onChange={(e) => update("achievements", { ...form.achievements, award: e.target.value })} />
            </label>
            <label>
              <div>Notable Alumni (comma separated)</div>
              <input value={form.achievements.notable_alumni} onChange={(e) => update("achievements", { ...form.achievements, notable_alumni: e.target.value })} />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <div>Recognition</div>
              <textarea value={form.achievements.recognition} onChange={(e) => update("achievements", { ...form.achievements, recognition: e.target.value })} rows={3} style={{ width: "100%" }} />
            </label>
          </div>
        </fieldset>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Academy"}
          </button>
          <button type="button" onClick={() => router.back()} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
}