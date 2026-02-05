'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Member {
  id: string;
  full_name: string;
  country: string;
  city: string;
  status: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const sessionData = localStorage.getItem('supabase_session');
    
    if (!sessionData) {
      router.push('/auth/login');
      return;
    }

    // Vérifier si l'utilisateur est admin
    checkAdminRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const checkAdminRole = async () => {
    try {
      const sessionData = localStorage.getItem('supabase_session');
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      const userId = session.user?.id;

      if (!userId) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/profile?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.profile?.role === 'admin') {
        setIsAdmin(true);
        fetchMembers();
      } else {
        // Pas admin, rediriger vers le dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      router.push('/dashboard');
    }
  };

  const fetchMembers = async () => {
    try {
      const sessionData = localStorage.getItem('supabase_session');
      const session = sessionData ? JSON.parse(sessionData) : null;
      const adminId = session?.user?.id;

      const response = await fetch('/api/admin/members', {
        headers: {
          'x-user-id': adminId || '',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberStatus = async (memberId: string, newStatus: string) => {
    setUpdatingId(memberId);
    try {
      const sessionData = localStorage.getItem('supabase_session');
      const session = sessionData ? JSON.parse(sessionData) : null;
      const adminId = session?.user?.id;

      const response = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId || '',
        },
        body: JSON.stringify({ userId: memberId, status: newStatus }),
      });

      if (response.ok) {
        // Mettre à jour localement
        setMembers((prev) =>
          prev.map((member) =>
            member.id === memberId ? { ...member, status: newStatus } : member
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  const pendingMembers = members.filter((m) => m.status === 'pending');
  const approvedMembers = members.filter((m) => m.status === 'member');
  const rejectedMembers = members.filter((m) => m.status === 'rejected');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Vérification des permissions...</p>
      </div>
    );
  }

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Panneau d&apos;Administration
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            ← Retour au dashboard
          </button>
        </div>

        {/* Liens rapides de gestion */}
        <div className="grid grid-cols-1 gap-4 mb-12 md:grid-cols-5">
          <Link href="/admin/news">
            <div className="p-6 text-center bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-3xl">📰</span>
              <h3 className="mt-2 font-semibold text-gray-900">Gérer les Actualités</h3>
              <p className="text-sm text-gray-500">Publier et gérer les news</p>
            </div>
          </Link>
          <Link href="/admin/projects">
            <div className="p-6 text-center bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-3xl">🌱</span>
              <h3 className="mt-2 font-semibold text-gray-900">Gérer les Projets</h3>
              <p className="text-sm text-gray-500">Ajouter et modifier les projets</p>
            </div>
          </Link>
          <Link href="/admin/volunteers">
            <div className="p-6 text-center bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-3xl">🤝</span>
              <h3 className="mt-2 font-semibold text-gray-900">Gérer les Bénévoles</h3>
              <p className="text-sm text-gray-500">Candidatures de bénévoles</p>
            </div>
          </Link>
          <Link href="/admin/messages">
            <div className="p-6 text-center bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-3xl">📬</span>
              <h3 className="mt-2 font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500">Messages de contact</p>
            </div>
          </Link>
          <Link href="/admin/stats">
            <div className="p-6 text-center bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-3xl">📊</span>
              <h3 className="mt-2 font-semibold text-gray-900">Statistiques</h3>
              <p className="text-sm text-gray-500">Voir les statistiques</p>
            </div>
          </Link>
        </div>

        {/* Demandes en attente */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-yellow-700">
            ⏳ Demandes en attente ({pendingMembers.length})
          </h2>
          {pendingMembers.length === 0 ? (
            <p className="text-gray-600">Aucune demande en attente.</p>
          ) : (
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Pays
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <button
                          onClick={() => updateMemberStatus(member.id, 'member')}
                          disabled={updatingId === member.id}
                          className="px-3 py-1 mr-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓ Valider
                        </button>
                        <button
                          onClick={() => updateMemberStatus(member.id, 'rejected')}
                          disabled={updatingId === member.id}
                          className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          ✗ Refuser
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Membres validés */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-green-700">
            ✓ Membres validés ({approvedMembers.length})
          </h2>
          {approvedMembers.length === 0 ? (
            <p className="text-gray-600">Aucun membre validé.</p>
          ) : (
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Pays
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <button
                          onClick={() => updateMemberStatus(member.id, 'pending')}
                          disabled={updatingId === member.id}
                          className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                          Révoquer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Demandes refusées */}
        {rejectedMembers.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-red-700">
              ✗ Demandes refusées ({rejectedMembers.length})
            </h2>
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Pays
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rejectedMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <button
                          onClick={() => updateMemberStatus(member.id, 'member')}
                          disabled={updatingId === member.id}
                          className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Valider finalement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
