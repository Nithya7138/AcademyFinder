// import dbConnect from "../../../lib/mongodb";
// import Academidata from "../../../models/Academy";
// import Link from "next/link";
// import mongoose from "mongoose";

// interface PageProps {
//   params: { id: string };
// }

// export default async function AcademyDetailPage({ params }: PageProps) {
//   await dbConnect();

//   const { id } = params;

//   // Support both custom id and Mongo _id (only use _id if valid ObjectId)
//   const conditions: any[] = [{ id }];
//   if (mongoose.Types.ObjectId.isValid(id)) {
//     conditions.push({ _id: new mongoose.Types.ObjectId(id) });
//   }

//   // Strongly type the expected document shape to avoid TS errors
//   type ProgramItem = {
//     sport_name?: string;
//     art_name?: string;
//     level?: string;
//   };

//   type Address = {
//     city?: string;
//   };

//   interface AcademyDoc {
//     _id: string | mongoose.Types.ObjectId;
//     id?: string;
//     name: string;
//     type?: string;
//     phone?: string;
//     address?: Address;
//     average_rating?: number;
//     sportsprogram?: ProgramItem[];
//     artprogram?: ProgramItem[];
//   }

//   const doc = (await Academidata.findOne({ $or: conditions }).lean()) as AcademyDoc | null;

//   if (!doc) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 md:p-10">
//         <div className="max-w-3xl mx-auto">
//           <Link href="/" className="text-indigo-600 hover:underline">← Back</Link>
//           <h1 className="text-2xl font-semibold mt-4">Academy not found</h1>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 md:p-10">
//       <div className="max-w-3xl mx-auto">
//         <Link href="/" className="text-indigo-600 hover:underline">← Back</Link>
//         <h1 className="text-3xl font-bold mt-4 text-gray-800">{doc.name}</h1>
//         <p className="text-gray-600">Type: {doc.type}</p>
//         <p className="text-gray-600">Phone: {doc.phone}</p>
//         {doc.address?.city && <p className="text-gray-600">City: {doc.address.city}</p>}
//         {typeof doc.average_rating === "number" && (
//           <p className="text-gray-600">Rating: {doc.average_rating} ⭐</p>
//         )}

//         {doc.sportsprogram?.length ? (
//           <div className="mt-6">
//             <h2 className="text-xl font-semibold text-green-600">Sports Programs</h2>
//             <ul className="list-disc list-inside text-gray-700">
//               {doc.sportsprogram.map((sp: ProgramItem, i: number) => (
//                 <li key={i}>{sp.sport_name} {sp.level ? `- ${sp.level}` : ""}</li>
//               ))}
//             </ul>
//           </div>
//         ) : null}

//         {doc.artprogram?.length ? (
//           <div className="mt-6">
//             <h2 className="text-xl font-semibold text-pink-600">Art Programs</h2>
//             <ul className="list-disc list-inside text-gray-700">
//               {doc.artprogram.map((ap: ProgramItem, i: number) => (
//                 <li key={i}>{ap.art_name} {ap.level ? `- ${ap.level}` : ""}</li>
//               ))}
//             </ul>
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }



import dbConnect from "../../../lib/mongodb";
import Academidata from "../../../models/Academy";
import Link from "next/link";
import mongoose from "mongoose";

interface PageProps {
  params: { id: string };
}

export default async function AcademyDetailPage({ params }: PageProps) {
  await dbConnect();

  const { id } = params;

  type IdCondition = { id: string } | { _id: mongoose.Types.ObjectId };
  const conditions: IdCondition[] = [{ id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(id) });
  }

  type ProgramItem = {
    sport_name?: string;
    art_name?: string;
    level?: string;
  };

  type Address = {
    city?: string;
  };

  interface AcademyDoc {
    _id: string | mongoose.Types.ObjectId;
    id?: string;
    name: string;
    type?: string;
    phone?: string;
    address?: Address;
    average_rating?: number;
    sportsprogram?: ProgramItem[];
    artprogram?: ProgramItem[];
  }

  const doc = (await Academidata.findOne({ $or: conditions }).lean()) as AcademyDoc | null;

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/AcademyCard" className="inline-block text-indigo-600 hover:text-indigo-800 transition">
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold mt-6 text-gray-800">Academy not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Back Link */}
        <Link href="/" className="inline-block text-indigo-600 hover:text-indigo-800 transition">
          ← Back
        </Link>

        {/* Academy Header */}
        <h1 className="text-4xl font-extrabold mt-4 text-gray-900">{doc.name}</h1>
        <p className="text-lg text-gray-600 mt-1">{doc.type ?? "Academy"}</p>

        {/* Info Section */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          {doc.phone && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📞 Phone</p>
              <p>{doc.phone}</p>
            </div>
          )}
          {doc.address?.city && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📍 City</p>
              <p>{doc.address.city}</p>
            </div>
          )}
          {typeof doc.average_rating === "number" && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">⭐ Rating</p>
              <p>{doc.average_rating} / 5</p>
            </div>
          )}
        </div>

        {/* Sports Programs */}
        {doc.sportsprogram?.length ? (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-green-600 mb-3">🏅 Sports Programs</h2>
            <ul className="space-y-2">
              {doc.sportsprogram.map((sp, i) => (
                <li
                  key={i}
                  className="bg-green-50 px-4 py-2 rounded-xl shadow-sm text-gray-800"
                >
                  {sp.sport_name} {sp.level ? `- ${sp.level}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Art Programs */}
        {doc.artprogram?.length ? (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-pink-600 mb-3">🎨 Art Programs</h2>
            <ul className="space-y-2">
              {doc.artprogram.map((ap, i) => (
                <li
                  key={i}
                  className="bg-pink-50 px-4 py-2 rounded-xl shadow-sm text-gray-800"
                >
                  {ap.art_name} {ap.level ? `- ${ap.level}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
