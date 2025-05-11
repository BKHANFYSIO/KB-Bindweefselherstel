import React, { useState } from 'react';

function EJournalSection({ onGeneratePDF, firstName, lastName, onFirstNameChange, onLastNameChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">eJournal</h2>
      
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <p className="text-gray-700 leading-relaxed">
          Je eJournal is je persoonlijke leeromgeving waar je je inzichten, vragen en reflecties kunt vastleggen. Gebruik dit om je leerproces te documenteren, belangrijke aha-momenten vast te leggen en je persoonlijke ontwikkeling te volgen. Het helpt je om bewust te leren en je kennis te verdiepen door regelmatig te reflecteren op wat je hebt geleerd.
        </p>
      </div>

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
    </div>
  );
}

export default EJournalSection; 