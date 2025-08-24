"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Form = {
  name: string;
  type: "Art" | "Sports" | "";
  phone: string;
};

export default function EditAcademyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [form, setForm] = useState<Form>({ name: "", type: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/academy/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setForm({ name: data.name ?? "", type: (data.type ?? "") as Form["type"], phone: data.phone ?? "" });
      } catch (e: any) {
        setError(e.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/academy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...form }),
      });
      if (res.status === 401) {
        router.replace(`/login?redirect=/academy/${encodeURIComponent(id)}/edit`);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      router.push(`/academy/${id}`);
    } catch (e: any) {
      setError(e.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-xl px-6 md:px-10 py-10">
        <h1 className="text-2xl font-semibold mb-4">Edit Academy</h1>
        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
          <label className="block">
            <span className="text-sm text-slate-700">Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Form["type"] })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3">
              <option value="">Select</option>
              <option value="Art">Art</option>
              <option value="Sports">Sports</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3" />
          </label>
          <div className="flex gap-2 pt-2">
            <button disabled={saving} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}