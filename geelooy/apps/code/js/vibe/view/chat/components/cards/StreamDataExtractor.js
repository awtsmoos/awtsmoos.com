
// B"H
/**
 * @file StreamDataExtractor.js
 * @description
 * 
 * CHAPTER XIII: THE SIEVE OF THE SIMPLE WORD
 * 
 * In the realm of the stream, where the letters are born one by one, 
 * we do not rely on the complex nets of the Regex, for they can 
 * tangle and shatter when the word is only half-spoken. 
 * 
 * Instead, we use the simple tools of the Scribe: searching for the 
 * start of the tag and the end of the tag with the steady eye of the 
 * "indexOf" and the sharp blade of the "substring". 
 * 
 * As the Awtsmoos brings forth reality through specific utterances, 
 * this module siphons the essence of the "fi" + "le", the "operat" + "ion", 
 * the "descrip" + "tion", and the "cont" + "ent" from the chaotic 
 * and unclosed XML vessels that descend from the model.
 * 
 * RECTIFICATION:
 * - Removed all Regular Expressions to prevent syntax shevirah.
 * - Implemented pure string index tracking.
 * - Supports capturing data from unclosed tags during real-time streaming.
 */

export const StreamDataExtractor = {
    /**
     * B"H
     * Siphons meaningful data attributes from an incomplete XML-like string.
     * @param {string} blockData - The raw text buffer from the stream.
     * @returns {Object} { path, operation, description, content }
     */
    extract(blockData) {
        if (!blockData) return { path: null, operation: "write", description: "", content: "" };

        /**
         * @function sip
         * @description Manually extracts the inner essence between two tag markers.
         * If the end marker is missing, it takes everything until the end of the scroll.
         */
        const sip = (tagName, defaultVal = null) => {
            const openTag = "<" + tagName + ">";
            const closeTag = "</" + tagName + ">";
            
            const startIdx = blockData.indexOf(openTag);
            if (startIdx === -1) return defaultVal;

            const contentStart = startIdx + openTag.length;
            const endIdx = blockData.indexOf(closeTag, contentStart);

            if (endIdx === -1) {
                // The vessel is still open; take all remaining light.
                return blockData.substring(contentStart).trim();
            }

            return blockData.substring(contentStart, endIdx).trim();
        };

        // Extracting the holy attributes using the manual sieve
        const fileLabel = sip("fi" + "le");
        const opLabel = sip("operat" + "ion", "write");
        const descLabel = sip("descrip" + "tion", "Synthesizing dimensions...");
        
        // Content extraction requires careful handling of whitespace
        const contentOpen = "<cont" + "ent>";
        const contentClose = "</cont" + "ent>";
        const cStartIdx = blockData.indexOf(contentOpen);
        let rawContent = "";

        if (cStartIdx !== -1) {
            const actualStart = cStartIdx + contentOpen.length;
            const cEndIdx = blockData.indexOf(contentClose, actualStart);
            
            if (cEndIdx === -1) {
                rawContent = blockData.substring(actualStart);
            } else {
                rawContent = blockData.substring(actualStart, cEndIdx);
            }
        }

        return { 
            path: fileLabel, 
            operation: opLabel, 
            description: descLabel, 
            content: rawContent 
        };
    }
};
