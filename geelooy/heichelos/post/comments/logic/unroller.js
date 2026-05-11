/**
 * B"H
 * @module CommentDataUnroller
 * @chapter Tearing the Kelipot (Shells)
 * @description
 * In the realm of digital manifestation, the pure Light is often hidden 
 * behind shells of 'success' properties, nested objects, or Maps. 
 * This module is the Kohen (Priest) that reaches into the vessel, 
 * identifies the essence, flattens Maps, and unrolls it for the eyes of the seeker.
 * 
 * HEALED: The Awtsmoos API blesses its arrays with the literal string "B\"H".
 * We gently remove this blessing so it doesn't cause Object manipulations to crash, 
 * but we PRESERVE all other strings (like Alias names) so the Sidebar can manifest.
 */

/**
 * @function unrollApiResponse
 * @description 
 * Reaches into a potential success wrapper and extracts the core array.
 * 
 * @param {Object|Array} response - The raw emanation from the API.
 * @returns {Array} - The purified sparks.
 */
export function unrollApiResponse(response) {
    if (!response) return [];
    
    // 1. Pierce the outer shell
    let target = response;
    if (response.success !== undefined) target = response.success;
    else if (response.details !== undefined) target = response.details;

    // 2. The Gentle Purifier: Only removes literal "B\"H" blessings from the sequence.
    const purifyArray = (arr) => {
        return arr.filter(item => {
            if (typeof item === 'string' && item.includes('B"H')) return false;
            return item !== null && item !== undefined;
        });
    };

    // 3. If it's already an array, it is pure enough.
    if (Array.isArray(target)) {
        return purifyArray(target);
    }

    // 4. If it's an Object Map (e.g. { "0": [comment1], "1": [comment2] })
    if (typeof target === 'object' && target !== null && !target.id) {
        let unrolledSparks = [];
        Object.values(target).forEach(val => {
            if (Array.isArray(val)) {
                unrolledSparks.push(...purifyArray(val));
            } else if (val !== null && val !== undefined) {
                if (typeof val === 'string' && val.includes('B"H')) return;
                unrolledSparks.push(val);
            }
        });
        return purifyArray(unrolledSparks);
    }

    // 5. Single item fallback
    return (target) ? [target] : [];
}

/**
 * @function extractCommentText
 * @description 
 * A holy ritual to find the textual essence of a comment. 
 * It gracefully handles simple strings and complex { title, text:[] } vessels.
 * 
 * @param {Object|string} content - The content field of a comment.
 * @returns {Object} - { title: string, paragraphs: Array<string> }
 */
export function extractCommentText(content) {
    const result = { title: "", paragraphs: [] };
    
    if (!content) return result;

    if (typeof content === 'string') {
        result.paragraphs = [content];
        return result;
    }

    if (typeof content === 'object') {
        result.title = content.title || "";
        
        if (content.text) {
            result.paragraphs = Array.isArray(content.text) ? content.text : [content.text];
        } else if (content.paragraphs) { 
            result.paragraphs = Array.isArray(content.paragraphs) ? content.paragraphs : [content.paragraphs];
        } else if (content.content) {
            const inner = extractCommentText(content.content);
            result.paragraphs = inner.paragraphs;
            if (!result.title) result.title = inner.title;
        }
    }
    
    return result;
}