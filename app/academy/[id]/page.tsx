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
    fee_per_month?: number | "";
    fees_per_month?: number | ""; // align with model field, keep both for compatibility
  };

  type Address = {
    area?: string;
    city?: string;
    state?: string;
    country?: string | null;
    zip?: string | number;
    link?: string; 
  };

  interface AcademyDoc {
    _id: string | mongoose.Types.ObjectId;
    id?: string;
    name: string;
    type?: string;
    phone?: string;
    wabsite?: string;
    academy_startat?: Date; // matches schema
    address?: Address;
    average_rating?: number;
    sportsprogram?: ProgramItem[];
    artprogram?: ProgramItem[];
    location?: { coordinates?: [number, number] }; // [lng, lat]
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
        <Link href="/academy" className="inline-block text-indigo-600 hover:text-indigo-800 transition">
          ← Back
        </Link>

        <h1 className="text-4xl font-extrabold mt-4 text-gray-900">{doc.name}</h1>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          {doc.type && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">🎓Type</p>
              <p>{doc.type}</p>
            </div>
                )}

          {doc.phone && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📞 Phone</p>
              <p>{doc.phone}</p>
            </div>
          )}
          {doc.wabsite && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">🌐 Website</p>
              <p><a href={`https://${doc.wabsite}`} target="_blank" rel="noopener noreferrer">{doc.wabsite}</a></p>
            </div>)}
            
          {doc.academy_startat && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📅 Date</p>
              <p>{new Date(doc.academy_startat).toLocaleDateString()}</p>
            </div>)}  
          
           {doc.address?.area &&(
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📍area</p>
              <p>{doc.address.area}</p>
            </div>)}   

            
          {doc.address?.city && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📍 City</p>
              <p>{doc.address.city}</p>
            </div>
          )}
          {doc.address?.state && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📍 State</p>
              <p>{doc.address.state}</p>
            </div>
          )}
          {doc.address?.country !== undefined && doc.address?.country !== null ? (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📍 Country</p>
              <p>{doc.address.country}</p>
            </div>
          ) : null}
          {doc.address?.zip && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📍 Zip</p>
              <p>{doc.address.zip}</p>
            </div>
          )}
          {(doc.address?.link || (Array.isArray(doc.location?.coordinates) && doc.location?.coordinates?.length === 2)) && (
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="font-semibold text-gray-800">📍 Location</p>
              <p>
                {doc.address?.link ? (
                  <a href={doc.address.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                    Open Map
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(String(doc.location?.coordinates?.[1]))},${encodeURIComponent(String(doc.location?.coordinates?.[0]))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Open Map
                  </a>
                )}
              </p>
            </div>)}

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
                  <div className="flex items-center justify-between">
                    <span>{sp.sport_name} {sp.level ? `- ${sp.level}` : ""}</span>
                    {typeof sp.fee_per_month === "number" && sp.fee_per_month > 0 ? (
                      <span className="text-sm text-gray-600">Fee: ₹{sp.fee_per_month}</span>
                    ) : null}
                    {typeof sp.fees_per_month === "number" && sp.fees_per_month > 0 ? (
                      <span className="text-sm text-gray-600">Fee: ₹{sp.fees_per_month}</span>
                    ) : null}
                  </div>
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
                  <div className="flex items-center justify-between">
                    <span>{ap.art_name} {ap.level ? `- ${ap.level}` : ""}</span>
                    {typeof ap.fee_per_month === "number" && ap.fee_per_month > 0 ? (
                      <span className="text-sm text-gray-600">Fee: ₹{ap.fee_per_month}</span>
                    ) : null}
                    {typeof ap.fees_per_month === "number" && ap.fees_per_month > 0 ? (
                      <span className="text-sm text-gray-600">Fee: ₹{ap.fees_per_month}</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
