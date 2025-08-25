"use client";
// Purpose: Card component displaying brief academy info with actions (view/edit/delete)
import Link from "next/link";
import { useEffect, useState } from "react";

interface ArtProgram {
  art_name: string;
  level: string;
  fees_per_month?: number | string;
}
interface SportsProgram {
  sport_name: string;
  level: string;
  fees_per_month?: number | string;
}
interface Academy {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  phone: string;
  address?: { city?: string; state?: string; country?: string | null; zip?: string | number };
  artprogram?: ArtProgram[];
  sportsprogram?: SportsProgram[];
  rating?: number; // legacy or alternate field
  average_rating?: number; // matches schema
}

export default function AcademyCard({ academy }: { academy: Academy }) {
  const detailId = academy.id ?? academy._id;
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch("/api/auth/status", { cache: "no-store" });
        const j = await r.json();
        setAuthed(Boolean(j?.authed));
      } catch {}
    };
    run();
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
            City: <span className="text-slate-900">{academy.address?.city}</span>
          </p>
        )}
        {academy.address?.state && (
          <p>
            State: <span className="text-slate-900">{academy.address?.state}</span>
          </p>
        )}
        {academy.address?.country && (
          <span>
            <p>
              Country: <span className="text-slate-900">{academy.address.country ?? "null"}</span>
            </p>
            </span>
        )}

        {typeof (academy.average_rating ?? academy.rating) === "number" && (
          <p className="font-semibold">
            Rating: <span className="text-amber-600">{(academy.average_rating ?? academy.rating)} ⭐</span>
          </p>
        )}
      </div>

      {academy.sportsprogram?.length ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-green-700">Sports</h3>
          <ul className="mt-1 list-inside list-disc text-slate-700">
            {academy.sportsprogram.map((sp, i) => (
              <li key={i}>
                <span className="font-medium">
                  {sp.sport_name}
                </span>
                {(() => {
                  const n =
                    typeof sp.fees_per_month === "string"
                      ? Number(sp.fees_per_month)
                      : sp.fees_per_month;
                  return typeof n === "number" && Number.isFinite(n) ? (
                    <span className="ml-2 text-slate-600">- ₹{n}</span>
                  ) : null;
                })()}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {academy.artprogram?.length ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-pink-700">Arts</h3>
          <ul className="mt-1 list-inside list-disc text-slate-700">
            {academy.artprogram.map((ap, i) => (
              <li key={i}>
                <span className="font-medium">
                {ap.art_name}
                </span>
                {(() => {
                  const n =
                    typeof ap.fees_per_month === "string"
                      ? Number(ap.fees_per_month)
                      : ap.fees_per_month;
                  return typeof n === "number" && Number.isFinite(n) ? (
                    <span className="ml-2 text-slate-600">- ₹{n}</span>
                  ) : null;
                })()}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detailId ? (
        <div className="mt-auto pt-4 space-y-2">
          <Link
            href={`./academy/${detailId}`}
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
        </div>
      ) : null}
    </article>
  );
}