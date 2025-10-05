import React from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface PromptDisplayProps {
  prompt: string;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt }) => {
    const displayText = useTypewriter(prompt);
    
    return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Votre consigne d'écriture</h2>
            <div className="prose prose-lg text-slate-600 dark:text-slate-300 min-h-[100px]">
                <p>{displayText}<span className="inline-block w-1 h-6 bg-slate-600 dark:bg-slate-400 animate-pulse ml-1"></span></p>
            </div>
        </div>
    );
};

export default PromptDisplay;
