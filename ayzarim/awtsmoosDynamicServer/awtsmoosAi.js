// B"H
/**
 * awtsmoosAi.js
 * DIRECT HTTPS STREAMING
 * Bypasses custom fetch polyfills to guarantee real-time packet delivery.
 */

const https = require('https'); // Direct dependency for stability

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

function checkRateLimit(apiKey, modelName, estimatedTokens) { return true; } // Keep full logic if you have it
function recordUsage(apiKey, modelName, tokenCount) {} // Keep full logic if you have it

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
        // (Add your rate limit check here if needed)
        
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
                        // Consume response to free memory
                        res.resume();
                        if (res.statusCode === 429 || res.statusCode === 503) {
                            return reject({ retry: true });
                        }
                        return reject(new Error(`Gemini Error: ${res.statusCode}`));
                    }

                    res.setEncoding('utf8');

                    // --- ROBUST STREAM LOGIC ---
                    let rawAccumulator = "";
                    let lastEmittedLength = 0;

                    res.on('data', (chunk) => {
                        rawAccumulator += chunk;

                        // OPTIMISTIC PARSING STRATEGY
                        // 1. Temporarily close the array
                        // 2. Parse what we have
                        // 3. Emit difference
                        try {
                            let candidate = rawAccumulator.trim();
                            if (!candidate.startsWith("[")) return; // Wait for start
                            if (!candidate.endsWith("]")) candidate += "]"; // Close it

                            const ar = JSON.parse(candidate);
                            let currentFullText = "";
                            
                            for (const item of ar) {
                                currentFullText += (item?.candidates?.[0]?.content?.parts?.[0]?.text || "");
                            }

                            if (currentFullText.length > lastEmittedLength) {
                                if (onChunk) onChunk(currentFullText); // FIRE!
                                lastEmittedLength = currentFullText.length;
                            }
                        } catch (e) {
                            // Packet split in middle of JSON. Wait for next chunk.
                        }
                    });

                    res.on('end', () => {
                        // One final parse to be sure
                        try {
                           let candidate = rawAccumulator.trim();
                           if(!candidate.endsWith("]")) candidate += "]";
                           const ar = JSON.parse(candidate);
                           let finalTxt = "";
                           for(const item of ar) finalTxt += (item?.candidates?.[0]?.content?.parts?.[0]?.text || "");
                           resolve(finalTxt);
                        } catch(e) {
                            // If parse failed, return what we emitted so far
                            // (Likely empty if error, but 'lastEmittedLength' tracks valid state)
                            // We can just return empty string if it failed, or rawAccumulator if simple text
                            resolve(rawAccumulator); 
                        }
                    });
                });

                req.on('error', (e) => reject(e));
                
                req.write(JSON.stringify({ 
                    contents: history,
                    generationConfig: { maxOutputTokens: 8000 }
                }));
                req.end();
            });

            // If success, return the text
            if (finalResult && typeof finalResult === 'string' && finalResult.length > 0) {
                 // Try to return clean text, or at least the JSON array string if parse failed at very end
                 try {
                     // Check if it's the raw JSON string
                     if(finalResult.trim().startsWith("[")) {
                         const ar = JSON.parse(finalResult);
                         let txt = "";
                         for(const i of ar) txt += (i?.candidates?.[0]?.content?.parts?.[0]?.text || "");
                         return txt;
                     }
                 } catch(e){}
                 return finalResult;
            }

        } catch (err) {
            if (err.retry) {
                // recordUsage(apiKey, model, estimatedCost);
                continue; 
            }
            console.error(`B"H - Stream Error on ${model}:`, err.message);
            continue;
        }
    }

    return "Error: All models are currently exhausted or unreachable.";
};