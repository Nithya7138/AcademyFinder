"use client";
import { useEffect, useState } from "react";
import DbStatus from "../DbStatus";
import AcademyCard from "../AcademyCard";
import FilterDropdown from "../filterdropdown";
import RatingDropdown from "../ratingdropdown";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";


interface Academy {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  phone: string;
  address?: { city?: string };
  artprogram?: { art_name: string; level: string }[];
  sportsprogram?: { sport_name: string; level: string }[];
}

// Subtle, professional animation presets
const fadeContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.06 } },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function AcademySearchPage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minRating, setMinRating] = useState("0");
  const [nearby, setNearby] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [authed, setAuthed] = useState(false);

  // Check auth from server
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

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  // Check DB connection
  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setDbConnected(Boolean(data?.connected));
      } catch {
        setDbConnected(false);
      }
    };
    checkDb();
  }, []);

  // Fetch academies from DB
  useEffect(() => {
    const fetchAcademies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query, type: typeFilter, minRating, page: String(page), limit: String(limit) });
        if (nearby) {
          params.set("lat", String(nearby.lat));
          params.set("lng", String(nearby.lng));
          params.set("radiusKm", String(radiusKm));
        }
        const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Search failed: ${res.status} ${text}`);
        }
        const json = await res.json();
        // API returns { results, page, limit, total, totalPages }
        setAcademies(json.results ?? []);
        setTotalPages(json.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setAcademies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademies();
  }, [query, typeFilter, minRating, nearby, radiusKm, page]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [query, typeFilter, minRating, nearby, radiusKm]);

  // Always fetch live location on click (no caching)
  async function handleNearMeClick() {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    try {
      // Check permission state if supported
      if (typeof navigator.permissions?.query === "function") {
        try {
          const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          if (status.state === "denied") {
            alert("Location permission is blocked. Enable it in your browser settings for this site and try again.");
            return;
          }
        } catch {}
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setNearby(coords);
        },
        (err) => {
          let message = "Unable to get your location";
          if (err?.code === err.PERMISSION_DENIED) message = "Permission denied. Please allow location access for this site and try again.";
          else if (err?.code === err.POSITION_UNAVAILABLE) message = "Location unavailable. Please check your device/location settings and try again.";
          else if (err?.code === err.TIMEOUT) message = "Location request timed out. Try again or move to an area with better signal.";
          alert(message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } catch {
      alert("Unexpected error getting location");
    }
  }

  const skeletons = Array.from({ length: 8 });

  return (
    <div className="min-h-screen animated-bg">
      <div className="container mx-auto max-w-7xl px-6 md:px-10 py-8">
        <DbStatus connected={dbConnected} />

        {/* Header */}
        <motion.div
          variants={fadeContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8"
        >
          <motion.div variants={fadeItem} className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Find Academies</h1>
            <p className="text-slate-500 text-sm md:text-base">Search, filter and discover academies near you.</p>
          </motion.div>

          <motion.div variants={fadeItem}>
            <Link
              href={authed ? "/academy/new" : "/login?redirect=/academy/new"}
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition"
              title={authed ? "Add a new academy" : "Login required"}
            >
              + Add Academy
            </Link>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div
          variants={fadeContainer}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <motion.div
            variants={fadeItem}
            className="w-full rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm p-4 md:p-5 space-y-4"
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search academy, city or program..."
                  className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 pr-10 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <div className="flex flex-row items-center gap-3 flex-nowrap overflow-x-auto whitespace-nowrap">
              <div className="shrink-0">
                <FilterDropdown filter={typeFilter} setFilter={setTypeFilter} />
              </div>
              <div className="shrink-0">
                <RatingDropdown minRating={minRating} setMinRating={setMinRating} />
              </div>

              <div className="flex flex-row items-center gap-2 flex-nowrap shrink-0">
                <button
                  onClick={handleNearMeClick}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 h-12 text-slate-700 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition shrink-0"
                >
                  {nearby ? "By my location" : "Near me"}
                </button>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-28 h-12 rounded-lg border border-slate-300 bg-white px-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 shrink-0"
                  title="Radius (km)"
                  placeholder="km"
                />
                <button
                  onClick={() => {
                    setNearby(null);
                    try { localStorage.removeItem("nearbyLocation"); } catch {}
                  }}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 h-12 text-slate-700 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition shrink-0"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {skeletons.map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-40 w-full rounded-lg bg-slate-200 animate-pulse" />
                <div className="mt-4 h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
                <div className="mt-2 h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                <div className="mt-4 h-9 w-full bg-slate-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : academies.length === 0 ? (
          <p className="text-center text-slate-500">No academies found.</p>
        ) : (
          <motion.div
            variants={fadeContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {academies.map((academy) => (
              <motion.div key={academy.id ?? academy._id} variants={gridItem} className="h-full">
                <AcademyCard academy={academy} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination controls */}
        <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 disabled:opacity-50 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
          >
            Prev
          </button>
          <span className="text-sm text-slate-600 text-center w-full sm:w-auto">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 disabled:opacity-50 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}