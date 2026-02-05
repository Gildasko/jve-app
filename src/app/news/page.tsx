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
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container px-6 py-16 mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-green-800 mb-2">#JVEActualités</h1>
            <p className="text-xl text-gray-600">L&apos;actualité du réseau JVE</p>
          </div>
          <div className="flex justify-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-green-800 text-white py-16">
        <div className="container px-6 mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">#JVEActualités</h1>
          <p className="text-xl text-green-200">L&apos;actualité du réseau JVE</p>
        </div>
      </div>

      {/* Modal Article */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {selectedArticle.image_url && (
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
            )}
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold">{formatDate(selectedArticle.created_at).day}</div>
                  <div className="text-sm">{formatDate(selectedArticle.created_at).month}</div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedArticle.title}</h2>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedArticle.content}</p>
              {selectedArticle.profiles?.full_name && (
                <p className="mt-6 text-sm text-gray-500">Par {selectedArticle.profiles.full_name}</p>
              )}
              <button
                onClick={() => setSelectedArticle(null)}
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="container px-6 py-16 mx-auto">
        {news.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-2xl text-gray-600">Aucune actualité pour le moment</p>
            <p className="mt-2 text-gray-500">Revenez bientôt pour découvrir nos dernières nouvelles !</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <div
                key={article.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <span className="text-6xl">🌿</span>
                    </div>
                  )}
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg">
                    <div className="text-2xl font-bold leading-none">{formatDate(article.created_at).day}</div>
                    <div className="text-xs">{formatDate(article.created_at).month}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {article.content}
                  </p>
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors"
                  >
                    LIRE LA SUITE
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

export default NewsPage;
