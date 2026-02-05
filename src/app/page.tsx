import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-800">
          Bienvenue sur le site de notre association
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Ensemble, agissons pour un avenir plus vert.
        </p>
        <div className="flex justify-center mt-8 space-x-4">
          <button className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
            Découvrez nos actions
          </button>
          <Link href="/auth/signup">
            <button className="px-6 py-3 text-lg font-semibold text-green-800 bg-white border-2 border-green-800 rounded-md hover:bg-green-50">
              Nous rejoindre
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
