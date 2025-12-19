
// B"H
// FILE: js/vibe/api-client.js

export const VibeAPI = {
    // Available Models
    MODELS: {
        'gemini-3-pro-preview': { name: 'Gemini 3 Pro (Preview)', cost: 'high' },
        'gemini-3-flash-preview': { name: 'Gemini 3 Flash (Preview)', cost: 'med' },
        'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', cost: 'low' },
        'gemini-2.0-flash-lite-preview-02-05': { name: 'Gemini 2.0 Flash Lite', cost: 'lowest' },
        'gemini-2.0-pro-exp-02-05': { name: 'Gemini 2.0 Pro Experimental', cost: 'high' },
        'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', cost: 'high' },
        'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', cost: 'low' },
        'gemini-1.5-flash-8b': { name: 'Gemini 1.5 Flash-8B', cost: 'lowest' }
    },

    async streamChat(messages, apiKey, model, onChunk, onComplete, onError) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        // Convert internal message format to Gemini format
        const contents = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Default Config
        const requestBody = {
            contents,
            generationConfig: {
                temperature: 0.3, // Low for code
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192
            }
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errText = await response.text();
                // Check for Quota Error (429)
                if (response.status === 429) {
                    throw new Error('QUOTA_EXCEEDED');
                }
                throw new Error(`API Error ${response.status}: ${errText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunkStr = decoder.decode(value, { stream: true });
                // Robust Stream Parsing
                // The API returns a stream of JSON objects, usually formatted as array elements.
                // We regex specifically for the text content to be safe against buffer splits.
                
                const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
                let match;
                while ((match = regex.exec(chunkStr)) !== null) {
                    try {
                        // Unescape JSON string
                        let textSegment = JSON.parse(`"${match[1]}"`); 
                        fullText += textSegment;
                        if (onChunk) onChunk(textSegment);
                    } catch(e) {
                        // Ignore partial JSON parse errors in stream
                    }
                }
            }
            
            if (onComplete) onComplete(fullText);

        } catch (error) {
            if (onError) onError(error);
        }
    }
};
