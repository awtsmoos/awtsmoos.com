// B"H
/**
 * @file token-counter.js
 * @brief The Scales of Justice for the Digital Utterance.
 * 
 * CHAPTER LXIII: THE MEASURE OF THE WORD
 * 
 * "Who has measured the waters in the hollow of His hand, and meted out heaven with the span..."
 * 
 * Tokens are the currency of the digital dimensions. If we send a message that exceeds
 * the vessel's limit, it shatters (400 Bad Request / 429 Too Many Requests). 
 * This module dynamically assesses the weight of the request. For Google, we ask the Oracle 
 * itself to weigh it. For OpenRouter, we apply the Universal Heuristic.
 */

export const TokenCounter = {
    /**
     * B"H
     * Ascertains the token weight of the upcoming manifestation.
     * 
     * @param {Array} messages - The purified history.
     * @param {string} apiKey - The authorization token.
     * @param {string} modelId - The identity of the targeted realm.
     * @returns {Promise<number>} The estimated or exact token weight.
     */
    async countTokens(messages, apiKey, modelId) {
        if (!apiKey || !modelId) return 0;
        
        try {
            const isOpenRouter = modelId.startsWith('openrouter/') || modelId.includes('/');

            if (isOpenRouter) {
                // OpenRouter models don't have a reliable, exposed token-counting API without sending an actual request.
                // We estimate locally based on raw string length (approx 4 chars = 1 token).
                // This is the Tzimtzum (Contraction) of approximation.
                const textDump = messages.map(m => m.content).join(" ");
                return Math.ceil(textDump.length / 4);
            } else {
                // Google Native Precision
                const modelName = modelId.startsWith('models/') ? modelId : `models/${modelId}`;
                const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:countTokens?key=${apiKey}`;
                
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
            }
        } catch (e) {
            console.warn('[TokenCounter] B"H - The Scales failed to balance:', e);
            return 0;
        }
    }
};