'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: string;
  location: string | null;
  created_at: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  
  // Formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('en_cours');
  const [location, setLocation] = useState('');
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
        fetchProjects();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
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
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId || '',
        },
        body: JSON.stringify({ title, description, imageUrl, status, location }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Projet publié avec succès !' });
        setTitle('');
        setDescription('');
        setImageUrl('');
        setStatus('en_cours');
        setLocation('');
        fetchProjects();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la publication.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': adminId || '',
        },
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setMessage({ type: 'success', text: 'Projet supprimé.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_cours': return '🔄 En cours';
      case 'termine': return '✅ Terminé';
      case 'planifie': return '📅 Planifié';
      default: return status;
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
            Gestion des Projets
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
            Ajouter un projet
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre du projet
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Lieu
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Lomé, Togo"
                  className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
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
              {isSubmitting ? 'Publication en cours...' : 'Publier le projet'}
            </button>
          </form>
        </div>

        {/* Liste des projets */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Projets publiés ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <p className="text-gray-600">Aucun projet publié.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <span className="text-sm">{getStatusLabel(project.status)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    {project.location && (
                      <p className="mt-1 text-sm text-gray-500">📍 {project.location}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(project.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(project.id)}
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
