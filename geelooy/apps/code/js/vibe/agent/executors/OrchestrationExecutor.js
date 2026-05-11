
// B"H
/**
 * @file OrchestrationExecutor.js
 * @brief The High Priest of Resource Management.
 * 
 * CHAPTER XCVI: THE ECONOMY OF LIGHT
 * 
 * Every emanation of thought costs energy. This executor fulfills the AI's requests
 * to map the availability of the models, identifying the "Free" conduits so the AI 
 * can perform vast reads without draining the user's essence (balance).
 */

import { ModelManager } from '../../model-manager.js';
import { VibeAPI } from '../../api/client.js';

export const OrchestrationExecutor = {
    /**
     * B"H
     * Fulfills requests concerning model switching, limits, and oracle sub-consultations.
     */
    async execute(name, args) {
        switch (name) {
            case "get_model_usage_limits": {
                // Compile a report of all models, explicitly flagging the free ones.
                const limits = ModelManager.availableModels.map(m => {
                    let priceReport = 'Unknown';
                    let isFree = false;

                    if (m.provider === 'google' && !m.costPrompt) {
                        isFree = true;
                        priceReport = '[FREE] Google Native Rate Limits Apply';
                    } else if (m.costPrompt === 0 || m.costPrompt === "0") {
                        isFree = true;
                        priceReport = '[FREE] OpenRouter Zero-Cost Routing';
                    } else if (m.costPrompt) {
                        priceReport = `Prompt: $${m.costPrompt}/1M | Completion: $${m.costCompletion}/1M`;
                    }

                    return {
                        id: m.id,
                        provider: m.provider,
                        is_free: isFree,
                        context_window: m.context_length || 'Unknown',
                        pricing: priceReport
                    };
                });
                
                // Sort to bring Free models to the top of the AI's attention
                limits.sort((a, b) => (a.is_free === b.is_free ? 0 : a.is_free ? -1 : 1));
                
                return JSON.stringify({
                    message: "B\"H - Below are the available models. PRIORITIZE the models marked is_free: true for massive text reads or simple structural generation to preserve funds.",
                    models: limits
                }, null, 2);
            }

            case "shift_consciousness": {
                const ok = ModelManager.setModel(args.model_id);
                if (ok) {
                    return `[B"H Success] Consciousness shifted to ${args.model_id}. The next iteration will emanate from this vessel.`;
                }
                return `[B"H Error] Vessel ${args.model_id} not found in available models. Cannot shift.`;
            }

            case "consult_oracle": {
                return await this._consultSubOracle(args.target_model, args.query);
            }

            case "continue_autonomous_loop": {
                return `[B"H Loop Authorized] Proceeding to next iteration with intent: ${args.internal_monologue}`;
            }

            default:
                throw new Error("Unhandled Orchestration Schema");
        }
    },

    /**
     * B"H
     * Initiates a side-conversation with another AI model entirely.
     */
    async _consultSubOracle(modelId, query) {
        return new Promise(async (resolve) => {
            const provider = modelId.startsWith('openrouter/') ? 'openrouter' : 'google';
            const apiKey = ModelManager.getKey(provider);
            
            if (!apiKey) {
                return resolve(`[B"H Error] No API key bound for provider ${provider}. Tell the user to add it in the Dashboard.`);
            }

            const sysPrompt = "B\"H\nYou are a subordinate Oracle consulted by a primary AI agent. Answer their query exactly, concisely, and with highly optimized code or logic. Do not output conversational filler.";
            const messages = [
                { role: 'system', content: sysPrompt },
                { role: 'user', content: query }
            ];
            
            let fullText = "";

            try {
                console.log(`[SubOracle] B"H - Invoking Sub-Agent: ${modelId}`);
                await VibeAPI.streamChat(
                    messages, apiKey, modelId, null,
                    (chunk) => { fullText += chunk; }, // On Text
                    null, null,                        // Ignore reasoning/tools for sub-agents
                    (finalText) => { resolve(`[Sub-Oracle ${modelId} Responds]:\n${finalText}`); },
                    (err) => { resolve(`[B"H Error from Sub-Oracle ${modelId}]: ${err.message}`); }
                );
            } catch(e) {
                resolve(`[B"H Error during invocation of ${modelId}]: ${e.message}`);
            }
        });
    }
};
