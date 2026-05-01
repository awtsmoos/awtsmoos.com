
/**
 * B"H
 * @module Purification
 * @chapter The Ritual of Refinement
 * @description
 * In the physical world, the pure Light is often obscured by shells (Kelipot).
 * In the world of data, these shells manifest as broken HTML, mundane
 * tag formats like '[cup]', or careless backend ghosts like the string "undefined". 
 * This module performs the purification (Birur), stripping away that which 
 * is unnecessary and transmuting the data into clear vessels of manifestation.
 */

/**
 * @function purifyAwtsmoosString
 * @description
 * Cleanses titles and names from the filth of the digital void.
 * Replaces underscores with the breadth of empty space, and completely
 * annihilates the string "undefined" into true Nothingness, ready for
 * new creation.
 * 
 * @param {string|null|undefined} str - The unrefined emanation.
 * @returns {string} - The purified string.
 */
export function purifyAwtsmoosString(str) {
    if (str === null || str === undefined) return "";
    let s = String(str).trim();
    if (s.toLowerCase() === "undefined") return "";
    
    // Transmute underscores into the infinite space of expansion
    return s.replace(/_/g, ' ');
}

/**
 * @function stripTags
 * @description
 * Returns the manifest letters to their primordial state, 
 * stripping away all structural shells (HTML tags) to 
 * reveal the inner meaning of the text.
 * 
 * @param {string} html - The shell-wrapped text.
 * @returns {string} - The purified sequence.
 */
export function stripTags(html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html.split("</br>").join("\n").replace(/<br\s*\/?>/gi, '\n');
    return div.textContent || div.innerText || "";
}

/**
 * @function sanitizeContent
 * @description
 * Transmutes the custom tags (like [cup]) used by the Scribes 
 * of the Awtsmoos into the standardized bolding vessels 
 * of the manifest browser world.
 * 
 * @param {string} txt - The raw string from the server.
 * @returns {string} - The sanitized HTML sequence.
 */
export function sanitizeContent(txt) {
    if (typeof txt !== 'string') return "";
    return txt.split("[cup]").join("<b>").split("[/cup]").join("</b>");
}
