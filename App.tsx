

import React, { useState, useCallback, useEffect } from 'react';
import type { AppState, AnalysisResult, SessionState, HistoricExercise, MicroExercise, PersonalizedFeedback, StoredDocument, ExerciseMode, BackupData } from './types';
import { extractSceneAndGeneratePrompt, analyzeTexts, getPersonalizedFeedbackAndExercises } from './services/geminiService';
import { saveSession, loadSession, clearSession, saveToHistory, getHistory, clearHistory, getAllDocuments, saveDocument, deleteDocument, getDocumentText, getAllDocumentsWithText, importData } from './utils/storage';

// Composants
import Spinner from './components/Spinner';
import Welcome from './components/Welcome';
import FileUpload from './components/FileUpload';
import DocumentSelector from './components/DocumentSelector';
import LibraryPanel from './components/LibraryPanel';
import PromptDisplay from './components/PromptDisplay';
import WritingInterface from './components/WritingInterface';
import ResultsView from './components/ResultsView';
import HistoryPanel from './components/HistoryPanel';
import ProgressDashboard from './components/ProgressDashboard';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { HistoryIcon, ProgressIcon, LibraryIcon, SettingsIcon } from './components/Icons';

const App: React.FC = () => {
    // App flow state
    const [appState, setAppState] = useState<AppState>('WELCOME');
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string>('');

    // Exercise context
    const [exerciseMode, setExerciseMode] = useState<ExerciseMode | null>(null);
    const [customTopic, setCustomTopic] = useState<string>('');
    const [selectedDocumentText, setSelectedDocumentText] = useState<string>('');
    
    // Exercise data
    const [extractedScene, setExtractedScene] = useState<string>('');
    const [writingPrompt, setWritingPrompt] = useState<string>('');
    const [userText, setUserText] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [targetedExercise, setTargetedExercise] = useState<MicroExercise | undefined>(undefined);
    
    // Panels visibility
    const [showHistory, setShowHistory] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Data stores
    const [history, setHistory] = useState<HistoricExercise[]>([]);
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [personalizedFeedback, setPersonalizedFeedback] = useState<PersonalizedFeedback | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    
    const loadData = useCallback(async () => {
        try {
            setHistory(getHistory());
            setDocuments(await getAllDocuments());
        } catch (e) {
            console.error("Erreur de chargement des documents:", e);
            setError("Impossible de charger la bibliothèque de documents. Votre navigateur est peut-être en mode privé ou bloque l'accès au stockage local.");
        }
    }, []);

    useEffect(() => {
        const savedSession = loadSession();
        if (savedSession && savedSession.appState !== 'WELCOME') {
            setAppState(savedSession.appState);
            setExerciseMode(savedSession.exerciseMode);
            setCustomTopic(savedSession.customTopic);
            setSelectedDocumentText(savedSession.selectedDocumentText);
            setExtractedScene(savedSession.extractedScene);
            setWritingPrompt(savedSession.writingPrompt);
            setUserText(savedSession.userText);
            setAnalysisResult(savedSession.analysisResult);
            setTargetedExercise(savedSession.targetedExercise);
            setToastMessage("Session précédente restaurée.");
        }
        loadData();
    }, [loadData]);

    useEffect(() => {
        const session: SessionState = { appState, exerciseMode, customTopic, selectedDocumentText, extractedScene, writingPrompt, userText, analysisResult, targetedExercise };
        if (appState !== 'WELCOME') {
            saveSession(session);
        }
    }, [appState, exerciseMode, customTopic, selectedDocumentText, extractedScene, writingPrompt, userText, analysisResult, targetedExercise]);

    const handleFetchFeedback = useCallback(async () => {
        if (history.length === 0) { setPersonalizedFeedback(null); return; }
        setIsFeedbackLoading(true); setError(null);
        try {
            const result = await getPersonalizedFeedbackAndExercises(history);
            setPersonalizedFeedback(result);
        } catch (e) { console.error("Erreur de génération de feedback:", e); if (!error) setError("Impossible de générer le plan d'entraînement. Veuillez réessayer."); } 
        finally { setIsFeedbackLoading(false); }
    }, [history, error]);

    const handleStartExerciseFlow = useCallback(async (text: string) => {
        setAppState('GENERATING_PROMPT');
        setError(null);
        try {
            let topic: string | undefined = undefined;
            if (exerciseMode === 'profile') {
                if (history.length > 0) {
                    const feedback = await getPersonalizedFeedbackAndExercises(history);
                    topic = feedback.exercises[0]?.skill;
                    setToastMessage(topic ? `Entraînement ciblé sur : "${topic}"` : "Aucune compétence claire à cibler, exercice aléatoire lancé.");
                } else {
                    setToastMessage("Mode 'Ciblé' indisponible (historique vide), passage en mode 'Aléatoire'.");
                }
            } else if (exerciseMode === 'custom') {
                topic = customTopic;
            }
            const { extractedScene, writingPrompt } = await extractSceneAndGeneratePrompt(text, topic);
            setExtractedScene(extractedScene); 
            setWritingPrompt(writingPrompt); 
            setAppState('WRITING');
        } catch (e: any) { 
            console.error("Erreur de traitement:", e); 
            setError("Une erreur est survenue lors de l'analyse du document. Veuillez réessayer."); 
            setAppState('SELECTING_DOCUMENT');
        }
    }, [exerciseMode, customTopic, history]);

    const handleDocumentSelected = useCallback(async (docId: string) => {
        const text = await getDocumentText(docId);
        if (text) {
            setSelectedDocumentText(text);
            await handleStartExerciseFlow(text);
        } else {
            setError("Impossible de charger le contenu du document.");
            setAppState('SELECTING_DOCUMENT');
        }
    }, [handleStartExerciseFlow]);

    const handleFileUploaded = useCallback(async (file: File) => {
        setAppState('SAVING_DOCUMENT');
        setError(null);
        const isLibraryUpload = exerciseMode === null;
        let text = '';

        try {
            if (file.type === 'application/pdf') {
                const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                text = (await Promise.all(Array.from({ length: pdf.numPages }, async (_, i) => {
                    const page = await pdf.getPage(i + 1);
                    const content = await page.getTextContent();
                    return content.items.map((item: any) => item.str).join(' ');
                }))).join('\n\n');
            } else { text = await file.text(); }

            if (!text.trim()) { 
                setError("Le document est vide."); 
                setAppState(exerciseMode ? 'SELECTING_DOCUMENT' : 'WELCOME');
                if (isLibraryUpload) setShowLibrary(true);
                return; 
            }
            
            await saveDocument(file, text);
            setDocuments(await getAllDocuments());
            setToastMessage(`"${file.name}" a été ajouté à votre bibliothèque.`);

            if (exerciseMode) {
                setSelectedDocumentText(text);
                await handleStartExerciseFlow(text);
            } else {
                setAppState('WELCOME');
                if (isLibraryUpload) { setShowLibrary(true); }
            }
        } catch (e) {
            console.error("Erreur d'upload:", e);
            setError("Erreur lors de la lecture ou sauvegarde du fichier.");
            setAppState(exerciseMode ? 'SELECTING_DOCUMENT' : 'WELCOME');
            if (isLibraryUpload) { setShowLibrary(true); }
        }
    }, [exerciseMode, handleStartExerciseFlow]);


    const handleUserTextSubmit = useCallback(async (text: string) => {
        setUserText(text); setAppState('ANALYZING'); setError(null);
        try {
            const original = appState === 'WRITING_TARGETED_EXERCISE' ? targetedExercise!.baseText : extractedScene;
            const prompt = appState === 'WRITING_TARGETED_EXERCISE' ? targetedExercise!.prompt : writingPrompt;
            const skill = appState === 'WRITING_TARGETED_EXERCISE' ? targetedExercise!.skill : undefined;
            const analysis = await analyzeTexts(original, text, skill);
            setAnalysisResult(analysis); 
            setAppState('SHOWING_ANALYSIS');
            const newExercise: HistoricExercise = { id: new Date().toISOString(), date: new Date().toISOString(), prompt, originalText: original, userText: text, analysis, type: skill ? 'targeted' : 'standard', targetedSkill: skill };
            saveToHistory(newExercise);
            setHistory(getHistory());
        } catch (e) { console.error(e); setError("Une erreur est survenue lors de l'analyse. Veuillez réessayer."); setAppState('WRITING'); }
    }, [extractedScene, writingPrompt, targetedExercise, appState]);

    const handleStartTargetedExercise = useCallback((exercise: MicroExercise) => {
        setTargetedExercise(exercise);
        setWritingPrompt(exercise.prompt);
        setExtractedScene(exercise.baseText);
        setUserText(exercise.baseText);
        setAnalysisResult(null); setError(null);
        setAppState('WRITING_TARGETED_EXERCISE');
        setShowProgress(false);
    }, []);

    const startMode = (mode: ExerciseMode, topic = '') => {
        setExerciseMode(mode);
        setCustomTopic(topic);
        setAppState('SELECTING_DOCUMENT');
    };

    const handleReset = () => { 
        setAppState('WELCOME');
        setError(null); setExtractedScene(''); setWritingPrompt(''); setUserText(''); setAnalysisResult(null);
        setTargetedExercise(undefined); setExerciseMode(null); setCustomTopic(''); setSelectedDocumentText('');
        clearSession();
    };

    const handleRewrite = () => { setAppState(targetedExercise ? 'WRITING_TARGETED_EXERCISE' : 'WRITING'); setError(null); setAnalysisResult(null); };

    const handleSelectHistoryItem = (exercise: HistoricExercise) => {
        setExtractedScene(exercise.originalText); setWritingPrompt(exercise.prompt); setUserText(exercise.userText); setAnalysisResult(exercise.analysis);
        if (exercise.type === 'targeted') {
            setTargetedExercise({ title: `Exercice sur : ${exercise.targetedSkill}`, description: '', skill: exercise.targetedSkill || '', baseText: exercise.originalText, prompt: exercise.prompt });
        } else { setTargetedExercise(undefined); }
        setAppState('SHOWING_ANALYSIS'); setShowHistory(false);
    }
    
    const handleClearHistory = () => { clearHistory(); setHistory([]); setPersonalizedFeedback(null); };

    const handleDeleteDocument = async (id: string) => { await deleteDocument(id); setDocuments(await getAllDocuments()); setToastMessage("Document supprimé."); };

    const handleBackToWelcome = () => { setAppState('WELCOME'); setError(null); setExerciseMode(null); setCustomTopic(''); };

    const handleBackToSelection = () => { setAppState('SELECTING_DOCUMENT'); setError(null); };

    const handleExportData = async () => {
        try {
            const historyData = getHistory();
            const backupData: BackupData = {
                history: historyData,
            };
            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `assistant-ecriture-historique-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setToastMessage("Historique exporté avec succès !");
        } catch (e) {
            console.error("Erreur d'exportation:", e);
            setError("Une erreur est survenue lors de l'exportation de l'historique.");
        }
    };
    
    const handleImportData = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const data: BackupData = JSON.parse(content);
    
                if (window.confirm("Êtes-vous sûr de vouloir importer cet historique ? Tout l'historique actuel sera remplacé. Cette action est irréversible.")) {
                    await importData(data);
                    await loadData(); // Recharger les données dans l'état de l'application
                    setShowSettings(false);
                    setToastMessage("Historique importé avec succès !");
                }
            } catch (e: any) {
                console.error("Erreur d'importation:", e);
                setError(`Erreur lors de l'importation : ${e.message || 'Le fichier est peut-être invalide.'}`);
            }
        };
        reader.readAsText(file);
    };

    const renderContent = () => {
        switch (appState) {
            case 'WELCOME': 
                return <Welcome onStartRandom={() => startMode('random')} onStartFromProfile={() => startMode('profile')} onStartFromDocument={(topic) => startMode('custom', topic)} history={history} />;
            case 'SELECTING_DOCUMENT':
                return <DocumentSelector documents={documents} onSelect={handleDocumentSelected} onUploadRequest={() => setAppState('UPLOADING')} exerciseMode={exerciseMode} onBack={handleBackToWelcome} />;
            case 'UPLOADING':
                const handleUploadBack = () => setAppState(exerciseMode ? 'SELECTING_DOCUMENT' : 'WELCOME');
                return <FileUpload onFileSelect={handleFileUploaded} mode={exerciseMode} onBack={handleUploadBack} />;
            case 'SAVING_DOCUMENT':
                return <Spinner messages={["Sauvegarde de votre document..."]} />;
            case 'GENERATING_PROMPT': 
                return <Spinner messages={["Lecture de votre document...", "Identification des scènes clés...", "Création de votre consigne..."]} onCancel={handleBackToSelection} />;
            case 'WRITING':
            case 'WRITING_TARGETED_EXERCISE':
                return (<div className="space-y-8"><PromptDisplay prompt={writingPrompt} /><WritingInterface onSubmit={handleUserTextSubmit} onCancel={handleBackToSelection} initialText={userText} /></div>);
            case 'ANALYZING': 
                const handleAnalysisCancel = () => setAppState(targetedExercise ? 'WRITING_TARGETED_EXERCISE' : 'WRITING');
                return <Spinner messages={["Lecture de votre version...", "Comparaison avec l'original...", "Construction de l'analyse..."]} onCancel={handleAnalysisCancel} />;
            case 'SHOWING_ANALYSIS': 
                return (extractedScene && userText && analysisResult && <ResultsView prompt={writingPrompt} originalText={extractedScene} userText={userText} analysis={analysisResult} onReset={handleReset} onRewrite={handleRewrite} />);
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }`}</style>
            <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
            
            <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} history={history} onSelect={handleSelectHistoryItem} onClear={handleClearHistory} />
            <ProgressDashboard isOpen={showProgress} onClose={() => setShowProgress(false)} history={history} onStartExercise={handleStartTargetedExercise} feedback={personalizedFeedback} isLoading={isFeedbackLoading} onFetch={handleFetchFeedback} />
            <LibraryPanel isOpen={showLibrary} onClose={() => setShowLibrary(false)} documents={documents} onDelete={handleDeleteDocument} onAddRequest={() => { setShowLibrary(false); setAppState('UPLOADING'); setExerciseMode(null); }} />
            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} onExport={handleExportData} onImport={handleImportData} />

            <header className="text-center mb-12 relative">
                {appState === 'WELCOME' ? (
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                        Assistant d'Écriture de Roman
                    </h1>
                ) : (
                    <button onClick={handleReset} className="border-none bg-transparent p-0 cursor-pointer w-full">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight transition-colors hover:text-indigo-700 dark:hover:text-indigo-400">
                            Assistant d'Écriture de Roman
                        </h1>
                    </button>
                )}
                <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400">Affinez votre style en réécrivant des scènes clés de vos textes avec l'aide de l'IA.</p>
                <div className="absolute top-0 right-0 flex items-center space-x-2">
                     <button onClick={() => setShowLibrary(true)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors" aria-label="Gérer la bibliothèque de documents"><LibraryIcon /></button>
                     <button onClick={() => setShowProgress(true)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors" aria-label="Voir le tableau de bord de progrès"><ProgressIcon /></button>
                     <button onClick={() => setShowHistory(true)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors" aria-label="Voir l'historique des exercices"><HistoryIcon /></button>
                     <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors" aria-label="Ouvrir les paramètres et la gestion des données"><SettingsIcon /></button>
                 </div>
            </header>
            <main>
                {error && (<div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert"><strong className="font-bold">Erreur : </strong><span className="block sm:inline">{error}</span><button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Fermer"><span className="text-xl">×</span></button></div>)}
                {renderContent()}
            </main>
        </div>
    );
};

export default App;