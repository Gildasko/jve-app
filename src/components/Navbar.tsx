'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UserProfile {
  role?: string;
  status?: string;
}

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const sessionData = localStorage.getItem('supabase_session');
    
    if (sessionData) {
      setIsLoggedIn(true);
      const session = JSON.parse(sessionData);
      
      // Récupérer le profil pour connaître le rôle
      try {
        const response = await fetch(`/api/profile?userId=${session.user?.id}`);
        const data = await response.json();
        if (response.ok) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase_session');
    setIsLoggedIn(false);
    setProfile(null);
    window.location.href = '/';
  };

  // Affichage par défaut côté serveur (non connecté)
  const renderAuthButtons = () => {
    if (!mounted || isLoading) {
      // Rendu côté serveur ou chargement - afficher un placeholder
      return (
        <div className="flex items-center space-x-4">
          <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      );
    }

    if (isLoggedIn) {
      return (
        <>
          {/* Lien carte membre pour les membres validés ou admins */}
          {(profile?.status === 'member' || profile?.role === 'admin') && (
            <Link href="/dashboard/member-card">
              <span className="text-green-600 hover:text-green-700 font-medium">
                🎫 Ma Carte
              </span>
            </Link>
          )}
          
          {/* Lien admin pour les administrateurs */}
          {profile?.role === 'admin' && (
            <Link href="/admin">
              <span className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Admin
              </span>
            </Link>
          )}
          
          <Link href="/dashboard">
            <span className="px-4 py-2 text-sm font-semibold text-green-800 bg-white border border-green-800 rounded-md hover:bg-green-50">
              Mon Espace
            </span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-600 rounded-md hover:bg-red-50"
          >
            Déconnexion
          </button>
        </>
      );
    }

    return (
      <>
        <Link href="/auth/login">
          <span className="px-4 py-2 text-sm font-semibold text-green-800 bg-white border border-green-800 rounded-md hover:bg-green-50">
            Connexion
          </span>
        </Link>
        <Link href="/auth/signup">
          <span className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
            Inscription
          </span>
        </Link>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container px-6 py-4 mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-800">
            <Link href="/">JVE</Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/">
              <span className="text-gray-700 hover:text-green-600">Accueil</span>
            </Link>
            <Link href="/news">
              <span className="text-gray-700 hover:text-green-600">Actualités</span>
            </Link>
            <Link href="/projects">
              <span className="text-gray-700 hover:text-green-600">Projets</span>
            </Link>
            <Link href="/volunteer">
              <span className="text-gray-700 hover:text-green-600">Bénévolat</span>
            </Link>
            <Link href="/contact">
              <span className="text-gray-700 hover:text-green-600">Contact</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
