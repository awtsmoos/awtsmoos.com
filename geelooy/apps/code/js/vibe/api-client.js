
// B"H
/**
 * @file api-client.js
 * @brief The bridge to the Heavenly Intelligence of Gemini.
 */

export const VibeAPI = {
    /**
     * @async
     * @function fetchAvailableModels
     * @description Queries the API to discover which generative models are ready to manifest.
     */
    async fetchAvailableModels(apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Model Retrieval Failed: ${res.status}`);
        
        const data = await res.json();
        return data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => ({
                id: m.name.split('/').pop(),
                displayName: m.displayName,
                description: m.description
            }));
    },

    /**
     * @async
     * @function countTokens
     * @description Measures the token count of the given messages.
     */
    async countTokens(messages, apiKey, model) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:countTokens?key=${apiKey}`;
        const requestBody = {
            contents: messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }))
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            if (!res.ok) return 0;
            const data = await res.json();
            return data.totalTokens || 0;
        } catch (e) {
            return 0;
        }
    },

    /**
     * @async
     * @function streamChat
     * @description Initiates a streaming dialogue with the chosen model.
     */
    async streamChat(messages, apiKey, model, onChunk, onComplete, onError) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            })),
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!res.ok) throw new Error(await res.text());

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const textMatches = chunk.match(/"text":\s*"((?:[^"\\]|\\.)*)"/g);
                if (textMatches) {
                    textMatches.forEach(m => {
                        const content = JSON.parse(`{${m}}`).text;
                        fullText += content;
                        if (onChunk) onChunk(content);
                    });
                }
            }
            if (onComplete) onComplete(fullText);
        } catch (e) { if (onError) onError(e); }
    }
};
