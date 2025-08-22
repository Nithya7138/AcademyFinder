import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">FindAcademy</h1>
        <p className="text-gray-600 text-lg mb-8">Welcome! Discover the best academies near you.</p>
        <Link
          href="/academy"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow transition-all duration-200 ease-out hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 motion-reduce:transition-none motion-reduce:transform-none"
        >
          Find Academy
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
