'use client';

import { useState, useEffect } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { getUserInfo } from '@/utils/userInfo';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');

const FloatingHearts = () => {
  return (
    <div className="heart-bg">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: `hsl(${350 + Math.random() * 20}, 100%, ${70 + Math.random() * 20}%)`,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [gifs, setGifs] = useState<{
    main: string;
    happy: string;
    sad: string;
  }>({
    main: '',
    happy: '',
    sad: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch GIFs
        const [mainGif, happyGif, sadGif] = await Promise.all([
          gf.search('dog hello omg hi dogs puppy waiting wait corgi', { limit: 1 }),
          gf.search('love cat hug cutie hugs trend yeu thuong', { limit: 1 }),
          gf.search('sad cat heart cartoon', { limit: 1 })
        ]);

        setGifs({
          main: mainGif.data[0]?.images.original.url || '',
          happy: happyGif.data[0]?.images.original.url || '',
          sad: sadGif.data[0]?.images.original.url || '',
        });

        // Get and log user info
        await getUserInfo();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleResponse = (answer: 'yes' | 'no') => {
    setResponse(answer);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
        <div className="text-2xl text-pink-600 floating">
         Warte kurz...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts />
      <div className="card-container max-w-md w-full rounded-2xl shadow-lg p-6 space-y-6 relative z-10">
        {!response ? (
          <>
            <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-inner">
              <img
                src={gifs.main}
                alt="Cute Valentine Animation"
                className="w-full h-full object-cover floating"
              />
            </div>
            <h1 className="text-3xl md:text-4xl text-center text-black floating mb-8 font-bold">
              Willst du mit mir gehen? 💕
            </h1>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => handleResponse('yes')}
                className="relative"
              >
                <span className="absolute top-0 left-0 mt-1 ml-1 h-full w-full rounded bg-black"></span>
                <span className="fold-bold relative inline-block h-full w-full rounded border-2 border-black bg-white px-3 py-1 text-base font-bold text-black transition duration-100 hover:bg-yellow-400 hover:text-gray-900">Ja</span>
              </button>
              <button
                onClick={() => handleResponse('no')}
                className="relative"
              >
                <span className="absolute top-0 left-0 mt-1 ml-1 h-full w-full rounded bg-gray-700"></span>
                <span className="fold-bold relative inline-block h-full w-full rounded border-2 border-black bg-black px-3 py-1 text-base font-bold text-white transition duration-100 hover:bg-gray-900 hover:text-yellow-500">Nein</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            {response === 'yes' ? (
              <>
                <h2 className="text-3xl md:text-4xl text-black floating font-bold">Juhu! 🎉</h2>
                <p className="text-xl text-gray-700">
                  Du machst mich zum glücklichsten Menschen! ❤️
                </p>
                <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-inner">
                  <img
                    src={gifs.happy}
                    alt="Happy Response"
                    className="w-full h-full object-cover floating"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl text-gray-800 floating font-bold">Oh nein... 💔</h2>
                <p className="text-xl text-gray-700">
                  Vielleicht beim nächsten Mal... 🥺
                </p>
                <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-inner">
                  <img
                    src={gifs.sad}
                    alt="Sad Response"
                    className="w-full h-full object-cover floating"
                  />
                </div>
              </>
            )}
            <button
              onClick={() => setResponse(null)}
              className="relative px-8 py-3 bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 text-white rounded-full font-bold shadow-lg button-hover text-lg overflow-hidden group mt-8"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Nochmal versuchen <span className="transform transition-transform group-hover:scale-125">💫</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
