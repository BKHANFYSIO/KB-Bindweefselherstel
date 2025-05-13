import { useState, useEffect } from 'react';

function usePersistentToggle(key, defaultValue = true) {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(isOpen));
  }, [key, isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  return [isOpen, toggle];
}

export default usePersistentToggle; 