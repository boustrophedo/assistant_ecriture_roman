
import React, { useMemo, useState } from 'react';
import type { HistoricExercise, Badge, PersonalizedFeedback, MicroExercise, TargetedLesson } from '../types';
import { calculateProgress } from '../utils/progress';
import { HardWorkerIcon, HistoryIcon, StreakIcon, FirstStepIcon, RegularWriterIcon, VocabularyMasterIcon, LightbulbIcon, CheckCircleIcon, RefreshIcon } from './Icons';
import StatCard from './StatCard';
import BadgeCard from './BadgeCard';
import Spinner from './Spinner';

const ALL_BADGES: Badge[] = [
    { id: 'FIRST_STEP', title: "Premier Pas", description: "Terminer votre premier exercice.", icon: <FirstStepIcon /> },
    { id: 'REGULAR_WRITER', title: "Écrivain Régulier", description: "Terminer 5 exercices.", icon: <RegularWriterIcon /> },
    { id: 'HARD_WORKER', title: "Acharné", description: "Terminer 10 exercices.", icon: <HardWorkerIcon /> },
    { id: 'STREAK_3', title: "En Feu !", description: "Écrire 3 jours d'affilée.", icon: <StreakIcon /> },
    { id: 'VOCABULARY_MASTER', title: "Maître du Vocabulaire", description: "Obtenir 5 points d'analyse sur le vocabulaire.", icon: <VocabularyMasterIcon /> },
];

interface ProgressDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoricExercise[];
    onStartExercise: (exercise: MicroExercise) => void;
    feedback: PersonalizedFeedback | null;
    isLoading: boolean;
    onFetch: () => void;
}

const categoryLabels: Record<string, string> = { VOICE: "Voix", STRUCTURE: "Structure", VOCABULARY: "Vocabulaire", RHYTHM: "Rythme", OTHER: "Autre" };

const LessonModal: React.FC<{ lesson: TargetedLesson; onClose: () => void }> = ({ lesson, onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
            <button onClick={onClose} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full text-2xl leading-none">&times;</button>
            <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">{lesson.title}</h3>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {lesson.content}
            </div>
        </div>
    </div>
);


const TrainingItemCard: React.FC<{ item: MicroExercise | TargetedLesson; onStartExercise: (exercise: MicroExercise) => void; onReadLesson: (lesson: TargetedLesson) => void; }> = ({ item, onStartExercise, onReadLesson }) => {
    const isExercise = 'baseText' in item;
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex-grow">
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${isExercise ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'}`}>
                    {isExercise ? 'Micro-Exercice' : 'Leçon Ciblée'}
                </span>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{'description' in item ? item.description : `Apprenez les bases de : ${item.skill}`}</p>
            </div>
            {isExercise ? (
                <button onClick={() => onStartExercise(item)} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 transition-colors">
                    <CheckCircleIcon /> Commencer
                </button>
            ) : (
                <button onClick={() => onReadLesson(item as TargetedLesson)} className="mt-4 w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-md shadow-sm hover:bg-sky-700 transition-colors">
                    Lire la leçon
                </button>
            )}
        </div>
    );
};

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ isOpen, onClose, history, onStartExercise, feedback, isLoading, onFetch }) => {
    const progressData = useMemo(() => calculateProgress(history), [history]);
    const [selectedLesson, setSelectedLesson] = useState<TargetedLesson | null>(null);

    const maxCategoryCount = Math.max(...(Object.values(progressData.categoryCounts) as number[]), 1);

    return (
        <>
            {selectedLesson && <LessonModal lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />}
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <aside 
                className={`fixed top-0 right-0 h-full w-full max-w-lg bg-slate-100 dark:bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="progress-panel-title"
            >
                <div className="h-full flex flex-col">
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 id="progress-panel-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">Tableau de Bord de Progrès</h2>
                        <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full text-2xl leading-none">&times;</button>
                    </header>
                    <div className="flex-grow overflow-y-auto p-6 space-y-8">
                        {history.length === 0 ? (
                            <p className="text-center text-slate-500 dark:text-slate-400 mt-8">Commencez un exercice pour voir vos progrès !</p>
                        ) : (
                            <>
                                <section>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Entraînement Personnalisé</h3>
                                        <button 
                                            onClick={onFetch}
                                            disabled={isLoading}
                                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                                            aria-label="Actualiser l'entraînement personnalisé"
                                        >
                                            <RefreshIcon spinning={isLoading} />
                                        </button>
                                    </div>

                                    {isLoading && <Spinner messages={["Analyse de vos progrès...", "Création de votre plan..."]} />}
                                    {!isLoading && !feedback && (
                                        <div className="text-center p-4 bg-slate-200 dark:bg-slate-800 rounded-lg">
                                            <p className="text-slate-600 dark:text-slate-300">Cliquez sur le bouton Actualiser pour générer votre plan d'entraînement.</p>
                                        </div>
                                    )}
                                    {!isLoading && feedback && (
                                        <div className="space-y-4">
                                            <div className="bg-indigo-50/80 dark:bg-slate-800/80 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-start space-x-3">
                                                <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400 mt-1"><LightbulbIcon /></div>
                                                <p className="text-slate-700 dark:text-slate-300">{feedback.diagnostic}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {feedback.exercises.map((ex, i) => <TrainingItemCard key={`ex-${i}`} item={ex} onStartExercise={onStartExercise} onReadLesson={setSelectedLesson} />)}
                                                {feedback.lessons.map((le, i) => <TrainingItemCard key={`le-${i}`} item={le} onStartExercise={onStartExercise} onReadLesson={setSelectedLesson} />)}
                                            </div>
                                        </div>
                                    )}
                                </section>
                                <hr className="border-slate-200 dark:border-slate-700"/>
                                <section>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Statistiques Clés</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <StatCard icon={<HistoryIcon />} title="Exercices Terminés" value={progressData.totalExercises} />
                                        <StatCard icon={<StreakIcon />} title="Série Actuelle" value={`${progressData.currentStreak} jours`} />
                                        <StatCard icon={<HardWorkerIcon />} title="Plus Longue Série" value={`${progressData.longestStreak} jours`} />
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Axes de Travail</h3>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Répartition des points d'analyse de l'IA.</p>
                                        <div className="space-y-3">
                                            {Object.entries(progressData.categoryCounts).map(([category, count]) => (
                                                <div key={category} className="flex items-center">
                                                    <span className="w-28 text-sm font-semibold text-slate-600 dark:text-slate-300">{categoryLabels[category]}</span>
                                                    <div className="flex-grow bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                                                        <div 
                                                            className="bg-indigo-500 rounded-full h-5 flex items-center justify-end pr-2 text-white text-xs font-bold"
                                                            style={{ width: `${((count as number) / maxCategoryCount) * 100}%` }}
                                                        >
                                                            {(count as number) > 0 && count}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Réussites</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {ALL_BADGES.map(badge => (
                                            <BadgeCard 
                                                key={badge.id}
                                                badge={badge}
                                                isUnlocked={progressData.unlockedBadges.has(badge.id)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ProgressDashboard;
