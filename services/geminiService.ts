import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisBlock, AnalysisResult, HistoricExercise, PersonalizedFeedback } from '../types';

if (!process.env.API_KEY) {
    throw new Error("La variable d'environnement API_KEY n'est pas définie.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface SceneExtractionResult {
    extractedScene: string;
    writingPrompt: string;
}

/**
 * Extracts a scene from a document and generates a writing prompt.
 * @param documentText The full text of the user's document.
 * @param topic (Optional) A specific skill or theme the user wants to work on.
 * @returns An object containing the extracted scene and the writing prompt.
 */
export async function extractSceneAndGeneratePrompt(documentText: string, topic?: string): Promise<SceneExtractionResult> {
    const topicInstruction = topic 
        ? `L'utilisateur souhaite travailler spécifiquement sur le point suivant : "${topic}". Lors de la sélection de la scène, choisissez-en une qui est particulièrement pertinente pour pratiquer cette compétence. La consigne d'écriture que vous créerez doit également être orientée vers cet objectif.`
        : `L'utilisateur a choisi un exercice "aléatoire". Sélectionnez une scène narrativement significative qui offre un bon potentiel général pour un exercice de réécriture, sans vous focaliser sur un point technique précis.`;
    
    const prompt = `
        Vous êtes un analyste littéraire expert spécialisé dans la fiction pour jeunes adultes. Votre tâche est d'analyser le texte fourni, d'en extraire une scène courte et convaincante, et de créer une consigne d'écriture basée sur celle-ci.
        ${topicInstruction}

        Suivez précisément ces étapes :
        1. Lisez l'intégralité du document fourni par l'utilisateur.
        2. Identifiez une scène autonome d'environ 6-7 lignes. Cette scène doit être narrativement significative et offrir un bon potentiel pour un exercice d'écriture.
        3. Extrayez cette scène mot pour mot.
        4. À partir de la scène extraite, créez une consigne d'écriture pour l'utilisateur. La consigne doit guider l'utilisateur pour réécrire la scène.
        5. La consigne DOIT être précise sur le contexte (ce qui se passe, qui est là), l'objectif narratif (ce qui doit être transmis) et le ton stylistique (par exemple, tendu, mystérieux, rapide), MAIS elle NE DOIT PAS utiliser la formulation originale ni révéler la phraséologie exacte. Elle doit inspirer l'utilisateur à trouver sa propre manière de l'écrire.
        6. Retournez votre sortie sous la forme d'un seul objet JSON. N'incluez aucun texte en dehors de cet objet JSON.

        Le document de l'utilisateur est :
        ---
        ${documentText}
        ---
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "Tu es un assistant littéraire expert. Toute ta communication et le contenu que tu génères doivent être exclusivement en français.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    extractedScene: {
                        type: Type.STRING,
                        description: "La scène de 6-7 lignes extraite mot pour mot du texte."
                    },
                    writingPrompt: {
                        type: Type.STRING,
                        description: "La consigne d'écriture pour l'utilisateur, basée sur la scène."
                    }
                }
            }
        }
    });
    
    return JSON.parse(response.text);
}


/**
 * Analyzes and compares two texts: an original and a user's version.
 * @param originalText The original scene.
 * @param userText The user's rewritten scene.
 * @param targetedSkill (Optionnel) La compétence spécifique que l'exercice visait à améliorer.
 * @returns An object containing the synthesis and an array of analysis blocks.
 */
export async function analyzeTexts(originalText: string, userText: string, targetedSkill?: string): Promise<AnalysisResult> {
    const targetedSkillPrompt = targetedSkill
    ? `L'utilisateur vient de terminer un micro-exercice ciblant spécifiquement la compétence suivante : "${targetedSkill}". Dans votre analyse, portez une attention PARTICULIÈRE à ce point. Indiquez clairement si l'objectif a été atteint et comment.`
    : '';
    
    const prompt = `
        Vous êtes un analyste d'écriture froid, objectif et pédagogue. Votre tâche est de comparer systématiquement un texte écrit par un utilisateur à un texte original et de fournir une analyse structurée et actionnable.
        ${targetedSkillPrompt}

        Suivez rigoureusement ces instructions :
        1.  **Synthèse d'Abord** : Créez un objet 'synthesis' avec 'summary' (résumé) et 'mainAxis' (axe principal d'amélioration). Si l'exercice était ciblé, mentionnez la réussite de l'objectif dans la synthèse.
        2.  **Analyse Détaillée en Blocs** : Créez un tableau 'blocks' d'objets d'analyse, chacun avec un titre, un contenu et une catégorie ('VOICE', 'STRUCTURE', 'VOCABULARY', 'RHYTHM', 'OTHER').
        3.  **Analyse Neutre** : Restez neutre. Ne félicitez pas. Concentrez-vous sur les différences.
        4.  **Utilisation de Verbatims** : Dans le contenu de chaque bloc, illustrez vos points avec des extraits courts en utilisant les balises \`[ORIGINAL]extrait[/ORIGINAL]\` et \`[USER]extrait[/USER]\`.
        5.  **Suggestion Actionnable (Optionnel)** : Pour les blocs où c'est pertinent (surtout 'VOCABULARY' ou 'STRUCTURE'), vous POUVEZ ajouter un objet 'suggestion'. Si vous l'ajoutez, il DOIT contenir :
            - \`originalFragment\` (chaîne) : Un court extrait EXACT du texte de l'utilisateur (2 à 10 mots) que vous suggérez de changer.
            - \`suggestedFragment\` (chaîne) : Votre proposition de réécriture pour ce fragment spécifique.
            - N'ajoutez cet objet 'suggestion' que si vous avez une alternative claire et pédagogique à proposer. Ne l'inventez pas si ce n'est pas nécessaire.
        6.  **Formatage du Contenu** : Utilisez des listes à puces (commençant par '-') dans le contenu des blocs.
        7.  **Sortie JSON Unique** : Votre sortie entière doit être un seul objet JSON.

        Voici les textes :
        --- TEXTE ORIGINAL ---
        ${originalText}
        --- FIN DU TEXTE ORIGINAL ---
        --- TEXTE DE L'UTILISATEUR ---
        ${userText}
        --- FIN DU TEXTE DE L'UTILISATEUR ---
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "Tu es un assistant littéraire expert. Toute ta communication et le contenu que tu génères doivent être exclusivement en français.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    synthesis: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            mainAxis: { type: Type.STRING }
                        },
                        required: ['summary', 'mainAxis']
                    },
                    blocks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                content: { type: Type.STRING },
                                category: { type: Type.STRING },
                                suggestion: {
                                    type: Type.OBJECT,
                                    properties: {
                                        originalFragment: { type: Type.STRING },
                                        suggestedFragment: { type: Type.STRING }
                                    },
                                    required: ['originalFragment', 'suggestedFragment']
                                }
                            },
                            required: ['title', 'content', 'category']
                        }
                    }
                },
                required: ['synthesis', 'blocks']
            }
        }
    });

    return JSON.parse(response.text);
}


/**
 * Analyzes the user's entire exercise history to provide personalized feedback.
 * @param history An array of all past exercises.
 * @returns A personalized feedback object with a diagnostic, exercises, and lessons.
 */
export async function getPersonalizedFeedbackAndExercises(history: HistoricExercise[]): Promise<PersonalizedFeedback> {
    const simplifiedHistory = history.map(h => ({
        prompt: h.prompt,
        mainAxis: h.analysis.synthesis.mainAxis,
        categories: h.analysis.blocks.map(b => b.category),
    }));

    const prompt = `
        Tu es un tuteur d'écriture IA, bienveillant et perspicace. Ton rôle est d'analyser l'historique d'exercices d'un utilisateur pour identifier ses schémas d'écriture et lui proposer un entraînement personnalisé.

        Voici l'historique simplifié des exercices de l'utilisateur :
        ---
        ${JSON.stringify(simplifiedHistory, null, 2)}
        ---

        Suis ces étapes pour générer une réponse au format JSON :

        1.  **Diagnostic (diagnostic)** : Rédige un paragraphe (2-4 phrases) qui identifie 1 ou 2 tendances claires (une force et/ou une faiblesse récurrente). Sois encourageant mais direct. Exemple : "J'ai remarqué que vous excellez à créer des descriptions immersives. Cependant, vos dialogues manquent parfois de sous-texte, révélant trop directement les intentions des personnages."

        2.  **Micro-Exercices (exercises)** : Propose DEUX micro-exercices. Chaque exercice doit cibler une faiblesse identifiée ou renforcer une compétence. Pour chaque exercice, fournis :
            - \`title\`: Un titre accrocheur (ex: "L'art du non-dit").
            - \`description\`: Une phrase expliquant l'objectif.
            - \`skill\`: La compétence clé travaillée (ex: "Écrire du dialogue avec sous-texte").
            - \`baseText\`: Un court texte de 2-3 phrases servant de point de départ.
            - \`prompt\`: Une consigne claire et concise pour réécrire ou continuer le \`baseText\`.

        3.  **Leçons Ciblées (lessons)** : Propose UNE leçon ciblée. La leçon doit expliquer un concept lié au diagnostic. Pour la leçon, fournis :
            - \`title\`: Un titre clair (ex: "Le 'Montrer, ne pas dire' appliqué aux émotions").
            - \`skill\`: La compétence clé expliquée.
            - \`content\`: Un texte de 150-200 mots qui explique le concept de manière pédagogique, avec un exemple simple "avant/après".

        Assure-toi que ta sortie est un unique objet JSON valide, sans texte additionnel.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "Tu es un tuteur d'écriture expert. Toute ta communication et le contenu que tu génères doivent être exclusivement en français.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    diagnostic: { type: Type.STRING },
                    exercises: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                skill: { type: Type.STRING },
                                baseText: { type: Type.STRING },
                                prompt: { type: Type.STRING }
                            },
                            required: ["title", "description", "skill", "baseText", "prompt"]
                        }
                    },
                    lessons: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                skill: { type: Type.STRING },
                                content: { type: Type.STRING }
                            },
                            required: ["title", "skill", "content"]
                        }
                    }
                },
                required: ["diagnostic", "exercises", "lessons"]
            }
        }
    });

    return JSON.parse(response.text);
}