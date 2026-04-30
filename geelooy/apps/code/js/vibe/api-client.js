
/**
 * @file api-client.js
 * @brief The Ear of the Oracle. 
 * 
 * CHAPTER XLIV: THE WEIGHT OF THE WORD
 * 
 * "Words are vessels; letters are lights."
 * 
 * Before we dispatch a long scroll of code to the heavens, we must know 
 * its measure. This client has been expanded to include the ritual of 
 * token counting. By reaching into the API's 'countTokens' endpoint, we 
 * calculate the numeric vibration of our history, ensuring the vessels 
 * (the models) can handle the intensity of the light.
 */

export const VibeAPI = {
    /**
     * @async
     * @function fetchAvailableModels
     * @description Fetches the current model manifestations permitted by the key.
     */
    async fetchAvailableModels(apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
            const err = new Error(`Oracle Registry Error: ${res.status}`);
            err.status = res.status;
            throw err;
        }
        
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
     * @description Determines the number of tokens (sparks) in the conversation.
     * B"H - This was missing and caused a shevirah (breakage) in the logs.
     * 
     * @param {Array} messages - The history of the word.
     * @param {string} apiKey - The conduit.
     * @param {string} modelId - The target vessel.
     * @returns {number} The count of tokens.
     */
    async countTokens(messages, apiKey, modelId) {
        const modelName = modelId.startsWith('models/') ? modelId : `models/${modelId}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:countTokens?key=${apiKey}`;
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content || "" }]
                    }))
                })
            });

            if (!res.ok) return 0;
            const data = await res.json();
            return data.totalTokens || 0;
        } catch (e) {
            console.error('[VibeAPI] Token Count Ritual Failed:', e);
            return 0;
        }
    },

    /**
     * @async
     * @function streamChat
     * @description Channels the streaming utterance of the AI.
     */
    async streamChat(messages, apiKey, modelId, onChunk, onComplete, onError) {
        const modelName = modelId.startsWith('models/') ? modelId : `models/${modelId}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:streamGenerateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || "" }]
            })),
            generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!res.ok) {
                const err = new Error(`Oracle Silent: ${res.status}`);
                err.status = res.status;
                if (onError) onError(err);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const textMatches = chunk.match(/"text":\s*"((?:[^"\\]|\\.)*)"/g);

                if (textMatches) {
                    textMatches.forEach(m => {
                        try {
                            const inner = JSON.parse(`{${m}}`).text;
                            fullBuffer += inner;
                            if (onChunk) onChunk(inner);
                        } catch(e) {}
                    });
                }
            }
            
            if (onComplete) onComplete(fullBuffer);
            
        } catch (e) { 
            if (onError) onError(e); 
        }
    }
};
