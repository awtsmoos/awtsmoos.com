// B"H
/**
 * awtsmoosAi.js
 * The Urim VeTumim (The Oracle of Light)
 * Fixed: True Streaming Support using getReader() and Chunk Parsing
 */

const { TextDecoder } = require('util');

// --- 1. THE CONSTELLATION (Model Config) ---
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

// --- 2. STATE ---
const usageTracker = new Map();

// --- 3. LIMIT CHECKER ---
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

// --- 4. THE ORACLE FUNCTION ---
module.exports = async function callGemini(fetchImpl, history, apiKey, preferredModel = null, onChunk = null) {
    if (!apiKey) return "Error: No API Key.";
    if (!fetchImpl) return "Error: No fetch.";

    const estimatedCost = estimateTokens(history);
    let runOrder = [...DEFAULT_MODEL_ORDER];
    if (preferredModel && GEMINI_CONFIG.models[preferredModel]) {
        runOrder = [preferredModel, ...runOrder.filter(m => m !== preferredModel)];
    }

    for (const model of runOrder) {
        if (!checkRateLimit(apiKey, model, estimatedCost)) continue;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: history, 
            generationConfig: {
                temperature: 0.3, topP: 0.95, topK: 40, maxOutputTokens: 65536,
                thinkingConfig: { thinkingBudget: 0 }
            }
        };

        try {
            console.log(`B"H - Stream Request: ${model}`);
            const response = await fetchImpl(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 429) { recordUsage(apiKey, model, estimatedCost); continue; }
            if (!response.ok) {
                if (response.status === 503) continue;
                return `Error: ${response.status}`;
            }

            // B"H - REAL TIME STREAMING LOGIC
            recordUsage(apiKey, model, estimatedCost);
            
            // 1. Get the Reader
            const reader = response.body.getReader ? response.body.getReader() : null;
            if (!reader) {
                // Fallback for non-stream environments: wait for full JSON
                const data = await response.json();
                return extractTextFromFullJson(data);
            }

            const decoder = new TextDecoder();
            let accumulatedText = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 2. Decode Chunk
                const chunkStr = decoder.decode(value, { stream: true });
                buffer += chunkStr;

                // B"H - Simplified Parsing Logic (Client-Style)
                // Attempt to parse the accumulating array by forcing it closed
                try {
                    let tempBuffer = buffer.trim();
                    // If stream isn't finished, it won't have the closing bracket
                    if (!tempBuffer.endsWith(']')) {
                        tempBuffer += ']';
                    }

                    // Parse the whole array so far
                    const jsonArray = JSON.parse(tempBuffer);
                    
                    // Re-calculate the full text state
                    let currentFullText = "";
                    for (const item of jsonArray) {
                        const piece = item?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        currentFullText += piece;
                    }

                    // 3. Fire Callback (Updates Ghost Bubble)
                    if (currentFullText && onChunk) {
                        onChunk(currentFullText);
                    }
                    
                    accumulatedText = currentFullText;

                } catch (e) {
                    // Buffer is not yet valid JSON (e.g. cut in the middle of a string), wait for next chunk
                }
            }

            return accumulatedText;
            
            } catch (e) {
            console.error(`B"H - Stream Error ${model}`, e);
            continue; 
        }
    }

    return "Error: All models exhausted.";
};

// Helper for fallback non-stream
function extractTextFromFullJson(data) {
    if (Array.isArray(data)) {
        return data.map(chunk => 
            chunk.candidates?.[0]?.content?.parts?.[0]?.text || ""
        ).join("");
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}