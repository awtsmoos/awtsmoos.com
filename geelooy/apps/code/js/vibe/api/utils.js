// B"H
/**
 * @file utils.js
 * @brief The universal translator of text, tools, and multimodal content.
 *
 * Chapter 6: The messenger used to flatten every offering into text. Now it
 * preserves arrays of OpenAI-compatible content parts so images, audio, video,
 * and snapshots can reach models that support them.
 */

export const ApiUtils = {
    standardizeMessages(messages) {
        if (!Array.isArray(messages)) return [];
        return messages.map(m => {
            const standardized = {
                role: m.role === 'model' ? 'assistant' : m.role,
                content: normalizeContent(m.content)
            };
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
                    if (tc.thought_signature) call.thought_signature = tc.thought_signature;
                    return call;
                });
                if (!standardized.content || standardized.content === "") standardized.content = null;
            }
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
                systemPrompt += stringifyContent(m.content) + "\n";
                return false;
            }
            return true;
        });
        return { systemPrompt: systemPrompt.trim(), conversation: filtered };
    }
};

function normalizeContent(content) {
    if (Array.isArray(content)) return content;
    if (content === undefined || content === null) return null;
    return String(content);
}

function stringifyContent(content) {
    if (Array.isArray(content)) {
        return content.map(part => part?.text || part?.image_url?.url || part?.video_url?.url || part?.type || '').filter(Boolean).join('\n');
    }
    return String(content || '');
}
