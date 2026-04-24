
/**
 * B"H
 * @module Sanitizer
 * @description 
 * Words from the digital void often carry shards of broken code. 
 * This module purifies them, preparing the letters for the Holy Scroll.
 */

/**
 * @function sanitizeContent
 * @description Transforms raw text into clean, manifestable HTML.
 * @param {string} raw - The unrefined text.
 * @returns {string} - The purified HTML string.
 */
export function sanitizeContent(raw) {
    if (typeof raw !== 'string') return "";

    // B"H - The transmutation of the [cup] tags into the Boldness of Creation.
    let refined = raw
        .replace(/\[cup\]/g, '<span class="rubrication-bold">')
        .replace(/\[\/cup\]/g, '</span>');

    // B"H - Basic protection against the void.
    const div = document.createElement("div");
    div.textContent = refined;
    
    // We allow our specific tags to survive the textContent ritual.
    return div.textContent
        .replace(/&lt;span class="rubrication-bold"&gt;/g, '<span class="rubrication-bold">')
        .replace(/&lt;\/span&gt;/g, '</span>');
}
