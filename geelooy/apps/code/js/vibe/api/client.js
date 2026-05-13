
// B"H
/**
 * @file client.js
 * @brief The Universal Oracle Gateway.
 */

import { ApiUtils } from './utils.js';
import { TokenCounter } from './token-counter.js';
import { GoogleProvider } from './google-provider.js';
import { OpenRouterProvider } from './openrouter-provider.js';
import { GroqProvider } from './groq-provider.js';
import { CerebrasProvider } from './cerebras-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { XAIProvider } from './xai-provider.js';
import { TogetherProvider } from './together-provider.js';
import { ModelManager } from '../model-manager.js';
import { providerTelemetryLedger } from '../telemetry/ProviderTelemetryLedger.js';
import { AgentCapabilities } from '../agent/logic/AgentCapabilities.js';

export const VibeAPI = {
    _providers: {
        google: GoogleProvider,
        openrouter: OpenRouterProvider,
        groq: GroqProvider,
        cerebras: CerebrasProvider,
        openai: OpenAIProvider,
        xai: XAIProvider,
        together: TogetherProvider
    },

    async countTokens(messages, apiKey, modelId) {
        const std = ApiUtils.standardizeMessages(messages);
        const key = apiKey || ModelManager.getActiveKey();
        return await TokenCounter.countTokens(std, key, modelId);
    },

    // B"H - Added 'onActive' hook to pierce the latency void instantly
    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const { systemPrompt, conversation } = ApiUtils.extractSystem(messages);
        let finalMessages = ApiUtils.standardizeMessages(conversation);
        
        if (systemPrompt) finalMessages.unshift({ role: 'system', content: systemPrompt });

        let selectedModelId = modelId;
        const triedModels = new Set();

        while (selectedModelId && !triedModels.has(selectedModelId)) {
            const modelMeta = ModelManager.getModel(selectedModelId) || {
                id: selectedModelId,
                provider: selectedModelId.includes('/') ? 'openrouter' : 'google'
            };
            const key = apiKey || ModelManager.getKeyForModel(selectedModelId) || ModelManager.getKey(modelMeta.provider);
            if (!key) throw new Error(`Divine Connection Blocked: No API key found for ${modelMeta.provider}.`);

            const provider = this._providers[modelMeta.provider];
            if (!provider) {
                if (onError) onError(new Error(`Unknown provider '${modelMeta.provider}' for model ${selectedModelId}.`));
                return;
            }
            const startedAt = performance.now();
            providerTelemetryLedger.markRequestStart(modelMeta.provider, { modelId: selectedModelId });
            let streamEmittedOutput = false;

            const result = await new Promise((resolve) => {
                provider.streamChat(
                    finalMessages,
                    key,
                    selectedModelId,
                    tools,
                    () => {
                        streamEmittedOutput = true;
                        if (onActive) onActive();
                    },
                    (chunk) => {
                        streamEmittedOutput = true;
                        if (onChunk) onChunk(chunk);
                    },
                    (reasoningChunk) => {
                        streamEmittedOutput = true;
                        if (onReasoning) onReasoning(reasoningChunk);
                    },
                    (toolCalls) => {
                        streamEmittedOutput = true;
                        if (onToolCall) onToolCall(toolCalls);
                    },
                    (finalText, finalReasoning, finalTools, signature) => resolve({
                        ok: true,
                        finalText,
                        finalReasoning,
                        finalTools,
                        signature
                    }),
                    (err) => resolve({
                        ok: false,
                        err,
                        emitted: streamEmittedOutput
                    })
                );
            });

            if (result.ok) {
                providerTelemetryLedger.markRequestSuccess(modelMeta.provider, {
                    modelId: selectedModelId,
                    latencyMs: Math.round(performance.now() - startedAt)
                });
                if (onComplete) onComplete(result.finalText, result.finalReasoning, result.finalTools, result.signature);
                return;
            }
            providerTelemetryLedger.markRequestFailure(modelMeta.provider, {
                modelId: selectedModelId,
                error: result.err
            });

            triedModels.add(selectedModelId);
            const fallback = this._getProviderFallback(result.err, selectedModelId, triedModels);
            if (fallback && !result.emitted) {
                selectedModelId = fallback.id;
                if (ModelManager.currentModel === modelId) {
                    ModelManager.setModel(fallback.id);
                }
                await this._notifyFallback(modelId, fallback.id, result.err);
                continue;
            }

            if (onError) onError(result.err);
            return;
        }

        if (onError) onError(new Error('No viable model remained after fallback attempts.'));
    },
    
    _getProviderFallback(err, modelId, triedModels) {
        const currentModel = ModelManager.getModel(modelId);
        if (!currentModel || !currentModel.provider) return null;
        const provider = currentModel.provider;

        const message = this._extractErrorText(err).toLowerCase();
        const isFallbackEligible = ['402', '429', '503'].includes(String(err?.status || err?.code || ''))
            || message.includes('credit')
            || message.includes('quota')
            || message.includes('rate limit')
            || message.includes('high demand')
            || message.includes('tool')
            || message.includes('unsupported');

        if (!isFallbackEligible) return null;

        const requireTools = message.includes('tool');

        // 1) Prefer a same-provider fallback first (fastest + least surprising).
        const sameProvider = ModelManager.getFallbackModel(modelId, {
            provider,
            requireFree: true,
            requireTools,
            excludeIds: Array.from(triedModels)
        });
        if (sameProvider && this._hasKeyForModel(sameProvider.id)) return sameProvider;

        // 2) Cross-provider failover: pick another free model with a usable key.
        const cross = this._getCrossProviderFallback({
            requireFree: true,
            requireTools,
            excludeIds: Array.from(triedModels)
        });
        return cross;
    },

    _hasKeyForModel(modelId) {
        const key = ModelManager.getKeyForModel(modelId);
        return !!key;
    },

    _getCrossProviderFallback({ requireFree = true, requireTools = false, excludeIds = [] } = {}) {
        const candidates = ModelManager.availableModels
            .filter((m) => m && m.id && !excludeIds.includes(m.id))
            .filter((m) => !requireFree || AgentCapabilities.isFree(m))
            .filter((m) => !requireTools || AgentCapabilities.supportsTools(m))
            .filter((m) => this._hasKeyForModel(m.id))
            .sort((a, b) => AgentCapabilities.compareModels(a, b));

        return candidates[0] || null;
    },

    _extractErrorText(err) {
        if (!err) return '';
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message || '';
        if (typeof err?.message === 'string') return err.message;
        if (typeof err?.error?.message === 'string') return err.error.message;
        return '';
    },

    async _notifyFallback(fromModelId, toModelId, err) {
        const { UI } = await import('../../ui.js');
        const reason = this._extractErrorText(err) || `HTTP ${err?.status || err?.code || 'error'}`;
        UI.showToast(`Model failover: ${fromModelId} → ${toModelId} (${reason})`, 'info');
    },

    fetchGoogleModels: (k) => GoogleProvider.fetchModels(k),
    fetchOpenRouterModels: (k) => OpenRouterProvider.fetchModels(k),
    fetchGroqModels: (k) => GroqProvider.fetchModels(k),
    fetchCerebrasModels: (k) => CerebrasProvider.fetchModels(k),
    fetchOpenAIModels: (k) => OpenAIProvider.fetchModels(k),
    fetchXAIModels: (k) => XAIProvider.fetchModels(k),
    fetchTogetherModels: (k) => TogetherProvider.fetchModels(k)
};
