
/**
 * B"H
 * @module CommentDataUnroller
 * @chapter Tearing the Kelipot (Shells)
 * @description
 * In the realm of digital manifestation, the pure Light is often hidden 
 * behind shells of 'success' properties and nested objects. 
 * This module is the Cohen (Priest) that reaches into the vessel, 
 * identifies the essence, and unrolls it for the eyes of the seeker.
 */

/**
 * @function unrollApiResponse
 * @description 
 * Reaches into a potential success wrapper and extracts the core array.
 * @param {Object|Array} response - The raw emanation from the API.
 * @returns {Array} - The purified sparks.
 */
export function unrollApiResponse(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.success && Array.isArray(response.success)) return response.success;
    if (response.details && Array.isArray(response.details)) return response.details;
    return response.id ? [response] : []; // Single item case
}

/**
 * @function extractCommentText
 * @description 
 * A holy ritual to find the textual essence of a comment. 
 * It gracefully handles simple strings and complex { title, text: [] } vessels.
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
        // Unrolling the nested diadem (Title)
        result.title = content.title || "";
        
        // Unrolling the nested speech (Text array)
        if (content.text) {
            result.paragraphs = Array.isArray(content.text) ? content.text : [content.text];
        } else if (content.paragraphs) {
             result.paragraphs = Array.isArray(content.paragraphs) ? content.paragraphs : [content.paragraphs];
        } else if (content.content) {
            // Recursive dip if 'content' is nested in 'content'
            const inner = extractCommentText(content.content);
            result.paragraphs = inner.paragraphs;
            if (!result.title) result.title = inner.title;
        }
    }
    
    return result;
}
