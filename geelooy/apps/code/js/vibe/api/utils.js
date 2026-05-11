
// B"H
/**
 * @file utils.js
 * @brief The Universal Translator of the Mind.
 */

export const ApiUtils = {
    /**
     * B"H
     * Standardizes the message history to the universal OpenAI-ish schema.
     * 
     * THE RECTIFICATION:
     * 1. Preserves 'thought_signature' for Gemini 3 models.
     * 2. Ensures 'content' is null if tool_calls are present to satisfy strict parsers.
     */
    standardizeMessages(messages) {
        if (!Array.isArray(messages)) return [];

        return messages.map(m => {
            let standardized = {
                role: m.role === 'model' ? 'assistant' : m.role,
                content: m.content || null
            };

            // Handle Tool Calls (The Oracle's Intent)
            if (m.tool_calls && m.tool_calls.length > 0) {
                standardized.tool_calls = m.tool_calls.map(tc => {
                    const call = {
                        id: tc.id,
                        type: 'function',
                        function: {
                            name: tc.function.name,
                            arguments: tc.function.arguments
                        }
                    };
                    
                    // B"H - CRITICAL GEMINI 3 COMPLIANCE:
                    // If a thought signature was provided by the model previously, 
                    // we MUST pass it back exactly in the history.
                    if (tc.thought_signature) {
                        call.thought_signature = tc.thought_signature;
                    }
                    
                    return call;
                });

                if (!standardized.content || standardized.content === "") {
                    standardized.content = null;
                }
            }
            
            // Handle Tool Responses (The Engine's Feedback)
            if (m.tool_call_id) {
                standardized.tool_call_id = m.tool_call_id;
                standardized.name = m.name;
                standardized.content = String(m.content || "Success");
            }

            return standardized;
        });
    },

    extractSystem(messages) {
        let systemPrompt = "";
        const filtered = messages.filter(m => {
            if (m.role === 'system') {
                systemPrompt += m.content + "\n";
                return false;
            }
            return true;
        });
        return { systemPrompt: systemPrompt.trim(), conversation: filtered };
    }
};
