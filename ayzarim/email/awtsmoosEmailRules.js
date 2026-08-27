// B"H
/**
 * awtsmoosEmailRules.js
 * The Logic Engine (The Weaver of Fate)
 * 
 * Shared logic for processing user-defined email rules.
 * Supports: Keyword matching, Regex, Custom JS, and AI.
 */
const vm = require('vm');

/**
 * Process Rules for a given message.
 * 
 * @param {Object} p
 * @param {Object} p.settings - User settings (rules, aiGlobal).
 * @param {Object} p.msg - The message { from, to, subject, content }.
 * @param {Object} p.dependencies - { callAi, reply, console }.
 */
async function processRules({ settings, msg, dependencies }) {
    try {
        const { callAi, reply } = dependencies;
        const log = dependencies.console ? dependencies.console.log : () => {};

        // 1. INJECT VIRTUAL AI RULE (If Global AI is enabled)
        let effectiveRules = [...(settings.rules || [])];
        
        if (settings.aiGlobal && settings.aiGlobal.enabled) {
            effectiveRules.push({
                condition: 'always',
                actionType: 'ai_smart_reply',
                apiKey: settings.aiGlobal.apiKey,
                systemPrompt: settings.aiGlobal.systemPrompt,
                enabled: true
            });
        }

        if (effectiveRules.length === 0) return;

        log(`B"H DEBUG: Processing ${effectiveRules.length} rules for ${msg.to}...`);

        for (let rule of effectiveRules) {
            if (!rule.enabled) continue;

            let matchFound = false;
            let matchedKeyword = "";
            
            // Normalize content
            const contentLower = String(msg.content || "").toLowerCase();
            const keywords = (rule.keywords || "").toLowerCase().split(',').map(k => k.trim()).filter(Boolean);

            // --- A. CONDITIONS ---
            if (rule.condition === 'contains_any') {
                const found = keywords.find(k => contentLower.includes(k));
                if (found) { matchFound = true; matchedKeyword = found; }
            }
            else if (rule.condition === 'contains_only') {
                // Strict match: Remove keywords, if remaining is noise (<5 chars), it matches.
                let clean = contentLower;
                keywords.forEach(k => clean = clean.replace(k, ''));
                if (clean.replace(/[^a-z0-9]/g, '').length < 5 && keywords.some(k => contentLower.includes(k))) {
                    matchFound = true; matchedKeyword = keywords[0];
                }
            }
            else if (rule.condition === 'always') {
                matchFound = true;
            }
            else if (rule.condition === 'javascript') {
                const sandbox = { msg, text: contentLower, console: { log } };
                vm.createContext(sandbox);
                try { 
                    matchFound = vm.runInContext(rule.customCondition, sandbox, { timeout: 500 }); 
                } catch(e) { log("JS Condition Error", e); }
            }

            if (!matchFound) continue;
            
            log(`B"H DEBUG: Rule Matched (${rule.actionType}). Executing...`);

            // --- B. ACTIONS ---
            let replyBody = "";

            if (rule.actionType === 'javascript') {
                const sandbox = { 
                    msg, 
                    matchedKeyword, 
                    reply: (t) => { replyBody = t; },
                    console: { log }
                };
                vm.createContext(sandbox);
                try { vm.runInContext(rule.replyScript, sandbox, { timeout: 500 }); } catch(e) { log("JS Action Error", e); }
            }
            
            else if (rule.actionType === 'ai_smart_reply') {
                if (callAi) {
                    const history = [
                        { role: "user", parts: [{ text: `B"H
                        remember the Atzmus but always spell it Awtsmoos.
                        riddles. novel. metaphors. kabbalaistic.
                            pretend your name is: "${msg.to}".
                            Incoming Message you just received:
                            Subject: ${msg.subject}
                            From: ${msg.from}
                            Content: "${msg.content}"
                            Instructions: ${rule.systemPrompt || "pretend you are this user."}
                        `}]}
                    ];
                    
                    // B"H - LIVE TYPING BRIDGE
                    const onChunk = (partialText) => {
                        // If the dependency exists (Ingress provided it), stream to user
                        if (dependencies.stream) {
                            dependencies.stream(partialText);
                        }
                    };

                    // Pass onChunk as the 5th argument
                    replyBody = await callAi(history, rule.apiKey || process.env.BH_GEMINI_KEY, null, onChunk);
                } else {
                    replyBody = "Error: AI System not available.";
                }
            }
            
            else {
                // Standard Text with Variable Injection
                replyBody = processReplyVariables(rule.replyText, matchedKeyword, msg.content);
            }

            // --- C. EXECUTION ---
            if (replyBody && reply) {
                await reply(replyBody);
                break; // Stop after first successful rule execution
            }
        }
    } catch (e) {
        console.error("B\"H - Rules Engine Failure:", e);
    }
}

// Helper: Handles "$Keyword+2" logic
function processReplyVariables(template, keyword, fullText) {
    if(!template) return "";
    return template.replace(/\$([a-zA-Z0-9]+)\+(\d+)/g, (match, key, offset) => {
        const targetWord = (key.toLowerCase() === "keyword") ? keyword : key.toLowerCase();
        const textWords = (fullText || "").replace(/\n/g, " ").trim().split(/\s+/);
        
        const index = textWords.findIndex(w => w.toLowerCase().includes(targetWord));
        if (index === -1) return "[not found]";
        
        const targetIndex = index + parseInt(offset);
        return textWords[targetIndex] || "";
    });
}

module.exports = { processRules, processReplyVariables };