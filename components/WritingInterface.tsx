

import React, { useState, useEffect } from 'react';

interface WritingInterfaceProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  initialText?: string;
}

const WritingInterface: React.FC<WritingInterfaceProps> = ({ onSubmit, onCancel, initialText = '' }) => {
    const [text, setText] = useState(initialText);
    
    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const lineCount = text.split(/\r\n|\r|\n/).filter(line => line.length > 0).length;
    
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        onSubmit(text); 
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    placeholder="Écrivez votre scène ici..." 
                    className="w-full h-48 p-4 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200" 
                    rows={7} 
                />
                <div className="flex justify-between items-center mt-4">
                    <button 
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                    >
                        Annuler
                    </button>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{lineCount} lignes</span>
                        <button 
                            type="submit" 
                            disabled={!text.trim()} 
                            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Analyser ma scène
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default WritingInterface;