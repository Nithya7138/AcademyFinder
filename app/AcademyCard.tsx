"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ArtProgram { art_name: string; level: string; }
interface SportsProgram { sport_name: string; level: string; }
interface Academy {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  phone: string;
  address?: { city?: string };
  artprogram?: ArtProgram[];
  sportsprogram?: SportsProgram[];
  rating?: number;
}

export default function AcademyCard({ academy }: { academy: Academy }) {
  const detailId = academy.id ?? academy._id;
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    try {
      setAuthed(document.cookie.includes("auth=ok"));
    } catch {}
  }, []);

  async function handleDelete() {
    if (!detailId) return;
    const ok = confirm("Delete this academy? This action cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch(`/api/academy/${detailId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
      alert("Deleted successfully");
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    }
  }

  return (
    <article
      tabIndex={0}
      aria-label={`${academy.name} ${academy.type} academy card`}
      className="
        relative block h-full min-h-[320px] rounded-2xl border border-slate-200
        bg-white p-6 shadow-sm transition
        hover:-translate-y-0.5 hover:shadow-md
        outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
        flex flex-col
      "
    >
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        {academy.name}
      </h2>

      <div className="mt-2 space-y-1 text-slate-600">
        <p className="font-medium">
          Type: <span className="text-slate-900">{academy.type}</span>
        </p>
        <p>
          Phone: <span className="text-slate-900">{academy.phone}</span>
        </p>
        {academy.address?.city && (
          <p>
            City: <span className="text-slate-900">{academy.address.city}</span>
          </p>
        )}
        {academy.rating && (
          <p className="font-semibold">
            Rating: <span className="text-amber-600">{academy.rating} ⭐</span>
          </p>
        )}
      </div>

      {academy.sportsprogram?.length ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-green-700">Sports</h3>
          <ul className="mt-1 list-inside list-disc text-slate-700">
            {academy.sportsprogram.map((sp, i) => (
              <li key={i}>{sp.sport_name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {academy.artprogram?.length ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-pink-700">Arts</h3>
          <ul className="mt-1 list-inside list-disc text-slate-700">
            {academy.artprogram.map((ap, i) => (
              <li key={i}>{ap.art_name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {detailId ? (
        <div className="mt-auto pt-4 space-y-2">
          <Link
            href={`/academy/${detailId}`}
            className="
              inline-flex items-center justify-center gap-2 rounded-lg
              bg-indigo-600 px-5 py-2 text-white font-medium shadow-sm
              transition
              hover:bg-indigo-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
            "
          >
            View Details
          </Link>

          {authed && (
            <div className="flex gap-2">
              <Link
                href={`/academy/${detailId}/edit`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-red-700 hover:bg-red-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}