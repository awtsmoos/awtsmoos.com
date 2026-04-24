
import { findTextSparks } from "./RecursiveGatherer.js";

/**
 * B"H
 * @class LexiconInterpreter
 * @description 
 * The mind that interprets the vision. 
 * It takes the chaotic stream of data and organizes it into the 
 * Seder Histalshelus (Order of Evolution) of the post.
 * 
 * Every section becomes a vessel; every paragraph becomes a spark.
 */
export class LexiconInterpreter {
    /**
     * @method translate
     * @description Normalizes the raw post object into an array of readable sections.
     * @param {Object} rawPost - The raw input from the API.
     * @returns {Array<Object>} - Array of sections: { id, type, paragraphs }
     */
    static translate(rawPost) {
        if (!rawPost) return [];

        // B"H - Extract the root sections array
        const rawData = rawPost.dayuh?.sections || rawPost.sections || [];
        const sectionsArray = Array.isArray(rawData) ? rawData : Object.values(rawData);

        console.log(`B"H - Lexicon: Interpreting ${sectionsArray.length} raw sections.`);

        return sectionsArray.map((rawSec, index) => {
            // Determine type if available
            const sectionType = rawSec.dayuh?.type || rawSec.type || "standard";
            
            // Extract all paragraphs within this specific section using recursion
            const paragraphs = findTextSparks(rawSec);

            return {
                id: index,
                type: sectionType,
                paragraphs: paragraphs
            };
        });
    }
}
