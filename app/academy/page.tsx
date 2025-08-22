"use client";
import { useEffect, useState } from "react";
import DbStatus from "../DbStatus";
import AcademyCard from "../AcademyCard";
import FilterDropdown from "../filterdropdown";
import RatingDropdown from "../ratingdropdown";
import Link from "next/link";
import { motion } from "framer-motion";

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

export default function AcademySearchPage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minRating, setMinRating] = useState("0");
  const [nearby, setNearby] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);

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

  // Handle geolocation with better errors and permissions
  async function handleNearMeClick() {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    try {
      // Check permission state if supported
      if (typeof navigator.permissions?.query === 'function') {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          if (status.state === 'denied') {
            alert('Location permission is blocked. Enable it in your browser settings for this site and try again.');
            return;
          }
        } catch {}
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => setNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          let message = 'Unable to get your location';
          if (err?.code === err.PERMISSION_DENIED) message = 'Permission denied. Please allow location access for this site and try again.';
          else if (err?.code === err.POSITION_UNAVAILABLE) message = 'Location unavailable. Please check your device/location settings and try again.';
          else if (err?.code === err.TIMEOUT) message = 'Location request timed out. Try again or move to an area with better signal.';
          alert(message);
        },
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
      );
    } catch {
      alert('Unexpected error getting location');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="container mx-auto max-w-7xl">
        <DbStatus connected={dbConnected} />

        {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 align-middle">🎓 Find Academies</h1>
          <Link
            href="/login?redirect=/academy/new"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 shadow-sm"
            title="Login required"
          >
            + Add Academy
          </Link>
        </div> */}
{/* !---------------------------------------------------------- */}
     
     
 <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 text-center sm:text-left"
    >
      {/* Animated Title */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
        className="text-4xl font-extrabold text-gray-900 flex items-center gap-2"
      >
        <span className="animate-bounce">🎓</span>
        Find Academies
      </motion.h1>

      {/* Animated Button */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link
          href="/login?redirect=/academy/new"
          className="group relative inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-xl 
          bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
          text-white font-semibold shadow-lg hover:scale-105 hover:shadow-2xl 
          transition-all duration-300 ease-out"
          title="Login required"
        >
          <span className="absolute inset-0 w-full h-full rounded-xl bg-indigo-600 opacity-0 group-hover:opacity-20 transition duration-300" />
          <span className="relative z-10">+ Add Academy</span>
        </Link>
      </motion.div>
    </motion.div>


 {/* ---------------     */}
        <div className="max-w-3xl mx-auto mb-6 space-y-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search academy, city or program..."
            className="w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-blue-500 text-blue-500"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3">
            <FilterDropdown filter={typeFilter} setFilter={setTypeFilter} />
            <RatingDropdown minRating={minRating} setMinRating={setMinRating} />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:flex-wrap w-full">
              <button
                onClick={handleNearMeClick}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-indigo-500 text-indigo-600 h-12 transition-all duration-200 hover:bg-indigo-50 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 motion-reduce:transition-none motion-reduce:transform-none"
              >
                {nearby ? "By my location" : "Near me"}
              </button>
              <input 
                type="number"
                min={1}
                max={200}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full sm:w-24 px-3 py-2 rounded-lg border border-blue-500 h-12 text-blue-600 focus:border-blue-500"
                title="Radius (km)"
                placeholder="km"
              />
              <button
                onClick={() => setNearby(null)}
                className="w-full sm:w-auto px-3 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-gray-50 h-12"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 animate-pulse">Loading...</p>
        ) : academies.length === 0 ? (
          <p className="text-center text-gray-500">No academies found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {academies.map((academy) => (
              <AcademyCard key={academy.id ?? academy._id} academy={academy} />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border disabled:opacity-50 transition-all duration-200 hover:shadow active:scale-95"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 text-center w-full sm:w-auto">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border disabled:opacity-50 transition-all duration-200 hover:shadow active:scale-95 border-blue-500 text-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}