import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-8 border-t bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
        <p className="mb-2 sm:mb-0">© {new Date().getFullYear()} FindAcademy. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <Link href="/academy" className="hover:text-indigo-600">Academies</Link>
          <Link href="/enquiry" className="hover:text-indigo-600">Enquiry</Link>
          <a href="/api/health" className="hover:text-indigo-600">API Status</a>
        </nav>
      </div>
    </footer>
  );
}