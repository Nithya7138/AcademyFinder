"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Academy {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  phone: string;
  artprogram?: { art_name: string; level: string }[];
  sportsprogram?: { sport_name: string; level: string }[];
}

export default function AcademyDetails() {
  const { id } = useParams();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/academy/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Academy = await res.json();
        setAcademy(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <p className="p-10 text-center">Loading details...</p>;
  if (!academy) return <p className="p-10 text-center">Academy not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">
          {academy.name}
        </h1>
        <p className="text-gray-700">
          <strong>Type:</strong> {academy.type}
        </p>
        <p className="text-gray-700">
          <strong>Phone:</strong> {academy.phone}
        </p>

        {academy.sportsprogram?.length ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-green-600">Sports</h2>
            <ul className="list-disc list-inside text-gray-700">
              {academy.sportsprogram.map((sp, i) => (
                <li key={i}>
                  {sp.sport_name} – <span className="text-sm">{sp.level}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {academy.artprogram?.length ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-pink-600">Arts</h2>
            <ul className="list-disc list-inside text-gray-700">
              {academy.artprogram.map((ap, i) => (
                <li key={i}>
                  {ap.art_name} – <span className="text-sm">{ap.level}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
