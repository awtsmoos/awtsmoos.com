
/**
 * B"H
 * @module ParagraphWeaver
 * @chapter Weaving the Garments of Thought
 * @description
 * Every word of the revelation needs a garment (Kli) to be visible. 
 * This module weaves those garments, one paragraph at a time.
 */

import { markdownToHtml } from "/heichelos/post/parsing.js";
import { sanitizeComment } from "../utils.js";

/**
 * @function manifestParagraph
 * @description Creates a div vessel for a single string of commentary.
 * @param {string} text - The raw letters.
 * @returns {HTMLElement} - The manifest vessel.
 */
export function manifestParagraph(text) {
    if (!text) return null;
    
    const vessel = document.createElement("div");
    vessel.className = "awtsmoos-comment-paragraph";
    
    // Commands the parser to speak the markdown into HTML
    vessel.innerHTML = markdownToHtml(sanitizeComment(text));
    
    return vessel;
}
