// B"H
/**
 * @file minimax-provider.js
 * @brief MiniMax API provider — OpenAI-compatible with reasoning_details streaming.
 *
 * Chapter 7: MiniMax-M3 received eyes and motion. Older M2 vessels keep their
 * text-and-tool crowns, while M3 alone carries images and video according to
 * the public OpenAI-compatible MiniMax surface.
 */

import { readSSEStream } from '../../../../../shared/streaming/index.js';
import { sanitizeMessagesForProvider } from './multimodal-adapter.js';

const MINIMAX_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const MODELS = [
    { id: 'MiniMax-M3', displayName: 'MiniMax-M3', description: 'Multimodal foundation model: text, image, video inputs; tool calls; long context', context_length: 1048576, max_completion_tokens: 8192, input_modalities: ['text', 'image', 'video'] },
    { id: 'MiniMax-M2.7', displayName: 'MiniMax-M2.7', description: 'Recursive self-improvement, agentic coding, ~60 tps', context_length: 204800, max_completion_tokens: 8192 },
    { id: 'MiniMax-M2.7-highspeed', displayName: 'MiniMax-M2.7 Highspeed', description: 'M2.7 same performance, ~100 tps output', context_length: 204800, max_completion_tokens: 8192 },
    { id: 'MiniMax-M2.5', displayName: 'MiniMax-M2.5', description: 'Peak performance, complex tasks, ~60 tps', context_length: 204800, max_completion_tokens: 8192 },
    { id: 'MiniMax-M2.5-highspeed', displayName: 'MiniMax-M2.5 Highspeed', description: 'M2.5 same performance, ~100 tps output', context_length: 204800, max_completion_tokens: 8192 }
];

function extractMiniMaxReasoning(delta) {
    const details = delta.reasoning_details;
    return Array.isArray(details) && details.length ? details[0].text || null : null;
}

export const MiniMaxProvider = {
    async fetchModels(apiKey) {
        return MODELS.map(m => ({ ...m, provider: 'minimax', costPrompt: 0, costCompletion: 0, supported_parameters: ['tools', 'tool_choice', 'reasoning_split'], isFreeTier: true }));
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelMeta = MODELS.find(model => model.id === modelId) || { id: modelId, provider: 'minimax' };
        const finalMessages = sanitizeMessagesForProvider(messages, { ...modelMeta, provider: 'minimax' }, 'minimax');
        const toolsPayload = tools?.length ? tools.map(t => ({ type: 'function', function: t.function })) : undefined;
        const payload = { model: modelId, messages: finalMessages, stream: true, temperature: 1.0, max_tokens: Math.min(Number(modelId.includes('highspeed') ? 16384 : 8192), 8192), extra_body: { reasoning_split: true } };
        if (toolsPayload) { payload.tools = toolsPayload; payload.tool_choice = 'auto'; }
        try {
            const res = await fetch(MINIMAX_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) { onError?.(new Error(`MiniMax HTTP ${res.status}: ${await res.text().catch(() => '')}`)); return; }
            if (!res.body) { onError?.(new Error('MiniMax returned no response stream.')); return; }
            await readSSEStream(res.body.getReader(), 'minimax', { onActive, onChunk, onReasoning, onToolCall, onComplete, onError }, extractMiniMaxReasoning);
        } catch (e) { onError?.(e); }
    },

    async nonStreamChat(messages, apiKey, modelId, tools) {
        const modelMeta = MODELS.find(model => model.id === modelId) || { id: modelId, provider: 'minimax' };
        const finalMessages = sanitizeMessagesForProvider(messages, { ...modelMeta, provider: 'minimax' }, 'minimax');
        const toolsPayload = tools?.length ? tools.map(t => ({ type: 'function', function: t.function })) : undefined;
        const payload = { model: modelId, messages: finalMessages, stream: false, temperature: 1.0, max_tokens: 4096, extra_body: { reasoning_split: true } };
        if (toolsPayload) { payload.tools = toolsPayload; payload.tool_choice = 'auto'; }
        const res = await fetch(MINIMAX_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`MiniMax HTTP ${res.status}: ${await res.text().catch(() => '')}`);
        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content || '';
        return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() || raw;
    }
};
