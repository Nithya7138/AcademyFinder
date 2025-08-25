"use client";
import { useState } from "react";

export default function EnquiryPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    batch_time: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof form) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Submission failed");
      setMessage("Enquiry submitted successfully!");
      setForm({ name: "", email: "", phone: "", interest: "", batch_time: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isSuccess = message?.toLowerCase().includes("success") ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-3xl px-6 md:px-10 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Enquiry Form</h1>
          <p className="text-slate-500 mt-1">Tell us a bit about you and your interest. We will get back soon.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
          <form onSubmit={onSubmit} className="space-y-6">

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
                <span className="text-sm text-slate-700">Interest <span className="text-rose-600">*</span></span>
                <input
                  name="interest"
                  value={form.interest}
                  onChange={onChange}
                  placeholder="e.g., Football, Painting"
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  required
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Preferred Batch Time <span className="text-rose-600">*</span></span>
                <input
                  name="batch_time"
                  value={form.batch_time}
                  onChange={onChange}
                  placeholder="e.g., 6–7 PM"
                  className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  required
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


          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-6 rounded-lg border p-3 text-sm ${
                isSuccess
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}