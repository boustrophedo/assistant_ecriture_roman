import React from 'react';
import { generateDiff, DiffPart } from '../utils/diff';

interface ComparisonViewProps {
  originalText: string;
  userText: string;
}

const DiffRenderer: React.FC<{ parts: DiffPart[] }> = ({ parts }) => {
  const typeToClass: Record<DiffPart['type'], string> = {
    common: '',
    added: 'text-green-600 dark:text-green-500 font-medium',
    removed: 'text-red-600 dark:text-red-500 line-through',
  };

  return (
    <p className="whitespace-pre-wrap font-serif leading-relaxed text-slate-600 dark:text-slate-300">
      {parts.map((part, index) => (
        <span key={index} className={typeToClass[part.type]}>
          {part.value}
        </span>
      ))}
    </p>
  );
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ originalText, userText }) => {
    const { originalResult, userResult } = generateDiff(originalText, userText);
    
    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 border-b pb-2 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600">Texte Original</h3>
                <DiffRenderer parts={originalResult} />
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 border-b pb-2 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600">Votre Version</h3>
                 <DiffRenderer parts={userResult} />
            </div>
        </div>
    );
};

export default ComparisonView;