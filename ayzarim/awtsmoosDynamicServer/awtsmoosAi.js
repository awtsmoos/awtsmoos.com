// B"H
/**
 * awtsmoosAi.js
 * The Urim VeTumim (The Oracle of Light)
 * 
 * ROBUST EDITION: Uses Native HTTPS + Regex Stream Scanning.
 * Fixes "Ghost Typing" by ignoring complex JSON structure (Arrays) and 
 * extracting text deltas directly from the stream buffer.
 */

const https = require('https'); 

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
                    
                    res.on('data', (chunk) => {
                        buffer += chunk;
                        
                        // B"H - Regex Stream Scanner
                        // Matches "text": "..." while respecting escaped quotes.
                        // We use Regex instead of JSON.parse because Gemini wraps the response in an Array [ ... ]
                        // causing standard bracket counters to wait until the END of the stream.
                        const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                        
                        let match;
                        let lastIndex = 0;
                        let foundAny = false;

                        // Execute regex on the accumulated buffer
                        while ((match = regex.exec(buffer)) !== null) {
                            try {
                                // Parse the JSON string content (handles \n, \", etc)
                                // We wrap match[1] in quotes to use JSON.parse's string decoding
                                const textSegment = JSON.parse(`"${match[1]}"`);
                                
                                if (textSegment) {
                                    fullAggregatedText += textSegment;
                                    
                                    // B"H - FIRE THE CHUNK IMMEDIATELY
                                    if (onChunk) onChunk(fullAggregatedText);
                                }
                            } catch (e) {
                                // Ignore parsing errors on segments
                            }
                            
                            lastIndex = regex.lastIndex;
                            foundAny = true;
                        }

                        // Optimization: Discard processed parts of the buffer
                        // But ONLY if we matched something.
                        if (lastIndex > 0) {
                            buffer = buffer.substring(lastIndex);
                        }
                    });

                    res.on('end', () => resolve(fullAggregatedText));
                });

                req.on('error', (e) => reject(e));
                req.write(JSON.stringify({ contents: history, generationConfig: { maxOutputTokens: 8000 } }));
                req.end();
            });

            if (finalResult && typeof finalResult === 'string' && finalResult.length > 0) {
                recordUsage(apiKey, model, estimatedCost);
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