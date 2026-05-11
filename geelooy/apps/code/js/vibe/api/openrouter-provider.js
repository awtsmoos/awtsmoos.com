
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
        
        const models = data.data.map(m => ({
            id: m.id,
            displayName: m.name,
            description: m.description,
            provider: 'openrouter',
            context_length: m.context_length,
            costPrompt: m.pricing.prompt,
            costCompletion: m.pricing.completion
        })).sort((a,b) => a.displayName.localeCompare(b.displayName));
        
        // B"H - The Guaranteed Zero-Cost Conduits
        models.unshift({
            id: 'openrouter/free',
            displayName: 'OpenRouter FREE GUARANTEE',
            description: 'Routes your request only to models that have a $0 cost. Perfect for zero-budget manifestation.',
            provider: 'openrouter',
            context_length: 128000,
            costPrompt: 0,
            costCompletion: 0
        });

        models.unshift({
            id: 'openrouter/auto',
            displayName: 'OpenRouter Auto (Best Free/Premium)',
            description: 'Automatically routes to the best model based on the request.',
            provider: 'openrouter',
            context_length: 128000,
            costPrompt: 0,
            costCompletion: 0
        });

        return models;
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        
        const payload = {
            model: modelId,
            messages: messages,
            stream: true,
            temperature: 0.2
        };

        const modelMeta = { id: modelId };
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
                    if (trimmed === '' || trimmed === 'data:[DONE]') continue;
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(trimmed.substring(6));
                            const delta = data.choices[0]?.delta || {};

                            if (delta.content) { fullText += delta.content; if (onChunk) onChunk(delta.content); }
                            if (delta.reasoning || delta.reasoning_content) {
                                const thought = delta.reasoning || delta.reasoning_content;
                                fullReasoning += thought;
                                if (onReasoning) onReasoning(thought);
                            }
                            if (delta.tool_calls) {
                                delta.tool_calls.forEach(tc => {
                                    if (tc.id) {
                                        activeToolCalls[tc.index] = { id: tc.id, type: tc.type, function: { name: tc.function.name, arguments: tc.function.arguments || "" } };
                                    } else if (tc.function && tc.function.arguments) {
                                        activeToolCalls[tc.index].function.arguments += tc.function.arguments;
                                    }
                                    toolUpdatedInThisChunk = true;
                                });
                            }
                        } catch(e) {}
                    }
                }
                
                if (toolUpdatedInThisChunk && onToolCall) {
                    const filteredTools = activeToolCalls.filter(Boolean);
                    onToolCall(filteredTools);
                }
            }
            const finalizedTools = activeToolCalls.filter(Boolean);
            if (onComplete) onComplete(fullText, fullReasoning, finalizedTools);
        } catch (e) { if (onError) onError(e); }
    }
};
