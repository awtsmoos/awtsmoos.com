
// B"H
/**
 * @file openrouter-provider.js
 * @brief The Emissary to the Multiverse.
 */

import { AgentCapabilities } from '../agent/logic/AgentCapabilities.js';

export const OpenRouterProvider = {
    async fetchModels(apiKey) {
        const url = `https://openrouter.ai/api/v1/models`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        if (!res.ok) throw res; 
        const data = await res.json();
        
        const models = data.data
        .filter(m => (m?.architecture?.output_modalities || []).includes('text') || !m.architecture)
        .map(m => ({
            id: m.id,
            displayName: m.name,
            description: m.description,
            provider: 'openrouter',
            context_length: m.context_length,
            max_completion_tokens: m.top_provider?.max_completion_tokens || null,
            costPrompt: Number(m.pricing?.prompt ?? 0),
            costCompletion: Number(m.pricing?.completion ?? 0),
            supported_parameters: Array.isArray(m.supported_parameters) ? m.supported_parameters : [],
            architecture: m.architecture || null,
            top_provider: m.top_provider || null,
            per_request_limits: m.per_request_limits || null
        }));

        return models;
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        
        const { ModelManager } = await import('../model-manager.js');
        const modelMeta = ModelManager.getModel(modelId) || { id: modelId };
        const maxTokens = Math.min(Number(modelMeta.max_completion_tokens || 4096), 4096);

        const payload = {
            model: modelId,
            messages: messages,
            stream: true,
            temperature: 0.2,
            max_tokens: maxTokens
        };

        const canUseTools = AgentCapabilities.supportsTools(modelMeta);

        if (canUseTools && tools && tools.length > 0) {
            payload.tools = tools.map(t => ({ type: "function", function: t.function }));
            payload.tool_choice = 'auto';
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.href, 'X-Title': 'Awtsmoos Vibe Engine' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) { if (onError) onError(res); return; }
            if (!res.body) {
                if (onError) onError(new Error('OpenRouter returned no response stream.'));
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "", fullReasoning = "", buffer = "";
            let activeToolCalls =[]; 
            let isActiveFired = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                if (onActive && !isActiveFired) { onActive(); isActiveFired = true; }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); 

                let toolUpdatedInThisChunk = false;

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed === '' || trimmed === 'data:[DONE]' || trimmed === 'data: [DONE]') continue;
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(trimmed.substring(6));
                            if (data.error) {
                                if (onError) onError(data.error);
                                return;
                            }
                            const delta = data.choices[0]?.delta || {};

                            if (delta.content) { fullText += delta.content; if (onChunk) onChunk(delta.content); }
                            if (delta.reasoning || delta.reasoning_content) {
                                const thought = delta.reasoning || delta.reasoning_content;
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
                                                arguments: tc.function?.arguments || ""
                                            }
                                        };
                                    }

                                    if (tc.id) activeToolCalls[toolIndex].id = tc.id;
                                    if (tc.type) activeToolCalls[toolIndex].type = tc.type;
                                    if (tc.function?.name) activeToolCalls[toolIndex].function.name = tc.function.name;
                                    if (typeof tc.function?.arguments === 'string' && tc.function.arguments.length > 0) {
                                        activeToolCalls[toolIndex].function.arguments += tc.function.arguments;
                                    }
                                    toolUpdatedInThisChunk = true;
                                });
                            }
                        } catch(e) {
                            if (onError) onError(new Error(`OpenRouter stream parse failed: ${e.message}. Line: ${trimmed.slice(0, 220)}`));
                            return;
                        }
                    }
                }
                
                if (toolUpdatedInThisChunk && onToolCall) {
                    const filteredTools = activeToolCalls.filter(Boolean);
                    onToolCall(filteredTools);
                }
            }
            const finalizedTools = activeToolCalls.filter(Boolean);
            if (!fullText && !fullReasoning && finalizedTools.length === 0) {
                if (onError) onError(new Error(`OpenRouter stream completed without text, reasoning, or tool calls for ${modelId}.`));
                return;
            }
            if (onComplete) onComplete(fullText, fullReasoning, finalizedTools);
        } catch (e) { if (onError) onError(e); }
    }
};
