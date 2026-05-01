
/**
 * B"H
 * @module UniversalInterpreter
 * @chapter The Unity of Disparate Voices
 * @description
 * Just as the Essence of the Creator (the Awtsmoos) is found equally in 
 * a tiny stone and a massive star, so too must our logic find the 
 * soul of the data (the 'Dayuh') regardless of which vessel it chooses 
 * to inhabit. 
 * 
 * Some data arrives as a singular string (a pure spark), while others 
 * arrive as complex, nested structures (worlds within worlds). This 
 * module is the Divine Translator. It recognizes the 5 streams of 
 * manifestation and ensures that no letter of the Creator's speech 
 * is left behind in the void.
 */

export class UniversalInterpreter {
    /**
     * @method decipher
     * @description 
     * Takes a raw section of data and identifies the 'flat' text 
     * (the literal surface) and the 'dynamic' content (the inner parts).
     * 
     * @param {Object|string|Array} data - The primordial vessel of information.
     * @returns {Object} - An object containing { flatText, dynamicContent }.
     */
    static decipher(data) {
        if (!data) return { flatText: null, dynamicContent: null };

        // B"H - Stream 1: The Singular Spark (A pure string)
        if (typeof data === 'string') {
            return { flatText: data, dynamicContent: null };
        }

        // B"H - Stream 2: The Pure Array of Revelations
        if (Array.isArray(data)) {
            return { flatText: null, dynamicContent: data };
        }

        /**
         * B"H - Streams 3, 4, and 5: The Structured Objects.
         * We hunt for the text within specific, known dimensions (keys).
         */
        const textKey = data.text;
        const paragraphKey = data.paragraphs;
        const subSectionKey = data.subSections;

        // If 'text' is an array (like in the screenshot), treat it as sub-sections (Dynamic).
        const dynamic = subSectionKey || paragraphKey || (Array.isArray(textKey) ? textKey : null);
        
        // If 'text' is a string, treat it as the main flat text.
        const flat = (typeof textKey === 'string') ? textKey : null;

        return {
            flatText: flat,
            dynamicContent: dynamic
        };
    }

    /**
     * @method extractPureText
     * @description
     * Deeply traverses any vessel to find the pure 'Speech' (strings) within,
     * joining them into a unified stream for caching and global memory.
     * 
     * @param {*} d - The object to explore.
     * @returns {string|Array} - The extracted soul of the text.
     */
    static extractPureText(d) {
        if (typeof d === 'string') return d;
        
        if (Array.isArray(d)) {
            return d.map(item => this.extractPureText(item)).flat(Infinity);
        }

        if (d && typeof d === 'object') {
            // Prioritize text-holding keys
            const target = d.text || d.paragraphs || d.subSections;
            if (target) return this.extractPureText(target);
        }

        return "";
    }
}
