
/**
 * B"H
 * @module InlinePainter
 * @chapter Bringing Color to the Void
 * @description
 * This module performs the ritual of painting—taking the abstract
 * spark (comment) and manifest it into the physical scroll's 
 * borderland. 
 */

import { makeInlineComment } from "../../render/core.js";

/**
 * @function paintInsightInMargin
 * @description The Sovereign ritual of placement.
 * 
 * @param {HTMLElement} vessel - The textual home.
 * @param {Object} comment - The transmission.
 * @param {string} author - The Guardian.
 */
export function paintInsightInMargin(vessel, comment, author) {
    if (!vessel || !comment) return;

    // Check if reality already has this spark
    const existing = vessel.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
    if (existing) return;

    const inlineCard = makeInlineComment(comment);
    inlineCard.dataset.fromAlias = author;
    
    // Command a shelter to exist for marginal glosses
    let marginWall = vessel.querySelector(":scope > .marginal-gloss-shelter");
    if (!marginWall) {
        marginWall = document.createElement("div");
        marginWall.className = "marginal-gloss-shelter";
        vessel.appendChild(marginWall);
    }
    
    marginWall.appendChild(inlineCard);
}
