import type { HistoricExercise, ProgressData, BadgeId, AnalysisBlock } from '../types';

const INITIAL_COUNTS: Record<AnalysisBlock['category'], number> = {
    VOICE: 0,
    STRUCTURE: 0,
    VOCABULARY: 0,
    RHYTHM: 0,
    OTHER: 0
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function calculateProgress(history: HistoricExercise[]): ProgressData {
    if (history.length === 0) {
        return {
            totalExercises: 0,
            currentStreak: 0,
            longestStreak: 0,
            categoryCounts: { ...INITIAL_COUNTS },
            unlockedBadges: new Set<BadgeId>(),
        };
    }

    // 1. Calcul des séries (streaks)
    const exerciseDates = history.map(h => new Date(h.date));
    const uniqueDays = [...new Set(exerciseDates.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()))].sort((a,b) => b-a);
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (uniqueDays.length > 0) {
        const today = new Date();
        const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        
        // La série actuelle est valide si le dernier jour est aujourd'hui ou hier
        if (todayTime - uniqueDays[0] <= DAY_IN_MS) {
            currentStreak = 1;
            for (let i = 0; i < uniqueDays.length - 1; i++) {
                const diff = uniqueDays[i] - uniqueDays[i+1];
                if (diff === DAY_IN_MS) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }

    let tempLongest = 0;
    if (uniqueDays.length > 0) {
        tempLongest = 1;
        longestStreak = 1;
        for (let i = 0; i < uniqueDays.length - 1; i++) {
            const diff = uniqueDays[i] - uniqueDays[i+1];
            if (diff === DAY_IN_MS) {
                tempLongest++;
            } else {
                tempLongest = 1;
            }
            if(tempLongest > longestStreak) {
                longestStreak = tempLongest;
            }
        }
    }


    // 2. Compte des catégories
    const categoryCounts = history.reduce((acc, exercise) => {
        exercise.analysis.blocks.forEach(block => {
            if(acc[block.category] !== undefined) {
                acc[block.category]++;
            }
        });
        return acc;
    }, { ...INITIAL_COUNTS });


    // 3. Déblocage des badges
    const unlockedBadges = new Set<BadgeId>();
    const totalExercises = history.length;
    
    if(totalExercises >= 1) unlockedBadges.add('FIRST_STEP');
    if(totalExercises >= 5) unlockedBadges.add('REGULAR_WRITER');
    if(totalExercises >= 10) unlockedBadges.add('HARD_WORKER');
    if(longestStreak >= 3) unlockedBadges.add('STREAK_3');
    if(categoryCounts.VOCABULARY >= 5) unlockedBadges.add('VOCABULARY_MASTER');

    return {
        totalExercises,
        currentStreak,
        longestStreak,
        categoryCounts,
        unlockedBadges
    };
}