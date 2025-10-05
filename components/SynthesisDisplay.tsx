import React from 'react';
import type { Synthesis } from '../types';
import { LightbulbIcon } from './Icons';

interface SynthesisDisplayProps {
  synthesis: Synthesis;
}

const SynthesisDisplay: React.FC<SynthesisDisplayProps> = ({ synthesis }) => (
    <div className="sticky top-6 z-10">
      <div className="w-full max-w-4xl mx-auto bg-indigo-50/80 dark:bg-slate-800/80 p-6 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800 backdrop-blur-sm">
          <div className="flex items-start space-x-4">
              <div className="flex-shrink-0"><span className="text-indigo-500 dark:text-indigo-400"><LightbulbIcon /></span></div>
              <div>
                  <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300">Synthèse & Axe Principal</h3>
                  <p className="mt-2 text-slate-700 dark:text-slate-300">{synthesis.summary}</p>
                  <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">À retenir :</span> {synthesis.mainAxis}
                  </p>
              </div>
          </div>
      </div>
    </div>
);

export default SynthesisDisplay;
