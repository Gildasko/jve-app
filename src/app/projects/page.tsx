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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-6 py-16 mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-blue-800 mb-2">#JVEProjets</h1>
            <p className="text-xl text-gray-600">Nos actions pour l&apos;environnement</p>
          </div>
          <div className="flex justify-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-green-700 text-white py-16">
        <div className="container px-6 mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">#JVEProjets</h1>
          <p className="text-xl text-blue-200">Nos actions pour l&apos;environnement</p>
        </div>
      </div>

      {/* Modal Projet */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {selectedProject.image_url && (
              <img
                src={selectedProject.image_url}
                alt={selectedProject.title}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
            )}
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-4 py-2 text-white rounded-full font-semibold ${getStatusColor(selectedProject.status)}`}>
                  {getStatusLabel(selectedProject.status)}
                </span>
                {selectedProject.location && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                    📍 {selectedProject.location}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedProject.title}</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedProject.description}</p>
              <button
                onClick={() => setSelectedProject(null)}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="container px-6 py-16 mx-auto">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-2xl text-gray-600">Aucun projet pour le moment</p>
            <p className="mt-2 text-gray-500">De nouveaux projets seront bientôt annoncés !</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-blue-400 to-green-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <span className="text-6xl">🌱</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 text-white rounded-full text-sm font-semibold shadow-lg ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </div>
                  {project.location && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 text-gray-700 rounded-full text-sm shadow-lg">
                      📍 {project.location}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {project.description}
                  </p>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    DÉCOUVRIR
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
