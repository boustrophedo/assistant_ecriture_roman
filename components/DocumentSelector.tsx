

import React from 'react';
import type { StoredDocument, ExerciseMode } from '../types';
import { UploadIcon, BackIcon } from './Icons';

interface DocumentSelectorProps {
    documents: StoredDocument[];
    onSelect: (docId: string) => void;
    onUploadRequest: () => void;
    exerciseMode: ExerciseMode | null;
    onBack: () => void;
}

const TITLES: Record<ExerciseMode | 'default', string> = {
    random: "Choisissez un document pour votre exercice aléatoire",
    profile: "Choisissez un document pour votre entraînement ciblé",
    custom: "Choisissez un document à analyser",
    default: "Choisissez un document"
};

const DocumentCard: React.FC<{ doc: StoredDocument; onSelect: () => void; }> = ({ doc, onSelect }) => (
    <button
        onClick={onSelect}
        className="w-full text-left p-4 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700"
    >
        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{doc.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ajouté le {new Date(doc.dateAdded).toLocaleDateString('fr-FR')} - {Math.round(doc.size / 1024)} ko
        </p>
    </button>
);

const AddNewCard: React.FC<{ onClick: () => void; }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-full h-full text-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/70 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors flex flex-col items-center justify-center"
    >
        <UploadIcon />
        <p className="font-semibold text-slate-600 dark:text-slate-300 mt-2">Ajouter un nouveau document</p>
    </button>
);

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ documents, onSelect, onUploadRequest, exerciseMode, onBack }) => {
    const title = TITLES[exerciseMode || 'default'];

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors mb-6"
                aria-label="Retour à l'accueil"
            >
                <BackIcon />
                Retour à l'accueil
            </button>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-8">{title}</h2>
            
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map(doc => (
                        <DocumentCard key={doc.id} doc={doc} onSelect={() => onSelect(doc.id)} />
                    ))}
                    <AddNewCard onClick={onUploadRequest} />
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Votre bibliothèque est vide. Ajoutez votre premier document pour commencer.</p>
                    <button
                        onClick={onUploadRequest}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <UploadIcon />
                        Ajouter un document
                    </button>
                </div>
            )}
        </div>
    );
};

export default DocumentSelector;
