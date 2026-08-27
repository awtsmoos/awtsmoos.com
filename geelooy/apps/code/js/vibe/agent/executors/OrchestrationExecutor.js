
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
import { KeyRegistry } from '../state/KeyRegistry.js';
import { Providers } from '../state/ProviderRegistry.js';
import { AgentCapabilities } from '../logic/AgentCapabilities.js';
import { providerTelemetryLedger } from '../../telemetry/ProviderTelemetryLedger.js';

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

                    if (AgentCapabilities.isFree(m)) {
                        isFree = true;
                        if (m.provider === 'openrouter') {
                            priceReport = '[FREE] OpenRouter Zero-Cost Routing';
                        } else {
                            priceReport = '[FREE/TIER] Provider Key Limits Apply';
                        }
                    } else if (m.costPrompt) {
                        priceReport = `Prompt: $${m.costPrompt}/1M | Completion: $${m.costCompletion}/1M`;
                    }

                    return {
                        id: m.id,
                        provider: m.provider,
                        is_free: isFree,
                        context_window: m.context_length || 'Unknown',
                        pricing: priceReport,
                        max_completion_tokens: m.max_completion_tokens || null,
                        per_request_limits: m.per_request_limits || null
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
            case "get_provider_status": {
                const keys = KeyRegistry.getAll();
                const models = ModelManager.availableModels;
                const status = Object.values(Providers).map(p => {
                    const providerModels = models.filter(m => m.provider === p.id);
                    const freeModels = providerModels.filter(m => AgentCapabilities.isFree(m));
                    return {
                        provider: p.id,
                        name: p.name,
                        keys: keys.filter(k => k.provider === p.id).length,
                        models: providerModels.length,
                        free_models: freeModels.length,
                        tool_models: providerModels.filter(m => AgentCapabilities.supportsTools(m)).length
                    };
                });
                return JSON.stringify(status, null, 2);
            }
            case "get_provider_telemetry": {
                return JSON.stringify(providerTelemetryLedger.snapshot(), null, 2);
            }
            case "get_registered_keys": {
                const active = ModelManager.getActiveKeyObject();
                const out = KeyRegistry.getAll().map(k => ({
                    id: k.id,
                    provider: k.provider,
                    label: k.label,
                    suffix: k.key ? `..${k.key.slice(-4)}` : '',
                    is_active: active ? active.id === k.id : false
                }));
                return JSON.stringify(out, null, 2);
            }
            case "shift_consciousness_by_provider": {
                const providerId = args.provider_id;
                const model = ModelManager.getPreferredModel({
                    provider: providerId,
                    requireFree: args.require_free !== false,
                    requireTools: !!args.require_tools
                }) || ModelManager.getPreferredModel({ provider: providerId });

                if (!model) {
                    return `[B"H Error] No model found for provider ${providerId}.`;
                }
                ModelManager.setModel(model.id);
                return `[B"H Success] Shifted to ${model.id} on provider ${providerId}.`;
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
            const provider = ModelManager.getModel(modelId)?.provider || (modelId.includes('/') ? 'openrouter' : 'google');
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
                    null,
                    (chunk) => { fullText += chunk; },
                    null,
                    null,
                    (finalText) => { resolve(`[Sub-Oracle ${modelId} Responds]:\n${finalText}`); },
                    (err) => { resolve(`[B"H Error from Sub-Oracle ${modelId}]: ${err.message}`); }
                );
            } catch(e) {
                resolve(`[B"H Error during invocation of ${modelId}]: ${e.message}`);
            }
        });
    }
};
