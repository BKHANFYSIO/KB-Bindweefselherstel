import React from 'react';

function EJournalSection({ onGeneratePDF, firstName, lastName, onFirstNameChange, onLastNameChange }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-blue-700">eJournal Generator</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Genereer een PDF-document met al je antwoorden en zelfbeoordelingen. Dit document kun je gebruiken
            voor je eigen administratie of om je voortgang te delen.
          </p>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">
              Voornaam
            </label>
            <input
              type="text"
              id="firstName"
              className="w-full p-2 border rounded-md"
              value={firstName}
              onChange={onFirstNameChange}
              placeholder="Vul je voornaam in"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">
              Achternaam
            </label>
            <input
              type="text"
              id="lastName"
              className="w-full p-2 border rounded-md"
              value={lastName}
              onChange={onLastNameChange}
              placeholder="Vul je achternaam in"
            />
          </div>
        </div>
        <button
          onClick={onGeneratePDF}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          Genereer PDF
        </button>
      </div>
    </div>
  );
}

export default EJournalSection; 