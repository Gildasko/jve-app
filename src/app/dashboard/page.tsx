'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: string;
  full_name: string;
  country: string;
  city: string;
  status: string;
  role?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const sessionData = localStorage.getItem('supabase_session');
    
    if (!sessionData) {
      router.push('/auth/login');
      return;
    }

    const session = JSON.parse(sessionData);
    setUser(session.user);

    // Récupérer le profil de l'utilisateur
    fetchProfile(session.access_token, session.user.id);
  }, [router]);

  const fetchProfile = async (accessToken: string, userId: string) => {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase_session');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Mon Espace Membre
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-600 rounded-md hover:bg-red-50"
          >
            Se déconnecter
          </button>
        </div>

        {/* Carte d'information utilisateur */}
        <div className="p-8 mb-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Mes Informations
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="text-lg font-medium text-gray-900">
                {profile?.full_name || user?.user_metadata?.full_name || 'Non renseigné'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">E-mail</p>
              <p className="text-lg font-medium text-gray-900">
                {user?.email || 'Non renseigné'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pays</p>
              <p className="text-lg font-medium text-gray-900">
                {profile?.country || user?.user_metadata?.country || 'Non renseigné'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ville</p>
              <p className="text-lg font-medium text-gray-900">
                {profile?.city || user?.user_metadata?.city || 'Non renseigné'}
              </p>
            </div>
          </div>
        </div>

        {/* Statut de l'adhésion */}
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Statut de mon adhésion
          </h2>
          <div className="flex items-center gap-4">
            <span
              className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${
                profile?.status === 'member'
                  ? 'bg-green-100 text-green-800'
                  : profile?.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {profile?.status === 'member'
                ? '✓ Membre validé'
                : profile?.status === 'pending'
                ? '⏳ En attente de validation'
                : 'Statut inconnu'}
            </span>
          </div>
          {profile?.status === 'pending' && (
            <p className="mt-4 text-gray-600">
              Votre demande d&apos;adhésion est en cours d&apos;examen. Un administrateur
              la validera prochainement.
            </p>
          )}
          {(profile?.status === 'member' || profile?.role === 'admin') && (
            <div className="mt-6">
              <Link href="/dashboard/member-card">
                <button className="px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                  Voir ma carte de membre
                </button>
              </Link>
            </div>
          )}
          {profile?.role === 'admin' && (
            <div className="mt-4">
              <Link href="/admin">
                <button className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Accéder au panneau admin
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
