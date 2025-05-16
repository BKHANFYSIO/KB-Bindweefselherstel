import React from 'react';

function PogingBadge({ attemptNumber, afgerond }) {
  return (
    <span
      className="inline-flex items-center gap-2 bg-gray-100 text-blue-800 text-base font-medium px-4 py-1 rounded-full border border-blue-300 min-w-[120px] justify-center select-none"
      style={{ whiteSpace: 'nowrap' }}
    >
      Poging: {attemptNumber}
      {afgerond && (
        <>
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span className="text-green-700 text-sm">(afgerond)</span>
        </>
      )}
    </span>
  );
}

export default PogingBadge; 