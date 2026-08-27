// B"H
import { GRID_COLS, GRID_ROWS } from "../constants.js";
import { handleFetchError } from './error-handler.js';

const API_BASE_URL = "https://api.openai.com/v1";

/**
 * Queries the OpenAI Oracle for a list of its available forms (models).
 * @param {string} apiKey The user's sacred key.
 * @returns {Promise<Array<{id: string, name: string}>>} A promise resolving to a list of models.
 */
export async function fetchModels(apiKey) {
    const url = `${API_BASE_URL}/models`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) {
            throw await handleFetchError(response, url);
        }
        const data = await response.json();
        const models = data.data
            .filter(m => m.id.includes('gpt') && !m.id.includes('vision'))
            .map(m => ({ id: m.id, name: m.id }))
            .sort((a,b) => b.name.localeCompare(a.name)); // Best models first
        
        if (models.length === 0) {
            throw new Error("No compatible OpenAI models found. Your key may be invalid or lack permissions.");
        }
        return models;
    } catch (error) {
        console.error("Could not fetch the list of divine forms from OpenAI:", error);
        throw error;
    }
}

/**
 * Communes with the OpenAI AI to generate a level layout from a text prompt.
 * @param {string} prompt The user's theme or idea for the level.
 * @param {string} apiKey The user's sacred key.
 * @param {string} model The specific AI muse to invoke.
 * @returns {Promise<{name: string, layout: Array<Array<number>>}|null>} A promise that resolves to the new level data.
 */
export async function generateLevel(prompt, apiKey, model) {
    const url = `${API_BASE_URL}/chat/completions`;
    const systemInstruction = `You are a level designer for a brick-breaker game. The game grid is exactly ${GRID_COLS} columns wide and can be up to ${GRID_ROWS} rows tall. You must generate a JSON object. This JSON object must have a single key: "layout". The value of "layout" must be a 2D array of numbers. Each row must have exactly ${GRID_COLS} columns. Use a positive integer for a brick's health, and null for empty space. Health values should range from 10 to 500. Generate a creative level based on the user's theme. Your entire output must be ONLY the raw JSON object. You MUST use JSON mode.`;

    const requestBody = {
        model,
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw await handleFetchError(response, url, requestBody);
        }

        const data = await response.json();
        const jsonString = data.choices?.[0]?.message?.content;
        if (!jsonString) throw new Error("OpenAI response was empty or in an unexpected format.");

        const parsed = JSON.parse(jsonString);
        return { name: prompt, layout: parsed.layout };

    } catch (error) {
        console.error("A disturbance in the divine communion with the OpenAI Oracle:", error);
        throw error;
    }
}