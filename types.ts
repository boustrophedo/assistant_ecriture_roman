
import type { ReactElement } from 'react';

export interface Suggestion {
  originalFragment: string;
  suggestedFragment: string;
}

export interface Synthesis {
  summary: string;
  mainAxis: string;
}

export interface AnalysisBlock {
  title: string;
  content: string;
  category: 'VOICE' | 'STRUCTURE' | 'VOCABULARY' | 'RHYTHM' | 'OTHER';
  suggestion?: Suggestion;
}

export interface AnalysisResult {
  synthesis: Synthesis;
  blocks: AnalysisBlock[];
}

export type AppState =
  | 'WELCOME'
  | 'SELECTING_DOCUMENT'
  | 'UPLOADING'
  | 'SAVING_DOCUMENT'
  | 'GENERATING_PROMPT'
  | 'WRITING'
  | 'ANALYZING'
  | 'SHOWING_ANALYSIS'
  | 'WRITING_TARGETED_EXERCISE';

export interface HistoricExercise {
    id: string;
    date: string;
    prompt: string;
    originalText: string;
    userText: string;
    analysis: AnalysisResult;
    // Ajout d'une métadonnée pour savoir si c'est un exercice ciblé
    type?: 'standard' | 'targeted';
    targetedSkill?: string;
}

export interface StoredDocument {
    id: string; // timestamp de l'ajout
    name: string;
    type: string;
    size: number;
    dateAdded: string;
}

export interface StoredDocumentWithText extends StoredDocument {
    text: string;
}

export type ExerciseMode = 'random' | 'profile' | 'custom';

export interface SessionState {
    appState: AppState;
    exerciseMode: ExerciseMode | null;
    customTopic: string;
    selectedDocumentText: string;
    extractedScene: string;
    writingPrompt: string;
    userText: string;
    analysisResult: AnalysisResult | null;
    targetedExercise?: MicroExercise; 
}

// Types pour le Tableau de Bord de Progrès
export type BadgeId = 'FIRST_STEP' | 'REGULAR_WRITER' | 'HARD_WORKER' | 'VOCABULARY_MASTER' | 'STREAK_3';

export interface Badge {
    id: BadgeId;
    title: string;
    description: string;
    icon: ReactElement;
}

export interface ProgressData {
    totalExercises: number;
    currentStreak: number;
    longestStreak: number;
    categoryCounts: Record<AnalysisBlock['category'], number>;
    unlockedBadges: Set<BadgeId>;
}

// Types pour l'Entraînement Personnalisé
export interface MicroExercise {
    title: string;
    description: string;
    baseText: string; // Le texte à réécrire
    prompt: string; // La consigne spécifique
    skill: string; // La compétence ciblée (ex: "Varier la structure des phrases")
}

export interface TargetedLesson {
    title: string;
    content: string; // Le contenu de la leçon
    skill: string;
}

export interface PersonalizedFeedback {
    diagnostic: string;
    exercises: MicroExercise[];
    lessons: TargetedLesson[];
}

// Type pour l'import/export de données
export interface BackupData {
    documents?: StoredDocumentWithText[];
    history: HistoricExercise[];
}