import React, { useState } from 'react';
import type { HistoricExercise } from '../types';

interface WelcomeProps {
    onStartRandom: () => void;
    onStartFromProfile: () => void;
    onStartFromDocument: (topic: string) => void;
    history: HistoricExercise[];
}

const Welcome: React.FC<WelcomeProps> = ({ onStartRandom, onStartFromProfile, onStartFromDocument, history }) => {
    const [customTopic, setCustomTopic] = useState('');
    const isProfileDisabled = history.length === 0;

    return (
        <div className="w-full max-w-4xl mx-auto text-center opacity-0 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Choisissez votre prochain exercice</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">
                Chaque exercice commence par l'analyse d'un de vos documents.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Card 1: Random Exercise */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                    <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-2">Scène Aléatoire</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow mb-6">L'IA choisit une scène au hasard dans votre document et crée une consigne de réécriture générale. Parfait pour un regard neuf.</p>
                    <button
                        onClick={onStartRandom}
                        className="w-full mt-auto px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105"
                    >
                        Choisir un fichier
                    </button>
                </div>

                {/* Card 2: Profile-based Exercise */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col relative">
                    {isProfileDisabled && <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl cursor-not-allowed" title="Faites au moins un exercice pour débloquer cette option."></div>}
                    <h3 className="font-bold text-xl text-teal-600 dark:text-teal-400 mb-2">Entraînement Ciblé</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow mb-6">L'IA analyse votre profil, puis choisit la scène la plus pertinente dans votre document pour travailler un point faible.</p>
                    <button
                        onClick={onStartFromProfile}
                        disabled={isProfileDisabled}
                        className="w-full mt-auto px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Choisir un fichier
                    </button>
                </div>

                {/* Card 3: Custom Exercise from Document */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                    <h3 className="font-bold text-xl text-sky-600 dark:text-sky-400 mb-2">Scène Choisie</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow mb-4">Indiquez un point à travailler. L'IA choisira une scène dans votre document adaptée à cet objectif.</p>
                    <div className="flex-grow">
                         <input
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="Ex: Améliorer mes dialogues"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm mb-4"
                        />
                    </div>
                    <button
                        onClick={() => onStartFromDocument(customTopic)}
                        className="w-full mt-auto px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform hover:scale-105"
                    >
                        Choisir un fichier
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Welcome;