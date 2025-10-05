
import React, { useState, useEffect } from 'react';
import type { AnalysisResult, Suggestion } from '../types';
import SynthesisDisplay from './SynthesisDisplay';
import AnalysisDisplay from './AnalysisDisplay';
import ComparisonView from './ComparisonView';
import { ChevronDownIcon } from './Icons';

interface ResultsViewProps {
  prompt: string;
  originalText: string;
  userText: string;
  analysis: AnalysisResult;
  onReset: () => void;
  onRewrite: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ prompt, originalText, userText, analysis, onReset, onRewrite }) => {
    const [activeTab, setActiveTab] = useState<'analysis' | 'compare'>('analysis');
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [editableUserText, setEditableUserText] = useState(userText);

    useEffect(() => {
        setEditableUserText(userText);
    }, [userText]);

    const handleApplySuggestion = (suggestion: Suggestion) => {
        // Remplace seulement la première occurrence pour éviter les remplacements multiples non désirés
        setEditableUserText(currentText => currentText.replace(suggestion.originalFragment, suggestion.suggestedFragment));
    };
    
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-center items-center gap-4">
                <button 
                    onClick={onRewrite} 
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    Réécrire cette scène
                </button>
                <button 
                    onClick={onReset} 
                    className="px-8 py-3 bg-slate-700 dark:bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                    Commencer un nouvel exercice
                </button>
            </div>
            
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 px-4">
                <button onClick={() => setIsPromptOpen(!isPromptOpen)} className="w-full flex justify-between items-center py-3 text-lg font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-left">Rappel de la consigne</span>
                    <span className={`${isPromptOpen ? 'rotate-180' : ''}`}><ChevronDownIcon /></span>
                </button>
                {isPromptOpen && (
                    <div className="pb-4 border-t border-slate-200 dark:border-slate-600 pt-3 text-slate-600 dark:text-slate-400 prose">
                        {prompt}
                    </div>
                )}
            </div>
            
            <div className="w-full max-w-6xl mx-auto">
                <div className="flex justify-center border-b border-slate-300 dark:border-slate-600 mb-8">
                    <button onClick={() => setActiveTab('analysis')} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'analysis' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                        Analyse
                    </button>
                    <button onClick={() => setActiveTab('compare')} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'compare' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                        Comparaison
                    </button>
                </div>

                {activeTab === 'analysis' && (
                    <div className="space-y-8 opacity-0 animate-fade-in">
                        <SynthesisDisplay synthesis={analysis.synthesis} />
                        <AnalysisDisplay analysis={analysis.blocks} onApplySuggestion={handleApplySuggestion} />
                    </div>
                )}
                {activeTab === 'compare' && (
                    <div className="opacity-0 animate-fade-in">
                        <ComparisonView originalText={originalText} userText={editableUserText} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsView;
