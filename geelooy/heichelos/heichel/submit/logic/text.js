// B"H
/**
 * @module SubmitText
 * @description
 * Splits raw pasted light into workable section vessels, respecting custom
 * delimiters without letting special regex characters break the bowl.
 */

/**
 * Converts bulk text into trimmed section chunks.
 * @param {string} text source text
 * @param {string} delimitersStr comma-separated custom delimiters
 * @returns {string[]} non-empty chunks
 */
export function parseSectionText(text, delimitersStr = "") {
    if (!text) return [];
    const delims = delimitersStr.split(",").map(d => d.trim()).filter(Boolean);
    if (!delims.length) return text.split(/\n+/).map(t => t.trim()).filter(Boolean);
    const escaped = delims.map(d => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return text.split(new RegExp(escaped.join("|"), "g")).map(t => t.trim()).filter(Boolean);
}
