'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: string;
  full_name: string;
  country: string;
  city: string;
  status: string;
}

export default function MemberCardPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionData = localStorage.getItem('supabase_session');
    
    if (!sessionData) {
      router.push('/auth/login');
      return;
    }

    const session = JSON.parse(sessionData);
    setUser(session.user);
    fetchProfile(session.user.id);
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);

        // Rediriger si le membre n'est pas validé
        if (data.profile?.status !== 'member') {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMemberNumber = (id: string) => {
    // Générer un numéro de membre basé sur l'ID
    return `JVE-${id.substring(0, 8).toUpperCase()}`;
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!profile || profile.status !== 'member') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Vous devez être un membre validé pour accéder à cette page.
          </p>
          <Link href="/dashboard" className="mt-4 text-green-600 hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-green-600 hover:underline">
            ← Retour au tableau de bord
          </Link>
        </div>

        <h1 className="mb-8 text-4xl font-bold text-center text-gray-900">
          Ma Carte de Membre
        </h1>

        {/* Carte de membre */}
        <div
          ref={cardRef}
          className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-2xl"
          style={{ aspectRatio: '1.586' }}
        >
          {/* Motif de fond */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="white" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative flex flex-col justify-between h-full p-8 text-white">
            {/* En-tête */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-wider">JVE</h2>
                <p className="text-sm text-green-200">
                  Jeunes Volontaires pour l'Environnement
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-200">Membre depuis</p>
                <p className="text-lg font-semibold">{getCurrentYear()}</p>
              </div>
            </div>

            {/* Informations du membre */}
            <div className="mt-8">
              <p className="mb-1 text-sm text-green-200">Nom du membre</p>
              <p className="text-2xl font-bold tracking-wide">
                {profile.full_name}
              </p>
            </div>

            {/* Pied de carte */}
            <div className="flex items-end justify-between mt-8">
              <div>
                <p className="mb-1 text-sm text-green-200">Localisation</p>
                <p className="text-lg font-medium">
                  {profile.city}, {profile.country}
                </p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-sm text-green-200">N° de membre</p>
                <p className="text-lg font-mono font-bold">
                  {generateMemberNumber(profile.id)}
                </p>
              </div>
            </div>
          </div>

          {/* Badge de statut */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-white rounded-full">
              ✓ Membre actif
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 mt-8 text-center bg-white rounded-lg shadow">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            Votre carte de membre JVE
          </h3>
          <p className="text-gray-600">
            Cette carte atteste de votre appartenance à l'association JVE. 
            Vous pouvez faire une capture d'écran pour la sauvegarder.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Numéro de membre : <strong>{generateMemberNumber(profile.id)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
