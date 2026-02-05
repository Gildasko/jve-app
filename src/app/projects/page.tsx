'use client';

import { useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: string;
  location: string | null;
  created_at: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'planifie': return 'Planifié';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours': return 'bg-yellow-500';
      case 'termine': return 'bg-green-500';
      case 'planifie': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container px-6 py-8 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-center text-gray-900">
          Nos Projets
        </h1>
        <p className="text-center text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container px-6 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center text-gray-900">
        Nos Projets
      </h1>

      {projects.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-600">Aucun projet pour le moment.</p>
          <p className="mt-2 text-gray-500">De nouveaux projets seront bientôt annoncés !</p>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col overflow-hidden bg-white rounded-lg shadow-lg md:flex-row"
            >
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="object-cover w-full h-64 md:w-1/3"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-green-400 to-green-600 md:w-1/3">
                  <span className="text-6xl">🌱</span>
                </div>
              )}
              <div className="flex flex-col justify-between p-6 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(project.status)}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                    {project.location && (
                      <span className="text-sm text-gray-500">📍 {project.location}</span>
                    )}
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    {project.title}
                  </h2>
                  <p className="text-gray-700">{project.description}</p>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  Publié le {new Date(project.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
