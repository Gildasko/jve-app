'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

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
        fetchMessages(userId);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch('/api/contact', {
        headers: {
          'x-user-id': userId,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId || '',
        },
        body: JSON.stringify({ messageId, status }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status } : m))
        );
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const response = await fetch(`/api/contact?id=${messageId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': adminId || '',
        },
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">Non lu</span>;
      case 'read':
        return <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded">Lu</span>;
      case 'answered':
        return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">Répondu</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">{status}</span>;
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  const unreadMessages = messages.filter((m) => m.status === 'unread');
  const readMessages = messages.filter((m) => m.status === 'read');
  const answeredMessages = messages.filter((m) => m.status === 'answered');

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📬 Messages de Contact
          </h1>
          <Link href="/admin">
            <button className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">
              ← Retour
            </button>
          </Link>
        </div>

        {/* Modal de détail */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Détails du message</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${selectedMessage.email}`} className="font-medium text-blue-600 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="font-medium">{getStatusBadge(selectedMessage.status)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sujet</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="p-3 whitespace-pre-wrap bg-gray-50 rounded">{selectedMessage.message}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    ✉️ Répondre par email
                  </a>
                  {selectedMessage.status !== 'answered' && (
                    <button
                      onClick={() => {
                        updateStatus(selectedMessage.id, 'answered');
                        setSelectedMessage({ ...selectedMessage, status: 'answered' });
                      }}
                      className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      ✓ Marquer comme répondu
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    🗑️ Supprimer
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages non lus */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-red-700">
            📩 Non lus ({unreadMessages.length})
          </h2>
          {unreadMessages.length === 0 ? (
            <p className="text-gray-600">Aucun message non lu.</p>
          ) : (
            <div className="space-y-3">
              {unreadMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{msg.name}</p>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{msg.subject}</p>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(msg.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updateStatus(msg.id, 'read');
                        setSelectedMessage({ ...msg, status: 'read' });
                      }}
                      className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      Lire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages lus */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-yellow-700">
            📖 Lus ({readMessages.length})
          </h2>
          {readMessages.length === 0 ? (
            <p className="text-gray-600">Aucun message lu.</p>
          ) : (
            <div className="space-y-3">
              {readMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{msg.name} - {msg.subject}</p>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(msg)}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-white"
                  >
                    Détails
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages répondus */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-green-700">
            ✅ Répondus ({answeredMessages.length})
          </h2>
          {answeredMessages.length === 0 ? (
            <p className="text-gray-600">Aucun message répondu.</p>
          ) : (
            <div className="space-y-3">
              {answeredMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{msg.name} - {msg.subject}</p>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMessage(msg)}
                      className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-white"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
