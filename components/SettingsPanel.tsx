
import React, { useRef } from 'react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: (file: File) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onExport, onImport }) => {
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
        // Réinitialiser la valeur pour permettre de sélectionner le même fichier à nouveau
        if(event.target) {
            event.target.value = '';
        }
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <aside 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-panel-title"
            >
                <div className="h-full flex flex-col">
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 id="settings-panel-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">Paramètres & Données</h2>
                        <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full">&times;</button>
                    </header>
                    <div className="flex-grow overflow-y-auto p-6 space-y-8">
                        <section>
                            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Exporter l'Historique</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                                Téléchargez un fichier de sauvegarde (.json) contenant l'intégralité de votre historique d'exercices. Votre bibliothèque de documents n'est pas incluse.
                            </p>
                            <button
                                onClick={onExport}
                                className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Exporter mon historique
                            </button>
                        </section>

                        <hr className="border-slate-200 dark:border-slate-700" />

                        <section>
                            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Importer un Historique</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                                Chargez un fichier de sauvegarde d'historique précédemment exporté.
                                <strong className="text-amber-600 dark:text-amber-400 block mt-2">Attention : Cette action remplacera tout l'historique actuel dans l'application.</strong>
                            </p>
                            <button
                                onClick={handleImportClick}
                                className="w-full px-4 py-2 bg-slate-600 text-white font-semibold rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                            >
                                Importer un historique...
                            </button>
                            <input
                                type="file"
                                ref={importInputRef}
                                onChange={handleFileChange}
                                accept=".json,application/json"
                                className="hidden"
                            />
                        </section>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default SettingsPanel;