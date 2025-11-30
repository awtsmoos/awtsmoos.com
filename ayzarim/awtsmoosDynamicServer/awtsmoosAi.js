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
// B"H
/**
 * awtsmoosAi.js
 * The Urim VeTumim (The Oracle of Light)
 * 
 * Uses Native HTTPS + Optimistic Array Parsing
 * to guarantee 100% streaming reliability without buffering glitches.
 */



// --- 4. THE ORACLE FUNCTION ---
module.exports = async function callGemini(fetchImpl, history, apiKey, preferredModel = null, onChunk = null) {
    if (!apiKey) return "Error: No API Key provided for Wisdom.";

    const estimatedCost = estimateTokens(history);
    let runOrder = [...DEFAULT_MODEL_ORDER];
    
    if (preferredModel && GEMINI_CONFIG.models[preferredModel]) {
        runOrder = [preferredModel, ...runOrder.filter(m => m !== preferredModel)];
    }

    for (const model of runOrder) {
        
        const hostname = "generativelanguage.googleapis.com";
        const path = `/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        try {
            const finalResult = await new Promise((resolve, reject) => {
                const req = https.request({
                    hostname, path, method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (res) => {
                    if (res.statusCode !== 200) {
                        res.resume(); // Drain
                        if (res.statusCode === 429 || res.statusCode === 503) return reject({ retry: true });
                        return reject(new Error(`Gemini Error: ${res.statusCode}`));
                    }

                    res.setEncoding('utf8');

                    // B"H - ROBUST STREAM BUFFER
                    let rawAccumulator = "";
                    let lastEmittedLength = 0;

                    res.on('data', (chunk) => {
                        rawAccumulator += chunk;

                        // --- OPTIMISTIC ARRAY PARSING (Your Trusted Logic) ---
                        try {
                            let candidate = rawAccumulator.trim();
                            if (!candidate.startsWith("[")) return; 

                            // Temporarily close array
                            if (!candidate.endsWith("]")) candidate += "]";

                            const ar = JSON.parse(candidate);
                            let currentFullText = "";
                            
                            for (const item of ar) {
                                currentFullText += (item?.candidates?.[0]?.content?.parts?.[0]?.text || "");
                            }

                            // If we have new text, emit immediately
                            if (currentFullText.length > lastEmittedLength) {
                                if (onChunk) onChunk(currentFullText);
                                lastEmittedLength = currentFullText.length;
                            }
                        } catch (e) {
                            // Syntax error (split packet)? Ignore and wait for next chunk.
                        }
                    });

                    res.on('end', () => {
                        // Final consistency check
                         try {
                           let candidate = rawAccumulator.trim();
                           if(!candidate.endsWith("]")) candidate += "]";
                           const ar = JSON.parse(candidate);
                           let finalTxt = "";
                           for(const item of ar) finalTxt += (item?.candidates?.[0]?.content?.parts?.[0]?.text || "");
                           resolve(finalTxt);
                        } catch(e) { resolve(rawAccumulator); }
                    });
                });

                req.on('error', (e) => reject(e));
                
                req.write(JSON.stringify({ 
                    contents: history,
                    generationConfig: { maxOutputTokens: 8000 }
                }));
                req.end();
            });

            // Return the final result string
            if (finalResult && typeof finalResult === 'string' && finalResult.length > 0) {
                 return finalResult;
            }

        } catch (err) {
            if (err.retry) continue;
            console.error(`B"H - Stream Error on ${model}:`, err.message);
            continue;
        }
    }

    return "Error: All models are currently exhausted or unreachable.";
};