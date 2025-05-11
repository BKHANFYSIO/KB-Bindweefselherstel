import React from 'react';

// Hulpfunctie om classes te bepalen op basis van status
const statusClasses = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-purple-700 text-white';
    case 'partial':
      return 'border-2 border-yellow-400 text-yellow-500';
    case 'static':
      return 'border-2 border-gray-300 text-gray-400 bg-white';
    default:
      return 'border-2 border-gray-300 text-gray-500';
  }
};

function Sidebar({ navItems, activeSection, navigateTo, getStatus, overallProgress, onClose, isMobile = false, onClearAllData }) {
  return (
    <div className={`flex flex-col h-full w-64 bg-white shadow-lg ${isMobile ? 'pb-20' : 'border-r'} py-6 ${isMobile ? 'pt-6' : ''}`}>
      <h2 className="px-6 text-xl font-semibold text-purple-700 mb-6">Hoofdstukken</h2>

      <ul className="flex-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const status = getStatus(item.id);
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}
                onClick={() => {
                  navigateTo(item.id);
                  if (isMobile && onClose) onClose();
                }}
                className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors ${isActive ? 'bg-purple-50' : 'hover:bg-gray-100'}`}
            >
              <div
                className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold ${statusClasses(status)}`}
              >
                {index + 1}
              </div>
              <span className={`truncate text-sm font-medium ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>{item.label}</span>
            </li>
          );
        })}
      </ul>

      {/* voortgang en wis knop onderin */}
      <div className="px-6 py-4 mt-auto flex flex-col items-center gap-3">
        {/* Wis Alle Voortgang Knop */}
        <button
          onClick={onClearAllData}
          className="w-full text-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-md border border-red-300 transition-colors duration-150 ease-in-out"
        >
          Wis Alle Voortgang
        </button>

        {/* Verbeterde cirkeldiagram */}
        {(() => {
          const radius = 16;
          const circumference = 2 * Math.PI * radius;
          const progress = Math.max(0, Math.min(1, overallProgress / 100)); // Clamp tussen 0 en 1
          return (
            <svg width="60" height="60" viewBox="0 0 36 36" className="rotate-[-90deg]">
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#6b21a8"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
            </svg>
          );
        })()}
        <span className="text-sm font-medium text-purple-700">{Math.round(overallProgress)}%</span>
      </div>

      {/* Aangepaste sluitknop voor mobiel, nu als FAB-stijl linksonder */}
      {isMobile && (
        <button
          onClick={onClose}
          className="fixed bottom-6 left-6 bg-purple-700 text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-purple-800 transition-colors"
          aria-label="Sluit menu"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Sidebar; 