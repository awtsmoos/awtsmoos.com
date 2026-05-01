
/**
 * B"H
 * @module Purification
 * @chapter The Ritual of Refinement
 * @description
 * In the physical world, the pure Light is often obscured by shells (Kelipot).
 * In the world of data, these shells manifest as broken HTML or mundane
 * tag formats like '[cup]'. This module performs the purification (Birur), 
 * stripping away that which is unnecessary and transmuting tags 
 * into clear vessels of manifest boldness.
 */

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
    // We create a temporary, non-manifested container to do the cleaning
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
