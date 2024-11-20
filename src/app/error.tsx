'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl shadow-lg p-6 space-y-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800">Oops! 😅</h2>
        <p className="text-center text-gray-600">
          Etwas ist schiefgelaufen. Versuche es bitte erneut!
        </p>
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="relative px-6 py-2 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full font-bold shadow-lg hover:from-pink-500 hover:to-rose-600 transition-all duration-200"
          >
            Nochmal versuchen
          </button>
        </div>
      </div>
    </div>
  );
}
