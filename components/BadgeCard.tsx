import React from 'react';
import type { Badge } from '../types';

interface BadgeCardProps {
    badge: Badge;
    isUnlocked: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isUnlocked }) => {
    const unlockedClasses = "bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700";
    const lockedClasses = "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60";

    return (
        <div className={`p-4 rounded-lg text-center flex flex-col items-center justify-start border transition-all duration-300 ${isUnlocked ? unlockedClasses : lockedClasses}`}>
            <div className={`mb-2 ${isUnlocked ? 'text-indigo-500' : 'text-slate-500'}`}>
                {badge.icon}
            </div>
            <h4 className={`font-bold text-sm ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{badge.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{badge.description}</p>
        </div>
    );
};

export default BadgeCard;