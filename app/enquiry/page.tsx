"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type React from "react";

function EnquiryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read metadata from URL (fallbacks included for robustness)
  const academyId = searchParams.get("academyId") ?? "";
  const academyName = searchParams.get("academyName") ?? "";
  const initialType = searchParams.get("academytype") ?? searchParams.get("type") ?? "";
  // programId no longer used; programName chosen from dropdown
  const programNameFromUrl = searchParams.get("programName") ?? "";

  // Academy type: prefer URL; if missing, auto-fetch from API using academyId
  const [academyType, setAcademyType] = useState<string>(initialType);
  useEffect(() => {
    const id = academyId?.trim();
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/academy/${encodeURIComponent(id)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.type) setAcademyType(String(data.type)); // "Art" | "Sports"

        // Build program options (label includes level and fees)
        const opts: ProgramOption[] = [];
        if (data?.type === "Art" && Array.isArray(data?.artprogram)) {
          for (const p of data.artprogram) {
            const name = p?.art_name ? String(p.art_name) : "";
            if (!name) continue;
            const level = p?.level ? String(p.level) : "";
            const fees = typeof p?.fees_per_month === "number" ? p.fees_per_month : undefined;
            const feeText = typeof fees === "number" && !Number.isNaN(fees) && fees > 0 ? ` - ₹${fees}/mo` : "";
            const label = level ? `${name} (${level})${feeText}` : `${name}${feeText}`;
            opts.push({ value: name, label });
          }
        }
        if (data?.type === "Sports" && Array.isArray(data?.sportsprogram)) {
          for (const p of data.sportsprogram) {
            const name = p?.sport_name ? String(p.sport_name) : "";
            if (!name) continue;
            const level = p?.level ? String(p.level) : "";
            const fees = typeof p?.fees_per_month === "number" ? p.fees_per_month : undefined;
            const feeText = typeof fees === "number" && !Number.isNaN(fees) && fees > 0 ? ` - ₹${fees}/mo` : "";
            const label = level ? `${name} (${level})${feeText}` : `${name}${feeText}`;
            opts.push({ value: name, label });
          }
        }
        setPrograms(opts);
        if (!selectedProgramName && opts.length) setSelectedProgramName(opts[0].value);
      } catch {
        // ignore
      }
    })();
  }, [academyId]);

  // Programs list for dropdown and selected programName
  type ProgramOption = { value: string; label: string };
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selectedProgramName, setSelectedProgramName] = useState<string>(programNameFromUrl || "");

  // User-editable form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    batch_time: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);
    try {
      // Send user details + read-only metadata
      const payload = {
        ...form,
        academyId,
        academyName,
        type: academyType,
        programName: selectedProgramName,
        message: form.message?.trim() || undefined,
      };

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Submission failed");

      setStatusMsg("Enquiry submitted successfully!");
      setForm({ name: "", email: "", phone: "", batch_time: "", message: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setStatusMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isSuccess = statusMsg?.toLowerCase().includes("success") ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-3xl px-6 md:px-10 py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Back
          </button>
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Academy Enquiry</h1>
            <p className="text-slate-500 mt-1">Tell us a bit about you and your interest. We will get back soon.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-700">Academy ID</span>
                <input
                  name="academyId"
                  value={academyId}
                  readOnly
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">Academy Name</span>
                <input
                  name="academyName"
                  value={academyName}
                  readOnly
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">Academy Type</span>
                <input
                  name="type"
                  value={academyType}
                  readOnly
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">Program</span>
                <select
                  name="programName"
                  value={selectedProgramName}
                  onChange={(e) => setSelectedProgramName(e.target.value)}
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  required
                >
                  <option value="" disabled>
                    {programs.length ? "Select a program" : "No programs available"}
                  </option>
                  {programs.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* User fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-700">Name <span className="text-rose-600">*</span></span>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Your full name"
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">Email <span className="text-rose-600">*</span></span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">Phone <span className="text-rose-600">*</span></span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="e.g., +91 98765 43210"
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">Preferred Batch Time <span className="text-rose-600">*</span></span>
                <select
                  name="batch_time"
                  value={form.batch_time}
                  onChange={onChange}
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  required
                >
                  <option value="" disabled>Select a time</option>
                  <option value="6–8 AM">6–8 AM</option>
                  <option value="8–10 AM">8–10 AM</option>
                  <option value="4–6 PM">4–6 PM</option>
                  <option value="6–8 PM">6–8 PM</option>
                  <option value="8–10 PM">8–10 PM</option>
                </select>
              </label>
            </div>


            <div>
              <label className="block">
                <span className="text-sm text-slate-700">Message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={4}
                  placeholder="Any specific questions or notes..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-white font-medium shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Enquiry"}
              </button>
            </div>
          </form>

          {statusMsg && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-6 rounded-lg border p-3 text-sm ${
                isSuccess
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {statusMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnquiryPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <EnquiryContent />
    </Suspense>
  );
}