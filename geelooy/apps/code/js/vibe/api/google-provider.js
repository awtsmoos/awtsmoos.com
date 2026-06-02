// B"H
/**
 * @file google-provider.js
 * @brief The emissary to Gemini models, now preserving image/audio/video parts.
 *
 * Chapter 9: Gemini already knew how to see, hear, and watch. The local bridge
 * simply stopped flattening those offerings into plain text.
 */

import { sanitizeMessagesForProvider, toGeminiParts } from './multimodal-adapter.js';

export const GoogleProvider = {
    async fetchModels(apiKey) {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey;
        const res = await fetch(url);
        if (!res.ok) throw res;
        const data = await res.json();
        return data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).map(m => ({
            id: m.name.split('/').pop(),
            displayName: m.displayName,
            provider: 'google',
            context_length: m.inputTokenLimit || 0,
            input_modalities: ['text', 'image', 'audio', 'video'],
            output_modalities: ['text']
        }));
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelName = modelId.startsWith('models/') ? modelId : 'models/' + modelId;
        const url = 'https://generativelanguage.googleapis.com/v1beta/' + modelName + ':streamGenerateContent?key=' + apiKey;
        const finalMessages = sanitizeMessagesForProvider(messages, { id: modelId, provider: 'google', input_modalities: ['text', 'image', 'audio', 'video'] }, 'google');
        const googleContents = finalMessages.map(m => {
            const role = m.role === 'assistant' ? 'model' : m.role;
            if (m.role === 'tool' || m.tool_call_id) return { role, parts: [{ functionResponse: { name: m.name, response: { content: m.content } } }] };
            if (m.tool_calls) return { role, parts: m.tool_calls.map(tc => toolCallPart(tc)) };
            return { role, parts: toGeminiParts(m.content || '') };
        });
        const googleTools = tools?.length ? [{ functionDeclarations: tools.map(t => ({ name: t.function.name, description: t.function.description, parameters: t.function.parameters })) }] : undefined;
        const bodyObj = { contents: googleContents, generationConfig: { temperature: 0.2 } };
        if (googleTools) bodyObj.tools = googleTools;
        try {
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj) });
            if (!res.ok) { onError?.(res); return; }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '', fullReasoning = '', currentSignature = null, buffer = '';
            let caughtToolCalls = [], activeFired = false;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (onActive && !activeFired) { onActive(); activeFired = true; }
                buffer += decoder.decode(value, { stream: true });
                const parsed = drainJsonObjects(buffer);
                buffer = parsed.rest;
                let toolStreamed = false;
                for (const data of parsed.objects) {
                    if (data.error) { onError?.(data.error); return; }
                    for (const cand of data.candidates || []) for (const part of cand.content?.parts || []) {
                        if (part.text) { fullText += part.text; onChunk?.(part.text); }
                        if (part.thoughtSignature) currentSignature = part.thoughtSignature;
                        if (part.functionCall) { caughtToolCalls.push(geminiTool(part, currentSignature)); toolStreamed = true; }
                    }
                }
                if (toolStreamed) onToolCall?.(caughtToolCalls);
            }
            onComplete?.(fullText, fullReasoning, caughtToolCalls, currentSignature);
        } catch (e) { onError?.(e); }
    }
};

function toolCallPart(tc) {
    let parsedArgs = {};
    try { parsedArgs = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments; } catch (_e) {}
    const part = { functionCall: { name: tc.function.name, args: parsedArgs } };
    if (tc.thought_signature) part.thoughtSignature = tc.thought_signature;
    return part;
}

function geminiTool(part, signature) {
    return { id: 'call_' + Math.random().toString(36).slice(2, 11), type: 'function', function: { name: part.functionCall.name, arguments: JSON.stringify(part.functionCall.args || {}) }, thought_signature: part.thoughtSignature || signature };
}

function drainJsonObjects(buffer) {
    const raw = [];
    let depth = 0, start = -1, inString = false;
    for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        if (char === '"' && buffer[i - 1] !== '\\') inString = !inString;
        if (inString) continue;
        if (char === '{') { if (depth === 0) start = i; depth++; }
        else if (char === '}') { depth--; if (depth === 0 && start !== -1) { raw.push(buffer.slice(start, i + 1)); start = -1; } }
    }
    const last = raw[raw.length - 1];
    const rest = last ? buffer.slice(buffer.lastIndexOf(last) + last.length) : buffer;
    const objects = raw.map(text => { try { return JSON.parse(text); } catch (_e) { return null; } }).filter(Boolean);
    return { objects, rest };
}
