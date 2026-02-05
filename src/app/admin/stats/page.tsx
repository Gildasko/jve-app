'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  members: {
    total: number;
    pending: number;
    validated: number;
    rejected: number;
    byCountry: { country: string; count: number }[];
  };
  news: {
    total: number;
  };
  projects: {
    total: number;
    enCours: number;
    termine: number;
    planifie: number;
  };
  recentMembers: {
    id: string;
    full_name: string;
    country: string;
    created_at: string;
  }[];
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const sessionData = localStorage.getItem('supabase_session');
    
    if (!sessionData) {
      router.push('/auth/login');
      return;
    }

    const session = JSON.parse(sessionData);
    checkAdminRole(session.user?.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const checkAdminRole = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.profile?.role === 'admin') {
        setIsAdmin(true);
        fetchStats(userId);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'x-user-id': userId,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Statistiques
          </h1>
          <Link href="/admin">
            <button className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">
              ← Retour
            </button>
          </Link>
        </div>

        {stats && (
          <>
            {/* Cartes de statistiques principales */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Total membres */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Membres</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.members.total}</p>
                  </div>
                  <span className="text-4xl">👥</span>
                </div>
              </div>

              {/* Membres validés */}
              <div className="p-6 bg-green-50 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Membres Validés</p>
                    <p className="text-3xl font-bold text-green-700">{stats.members.validated}</p>
                  </div>
                  <span className="text-4xl">✅</span>
                </div>
              </div>

              {/* En attente */}
              <div className="p-6 bg-yellow-50 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">En Attente</p>
                    <p className="text-3xl font-bold text-yellow-700">{stats.members.pending}</p>
                  </div>
                  <span className="text-4xl">⏳</span>
                </div>
              </div>

              {/* Rejetés */}
              <div className="p-6 bg-red-50 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Rejetés</p>
                    <p className="text-3xl font-bold text-red-700">{stats.members.rejected}</p>
                  </div>
                  <span className="text-4xl">❌</span>
                </div>
              </div>
            </div>

            {/* Statistiques contenu */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
              {/* Actualités */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-bold text-gray-800">📰 Actualités</h3>
                <p className="text-4xl font-bold text-blue-600">{stats.news.total}</p>
                <p className="text-sm text-gray-500">articles publiés</p>
              </div>

              {/* Projets */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-bold text-gray-800">🌱 Projets</h3>
                <p className="text-4xl font-bold text-green-600">{stats.projects.total}</p>
                <p className="mb-4 text-sm text-gray-500">projets au total</p>
                <div className="flex gap-4 text-sm">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    🔄 En cours: {stats.projects.enCours}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    ✅ Terminés: {stats.projects.termine}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    📅 Planifiés: {stats.projects.planifie}
                  </span>
                </div>
              </div>
            </div>

            {/* Répartition par pays */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-bold text-gray-800">🌍 Répartition par pays</h3>
                {stats.members.byCountry.length === 0 ? (
                  <p className="text-gray-500">Aucune donnée</p>
                ) : (
                  <div className="space-y-3">
                    {stats.members.byCountry.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{item.country || 'Non renseigné'}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(item.count / stats.members.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dernières inscriptions */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-bold text-gray-800">🆕 Dernières inscriptions</h3>
                {stats.recentMembers.length === 0 ? (
                  <p className="text-gray-500">Aucune inscription récente</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{member.full_name}</p>
                          <p className="text-xs text-gray-500">{member.country}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(member.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
