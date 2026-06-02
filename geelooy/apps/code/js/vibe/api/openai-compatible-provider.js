// B"H
/**
 * @file openai-compatible-provider.js
 * @brief Shared OpenAI-compatible model fetch + streaming logic with multimodal safety.
 *
 * Chapter 8: The OpenAI-shaped rivers learned not to drown text-only models in
 * images. Model metadata decides whether image, audio, and video parts remain
 * in the payload or become an honest omitted-media note.
 */

import { readSSEStream } from '../../../../../shared/streaming/index.js';
import { AgentCapabilities } from '../agent/logic/AgentCapabilities.js';
import { sanitizeMessagesForProvider } from './multimodal-adapter.js';

export const OpenAICompatibleProvider = {
    async fetchModels(apiKey, { providerId, modelsUrl, defaultContext = 131072, isFreeTier = true }) {
        const res = await fetch(modelsUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
        if (!res.ok) throw res;
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        return list.map(m => ({
            id: m.id,
            displayName: m.id,
            description: m.description || '',
            provider: providerId,
            context_length: Number(m.context_window || m.context_length || defaultContext),
            max_completion_tokens: Number(m.max_completion_tokens || 0) || null,
            costPrompt: Number(m.pricing?.prompt ?? 0),
            costCompletion: Number(m.pricing?.completion ?? 0),
            supported_parameters: Array.isArray(m.supported_parameters) ? m.supported_parameters : ['tools', 'tool_choice'],
            input_modalities: m.input_modalities || m.architecture?.input_modalities || [],
            output_modalities: m.output_modalities || m.architecture?.output_modalities || [],
            architecture: m.architecture || null,
            isFreeTier
        }));
    },

    async streamChat(messages, apiKey, modelId, tools, opts, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelMeta = opts.modelMeta || { id: modelId, provider: opts.providerId };
        const maxTokens = Math.min(Number(modelMeta.max_completion_tokens || 4096), 4096);
        const payload = { model: modelId, messages: sanitizeMessagesForProvider(messages, modelMeta, opts.providerId), stream: true, temperature: 0.2, max_tokens: maxTokens };
        if (tools && tools.length > 0 && AgentCapabilities.supportsTools(modelMeta)) {
            payload.tools = tools.map(t => ({ type: 'function', function: t.function }));
            payload.tool_choice = 'auto';
        }
        try {
            const res = await fetch(opts.chatUrl, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...(opts.extraHeaders || {}) }, body: JSON.stringify(payload) });
            if (!res.ok) { onError?.(res); return; }
            if (!res.body) { onError?.(new Error(`${opts.providerId || 'Provider'} returned no response stream.`)); return; }
            await readSSEStream(res.body.getReader(), opts.providerId || 'openai-compatible', { onActive, onChunk, onReasoning, onToolCall, onComplete, onError });
        } catch (e) { onError?.(e); }
    }
};
