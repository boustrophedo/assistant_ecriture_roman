
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Permet à l'animation de sortie de se terminer avant de vider le message
        setTimeout(onDismiss, 300);
      }, 3000); // Le toast reste visible 3 secondes

      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  return (
    <div 
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-800 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out z-50 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default Toast;
