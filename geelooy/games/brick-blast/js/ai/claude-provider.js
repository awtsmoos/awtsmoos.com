// B"H
import { GRID_COLS, GRID_ROWS } from "../constants.js";
import { handleFetchError } from './error-handler.js';

const API_BASE_URL = "https://api.anthropic.com/v1";

/**
 * The Claude Oracle does not reveal its forms through a divine inquiry (API endpoint).
 * Instead, its forms are known through sacred texts (documentation). We present them here.
 * @param {string} apiKey The user's sacred key (unused but kept for interface consistency).
 * @returns {Promise<Array<{id: string, name: string}>>} A promise resolving to a hardcoded list of models.
 */
export async function fetchModels(apiKey) {
    // This is a list of known good models for this task as of creation.
    const models = [
        { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
    ];
    return Promise.resolve(models);
}

/**
 * Communes with the Claude AI to generate a level layout from a text prompt.
 * @param {string} prompt The user's theme or idea for the level.
 * @param {string} apiKey The user's sacred key.
 * @param {string} model The specific AI muse to invoke.
 * @returns {Promise<{name: string, layout: Array<Array<number>>}|null>} A promise that resolves to the new level data.
 */
export async function generateLevel(prompt, apiKey, model) {
    const url = `${API_BASE_URL}/messages`;
    const systemInstruction = `You are a level designer for a brick-breaker game. The game grid is exactly ${GRID_COLS} columns wide and can be up to ${GRID_ROWS} rows tall. You must generate a JSON object representing a level layout. The JSON object must have a single key: "layout". The value of "layout" must be a 2D array of numbers. Each row must have exactly ${GRID_COLS} columns. Each cell should be a positive integer for brick health or null for empty space. Health values should range from 10 to 500. Generate a creative, playable level. Your entire response must be ONLY the raw JSON object itself, starting with { and ending with }. Do not wrap it in markdown backticks, explanations, or any other text.`;

    const requestBody = {
        model,
        system: systemInstruction,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw await handleFetchError(response, url, requestBody);
        }

        const data = await response.json();
        const jsonString = data.content?.[0]?.text;
        if (!jsonString) throw new Error("Claude response was empty or in an unexpected format.");

        const parsed = JSON.parse(jsonString);
        return { name: prompt, layout: parsed.layout };

    } catch (error) {
        console.error("A disturbance in the divine communion with the Claude Oracle:", error);
        throw error;
    }
}