
/**
 * B"H
 * @module CommentDataUnroller
 * @chapter Tearing the Kelipot (Shells)
 * @description
 * In the realm of digital manifestation, the pure Light is often hidden 
 * behind shells of 'success' properties, nested objects, or Maps. 
 * This module is the Kohen (Priest) that reaches into the vessel, 
 * identifies the essence, flattens Maps, and unrolls it for the eyes of the seeker.
 */

/**
 * @function unrollApiResponse
 * @description 
 * Reaches into a potential success wrapper and extracts the core array.
 * HEALED: Now successfully detects and flattens Object Maps!
 * 
 * @param {Object|Array} response - The raw emanation from the API.
 * @returns {Array} - The purified sparks.
 */
export function unrollApiResponse(response) {
    if (!response) return[];
    
    // 1. Pierce the outer shell
    let target = response;
    if (response.success) target = response.success;
    else if (response.details) target = response.details;

    // 2. If it's already an array, it is pure.
    if (Array.isArray(target)) return target;

    // 3. If it's an Object Map (e.g. { "0": [comment1], "1": [comment2] })
    if (typeof target === 'object' && target !== null && !target.id) {
        let unrolledSparks =[];
        Object.values(target).forEach(val => {
            if (Array.isArray(val)) {
                unrolledSparks.push(...val);
            } else {
                unrolledSparks.push(val);
            }
        });
        return unrolledSparks;
    }

    // 4. Single item fallback
    return target.id ? [target] :[];
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
    const result = { title: "", paragraphs:[] };
    
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
