
/**
 * B"H
 * @module AltarFactory
 * @chapter Forging the Vessel of Input
 * @description
 * Before an insight can be recorded in the heavens, it must be typed 
 * in the lower world. This module creates the physical input zone 
 * where the user transmits their will. 
 * 
 * It adds rigid box-styling and robust borders to ensure the interface 
 * perfectly aligns with the Torah Matrix aesthetics.
 */

import { CommentSection } from "../../../CommentSection.js";

/**
 * @function makeAddCommentSection
 * @description Manifests the container and logic for transcribing new insights.
 * 
 * @param {HTMLElement} parent - The vessel in which to place the altar.
 */
export function makeAddCommentSection(parent) {
    const div = document.createElement("div");
    
    // Intense physical boundaries for the transcription area
    div.classList.add("comment-section-container");
    div.style.cssText = `
        padding: 20px;
        border: 4px solid var(--color-ink);
        background: var(--bg-surface);
        box-shadow: var(--shadow-ui);
        margin-bottom: 30px;
    `;
    
    parent.appendChild(div);
    
    // Instantiate the interactive scribe interface inside the newly formed vessel
    new CommentSection(div);
}
