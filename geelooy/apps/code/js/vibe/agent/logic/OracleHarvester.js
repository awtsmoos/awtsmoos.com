
// B"H
/**
 * @file OracleHarvester.js
 * @brief The Gatherer of Dimensional Capacity.
 */

import { KeyRegistry } from '../state/KeyRegistry.js';
import { ModelRegistry } from '../state/ModelRegistry.js';
import { AgentCapabilities } from './AgentCapabilities.js';

export const OracleHarvester = {
    /**
     * B"H
     * Reaches out to all registered providers and aggregates their models.
     */
    async harvest() {
        const keys = KeyRegistry.getAll();
        const { VibeAPI } = await import('../../api/client.js');
        
        console.log(`[Harvester] B"H - Initiating harvest across ${keys.length} keys.`);

        const modelMap = new Map();

        // Parallel harvest across all dimensions
        const harvests = keys.map(async (keyObj) => {
            try {
                let fetched = [];
                if (keyObj.provider === 'google') {
                    fetched = await VibeAPI.fetchGoogleModels(keyObj.key);
                } else if (keyObj.provider === 'openrouter') {
                    fetched = await VibeAPI.fetchOpenRouterModels(keyObj.key);
                } else if (keyObj.provider === 'groq') {
                    fetched = await VibeAPI.fetchGroqModels(keyObj.key);
                } else if (keyObj.provider === 'cerebras') {
                    fetched = await VibeAPI.fetchCerebrasModels(keyObj.key);
                } else if (keyObj.provider === 'openai') {
                    fetched = await VibeAPI.fetchOpenAIModels(keyObj.key);
                } else if (keyObj.provider === 'xai') {
                    fetched = await VibeAPI.fetchXAIModels(keyObj.key);
                } else if (keyObj.provider === 'together') {
                    fetched = await VibeAPI.fetchTogetherModels(keyObj.key);
                } else {
                    throw new Error(`Unsupported provider: ${keyObj.provider}`);
                }

                // Tag each model with the key that provided it
                const tagged = fetched.map(m => ({
                    ...m,
                    keyId: keyObj.id,
                    can_do_tools: AgentCapabilities.supportsTools(m),
                    is_reasoning: AgentCapabilities.isReasoning(m)
                }));

                tagged.forEach(model => {
                    const existing = modelMap.get(model.id);
                    if (!existing || (keyObj.addedAt || 0) > (existing._addedAt || 0)) {
                        modelMap.set(model.id, { ...model, _addedAt: keyObj.addedAt || 0 });
                    }
                });
            } catch (e) {
                console.warn(`[Harvester] B"H - Dimension ${keyObj.label} is currently silent:`, e.message);
            }
        });

        await Promise.all(harvests);

        const allModels = Array.from(modelMap.values()).map(({ _addedAt, ...model }) => model);
        allModels.sort((a, b) => AgentCapabilities.compareModels(a, b));
        
        ModelRegistry.setAll(allModels);
        return allModels;
    }
};
