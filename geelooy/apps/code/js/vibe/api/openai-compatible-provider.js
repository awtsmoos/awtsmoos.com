// B"H
/**
 * @file openai-compatible-provider.js
 * @brief Shared OpenAI-compatible model fetch + streaming logic.
 * Uses the shared SSE stream-client from geelooy/shared/streaming/.
 */

import { readSSEStream } from '../../../../../shared/streaming/index.js';
import { AgentCapabilities } from '../agent/logic/AgentCapabilities.js';

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
            costPrompt: 0,
            costCompletion: 0,
            supported_parameters: ['tools', 'tool_choice'],
            isFreeTier
        }));
    },

    async streamChat(messages, apiKey, modelId, tools, opts, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelMeta = opts.modelMeta || { id: modelId };
        const maxTokens = Math.min(Number(modelMeta.max_completion_tokens || 4096), 4096);

        const payload = {
            model: modelId,
            messages,
            stream: true,
            temperature: 0.2,
            max_tokens: maxTokens
        };

        if (tools && tools.length > 0 && AgentCapabilities.supportsTools(modelMeta)) {
            payload.tools = tools.map(t => ({ type: 'function', function: t.function }));
            payload.tool_choice = 'auto';
        }

        try {
            const res = await fetch(opts.chatUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    ...(opts.extraHeaders || {})
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                if (onError) onError(res);
                return;
            }
            if (!res.body) {
                if (onError) onError(new Error(`${opts.providerId || 'Provider'} returned no response stream.`));
                return;
            }

            const reader = res.body.getReader();
            await readSSEStream(reader, opts.providerId || 'openai-compatible', {
                onActive,
                onChunk,
                onReasoning,
                onToolCall,
                onComplete,
                onError
            });
        } catch (e) {
            if (onError) onError(e);
        }
    }
};
