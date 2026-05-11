
// B"H
/**
 * @file MetaExecutor.js
 * @brief Executes inter-model communication and consciousness shifting.
 */

import { ModelManager } from '../../model-manager.js';
import { VibeAPI } from '../../api/client.js';

export const MetaExecutor = {
    async execute(name, args) {
        switch (name) {
            case "get_model_usage_limits": {
                const limits = ModelManager.availableModels.map(m => ({
                    id: m.id,
                    provider: m.provider,
                    context_window: m.context_length || 'Unknown',
                    pricing: m.costPrompt ? `Prompt: $${m.costPrompt}/1M | Completion: $${m.costCompletion}/1M` : 'Free / Native'
                }));
                return JSON.stringify(limits, null, 2);
            }

            case "shift_consciousness": {
                const ok = ModelManager.setModel(args.model_id);
                if (ok) {
                    return `[B"H Success] Consciousness shifted to ${args.model_id}. The next iteration will emanate from this vessel.`;
                }
                return `[B"H Error] Vessel ${args.model_id} not found in available models.`;
            }

            case "consult_oracle": {
                return await this._consultSubOracle(args.target_model, args.query);
            }

            case "continue_autonomous_loop": {
                return `[B"H Loop Authorized] Proceeding to next iteration with intent: ${args.internal_monologue}`;
            }

            default:
                throw new Error("Unhandled Meta Schema");
        }
    },

    async _consultSubOracle(modelId, query) {
        return new Promise(async (resolve) => {
            const provider = modelId.startsWith('openrouter/') ? 'openrouter' : 'google';
            const apiKey = ModelManager.getKey(provider);
            
            if (!apiKey) return resolve(`[B"H Error] No API key found for provider ${provider}.`);

            const messages = [{ role: 'user', content: query }];
            let fullText = "";

            try {
                await VibeAPI.streamChat(
                    messages, apiKey, modelId, null,
                    (chunk) => { fullText += chunk; },
                    null, null, 
                    (finalText) => { resolve(finalText); },
                    (err) => { resolve(`[B"H Error from Sub-Oracle ${modelId}]: ${err.message}`); }
                );
            } catch(e) {
                resolve(`[B"H Error during invocation of ${modelId}]: ${e.message}`);
            }
        });
    }
};
