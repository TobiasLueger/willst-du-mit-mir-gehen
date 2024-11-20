import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl shadow-lg p-6 space-y-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800">404 💔</h2>
        <p className="text-center text-gray-600">
          Diese Seite wurde leider nicht gefunden.
        </p>
        <div className="flex justify-center">
          <Link
            href="/"
            className="relative px-6 py-2 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full font-bold shadow-lg hover:from-pink-500 hover:to-rose-600 transition-all duration-200"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
