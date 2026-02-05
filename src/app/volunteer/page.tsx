'use client';

import { useState } from 'react';

const VolunteerPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    motivation: '',
    availability: '',
    skills: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Votre candidature a été envoyée avec succès ! Nous vous contacterons bientôt.' });
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          country: '',
          city: '',
          motivation: '',
          availability: '',
          skills: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-6 text-4xl font-bold text-center text-gray-900">
          Devenir Bénévole
        </h1>
        <p className="mb-8 text-lg text-center text-gray-700">
          Votre temps et vos compétences sont précieux pour nous. Rejoignez notre
          équipe de volontaires et contribuez activement à nos projets sur le
          terrain. Remplissez le formulaire ci-dessous pour nous faire part de
          votre intérêt.
        </p>

        {message && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-lg shadow-lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                Disponibilité
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sélectionnez</option>
                <option value="temps_plein">Temps plein</option>
                <option value="temps_partiel">Temps partiel</option>
                <option value="weekends">Weekends uniquement</option>
                <option value="occasionnel">Occasionnel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Pays
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sélectionnez votre pays</option>
                <option value="Togo">Togo</option>
                <option value="Benin">Bénin</option>
                <option value="France">France</option>
                <option value="Cote d'Ivoire">Côte d&apos;Ivoire</option>
                <option value="Senegal">Sénégal</option>
                <option value="Cameroun">Cameroun</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Ville
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
              Compétences et domaines d&apos;intérêt
            </label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows={3}
              placeholder="Ex: sensibilisation, reboisement, communication, logistique..."
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
              Pourquoi souhaitez-vous devenir bénévole ? *
            </label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Décrivez vos motivations et ce que vous aimeriez apporter à JVE..."
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerPage;
