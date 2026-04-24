
/**
 * B"H
 * @class LexiconEngine
 * @description 
 * The Divine Interpreter. It recognizes that every data point is a vessel 
 * for a spark of meaning. Whether the spark is a string, an array, or an 
 * object, this engine gathers them all into the 'Otiyot' (Letters).
 */
export class LexiconEngine {
    /**
     * @method normalizePost
     * @description Orchestrates the normalization of the entire scroll.
     */
    static normalizePost(post) {
        if (!post) return [];
        const rawSections = post.dayuh?.sections || post.sections || [];
        const sectionsArray = Array.isArray(rawSections) ? rawSections : Object.values(rawSections);
        
        return sectionsArray.map((sec, idx) => {
            const normalized = {
                id: idx,
                type: sec.dayuh?.type || sec.type || "standard",
                paragraphs: this.deepExtract(sec)
            };
            return normalized;
        });
    }

    /**
     * @method deepExtract
     * @description 
     * Recursively traverses objects and arrays to find text.
     * Priority is given to common properties like 'text', 'subSections', 'paragraphs'.
     * @param {*} val - The vessel to explore.
     * @returns {Array<string>} - An array of pure text sparks.
     */
    static deepExtract(val) {
        if (!val) return [];

        // 1. Pure Text Spark
        if (typeof val === 'string') {
            return [val.trim()];
        }

        // 2. An Array of Vessels (Recursive traversal)
        if (Array.isArray(val)) {
            return val.flatMap(item => this.deepExtract(item));
        }

        // 3. A Complex Object Vessel
        if (typeof val === 'object' && val !== null) {
            // Priority path check based on observed manifestations
            const priorities = [
                'text',         // Screenshot style: obj.text = Array
                'subSections',  // Common nesting
                'paragraphs',   // Standard structure
                'content',      // Raw content field
                'textOrig',     // Snippet fallback
                'snippet'       // Deep nested snippet
            ];

            for (const key of priorities) {
                if (val[key] !== undefined && val[key] !== null) {
                    return this.deepExtract(val[key]);
                }
            }

            // If no priority key exists, gather all string values in the object
            // excluding metadata keys
            const ignored = ['id', 'sectionIdx', 'type', 'index'];
            return Object.entries(val)
                .filter(([k]) => !ignored.includes(k))
                .flatMap(([_, v]) => this.deepExtract(v));
        }

        return [];
    }
}
