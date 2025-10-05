
import React, { useState, useEffect } from 'react';

interface SpinnerProps {
  messages: string[];
  onCancel?: () => void;
}

const Spinner: React.FC<SpinnerProps> = ({ messages, onCancel }) => {
  const [currentMessage, setCurrentMessage] = useState(messages[0] || 'Chargement...');

  useEffect(() => {
    setCurrentMessage(messages[0] || 'Chargement...'); // Reset on new messages
    if (messages.length > 1) {
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setCurrentMessage(messages[index]);
      }, 2500); // Change message every 2.5 seconds

      return () => clearInterval(interval);
    }
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{currentMessage}</p>
      {onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
              Annuler
          </button>
      )}
    </div>
  );
};

export default Spinner;
