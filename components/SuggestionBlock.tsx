
import React from 'react';
import type { Suggestion } from '../types';
import { CheckCircleIcon } from './Icons';

interface SuggestionBlockProps {
  suggestion: Suggestion;
  onApply: () => void;
}

const SuggestionBlock: React.FC<SuggestionBlockProps> = ({ suggestion, onApply }) => (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Suggestion :</h4>
        <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-grow">
                <p className="text-sm text-slate-500 dark:text-slate-400">Remplacer :</p>
                <p className="italic text-red-600 dark:text-red-400">"{suggestion.originalFragment}"</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Par :</p>
                <p className="italic text-green-700 dark:text-green-400">"{suggestion.suggestedFragment}"</p>
            </div>
            <button 
                onClick={onApply}
                className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
                <CheckCircleIcon />
                Appliquer
            </button>
        </div>
    </div>
);

export default SuggestionBlock;
