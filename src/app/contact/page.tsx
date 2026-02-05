'use client';

import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-center text-gray-900">
          Nous Contacter
        </h1>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Contact Form */}
          <div className="p-8 bg-white rounded-lg shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Envoyez-nous un message
            </h2>

            {submitSuccess ? (
              <div className="p-4 text-center bg-green-100 rounded-lg">
                <p className="text-lg font-semibold text-green-700">
                  ✅ Message envoyé avec succès !
                </p>
                <p className="mt-2 text-gray-600">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-4 py-2 mt-4 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Votre e-mail *
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

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Objet de votre message"
                    className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Votre message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="p-8 bg-gray-100 rounded-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Nos Coordonnées
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>JVE - Siège International</strong>
              </p>
              <p>
                123 Rue de l&apos;Écologie,
                <br />
                75000 Paris, France
              </p>
              <p>
                <strong>Email :</strong> contact@jve-international.org
              </p>
              <p>
                <strong>Téléphone :</strong> +33 1 23 45 67 89
              </p>
              <p className="pt-4 mt-4 border-t border-gray-300">
                Pour des questions spécifiques à un pays, veuillez contacter
                directement la branche locale.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Suivez-nous
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700"
                  aria-label="Facebook"
                >
                  📘
                </a>
                <a
                  href="#"
                  className="p-2 text-white bg-sky-500 rounded-full hover:bg-sky-600"
                  aria-label="Twitter"
                >
                  🐦
                </a>
                <a
                  href="#"
                  className="p-2 text-white bg-pink-600 rounded-full hover:bg-pink-700"
                  aria-label="Instagram"
                >
                  📷
                </a>
                <a
                  href="#"
                  className="p-2 text-white bg-blue-700 rounded-full hover:bg-blue-800"
                  aria-label="LinkedIn"
                >
                  💼
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
