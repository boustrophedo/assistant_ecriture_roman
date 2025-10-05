
import React, { useRef } from 'react';
import type { StoredDocument } from '../types';
import { TrashIcon, UploadIcon } from './Icons';

interface LibraryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    documents: StoredDocument[];
    onDelete: (id: string) => void;
    onAddRequest: () => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ isOpen, onClose, documents, onDelete, onAddRequest }) => {
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
                aria-labelledby="library-panel-title"
            >
                <div className="h-full flex flex-col">
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 id="library-panel-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">Bibliothèque de Documents</h2>
                        <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full">&times;</button>
                    </header>
                    <div className="flex-grow overflow-y-auto p-4">
                        {documents.length === 0 ? (
                            <p className="text-center text-slate-500 dark:text-slate-400 mt-8">Votre bibliothèque est vide.</p>
                        ) : (
                            <ul className="space-y-3">
                                {documents.map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex-grow overflow-hidden">
                                            <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{doc.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {Math.round(doc.size / 1024)} ko - {doc.type}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onDelete(doc.id)}
                                            className="ml-4 flex-shrink-0 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                            aria-label={`Supprimer ${doc.name}`}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={onAddRequest}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <UploadIcon />
                            Ajouter un document
                        </button>
                    </footer>
                </div>
            </aside>
        </>
    );
};

export default LibraryPanel;