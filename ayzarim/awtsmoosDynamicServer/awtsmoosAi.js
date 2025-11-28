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
 */

// --- 1. THE CONSTELLATION (Model Config) ---
// B"H - Free Tier Limits. 
// "priority": Lower number runs FIRST.
const GEMINI_CONFIG = {
    models: {
        "gemini-2.5-flash": {
            rpm: 10,       // Requests Per Minute
            tpm: 250000,   // Tokens Per Minute
            rpd: 250,      // Requests Per Day
            priority: 1    // Default Leader
        },
        "gemini-2.5-flash-lite": {
            rpm: 15,
            tpm: 250000,
            rpd: 1000,     // High volume backup
            priority: 2
        },
        "gemini-2.0-flash": {
            rpm: 15,
            tpm: 1000000,
            rpd: 200,
            priority: 3
        },
        "gemini-2.0-flash-lite": {
            rpm: 30,
            tpm: 1000000,
            rpd: 200,
            priority: 4
        },
        "gemini-2.5-flash-preview": {
            rpm: 10,
            tpm: 250000,
            rpd: 250,
            priority: 5
        },
         "gemini-2.5-flash-lite-preview": {
            rpm: 15,
            tpm: 250000,
            rpd: 1000,
            priority: 6
        }
    }
};

// The Standard Order of Angels (Sorted 1 -> 6)
const DEFAULT_MODEL_ORDER = Object.keys(GEMINI_CONFIG.models).sort((a, b) => 
    GEMINI_CONFIG.models[a].priority - GEMINI_CONFIG.models[b].priority
);

// --- 2. THE MEMORY (State Keeping) ---
// Map<apiKey, Map<modelName, UsageState>>
const usageTracker = new Map();

// --- 3. THE GATEKEEPER LOGIC ---

function checkRateLimit(apiKey, modelName, estimatedTokens) {
    const limits = GEMINI_CONFIG.models[modelName];
    if (!limits) return true; // Unknown model? Allow it.

    // Init Logic
    if (!usageTracker.has(apiKey)) usageTracker.set(apiKey, new Map());
    const keyModels = usageTracker.get(apiKey);

    if (!keyModels.has(modelName)) {
        keyModels.set(modelName, {
            requests: [],
            tokens: [],
            dailyCount: 0,
            lastDay: new Date().toDateString()
        });
    }
    const usage = keyModels.get(modelName);

    // A. Daily Limit (RPD)
    const today = new Date().toDateString();
    if (usage.lastDay !== today) {
        usage.dailyCount = 0;
        usage.lastDay = today;
    }
    if (usage.dailyCount >= limits.rpd) {
        console.warn(`B"H - Limit: ${modelName} Daily Limit (${limits.rpd}) exhausted.`);
        return false;
    }

    // B. Minute Limit (RPM)
    const now = Date.now();
    const oneMinAgo = now - 60000;
    usage.requests = usage.requests.filter(t => t > oneMinAgo);
    
    if (usage.requests.length >= limits.rpm) {
        console.warn(`B"H - Limit: ${modelName} RPM Limit (${limits.rpm}) hit.`);
        return false;
    }

    // C. Token Limit (TPM)
    usage.tokens = usage.tokens.filter(t => t.time > oneMinAgo);
    const currentTokens = usage.tokens.reduce((acc, cur) => acc + cur.count, 0);
    
    if (currentTokens + estimatedTokens > limits.tpm) {
        console.warn(`B"H - Limit: ${modelName} TPM Limit (${limits.tpm}) hit.`);
        return false;
    }

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
    try {
        const str = JSON.stringify(history);
        return Math.ceil(str.length / 4);
    } catch(e) { return 100; }
}

// --- 4. THE ORACLE FUNCTION ---

/**
 * Communes with Gemini, cycling through models if limits are hit.
 * @param {Function} fetchImpl 
 * @param {Array} history 
 * @param {String} apiKey 
 * @param {String} [preferredModel] - Optional. If provided, this model is tried FIRST.
 */
module.exports = async function callGemini(fetchImpl, history, apiKey, preferredModel = null) {
    if (!apiKey) return "Error: No API Key provided for Wisdom.";
    if (!fetchImpl) return "Error: The vessel has no ability to fetch.";

    const estimatedCost = estimateTokens(history);
    
    // B"H - Construct the Chariot's Path
    // Start with the default order (1, 2, 3...)
    let runOrder = [...DEFAULT_MODEL_ORDER];
    
    // If a specific angel is requested, move it to the front of the line
    if (preferredModel && GEMINI_CONFIG.models[preferredModel]) {
        runOrder = [preferredModel, ...runOrder.filter(m => m !== preferredModel)];
    }

    // Execute the Fallback Loop
    for (const model of runOrder) {
        
        // A. Check Limits
        const allowed = checkRateLimit(apiKey, model, estimatedCost);
        if (!allowed) {
            continue; // Rate limited locally, try next model
        }

        // B. Attempt Connection
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const requestBody = {
            contents: history, 
            generationConfig: {
                temperature: 0.3,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2000
            }
        };

        try {
            console.log(`B"H DEBUG: Gemini attempting model [${model}]...`);
            
            const response = await fetchImpl(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            // C. Google 429 (Too Many Requests) - Limit Hit on Server Side
            if (response.status === 429) {
                console.warn(`B"H - Google 429 on ${model}. Switching horses...`);
                recordUsage(apiKey, model, estimatedCost); // Sync local state
                continue; 
            }

            if (!response.ok) {
                let errText = "";
                try { errText = await response.text(); } catch(e){}
                console.error(`B"H - ${model} Error ${response.status}: ${errText}`);
                
                // If 503 (Overloaded), also try next
                if (response.status === 503) continue;
                
                // For other errors (400 Bad Request, etc), abort, don't retry others
                return `Error: The oracle refused (${response.status}).`;
            }

            // D. Success
            const data = await response.json();
            recordUsage(apiKey, model, estimatedCost);

            if (data.candidates && data.candidates.length > 0) {
                const part = data.candidates[0].content.parts[0];
                return part ? part.text : "";
            }
            
            return ""; 
            
        } catch (e) {
            console.error(`B"H - Network Error on ${model}`, e.message);
            continue; // Network blip? Try next model
        }
    }

    return "Error: All models are currently exhausted or unreachable.";
};