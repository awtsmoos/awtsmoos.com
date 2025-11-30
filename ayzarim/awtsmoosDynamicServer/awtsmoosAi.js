// B"H
/**
 * awtsmoosAi.js
 * The Urim VeTumim (The Oracle of Light)
 * Module Exports & Streaming Logic
 */


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
// B"H
/**
 * awtsmoosAi.js
 * Native HTTPS + State-Preserving Stream Parser
 * 
 * Correctly handles:
 * 1. Brackets {} inside the AI's text (Code blocks, etc.)
 * 2. Split packets (Network fragmentation)
 * 3. Escaped quotes \" inside strings
 */

const https = require('https'); 



module.exports = async function callGemini(fetchImpl, history, apiKey, preferredModel = null, onChunk = null) {
    if (!apiKey) return "Error: No API Key provided for Wisdom.";

    const estimatedCost = estimateTokens(history);
    let runOrder = [...DEFAULT_MODEL_ORDER];
    
    if (preferredModel && GEMINI_CONFIG.models[preferredModel]) {
        runOrder = [preferredModel, ...runOrder.filter(m => m !== preferredModel)];
    }

    for (const model of runOrder) {
        if (!checkRateLimit(apiKey, model, estimatedCost)) continue;

        const hostname = "generativelanguage.googleapis.com";
        const path = `/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        try {
            const finalResult = await new Promise((resolve, reject) => {
                const req = https.request({
                    hostname,
                    path,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (res) => {
                    if (res.statusCode !== 200) {
                        res.resume(); 
                        if (res.statusCode === 429 || res.statusCode === 503) return reject({ retry: true });
                        return reject(new Error(`Gemini Error: ${res.statusCode}`));
                    }

                    res.setEncoding('utf8');

                    let buffer = "";
                    let fullAggregatedText = ""; 
                    
                    // --- STATE VARIABLES MUST BE HERE (Outside on('data')) ---
                    let balance = 0;
                    let inString = false;
                    let escape = false;

                    res.on('data', (chunk) => {
                        buffer += chunk;
                        
                        let startIndex = 0;

                        // Iterate through the buffer to find complete JSON objects
                        // We modify 'buffer' as we go, so we use a while loop or careful indexing
                        // Better: Scan linearly and slice buffer at the end
                        
                        let i = 0;
                        while (i < buffer.length) {
                            const char = buffer[i];

                            // 1. Handle String State (Ignore brackets inside text)
                            if (char === '"' && !escape) {
                                inString = !inString;
                            }
                            
                            // Handle Escapes (e.g., \" or \\)
                            if (inString) {
                                if (char === '\\' && !escape) {
                                    escape = true;
                                } else {
                                    escape = false;
                                }
                                i++;
                                continue; // Skip bracket checks while in string
                            }

                            // 2. Bracket Counting (Structure Only)
                            if (char === '{') {
                                balance++;
                            } else if (char === '}') {
                                balance--;
                                
                                // 3. Found a complete JSON object at root level
                                if (balance === 0) {
                                    const jsonStr = buffer.substring(0, i + 1);
                                    
                                    // Process this object
                                    try {
                                        // Ignore the opening '[' or ',' if they are stuck to the front
                                        const cleanJson = jsonStr.replace(/^[,\s\[]+/, "");
                                        
                                        if (cleanJson.startsWith("{")) {
                                            const json = JSON.parse(cleanJson);
                                            const newText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                                            
                                            if (newText) {
                                                fullAggregatedText += newText;
                                                if (onChunk) onChunk(fullAggregatedText);
                                            }
                                        }
                                    } catch (e) {
                                        // If parse fails, it might be the starting '[' array bracket
                                        // We safely ignore non-object chunks
                                    }

                                    // 4. Remove processed part from buffer
                                    buffer = buffer.substring(i + 1);
                                    i = -1; // Reset index since buffer shrank
                                }
                            }
                            i++;
                        }
                    });

                    res.on('end', () => resolve(fullAggregatedText));
                });

                req.on('error', (e) => reject(e));
                req.write(JSON.stringify({ contents: history, generationConfig: { maxOutputTokens: 8000 } }));
                req.end();
            });

            if (finalResult && typeof finalResult === 'string' && finalResult.length > 0) return finalResult;

        } catch (err) {
            if (err.retry) continue;
            console.error(`B"H - Stream Error on ${model}:`, err.message);
            continue;
        }
    }

    return "Error: All models are currently exhausted or unreachable.";
};