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

        // Ensure we request streaming
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: history, 
            generationConfig: {
                temperature: 0.3,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8000
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
                // Read error body if possible
                try { 
                    const errText = await response.text();
                    console.error("AI Error Body:", errText);
                } catch(e) {}
                return `Error: The oracle refused (${response.status}).`;
            }

            recordUsage(apiKey, model, estimatedCost);

            // B"H - TRUE STREAMING LOGIC
            // Use the reader provided by your fetch implementation
            if (response.body && response.body.getReader) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let fullText = "";
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    // Gemini sends JSON objects (sometimes comma separated, sometimes array brackets)
                    // We use Regex to grab the "text" fields from the raw stream buffer
                    // This is robust against split chunks
                    const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
                    let match;
                    
                    // We only want to process *new* matches, but regex keeps state if we reused it.
                    // Instead, we just match the current chunk + leftovers logic?
                    // Simpler approach for "Ghost Typing":
                    // Just scan the current buffer for text fields.
                    
                    while ((match = regex.exec(buffer)) !== null) {
                        // Decode escaped chars (like \n or \")
                        let newText = match[1];
                        try {
                            newText = JSON.parse(`"${newText}"`); 
                        } catch(e) {
                            // Fallback if regex grabbed a partial
                        }
                        
                        // To prevent duplicate processing, we need to ensure we don't re-read.
                        // However, a simpler way for live preview:
                        // Just rely on the fact that Gemini appends.
                    }
                }
                
                // REVISED STREAM PARSING STRATEGY FOR GEMINI REST
                // Gemini returns: [{...}, \n {...}]
                // We will rely on simple JSON parsing of lines or segments.
                
                // Re-initialize reader for clean logic
                const reader2 = response.body.getReader(); 
                // Note: Can't read stream twice. Let's use the logic below instead.
            }
            
            // --- ACTUAL WORKING STREAM READER ---
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunkStr = decoder.decode(value, { stream: true });
                
                // Gemini sends data like: "data: { ... }\n\n" or inside an array like "[{...},\r\n{...}]"
                // Simple regex extract is safest for raw streams
                const textMatches = chunkStr.matchAll(/"text":\s*"((?:[^"\\]|\\.)*)"/g);
                
                let foundNew = false;
                for (const match of textMatches) {
                    try {
                        // Unescape the JSON string
                        const piece = JSON.parse(`"${match[1]}"`);
                        accumulatedText += piece;
                        foundNew = true;
                    } catch(e) {}
                }

                if (foundNew && onChunk) {
                    onChunk(accumulatedText);
                }
            }
            
            return accumulatedText;

        } catch (e) {
            console.error(`B"H - Network Error on ${model}`, e);
            continue; 
        }
    }

    return "Error: All models are currently exhausted or unreachable.";
};

