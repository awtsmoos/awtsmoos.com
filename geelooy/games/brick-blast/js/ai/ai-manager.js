// B"H

import * as gemini from './gemini-provider.js';
import * as openai from './openai-provider.js';
import * as claude from './claude-provider.js';

/**
 * The Council of Oracles. This sacred map connects a simple identifier to the
 * provider's user-facing name, the URL to get an API key, and the module
 * that knows how to speak to it.
 */
export const PROVIDERS = {
    gemini: {
        name: 'Gemini',
        keyUrl: 'https://aistudio.google.com/app/apikey',
        module: gemini
    },
    openai: {
        name: 'OpenAI',
        keyUrl: 'https://platform.openai.com/api-keys',
        module: openai
    },
    claude: {
        name: 'Claude',
        keyUrl: 'https://console.anthropic.com/settings/keys',
        module: claude
    }
};

/**
 * Communes with the chosen Oracle to retrieve a list of its available forms (models).
 * @param {string} providerId The identifier of the AI provider (e.g., 'gemini').
 * @param {string} apiKey The sacred key for that provider.
 * @returns {Promise<Array<{id: string, name: string}>>} A promise resolving to a list of models.
 */
export async function fetchModels(providerId, apiKey) {
    const provider = PROVIDERS[providerId];
    if (!provider) throw new Error(`Unknown AI provider: ${providerId}`);
    return provider.module.fetchModels(apiKey);
}

/**
 * Communes with the chosen Oracle to generate a level from a prompt.
 * @param {string} providerId The identifier of the AI provider.
 * @param {string} prompt The user's creative request.
 * @param {string} apiKey The sacred key for that provider.
 * @param {string} model The specific model (form) of the Oracle to invoke.
 * @returns {Promise<object|null>} A promise resolving to the generated level data.
 */
export async function generateLevel(providerId, prompt, apiKey, model) {
    const provider = PROVIDERS[providerId];
    if (!provider) throw new Error(`Unknown AI provider: ${providerId}`);
    return provider.module.generateLevel(prompt, apiKey, model);
}