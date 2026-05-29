// B"H
/**
 * @file minimax-provider.js
 * @brief MiniMax API provider — OpenAI-compatible with reasoning_details streaming.
 *
 * CHAPTER 29: THE SHARED STREAM — MiniMax joins the single SSE river.
 */

import { readSSEStream } from '../../../../../shared/streaming/index.js';

const MINIMAX_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const MODELS = [
    { id: 'MiniMax-M2.7',       displayName: 'MiniMax-M2.7',       description: 'Recursive self-improvement, agentic coding, ~60 tps',   context_length: 204800, max_completion_tokens: 8192 },
    { id: 'MiniMax-M2.7-highspeed', displayName: 'MiniMax-M2.7 Highspeed', description: 'M2.7 same performance, ~100 tps output', context_length: 204800, max_completion_tokens: 8192 },
    { id: 'MiniMax-M2.5',       displayName: 'MiniMax-M2.5',       description: 'Peak performance, complex tasks, ~60 tps',        context_length: 204800, max_completion_tokens: 8192 },
    { id: 'MiniMax-M2.5-highspeed', displayName: 'MiniMax-M2.5 Highspeed', description: 'M2.5 same performance, ~100 tps output', context_length: 204800, max_completion_tokens: 8192 }
];

/**
 * B"H — MiniMax reasoning lives in reasoning_details[0].text (not delta.reasoning).
 */
function extractMiniMaxReasoning(delta) {
    const details = delta.reasoning_details;
    if (details && Array.isArray(details) && details.length > 0) {
        return details[0].text || null;
    }
    return null;
}

export const MiniMaxProvider = {
    async fetchModels(apiKey) {
        return MODELS.map(m => ({ ...m, provider: 'minimax', costPrompt: 0, costCompletion: 0, supported_parameters: ['tools', 'tool_choice', 'reasoning_split'], isFreeTier: true }));
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const toolsPayload = (tools && tools.length > 0)
            ? tools.map(t => ({ type: 'function', function: t.function }))
            : undefined;

        const payload = {
            model: modelId,
            messages,
            stream: true,
            temperature: 1.0,
            max_tokens: Math.min(Number(modelId.includes('highspeed') ? 16384 : 8192), 8192),
            extra_body: { reasoning_split: true }
        };
        if (toolsPayload) {
            payload.tools = toolsPayload;
            payload.tool_choice = 'auto';
        }

        try {
            const res = await fetch(MINIMAX_ENDPOINT, {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                if (onError) onError(new Error(`MiniMax HTTP ${res.status}: ${text}`));
                return;
            }
            if (!res.body) {
                if (onError) onError(new Error('MiniMax returned no response stream.'));
                return;
            }

            const reader = res.body.getReader();
            // Pass custom reasoning extractor so readSSEStream uses reasoning_details[0].text
            await readSSEStream(reader, 'minimax', {
                onActive,
                onChunk,
                onReasoning,
                onToolCall,
                onComplete,
                onError
            }, extractMiniMaxReasoning);
        } catch (e) {
            if (onError) onError(e);
        }
    },

    /**
     * B"H — Non-stream chat. MiniMax-M2.7 wraps responses in <think>... — strip it.
     */
    async nonStreamChat(messages, apiKey, modelId, tools) {
        const toolsPayload = (tools && tools.length > 0)
            ? tools.map(t => ({ type: 'function', function: t.function }))
            : undefined;

        const payload = {
            model: modelId,
            messages,
            stream: false,
            temperature: 1.0,
            max_tokens: 4096,
            extra_body: { reasoning_split: true }
        };
        if (toolsPayload) {
            payload.tools = toolsPayload;
            payload.tool_choice = 'auto';
        }

        const res = await fetch(MINIMAX_ENDPOINT, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`MiniMax HTTP ${res.status}: ${await res.text().catch(() => '')}`);
        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content || '';
        return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() || raw;
    }
};
