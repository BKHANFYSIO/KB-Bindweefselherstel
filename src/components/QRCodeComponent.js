import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
// import '../styles/qr-animate.css'; // animatie niet meer nodig

function QRCodeComponent({ size = 32 }) {
  const [showModal, setShowModal] = useState(false);
  const url = 'https://kb-bindweefselherstel.vercel.app/';

  return (
    <>
      {/* Kleine QR code in de header */}
      <button
        onClick={() => setShowModal(true)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="Scan QR code"
        style={{ lineHeight: 0 }}
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          className="cursor-pointer"
        />
      </button>

      {/* Modal voor vergrote QR code */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Scan de QR code</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={url}
                size={200}
                level="H"
                includeMargin={true}
                className="mb-4"
              />
              <p className="text-gray-600 text-center">
                Scan deze QR code om de app te openen op je mobiele apparaat
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QRCodeComponent; 