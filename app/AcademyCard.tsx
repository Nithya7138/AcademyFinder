// // app/AcademyCard.tsx
// "use client";

// interface ArtProgram {
//   art_name: string;
//   level: string;
// }

// interface SportsProgram {
//   sport_name: string;
//   level: string;
// }

// interface Academy {
//   _id?: string;
//   id?: string;
//   name: string;
//   type: string;
//   phone: string;
//   address?: { city?: string };
//   artprogram?: ArtProgram[];
//   sportsprogram?: SportsProgram[];
//   rating?: number;
// }

// import Link from "next/link";

// export default function AcademyCard({ academy }: { academy: Academy }) {
//   const detailId = academy.id ?? academy._id; // prefer custom id, fallback to Mongo _id
//   return (
//     <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
//       <h2 className="text-xl font-semibold text-indigo-600">{academy.name}</h2>
//       <p className="text-gray-600">Type: {academy.type}</p>
//       <p className="text-gray-600">Phone: {academy.phone}</p>
//       {academy.address?.city && <p className="text-gray-600">City: {academy.address.city}</p>}
//       {academy.rating && <p className="text-gray-600">Rating: {academy.rating} ⭐</p>}

//       {academy.sportsprogram?.length ? (
//         <div className="mt-4">
//           <h3 className="text-lg font-semibold text-green-600">Sports</h3>
//           <ul className="list-disc list-inside text-gray-700">
//             {academy.sportsprogram.map((sp, i) => (
//               <li key={i}>{sp.sport_name}</li>
//             ))}
//           </ul>
//         </div>
//       ) : null}

//       {academy.artprogram?.length ? (
//         <div className="mt-4">
//           <h3 className="text-lg font-semibold text-pink-600">Arts</h3>
//           <ul className="list-disc list-inside text-gray-700">
//             {academy.artprogram.map((ap, i) => (
//               <li key={i}>{ap.art_name}</li>
//             ))}
//           </ul>
//         </div>
//       ) : null}

//       {detailId ? (
//         <div className="mt-6">
//           <Link
//             href={`/academy/${detailId}`}
//             className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
//           >
//             View
//           </Link>
//         </div>
//       ) : null}
//     </div>
//   );
// }


// app/AcademyCard.tsx
"use client";
import Link from "next/link";

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

  return (
    <article
      tabIndex={0}
      aria-label={`${academy.name} ${academy.type} academy card`}
      className="
        relative block rounded-2xl border border-slate-200/60
        bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500
        p-6 shadow-lg transition
        hover:-translate-y-1 hover:shadow-2xl
        focus-visible:-translate-y-1 focus-visible:shadow-2xl
        outline-none
        focus-visible:ring-4 focus-visible:ring-white/50
        backdrop-blur-md
      "
    >
      {/* Card Header */}
      <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
        {academy.name}
      </h2>

      {/* Info */}
      <div className="mt-2 space-y-1 text-white/90">
        <p className="font-medium">Type: <span className="text-yellow-200">{academy.type}</span></p>
        <p>Phone: <span className="text-green-200">{academy.phone}</span></p>
        {academy.address?.city && (
          <p>City: <span className="text-pink-200">{academy.address.city}</span></p>
        )}
        {academy.rating && (
          <p className="font-semibold">Rating: <span className="text-amber-300">{academy.rating} ⭐</span></p>
        )}
      </div>

      {/* Sports Programs */}
      {academy.sportsprogram?.length ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-green-200">Sports</h3>
          <ul className="mt-1 list-inside list-disc text-white/90">
            {academy.sportsprogram.map((sp, i) => (
              <li key={i}>{sp.sport_name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Arts Programs */}
      {academy.artprogram?.length ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-pink-200">Arts</h3>
          <ul className="mt-1 list-inside list-disc text-white/90">
            {academy.artprogram.map((ap, i) => (
              <li key={i}>{ap.art_name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Button */}
      {detailId ? (
        <div className="mt-6">
          <Link
            href={`/academy/${detailId}`}
            className="
              inline-flex items-center justify-center gap-2 rounded-lg
              bg-white/20 px-5 py-2 text-white font-semibold shadow-md
              transition backdrop-blur-sm
              hover:bg-white/30 hover:scale-105
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50
            "
          >
            View Details
          </Link>
        </div>
      ) : null}
    </article>
  );
}
