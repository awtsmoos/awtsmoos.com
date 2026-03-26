
// B"H
/**
 * @file compressor.js
 * @brief The Master of Tzimtzum (Contraction).
 */

export const HistoryCompressor = {
    /**
     * @function compress
     * @description Purges raw code blocks from the model's history. 
     * The model ALWAYS receives the complete context via the system prompt dynamically built from the current state.
     * Thus, it does NOT need to see previous <change> payloads, which just bloat the token count to infinity.
     * @param {Array<Object>} history - The full chat history.
     * @returns {Array<Object>} The compressed history.
     */
    compress(history) {
        if (!Array.isArray(history)) return [];

        return history.map(msg => {
            if (msg.role === 'model') {
                let content = msg.content;
                
                // Aggressively match all <change> blocks and remove them entirely.
                // We use [\s\S]*? to match across newlines lazily.
                const regex = /<change>[\s\S]*?<\/change>/gi;
                
                if (regex.test(content)) {
                    content = content.replace(regex, `\n[B"H: Changes manifested. View current system context for updated reality.]\n`);
                }
                
                return { ...msg, content };
            }
            return msg;
        });
    }
};
