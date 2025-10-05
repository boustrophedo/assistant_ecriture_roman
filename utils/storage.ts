
import type { SessionState, HistoricExercise, StoredDocument, StoredDocumentWithText, BackupData } from '../types';
import { openDB, type IDBPDatabase } from 'idb';

const SESSION_KEY = 'writing_app_session';
const HISTORY_KEY = 'writing_app_history';
const DB_NAME = 'WritingAppDB';
const DOC_STORE_NAME = 'documents';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(DOC_STORE_NAME)) {
                    db.createObjectStore(DOC_STORE_NAME, { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}

// --- Document Library Management (IndexedDB) ---

export async function saveDocument(file: File, text: string): Promise<void> {
    const db = await getDb();
    const doc: StoredDocumentWithText = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        dateAdded: new Date().toISOString(),
        text: text
    };
    await db.put(DOC_STORE_NAME, doc);
}

export async function getAllDocuments(): Promise<StoredDocument[]> {
    const db = await getDb();
    const allDocs: StoredDocumentWithText[] = await db.getAll(DOC_STORE_NAME);
    // Ne retourne que les métadonnées pour ne pas charger tous les textes en mémoire
    return allDocs.map(({ text, ...meta }) => meta).sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
}

export async function getDocumentText(id: string): Promise<string | null> {
    const db = await getDb();
    const doc: StoredDocumentWithText = await db.get(DOC_STORE_NAME, id);
    return doc ? doc.text : null;
}

export async function deleteDocument(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(DOC_STORE_NAME, id);
}

// --- Data Import/Export ---

export async function getAllDocumentsWithText(): Promise<StoredDocumentWithText[]> {
    const db = await getDb();
    return await db.getAll(DOC_STORE_NAME);
}

async function clearDocuments(): Promise<void> {
    const db = await getDb();
    await db.clear(DOC_STORE_NAME);
}

export async function importData(data: BackupData): Promise<void> {
    // Valider la structure de base des données
    if (!data || !Array.isArray(data.history)) {
        throw new Error("Le fichier de sauvegarde est invalide, corrompu, ou ne contient pas d'historique.");
    }

    // 1. Vider l'historique actuel
    clearHistory();

    // 2. Importer le nouvel historique
    saveHistory(data.history);
}


// --- Session Management ---

export function saveSession(session: SessionState): void {
    try {
        const serializedState = JSON.stringify(session);
        localStorage.setItem(SESSION_KEY, serializedState);
    } catch (error) {
        console.error("Impossible de sauvegarder la session", error);
    }
}

export function loadSession(): SessionState | null {
    try {
        const serializedState = localStorage.getItem(SESSION_KEY);
        if (serializedState === null) {
            return null;
        }
        return JSON.parse(serializedState);
    } catch (error) {
        console.error("Impossible de charger la session", error);
        return null;
    }
}

export function clearSession(): void {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error("Impossible de supprimer la session", error);
    }
}

// --- History Management ---

export function getHistory(): HistoricExercise[] {
    try {
        const serializedHistory = localStorage.getItem(HISTORY_KEY);
        if (serializedHistory === null) {
            return [];
        }
        const history: HistoricExercise[] = JSON.parse(serializedHistory);
        // Trier par date la plus récente
        return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Impossible de récupérer l'historique", error);
        return [];
    }
}

function saveHistory(history: HistoricExercise[]): void {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Impossible de sauvegarder l'historique", error);
    }
}

export function saveToHistory(exercise: HistoricExercise): void {
    try {
        const history = getHistory();
        const newHistory = [exercise, ...history];
        saveHistory(newHistory);
    } catch (error) {
        console.error("Impossible de sauvegarder dans l'historique", error);
    }
}

export function clearHistory(): void {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Impossible de supprimer l'historique", error);
    }
}