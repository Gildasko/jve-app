
import React from 'react';

const ConfirmEmailPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-900">
          Vérifiez vos e-mails
        </h2>
        <p className="mt-4 text-gray-600">
          Nous vous avons envoyé un lien de confirmation. Veuillez cliquer sur ce
          lien pour finaliser votre inscription.
        </p>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
