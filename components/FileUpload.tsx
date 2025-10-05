

import React, { useState, useRef, DragEvent } from 'react';
import { UploadIcon, BackIcon } from './Icons';
import type { ExerciseMode } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  mode: ExerciseMode | null;
  onBack: () => void;
}

const TITLES: Record<ExerciseMode, string> = {
    random: "Exercice Aléatoire",
    profile: "Entraînement Ciblé",
    custom: "Exercice Personnalisé"
};

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, mode, onBack }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
        const file = event.target.files?.[0]; 
        if (file) onFileSelect(file); 
    };
    
    const handleClick = () => fileInputRef.current?.click();
    
    const handleDrag = (e: DragEvent<HTMLDivElement>, dragging: boolean) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setIsDragging(dragging); 
    };
    
    const handleDrop = (e: DragEvent<HTMLDivElement>) => { 
        handleDrag(e, false); 
        const file = e.dataTransfer.files?.[0]; 
        if (file && (file.type === "text/plain" || file.type === "application/pdf")) {
            onFileSelect(file);
        }
    };
    
    const dragDropClasses = isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800';

    const title = mode ? TITLES[mode] : "Ajouter à la bibliothèque";
    const description = mode ? "Le document sera ajouté à votre bibliothèque et utilisé pour cet exercice." : "Cliquez ou glissez-déposez un fichier .txt ou .pdf ici.";

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
             <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors mb-6"
                aria-label="Retour"
            >
                <BackIcon />
                Retour
            </button>
            <div 
                onClick={handleClick} 
                onDragEnter={(e) => handleDrag(e, true)} 
                onDragLeave={(e) => handleDrag(e, false)} 
                onDragOver={(e) => handleDrag(e, true)} 
                onDrop={handleDrop} 
                className={`group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-300 p-8 text-center ${dragDropClasses}`}
            >
                <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                    <UploadIcon />
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".txt,.pdf" 
                />
            </div>
        </div>
    );
};

export default FileUpload;
