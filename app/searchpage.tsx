"use client";
// Purpose: Full search page with filters, fee range, sorting, pagination and results grid
import { useEffect, useState } from "react";
import DbStatus from "./components/DbStatus";
import AcademyCard from "./components/AcademyCard";
import FilterDropdown from "./components/filterdropdown";
import RatingDropdown from "./components/ratingdropdown";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { X, RotateCw } from "lucide-react";


interface Academy {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  phone: string;
  address?: { city?: string ,contry?:string,state?:string};
  artprogram?: { art_name: string; level: string;fees_per_month:number }[];
  sportsprogram?: { sport_name: string; level: string; fees_per_month:number }[];
  location?: { coordinates?: [number, number] }; // [lng, lat]
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
  const [sort, setSort] = useState<
    | "relevance"
    | "distance"
    | "newest"
    | "started_newest"
    | "started_oldest"
    | "price_low_high"
    | "price_high_low"
  >("relevance");
  const [authed, setAuthed] = useState(false);

  // New search fields
  const [stateQuery, setStateQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");

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
        const params = new URLSearchParams({ q: query, type: typeFilter, minRating, page: String(page), limit: String(limit), sort });
        if (minFee) params.set("minFee", minFee);
        if (maxFee) params.set("maxFee", maxFee);
        if (nearby) {
          params.set("lat", String(nearby.lat));
          params.set("lng", String(nearby.lng));
          params.set("radiusKm", String(radiusKm));
        }
        if (stateQuery) params.set("state", stateQuery);
        if (countryQuery) params.set("country", countryQuery);
        if (idQuery) params.set("id", idQuery);

        const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Search failed: ${res.status} ${text}`);
        }
        const json = await res.json();
        // API returns { results, page, limit, total, totalPages }
        let results: Academy[] = json.results ?? [];

        // Client-side distance sort fallback to ensure nearest-first display
        if (sort === "distance" && nearby && Array.isArray(results)) {
          const { lat, lng } = nearby;
          const toRad = (v: number) => (v * Math.PI) / 180;
          const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
          };

          const withDistances = results
            .map((doc) => {
              const coords = doc?.location?.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) return { doc, dKm: Number.POSITIVE_INFINITY };
              const dKm = haversineKm(lat, lng, coords[1], coords[0]);
              return { doc, dKm };
            })
            .filter((p) => (radiusKm > 0 ? p.dKm <= radiusKm : true))
            .sort((a, b) => a.dKm - b.dKm) // ascending distance
            .map((p) => p.doc);

          results = withDistances;
        }

        setAcademies(results);
        setTotalPages(json.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setAcademies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademies();
  }, [query, typeFilter, minRating, nearby, radiusKm, page, sort, stateQuery, countryQuery, idQuery, minFee, maxFee]);

  
  useEffect(() => {
    setPage(1);
  }, [query, typeFilter, minRating, nearby, radiusKm, sort]);

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
          setSort("distance"); // Ensure nearest first ordering
          // Clear restrictive filters so nearest results aren't hidden and enforce default radius
          setQuery("");
          setTypeFilter("all");
          setStateQuery("");
          setCountryQuery("");
          setIdQuery("");
          setMinFee("");
          setMaxFee("");
          setRadiusKm(10);
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

  function clearAllFilters() {
    setQuery("");
    setTypeFilter("all");
    setMinRating("0");
    setStateQuery("");
    setCountryQuery("");
    setIdQuery("");
    setMinFee("");
    setMaxFee("");
    setNearby(null);
    setRadiusKm(10);
    setSort("relevance");
    setPage(1);
  }

  const skeletons = Array.from({ length: 8 });

  return (
    <div className="min-h-screen animated-bg">
      <div className="container mx-auto max-w-7xl px-6 md:px-10 py-8">
        <DbStatus connected={dbConnected} />


        <motion.div
          variants={fadeContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8"
        >
          <motion.div variants={fadeItem} className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Academy Finder</h1>
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
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search academy, city or program..."
                    className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 pr-10 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-slate-700"
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 h-12 text-slate-700 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Clear all filters"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={stateQuery}
                    onChange={(e) => setStateQuery(e.target.value)}
                    placeholder="State (contains)"
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 pr-8 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {stateQuery && (
                    <button
                      onClick={() => setStateQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-slate-700"
                      title="Clear state"
                      aria-label="Clear state"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    placeholder="Country (contains)"
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 pr-8 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {countryQuery && (
                    <button
                      onClick={() => setCountryQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-slate-700"
                      title="Clear country"
                      aria-label="Clear country"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={idQuery}
                    onChange={(e) => setIdQuery(e.target.value)}
                    placeholder="Academy ID (exact)"
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 pr-8 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {idQuery && (
                    <button
                      onClick={() => setIdQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-slate-700"
                      title="Clear academy id"
                      aria-label="Clear academy id"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-3 flex-nowrap overflow-x-auto whitespace-nowrap">
              <div className="shrink-0 inline-flex items-center gap-1">
                <FilterDropdown filter={typeFilter} setFilter={setTypeFilter} />
                {typeFilter !== "all" && (
                  <button
                    onClick={() => setTypeFilter("all")}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white w-6 h-6 text-slate-600 hover:bg-slate-50"
                    title="Clear type"
                    aria-label="Clear type"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="shrink-0 inline-flex items-center gap-1">
                <RatingDropdown minRating={minRating} setMinRating={setMinRating} />
                {minRating !== "0" && (
                  <button
                    onClick={() => setMinRating("0")}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white w-6 h-6 text-slate-600 hover:bg-slate-50"
                    title="Clear rating"
                    aria-label="Clear rating"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-row items-center gap-2 flex-nowrap shrink-0">

                <div className="inline-flex items-center gap-1">
                  <select
                    value={minFee}
                    onChange={(e) => setMinFee(e.target.value)}
                    className="inline-flex h-12 rounded-lg border border-slate-300 bg-white pl-3 pr-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 shrink-0"
                    title="Min fee (per month)"
                  >
                    <option value="">Min fee</option>
                    <option value="500">₹500</option>
                    <option value="1000">₹1,000</option>
                    <option value="1500">₹1,500</option>
                    <option value="2000">₹2,000</option>
                    <option value="2500">₹2,500</option>
                    <option value="3000">₹3,000</option>
                    <option value="4000">₹4,000</option>
                    <option value="5000">₹5,000</option>
                  </select>
                  {minFee && (
                    <button
                      onClick={() => setMinFee("")}
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white w-6 h-6 text-slate-600 hover:bg-slate-50"
                      title="Clear min fee"
                      aria-label="Clear min fee"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="inline-flex items-center gap-1">
                  <select
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    className="inline-flex h-12 rounded-lg border border-slate-300 bg-white pl-3 pr-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 shrink-0"
                    title="Max fee (per month)"
                  >
                    <option value="">Max fee</option>
                    <option value="500">₹500</option>
                    <option value="1000">₹1,000</option>
                    <option value="1500">₹1,500</option>
                    <option value="2000">₹2,000</option>
                    <option value="2500">₹2,500</option>
                    <option value="3000">₹3,000</option>
                    <option value="4000">₹4,000</option>
                    <option value="5000">₹5,000</option>
                  </select>
                  {maxFee && (
                    <button
                      onClick={() => setMaxFee("")}
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white w-6 h-6 text-slate-600 hover:bg-slate-50"
                      title="Clear max fee"
                      aria-label="Clear max fee"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="inline-flex items-center gap-1">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="inline-flex h-12 rounded-lg border border-slate-300 bg-white px-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 shrink-0"
                    title="Sort by"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="distance">Distance (Nearest first)</option>
                    <option value="newest">Newly Added (Most recent)</option>
                    <option value="started_newest">Newly Started (Recent start date)</option>
                    <option value="started_oldest">Early Started (Oldest start date)</option>
                    <option value="price_low_high">Price: Low to High</option>
                    <option value="price_high_low">Price: High to Low</option>
                  </select>
                  {sort !== "relevance" && (
                    <button
                      onClick={() => setSort("relevance")}
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white w-6 h-6 text-slate-600 hover:bg-slate-50"
                      title="Clear sort"
                      aria-label="Clear sort"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleNearMeClick}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 h-12 text-slate-700 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition shrink-0"
                >
                  {nearby ? "By my location" : "Near me"}
                </button>

                <div className="relative inline-block">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-28 h-12 rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 shrink-0"
                    title="Radius (km)"
                    placeholder="km"
                  />
                  {nearby && (
                    <button
                      onClick={() => setRadiusKm(10)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      title="Reset radius to 10km"
                      aria-label="Reset radius"
                    >
                      <RotateCw size={16} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setNearby(null);
                    try { localStorage.removeItem("nearbyLocation"); } catch {}
                  }}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 h-12 text-slate-700 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition shrink-0"
                  title="Clear location"
                >
                  Clear location
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>


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