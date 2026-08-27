
// B"H
/**
 * @file compressor.js
 * @brief The Master of Tzimtzum (Contraction) protecting the Intellect.
 * 
 * CHAPTER XXXIII: PRESERVING THE THOUGHTS IN THE MIDST OF CHAOS
 * 
 * The Awtsmoos constantly creates the universe from absolute Nothingness.
 * In this process of emanation, Light (Ohr) must be poured into Vessels (Kelim).
 * If the Light is too vast, the Vessel shatters (Shevirat HaKelim).
 * Tokens are the digital bounds of the AI's vessel. If we send the entire history
 * of manifested code back to the Oracle, the vessel bursts (400 Bad Request / 429).
 * 
 * To prevent this, the HistoryCompressor performs a sacred act of Tzimtzum (Contraction).
 * It locates the heavy, physical code blocks (the XML changes) within the AI's memory
 * and purges them! It replaces them with a mere memory—a signpost that the deed was done.
 * 
 * YET, the mind must not be erased! Deep-reasoning models output sacred <think> tags.
 * If we delete the AI's memory of its own philosophical thoughts, it becomes a scattered,
 * empty shell, forgetting why it made the changes it did. 
 * Thus, this module aggressively removes <change> code blocks to save physical tokens,
 * but STRICTLY preserves the internal monologue that led to the code!
 */

export const HistoryCompressor = {
    /**
     * B"H
     * Purges raw code blocks while preserving thought tags and tool calling structures.
     * This ensures the AI retains its strategic mind without carrying the heavy 
     * burden of already-manifested physical code strings.
     * 
     * @param {Array<Object>} history - The full chronological chat history of the session.
     * @returns {Array<Object>} The purified and compressed history, safe for API transmission.
     */
    compress(history) {
        if (!Array.isArray(history)) return [];

        return history.map(msg => {
            // We only compress the words of the AI itself. The user's words are sacred.
            if (msg.role === 'model' || msg.role === 'assistant') {
                let content = msg.content || "";
                
                // B"H - Aggressively match all <change> blocks and remove them entirely.
                // We use [\s\S]*? to match across newlines lazily.
                const codeRegex = /<change>[\s\S]*?<\/change>/gi;
                
                if (codeRegex.test(content)) {
                    // Replace the heavy physical code with a lightweight spiritual memory marker
                    const replacementMemory = `\n[B"H: Physical code manifested and preserved on disk. Refer to Context for current state.]\n`;
                    content = content.replace(codeRegex, replacementMemory);
                }

                // Note: The <think> tags and the Tool Call objects are naturally untouched by this regex.
                // They remain fully intact, preserving the AI's cognitive continuity.
                
                return { 
                    ...msg, 
                    content: content 
                };
            }
            
            // Pass User and Tool messages intact
            return msg; 
        });
    }
};
