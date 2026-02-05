'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  motivation: string;
  availability: string | null;
  skills: string | null;
  status: string;
  created_at: string;
}

export default function AdminVolunteersPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('supabase_session');
    
    if (!sessionData) {
      router.push('/auth/login');
      return;
    }

    const session = JSON.parse(sessionData);
    setAdminId(session.user?.id);
    checkAdminRole(session.user?.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const checkAdminRole = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.profile?.role === 'admin') {
        setIsAdmin(true);
        fetchVolunteers(userId);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    }
  };

  const fetchVolunteers = async (userId: string) => {
    try {
      const response = await fetch('/api/volunteers', {
        headers: {
          'x-user-id': userId,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setVolunteers(data.volunteers || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (volunteerId: string, status: string) => {
    setUpdatingId(volunteerId);
    try {
      const response = await fetch('/api/volunteers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId || '',
        },
        body: JSON.stringify({ volunteerId, status }),
      });

      if (response.ok) {
        setVolunteers((prev) =>
          prev.map((v) => (v.id === volunteerId ? { ...v, status } : v))
        );
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getAvailabilityLabel = (availability: string | null) => {
    switch (availability) {
      case 'temps_plein': return 'Temps plein';
      case 'temps_partiel': return 'Temps partiel';
      case 'weekends': return 'Weekends';
      case 'occasionnel': return 'Occasionnel';
      default: return availability || 'Non précisé';
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  const pendingVolunteers = volunteers.filter((v) => v.status === 'pending');
  const acceptedVolunteers = volunteers.filter((v) => v.status === 'accepted');
  const rejectedVolunteers = volunteers.filter((v) => v.status === 'rejected');

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🤝 Gestion des Bénévoles
          </h1>
          <Link href="/admin">
            <button className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">
              ← Retour
            </button>
          </Link>
        </div>

        {/* Modal de détail */}
        {selectedVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Détails de la candidature</h2>
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium">{selectedVolunteer.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedVolunteer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{selectedVolunteer.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Disponibilité</p>
                    <p className="font-medium">{getAvailabilityLabel(selectedVolunteer.availability)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pays</p>
                    <p className="font-medium">{selectedVolunteer.country || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ville</p>
                    <p className="font-medium">{selectedVolunteer.city || 'Non renseigné'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Compétences</p>
                  <p className="font-medium">{selectedVolunteer.skills || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Motivation</p>
                  <p className="p-3 bg-gray-50 rounded">{selectedVolunteer.motivation}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  {selectedVolunteer.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateStatus(selectedVolunteer.id, 'accepted');
                          setSelectedVolunteer(null);
                        }}
                        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                      >
                        ✓ Accepter
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(selectedVolunteer.id, 'rejected');
                          setSelectedVolunteer(null);
                        }}
                        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                      >
                        ✕ Refuser
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedVolunteer(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Candidatures en attente */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-yellow-700">
            ⏳ En attente ({pendingVolunteers.length})
          </h2>
          {pendingVolunteers.length === 0 ? (
            <p className="text-gray-600">Aucune candidature en attente.</p>
          ) : (
            <div className="space-y-3">
              {pendingVolunteers.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{v.full_name}</p>
                    <p className="text-sm text-gray-500">{v.email} • {v.country || 'Pays non précisé'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(v.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVolunteer(v)}
                      className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => updateStatus(v.id, 'accepted')}
                      disabled={updatingId === v.id}
                      className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 disabled:opacity-50"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => updateStatus(v.id, 'rejected')}
                      disabled={updatingId === v.id}
                      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bénévoles acceptés */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-green-700">
            ✅ Acceptés ({acceptedVolunteers.length})
          </h2>
          {acceptedVolunteers.length === 0 ? (
            <p className="text-gray-600">Aucun bénévole accepté.</p>
          ) : (
            <div className="space-y-3">
              {acceptedVolunteers.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{v.full_name}</p>
                    <p className="text-sm text-gray-500">{v.email} • {v.country}</p>
                  </div>
                  <button
                    onClick={() => setSelectedVolunteer(v)}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-white"
                  >
                    Détails
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidatures refusées */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-red-700">
            ❌ Refusées ({rejectedVolunteers.length})
          </h2>
          {rejectedVolunteers.length === 0 ? (
            <p className="text-gray-600">Aucune candidature refusée.</p>
          ) : (
            <div className="space-y-3">
              {rejectedVolunteers.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{v.full_name}</p>
                    <p className="text-sm text-gray-500">{v.email}</p>
                  </div>
                  <button
                    onClick={() => updateStatus(v.id, 'pending')}
                    disabled={updatingId === v.id}
                    className="px-3 py-1 text-sm text-yellow-600 border border-yellow-600 rounded hover:bg-yellow-50 disabled:opacity-50"
                  >
                    Reconsidérer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
