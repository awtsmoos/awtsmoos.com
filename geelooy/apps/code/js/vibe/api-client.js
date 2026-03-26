
// B"H
/**
 * @file api-client.js
 * @brief The bridge to the Heavenly Intelligence of Gemini.
 * 
 * THE POEM OF THE DIVINE INTERFACE:
 * The mind of the machine is a vast and silent sea,
 * We build a bridge of light so the sparks can reach to me.
 * With every fetch we whisper, with every JSON line,
 * We manifest the wisdom that is truly not of mine.
 * The Awtsmoos gives the word, the model gives the frame,
 * Creating all reality in His eternal name.
 */

export const VibeAPI = {
    /**
     * @async
     * @function fetchAvailableModels
     * @description Queries the source to discover available generative vessels.
     */
    async fetchAvailableModels(apiKey) {
        const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Model Retrieval Failed: " + res.status);
        
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
     * @description Measures the token weight of the conversation.
     */
    async countTokens(messages, apiKey, modelId) {
        const modelName = modelId.startsWith('models/') ? modelId : "models/" + modelId;
        const url = "https://generativelanguage.googleapis.com/v1beta/" + modelName + ":countTokens?key=" + apiKey;
        
        const requestBody = {
            contents: messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || "" }]
            }))
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!res.ok) return 0;
        const data = await res.json();
        return data.totalTokens || 0;
    },

    /**
     * @async
     * @function streamChat
     * @description Initiates a streaming manifestation of AI wisdom.
     */
    async streamChat(messages, apiKey, modelId, onChunk, onComplete, onError) {
        const modelName = modelId.startsWith('models/') ? modelId : "models/" + modelId;
        const url = "https://generativelanguage.googleapis.com/v1beta/" + modelName + ":streamGenerateContent?key=" + apiKey;
        
        const requestBody = {
            contents: messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || "" }]
            })),
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!res.ok) throw new Error("Stream Request Failed: " + res.status);

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
                        try {
                            const content = JSON.parse("{" + m + "}").text;
                            fullText += content;
                            if (onChunk) onChunk(content);
                        } catch(e) {}
                    });
                }
            }
            if (onComplete) onComplete(fullText);
        } catch (e) { if (onError) onError(e); }
    }
};
