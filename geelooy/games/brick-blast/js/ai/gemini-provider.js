// B"H
import { GRID_COLS, GRID_ROWS } from "../constants.js";
import { handleFetchError } from './error-handler.js';

const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Queries the Gemini Oracle for a list of its available forms (models).
 * @param {string} apiKey The user's sacred key.
 * @returns {Promise<Array<{id: string, name: string}>>} A promise resolving to a list of models.
 */
export async function fetchModels(apiKey) {
    const url = `${API_BASE_URL}/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw await handleFetchError(response, url);
        }
        const data = await response.json();
        const models = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent") && m.name.includes("gemini"))
            .map(m => ({ id: m.name, name: m.displayName }));
        
        if (models.length === 0) {
            throw new Error("No compatible Gemini models found. Your key may not have access to the Generative Language API.");
        }
        return models;
    } catch (error) {
        console.error("Could not fetch the list of divine forms from Gemini:", error);
        throw error;
    }
}

/**
 * Communes with the Gemini AI to generate a level layout from a text prompt.
 * @param {string} prompt The user's theme or idea for the level.
 * @param {string} apiKey The user's sacred key.
 * @param {string} model The specific AI muse to invoke.
 * @returns {Promise<{name: string, layout: Array<Array<number>>}|null>} A promise that resolves to the new level data.
 */
export async function generateLevel(prompt, apiKey, model) {
    const url = `${API_BASE_URL}/${model}:generateContent?key=${apiKey}`;

    const systemInstruction = `You are a level designer for a brick-breaker game. The game grid is exactly ${GRID_COLS} columns wide and can be up to ${GRID_ROWS} rows tall. You must generate a JSON object representing a level layout. The JSON object must have a single key: "layout". The value of "layout" must be a 2D array of numbers. The array can have up to ${GRID_ROWS} rows. Each row must have exactly ${GRID_COLS} columns. Each cell in the array represents a brick. Use a positive integer for the brick's health. Use 0 or null for an empty space. The health values should be challenging but fair, ranging from 10 to 500 based on the user's prompt. Generate a creative and playable level. Your entire output must be ONLY the raw JSON object. Do not wrap it in markdown backticks or add any other text.`;

    const requestBody = {
        contents: [{ "parts": [{ "text": prompt }] }],
        systemInstruction: { "parts": [{ "text": systemInstruction }] },
        generationConfig: {
            "responseMimeType": "application/json",
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw await handleFetchError(response, url, requestBody);
        }

        const data = await response.json();
        const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonString) throw new Error("Gemini response was empty or in an unexpected format.");
        
        const parsed = JSON.parse(jsonString);
        return { name: prompt, layout: parsed.layout };
        
    } catch (error) {
        console.error("A disturbance in the divine communion with the Gemini Oracle:", error);
        throw error;
    }
}