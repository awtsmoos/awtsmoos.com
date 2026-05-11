
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

        const allModels = [];

        // Parallel harvest across all dimensions
        const harvests = keys.map(async (keyObj) => {
            try {
                let fetched = [];
                if (keyObj.provider === 'google') {
                    fetched = await VibeAPI.fetchGoogleModels(keyObj.key);
                } else {
                    fetched = await VibeAPI.fetchOpenRouterModels(keyObj.key);
                }

                // Tag each model with the key that provided it
                const tagged = fetched.map(m => ({
                    ...m,
                    keyId: keyObj.id,
                    can_do_tools: AgentCapabilities.supportsTools(m),
                    is_reasoning: AgentCapabilities.isReasoning(m)
                }));

                allModels.push(...tagged);
            } catch (e) {
                console.warn(`[Harvester] B"H - Dimension ${keyObj.label} is currently silent:`, e.message);
            }
        });

        await Promise.all(harvests);

        // Sort by name for aesthetic harmony
        allModels.sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        ModelRegistry.setAll(allModels);
        return allModels;
    }
};
