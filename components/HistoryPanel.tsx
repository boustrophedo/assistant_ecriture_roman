
import React from 'react';
import type { HistoricExercise } from '../types';
import { TrashIcon } from './Icons';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoricExercise[];
    onSelect: (exercise: HistoricExercise) => void;
    onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <aside 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-panel-title"
            >
                <div className="h-full flex flex-col">
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 id="history-panel-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">Historique des Exercices</h2>
                        <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full">&times;</button>
                    </header>
                    <div className="flex-grow overflow-y-auto p-4">
                        {history.length === 0 ? (
                            <p className="text-center text-slate-500 dark:text-slate-400 mt-8">Aucun exercice dans votre historique.</p>
                        ) : (
                            <ul className="space-y-3">
                                {history.map(item => (
                                    <li key={item.id}>
                                        <button 
                                            onClick={() => onSelect(item)}
                                            className="w-full text-left p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                                        >
                                            <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{item.prompt}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {history.length > 0 && (
                        <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={onClear} 
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <TrashIcon />
                                Vider l'historique
                            </button>
                        </footer>
                    )}
                </div>
            </aside>
        </>
    );
};

export default HistoryPanel;
