'use client';

import { useEffect, useState } from 'react';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

const NewsPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

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

  if (isLoading) {
    return (
      <div className="container px-6 py-8 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-center text-gray-900">
          Nos Actualités
        </h1>
        <p className="text-center text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container px-6 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center text-gray-900">
        Nos Actualités
      </h1>
      
      {news.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-600">Aucune actualité pour le moment.</p>
          <p className="mt-2 text-gray-500">Revenez bientôt pour découvrir nos dernières nouvelles !</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <div
              key={article.id}
              className="overflow-hidden bg-white rounded-lg shadow-lg"
            >
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="object-cover w-full h-48"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-48 bg-gradient-to-br from-green-400 to-green-600">
                  <span className="text-4xl">🌿</span>
                </div>
              )}
              <div className="p-6">
                <p className="mb-2 text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <h2 className="mb-2 text-xl font-bold text-gray-900">
                  {article.title}
                </h2>
                <p className="text-gray-700 line-clamp-3">
                  {article.content}
                </p>
                {article.profiles?.full_name && (
                  <p className="mt-4 text-sm text-gray-500">
                    Par {article.profiles.full_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
