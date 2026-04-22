import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowInstall(false);
      });
    }
  };

  if (!showInstall) return null;

  return (
    <div className="install-prompt">
      <p>📱 Install CPMS app for better experience</p>
      <button className="install-btn" onClick={handleInstall}>Install</button>
      <button className="close-install" onClick={() => setShowInstall(false)}>×</button>
    </div>
  );
};

export default InstallPWA;