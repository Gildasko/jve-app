'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  published: boolean;
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  
  // Formulaire
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        fetchNews();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();

      if (response.ok) {
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId || '',
        },
        body: JSON.stringify({ title, content, imageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Actualité publiée avec succès !' });
        setTitle('');
        setContent('');
        setImageUrl('');
        fetchNews();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la publication.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (newsId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return;

    try {
      const response = await fetch(`/api/news?id=${newsId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': adminId || '',
        },
      });

      if (response.ok) {
        setNews((prev) => prev.filter((n) => n.id !== newsId));
        setMessage({ type: 'success', text: 'Actualité supprimée.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Actualités
          </h1>
          <Link href="/admin">
            <button className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">
              ← Retour
            </button>
          </Link>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Formulaire de publication */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Publier une actualité
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Contenu
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                URL de l&apos;image (optionnel)
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Publication en cours...' : 'Publier'}
            </button>
          </form>
        </div>

        {/* Liste des actualités */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Actualités publiées ({news.length})
          </h2>
          {news.length === 0 ? (
            <p className="text-gray-600">Aucune actualité publiée.</p>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.content}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 ml-4 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    Supprimer
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
