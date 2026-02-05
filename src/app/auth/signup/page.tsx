
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const country = formData.get('country') as string;
    const city = formData.get('city') as string;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName, country, city }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Quelque chose s\'est mal passé.');
      }

      router.push('/auth/confirm-email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Créer un compte
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nom & Prénom
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Pays
            </label>
            <select
              id="country"
              name="country"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="">Sélectionnez votre pays</option>
              {/* TODO: Remplir la liste des pays dynamiquement */}
              <option value="Togo">Togo</option>
              <option value="France">France</option>
              <option value="Benin">Bénin</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              Ville
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
