import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeComponent = () => {
  const siteUrl = window.location.origin;
  
  return (
    <div className="qr-code-container">
      <QRCodeSVG 
        value={siteUrl}
        size={100}
        level="H"
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeComponent; 