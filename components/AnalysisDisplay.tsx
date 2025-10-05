
import React from 'react';
import type { AnalysisBlock, Suggestion } from '../types';
import { categoryIcons } from './Icons';
import ParsedContent from './ParsedContent';
import SuggestionBlock from './SuggestionBlock';

interface AnalysisDisplayProps {
  analysis: AnalysisBlock[];
  onApplySuggestion: (suggestion: Suggestion) => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, onApplySuggestion }) => (
    <div className="w-full max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">Analyse Détaillée</h2>
        {analysis.map((block, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 opacity-0 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex items-center space-x-3 mb-3">
                    <span className="text-indigo-600 dark:text-indigo-400">{categoryIcons[block.category]}</span>
                    <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{block.title}</h3>
                </div>
                <ul className="list-none space-y-2 text-slate-700 dark:text-slate-300">
                    {block.content.split('- ').filter(item => item.trim()).map((item, i) => (
                        <li key={i} className="flex items-start">
                            <span className="mr-2 text-indigo-500 mt-1">&rarr;</span>
                            <span><ParsedContent text={item.trim()} /></span>
                        </li>
                    ))}
                </ul>
                {block.suggestion && (
                    <SuggestionBlock 
                        suggestion={block.suggestion} 
                        onApply={() => onApplySuggestion(block.suggestion!)}
                    />
                )}
            </div>
        ))}
    </div>
);

export default AnalysisDisplay;
