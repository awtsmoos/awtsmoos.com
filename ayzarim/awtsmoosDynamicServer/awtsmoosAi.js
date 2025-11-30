// B"H
/**
 * awtsmoosAi.js
 * The Urim VeTumim (The Oracle of Light)
 * 
 * Handles the communion with the Google Gemini API.
 * Features:
 * 1. Comprehensive Rate Limiting (RPM, TPM, RPD) for Free Tier.
 * 2. Automatic Model Fallback (The Chariot System).
 * 3. Priority Queue: Starts with 'preferredModel' or 'priority: 1', then cascades.
 * 4. ROBUST STREAMING: Uses "Optimistic Array Parsing" to guarantee capture.
 */

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

// --- 2. THE MEMORY (State Keeping) ---
const usageTracker = new Map();

// --- 3. THE GATEKEEPER LOGIC ---
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
    if (usage.requests.length >= limits.rpm) return false;

    usage.tokens = usage.tokens.filter(t => t.time > oneMinAgo);
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
    if (!apiKey) return "Error: No API Key provided for Wisdom.";
    if (!fetchImpl) return "Error: The vessel has no ability to fetch.";

    const estimatedCost = estimateTokens(history);
    let runOrder = [...DEFAULT_MODEL_ORDER];
    
    if (preferredModel && GEMINI_CONFIG.models[preferredModel]) {
        runOrder = [preferredModel, ...runOrder.filter(m => m !== preferredModel)];
    }

    for (const model of runOrder) {
        if (!checkRateLimit(apiKey, model, estimatedCost)) continue; 

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        try {
           // console.log(`B"H - Calling Gemini Stream: ${model}`);
            
            const response = await fetchImpl(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: history, 
                    generationConfig: {
                        temperature: 0.3,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 8000
                    }
                })
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

            // B"H - STREAMING LOGIC: OPTIMISTIC ARRAY PARSING
            if (response.body && response.body.getReader) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                
                let rawAccumulator = "";
                let lastEmittedLength = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    rawAccumulator += chunk;

                    // --- ATTEMPT PARSE ---
                    // This mimics your working client logic:
                    // 1. Take what we have so far.
                    // 2. Add ']' to close the JSON array.
                    // 3. Try to parse.
                    // 4. If success, extract text and send.
                    // 5. If fail (syntax error due to split packet), wait for next chunk.
                    
                    try {
                        let candidate = rawAccumulator.trim();
                        
                        // Gemini starts with '['. If we don't have that yet, wait.
                        if (!candidate.startsWith("[")) continue;

                        // Force close the array
                        if (!candidate.endsWith("]")) {
                            candidate += "]";
                        }

                        const jsonArray = JSON.parse(candidate);
                        
                        // Combine all text parts found so far
                        let currentFullText = "";
                        for (const item of jsonArray) {
                            const txt = item?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                            currentFullText += txt;
                        }

                        // Only emit if we have NEW text
                        if (currentFullText.length > lastEmittedLength) {
                            if (onChunk) onChunk(currentFullText);
                            lastEmittedLength = currentFullText.length;
                        }

                    } catch (e) {
                        // Expected error: Packet split in the middle of a string/key.
                        // We ignore and wait for more data to complete the syntax.
                    }
                }
                
                // Final flush (in case loop finished cleanly)
                return rawAccumulator; // Return buffer for logging if needed, but onChunk handled the stream.
            } 
            else {
                // FALLBACK: Non-streaming response
                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            }
            
        } catch (e) {
            console.error(`B"H - Network Error on ${model}`, e.message);
            continue; 
        }
    }

    return "Error: All models are currently exhausted or unreachable.";
};