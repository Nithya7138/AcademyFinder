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
    setForm((f) => ({ ...f, [name]: value }));
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
    } catch (err: any) {
      setMessage(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Enquiry Form</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Your Name"
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Phone"
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            name="interest"
            value={form.interest}
            onChange={onChange}
            placeholder="Interest (e.g., Football, Painting)"
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            name="batch_time"
            value={form.batch_time}
            onChange={onChange}
            placeholder="Preferred Batch Time (e.g., 6-7 PM)"
            className="w-full p-3 border rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 motion-reduce:transition-none motion-reduce:transform-none"
          >
            {submitting ? "Submitting..." : "Submit Enquiry"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}