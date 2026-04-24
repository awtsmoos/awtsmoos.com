
/**
 * B"H
 * @module RecursiveGatherer
 * @description 
 * In the beginning, the Essence was hidden in the infinite. 
 * Then came the contraction, creating vessels. 
 * This module is the explorer of those vessels. It searches through the 
 * broken shards (nested JSON) to find the original light (Text Strings).
 * 
 * It treats every data point as a potential dwelling for the Creator's word.
 */

/**
 * @function findTextSparks
 * @description 
 * Recursively hunts for text within a nested structure. 
 * If it finds an array of strings, it treats them as a unified sequence of paragraphs.
 * @param {*} vessel - The object or array to search.
 * @param {Array<string>} [acc=[]] - The accumulator of sparks.
 * @returns {Array<string>} - A flat array of strings representing the textual content.
 */
export function findTextSparks(vessel, acc = []) {
    // B"H - If it is the word itself (string), anchor it.
    if (typeof vessel === 'string') {
        const trimmed = vessel.trim();
        if (trimmed) acc.push(trimmed);
        return acc;
    }

    // B"H - If it is a gathering (array), explore each member.
    if (Array.isArray(vessel)) {
        for (const item of vessel) {
            findTextSparks(item, acc);
        }
        return acc;
    }

    // B"H - If it is a complex vessel (object), prioritize sacred keys.
    if (typeof vessel === 'object' && vessel !== null) {
        // High priority keys manifest in the screenshot: 'text', 'snippet', 'dayuh'
        const sacredPaths = ['text', 'subSections', 'paragraphs', 'textOrig', 'content'];
        
        // First check if any sacred path exists directly
        let foundSacred = false;
        for (const key of sacredPaths) {
            if (vessel[key] !== undefined && vessel[key] !== null) {
                findTextSparks(vessel[key], acc);
                foundSacred = true;
                // Once we find the primary text content in an object, 
                // we usually don't want to double-scrape other properties unless needed.
                break; 
            }
        }

        // If no sacred path was found, traverse all entries like a wanderer in the desert.
        if (!foundSacred) {
            const forbiddenKeys = ['id', 'idx', 'type', 'sectionIdx', 'index'];
            for (const [key, value] of Object.entries(vessel)) {
                if (!forbiddenKeys.includes(key.toLowerCase())) {
                    findTextSparks(value, acc);
                }
            }
        }
    }

    return acc;
}
