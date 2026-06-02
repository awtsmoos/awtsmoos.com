// B"H
/**
 * @file client.js
 * @brief The Universal Oracle Gateway.
 *
 * Chapter 10: The gateway now lets attachments travel with the message. It does
 * not force media into every model; the providers decide by capability and
 * preserve truth with omitted-media notes when a vessel cannot receive a file.
 */

import { ApiUtils } from './utils.js';
import { TokenCounter } from './token-counter.js';
import { MiniMaxProvider } from './minimax-provider.js';
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
    _providers: { minimax: MiniMaxProvider, google: GoogleProvider, openrouter: OpenRouterProvider, groq: GroqProvider, cerebras: CerebrasProvider, openai: OpenAIProvider, xai: XAIProvider, together: TogetherProvider },

    async countTokens(messages, apiKey, modelId) {
        const std = ApiUtils.standardizeMessages(messages);
        const key = apiKey || ModelManager.getActiveKey();
        return await TokenCounter.countTokens(std, key, modelId);
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError, options = {}) {
        const { systemPrompt, conversation } = ApiUtils.extractSystem(messages);
        let finalMessages = ApiUtils.standardizeMessages(conversation);
        if (systemPrompt) finalMessages.unshift({ role: 'system', content: systemPrompt });
        finalMessages = appendAttachments(finalMessages, options.attachments || []);
        let selectedModelId = modelId;
        const triedModels = new Set();

        while (selectedModelId && !triedModels.has(selectedModelId)) {
            const modelMeta = ModelManager.getModel(selectedModelId) || { id: selectedModelId, provider: selectedModelId.includes('/') ? 'openrouter' : 'google' };
            const key = apiKey || ModelManager.getKeyForModel(selectedModelId) || ModelManager.getKey(modelMeta.provider);
            if (!key) throw new Error(`Divine Connection Blocked: No API key found for ${modelMeta.provider}.`);
            const provider = this._providers[modelMeta.provider];
            if (!provider) { onError?.(new Error(`Unknown provider '${modelMeta.provider}' for model ${selectedModelId}.`)); return; }
            const startedAt = performance.now();
            providerTelemetryLedger.markRequestStart(modelMeta.provider, { modelId: selectedModelId });
            let streamEmittedOutput = false;

            const result = await new Promise(resolve => {
                provider.streamChat(
                    finalMessages,
                    key,
                    selectedModelId,
                    tools,
                    () => { streamEmittedOutput = true; onActive?.(); },
                    chunk => { streamEmittedOutput = true; onChunk?.(chunk); },
                    reasoningChunk => { streamEmittedOutput = true; onReasoning?.(reasoningChunk); },
                    toolCalls => { streamEmittedOutput = true; onToolCall?.(toolCalls); },
                    (finalText, finalReasoning, finalTools, signature) => resolve({ ok: true, finalText, finalReasoning, finalTools, signature }),
                    err => resolve({ ok: false, err, emitted: streamEmittedOutput })
                );
            });

            if (result.ok) {
                providerTelemetryLedger.markRequestSuccess(modelMeta.provider, { modelId: selectedModelId, latencyMs: Math.round(performance.now() - startedAt) });
                onComplete?.(result.finalText, result.finalReasoning, result.finalTools, result.signature);
                return;
            }
            providerTelemetryLedger.markRequestFailure(modelMeta.provider, { modelId: selectedModelId, error: result.err });
            triedModels.add(selectedModelId);
            const fallback = this._getProviderFallback(result.err, selectedModelId, triedModels);
            if (fallback && !result.emitted) {
                selectedModelId = fallback.id;
                if (ModelManager.currentModel === modelId) ModelManager.setModel(fallback.id);
                await this._notifyFallback(modelId, fallback.id, result.err);
                continue;
            }
            onError?.(result.err);
            return;
        }
        onError?.(new Error('No viable model remained after fallback attempts.'));
    },

    _getProviderFallback(err, modelId, triedModels) {
        const currentModel = ModelManager.getModel(modelId);
        if (!currentModel?.provider) return null;
        const message = this._extractErrorText(err).toLowerCase();
        const eligible = ['402', '429', '503'].includes(String(err?.status || err?.code || '')) || ['credit', 'quota', 'rate limit', 'high demand', 'tool', 'unsupported'].some(word => message.includes(word));
        if (!eligible) return null;
        const requireTools = message.includes('tool');
        const sameProvider = ModelManager.getFallbackModel(modelId, { provider: currentModel.provider, requireFree: true, requireTools, excludeIds: Array.from(triedModels) });
        if (sameProvider && this._hasKeyForModel(sameProvider.id)) return sameProvider;
        return this._getCrossProviderFallback({ requireFree: true, requireTools, excludeIds: Array.from(triedModels) });
    },

    _hasKeyForModel(modelId) { return !!ModelManager.getKeyForModel(modelId); },

    _getCrossProviderFallback({ requireFree = true, requireTools = false, excludeIds = [] } = {}) {
        return ModelManager.availableModels.filter(m => m?.id && !excludeIds.includes(m.id)).filter(m => !requireFree || AgentCapabilities.isFree(m)).filter(m => !requireTools || AgentCapabilities.supportsTools(m)).filter(m => this._hasKeyForModel(m.id)).sort((a, b) => AgentCapabilities.compareModels(a, b))[0] || null;
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

    fetchMiniMaxModels: k => MiniMaxProvider.fetchModels(k),
    fetchGoogleModels: k => GoogleProvider.fetchModels(k),
    fetchOpenRouterModels: k => OpenRouterProvider.fetchModels(k),
    fetchGroqModels: k => GroqProvider.fetchModels(k),
    fetchCerebrasModels: k => CerebrasProvider.fetchModels(k),
    fetchOpenAIModels: k => OpenAIProvider.fetchModels(k),
    fetchXAIModels: k => XAIProvider.fetchModels(k),
    fetchTogetherModels: k => TogetherProvider.fetchModels(k)
};

function appendAttachments(messages = [], attachments = []) {
    if (!attachments.length) return messages;
    const lastIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastIndex < 0) return [...messages, { role: 'user', content: attachmentContent('', attachments) }];
    const next = [...messages];
    next[lastIndex] = { ...next[lastIndex], content: attachmentContent(next[lastIndex].content, attachments) };
    return next;
}

function attachmentContent(content, attachments) {
    const base = Array.isArray(content) ? content : [{ type: 'text', text: String(content || '') }];
    const parts = attachments.map(item => attachmentPart(item)).filter(Boolean);
    return [...base, ...parts];
}

function attachmentPart(item = {}) {
    const type = String(item.type || item.mimeType || '').toLowerCase();
    const url = item.dataUrl || item.url || '';
    if (!url) return null;
    if (type.startsWith('image/')) return { type: 'image_url', image_url: { url } };
    if (type.startsWith('audio/')) return { type: 'input_audio', input_audio: { data: url.replace(/^data:[^,]+,/, ''), format: type.includes('wav') ? 'wav' : type.includes('webm') ? 'webm' : 'mp3' } };
    if (type.startsWith('video/')) return { type: 'video_url', video_url: { url } };
    return { type: 'text', text: `[Unsupported attachment: ${item.name || type || 'file'}]` };
}
