// B"H
/**
 * @file openai-compatible-provider.js
 * @brief Shared OpenAI-compatible model fetch + streaming logic.
 */

import { AgentCapabilities } from '../agent/logic/AgentCapabilities.js';

export const OpenAICompatibleProvider = {
    async fetchModels(apiKey, {
        providerId,
        modelsUrl,
        defaultContext = 131072,
        isFreeTier = true
    }) {
        const res = await fetch(modelsUrl, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
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
        const payload = {
            model: modelId,
            messages,
            stream: true,
            temperature: 0.2
        };

        const modelMeta = opts.modelMeta || { id: modelId };
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

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let fullReasoning = '';
            let buffer = '';
            let activeToolCalls = [];
            let isActiveFired = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (onActive && !isActiveFired) {
                    isActiveFired = true;
                    onActive();
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                let toolUpdated = false;
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed === '' || trimmed === 'data:[DONE]' || trimmed === 'data: [DONE]') continue;
                    if (!trimmed.startsWith('data: ')) continue;

                    try {
                        const data = JSON.parse(trimmed.substring(6));
                        const delta = data.choices?.[0]?.delta || {};
                        if (delta.content) {
                            fullText += delta.content;
                            if (onChunk) onChunk(delta.content);
                        }

                        const thought = delta.reasoning || delta.reasoning_content;
                        if (thought) {
                            fullReasoning += thought;
                            if (onReasoning) onReasoning(thought);
                        }

                        if (delta.tool_calls) {
                            delta.tool_calls.forEach(tc => {
                                const toolIndex = Number.isInteger(tc.index) ? tc.index : activeToolCalls.length;
                                if (!activeToolCalls[toolIndex]) {
                                    activeToolCalls[toolIndex] = {
                                        id: tc.id || ('call_' + Math.random().toString(36).substr(2, 9)),
                                        type: tc.type || 'function',
                                        function: {
                                            name: tc.function?.name || '',
                                            arguments: tc.function?.arguments || ''
                                        }
                                    };
                                }

                                if (tc.id) activeToolCalls[toolIndex].id = tc.id;
                                if (tc.type) activeToolCalls[toolIndex].type = tc.type;
                                if (tc.function?.name) activeToolCalls[toolIndex].function.name = tc.function.name;
                                if (typeof tc.function?.arguments === 'string' && tc.function.arguments.length > 0) {
                                    activeToolCalls[toolIndex].function.arguments += tc.function.arguments;
                                }
                                toolUpdated = true;
                            });
                        }
                    } catch (e) {}
                }

                if (toolUpdated && onToolCall) {
                    onToolCall(activeToolCalls.filter(Boolean));
                }
            }

            if (onComplete) onComplete(fullText, fullReasoning, activeToolCalls.filter(Boolean));
        } catch (e) {
            if (onError) onError(e);
        }
    }
};
