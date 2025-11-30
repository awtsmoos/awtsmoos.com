// B"H
/**
 * awtsmoosAi.js
 * The Urim VeTumim (The Oracle of Light)
 * Module Exports & Streaming Logic
 */

const { TextDecoder } = require('util');

const GEMINI_CONFIG = {
    models: {
        "gemini-2.5-flash": { rpm: 10, tpm: 250000, rpd: 250, priority: 2 },
        "gemini-2.5-flash-lite": { rpm: 15, tpm: 250000, rpd: 1000, priority: 1 },
        "gemini-2.0-flash": { rpm: 15, tpm: 1000000, rpd: 200, priority: 4 },
        "gemini-2.0-flash-lite": { rpm: 30, tpm: 1000000, rpd: 200, priority: 3 }
    }
};

const DEFAULT_MODEL_ORDER = Object.keys(GEMINI_CONFIG.models).sort((a, b) => 
    GEMINI_CONFIG.models[a].priority - GEMINI_CONFIG.models[b].priority
);

const usageTracker = new Map();

function checkRateLimit(apiKey, modelName, estimatedTokens) {
    const limits = GEMINI_CONFIG.models[modelName];
    if (!limits) return true; 

    if (!usageTracker.has(apiKey)) usageTracker.set(apiKey, new Map());
    const keyModels = usageTracker.get(apiKey);

    if (!keyModels.has(modelName)) {
        keyModels.set(modelName, { requests: [], tokens: [], dailyCount: 0, lastDay: new Date().toDateString() });
    }
    const usage = keyModels.get(modelName);

    const today = new Date().toDateString();
    if (usage.lastDay !== today) { usage.dailyCount = 0; usage.lastDay = today; }
    if (usage.dailyCount >= limits.rpd) return false;

    const now = Date.now();
    const oneMinAgo = now - 60000;
    usage.requests = usage.requests.filter(t => t > oneMinAgo);
    usage.tokens = usage.tokens.filter(t => t.time > oneMinAgo);
    
    if (usage.requests.length >= limits.rpm) return false;
    const currentTokens = usage.tokens.reduce((acc, cur) => acc + cur.count, 0);
    if (currentTokens + estimatedTokens > limits.tpm) return false;

    return true;
}

function recordUsage(apiKey, modelName, tokenCount) {
    const usage = usageTracker.get(apiKey).get(modelName);
    const now = Date.now();
    usage.requests.push(now);
    usage.tokens.push({ time: now, count: tokenCount });
    usage.dailyCount++;
}

function estimateTokens(history) {
    try { return Math.ceil(JSON.stringify(history).length / 4); } catch(e) { return 100; }
}

// Helper for fallback non-stream
function extractTextFromFullJson(data) {
    if (Array.isArray(data)) {
        return data.map(chunk => 
            chunk.candidates?.[0]?.content?.parts?.[0]?.text || ""
        ).join("");
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}


// B"H
/**
 * awtsmoosAi.js 
 * Communes with Gemini, cycling through models if limits are hit.
 * SUPPORTS TRUE STREAMING via onChunk
 */



module.exports = async function callGemini(fetchImpl, history, apiKey, preferredModel = null, onChunk = null) {
    if (!apiKey) return "Error: No API Key provided for Wisdom.";
    if (!fetchImpl) return "Error: The vessel has no ability to fetch.";

    const estimatedCost = estimateTokens(history);
    let runOrder = [...DEFAULT_MODEL_ORDER];
    
    if (preferredModel && GEMINI_CONFIG.models[preferredModel]) {
        runOrder = [preferredModel, ...runOrder.filter(m => m !== preferredModel)];
    }

    for (const model of runOrder) {
        const allowed = checkRateLimit(apiKey, model, estimatedCost);
        if (!allowed) continue; 

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: history, 
            generationConfig: {
                temperature: 0.3, maxOutputTokens: 8000
            }
        };

        try {
            const response = await fetchImpl(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 429) {
                recordUsage(apiKey, model, estimatedCost);
                continue; 
            }
            if (!response.ok) {
                if (response.status === 503) continue;
                return `Error: The oracle refused (${response.status}).`;
            }

            recordUsage(apiKey, model, estimatedCost);

            // B"H - TRUE STREAMING LOGIC
            if (response.body && response.body.getReader) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let fullText = "";
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    
                    // Robust extraction of "text" fields from JSON stream
                    // We match all occurrences of "text": "..." 
                    const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
                    let match;
                    while ((match = regex.exec(chunk)) !== null) {
                        try {
                            const segment = JSON.parse(`"${match[1]}"`);
                            fullText += segment;
                            // FIRE UPDATE IMMEDIATELY
                            if (onChunk) onChunk(fullText); 
                        } catch(e) {}
                    }
                }
                return fullText;
            } 
            else {
                // Fallback
                const data = await response.json();
                if (data.candidates && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                }
            }
            return ""; 
            
        } catch (e) {
            console.error(`B"H - Network Error on ${model}`, e.message);
            continue; 
        }
    }
    return "Error: All models are currently exhausted or unreachable.";
};