
// B"H
/**
 * @file google-provider.js
 * @brief The Emissary to the Core Google Models (Hardened for Errors).
 */

export const GoogleProvider = {
    async fetchModels(apiKey) {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey;
        const res = await fetch(url);
        if (!res.ok) throw res; 
        const data = await res.json();
        return data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => ({
                id: m.name.split('/').pop(),
                displayName: m.displayName,
                provider: 'google',
                context_length: m.inputTokenLimit || 0
            }));
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelName = modelId.startsWith('models/') ? modelId : 'models/' + modelId;
        const url = 'https://generativelanguage.googleapis.com/v1beta/' + modelName + ':streamGenerateContent?key=' + apiKey;
        
        const googleContents = messages.map(m => {
            const role = m.role === 'assistant' ? 'model' : m.role;
            const parts = [];
            if (m.role === 'tool' || m.tool_call_id) {
                parts.push({ functionResponse: { name: m.name, response: { content: m.content } } });
            } else if (m.tool_calls) {
                m.tool_calls.forEach(tc => {
                    let parsedArgs = {};
                    try { parsedArgs = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments; } catch(e){}
                    const part = { functionCall: { name: tc.function.name, args: parsedArgs } };
                    if (tc.thought_signature) part.thoughtSignature = tc.thought_signature;
                    parts.push(part);
                });
            } else {
                parts.push({ text: m.content || "" });
            }
            return { role: role, parts: parts };
        });

        const googleTools = (tools && tools.length > 0) ? [{
            functionDeclarations: tools.map(t => ({
                name: t.function.name,
                description: t.function.description,
                parameters: t.function.parameters
            }))
        }] : undefined;

        const bodyObj = { contents: googleContents, generationConfig: { temperature: 0.2 } };
        if (googleTools) bodyObj.tools = googleTools;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyObj)
            });

            // B"H - CRITICAL CIRCUIT BREAKER
            // If the gateway responds with an error (503/429/401), we MUST notify the caller.
            if (!res.ok) {
                if (onError) onError(res);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "", fullReasoning = "", currentSignature = null, buffer = "";
            let caughtToolCalls = [];
            let isActiveFired = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                if (onActive && !isActiveFired) { onActive(); isActiveFired = true; }
                
                buffer += decoder.decode(value, { stream: true });
                const objects = [];
                let depth = 0, start = -1, inString = false;

                for (let i = 0; i < buffer.length; i++) {
                    const char = buffer[i];
                    if (char === '"' && buffer[i-1] !== '\\') inString = !inString;
                    if (inString) continue;

                    if (char === '{') { if (depth === 0) start = i; depth++; } 
                    else if (char === '}') {
                        depth--;
                        if (depth === 0 && start !== -1) { objects.push(buffer.substring(start, i + 1)); start = -1; }
                    }
                }

                if (objects.length > 0) {
                    const lastObj = objects[objects.length - 1];
                    const lastIdx = buffer.lastIndexOf(lastObj) + lastObj.length;
                    buffer = buffer.substring(lastIdx);
                }

                let toolStreamedInThisChunk = false;
                for (const jsonStr of objects) {
                    try {
                        const data = JSON.parse(jsonStr);
                        if (data.candidates) {
                            data.candidates.forEach(cand => {
                                const parts = cand.content?.parts || [];
                                parts.forEach(part => {
                                    if (part.text) { fullText += part.text; if (onChunk) onChunk(part.text); }
                                    if (part.thoughtSignature) { currentSignature = part.thoughtSignature; }
                                    if (part.functionCall) {
                                        caughtToolCalls.push({
                                            id: 'call_' + Math.random().toString(36).substr(2, 9),
                                            type: 'function',
                                            function: { name: part.functionCall.name, arguments: JSON.stringify(part.functionCall.args || {}) },
                                            thought_signature: part.thoughtSignature || currentSignature
                                        });
                                        toolStreamedInThisChunk = true;
                                    }
                                });
                            });
                        } else if (data.error) {
                            // Caught mid-stream error payload
                            if (onError) onError(data.error);
                            return;
                        }
                    } catch(e) {}
                }
                
                if (toolStreamedInThisChunk && onToolCall) onToolCall(caughtToolCalls);
            }
            
            if (onComplete) onComplete(fullText, fullReasoning, caughtToolCalls, currentSignature);
            
        } catch (e) {
            if (onError) onError(e);
        }
    }
};
