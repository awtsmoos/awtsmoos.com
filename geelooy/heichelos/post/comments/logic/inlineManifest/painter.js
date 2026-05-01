/**
 * B"H
 * @module InlineUIPainter
 * @chapter Painting the Marginal Glow
 */

import { makeInlineComment } from "../../render/core.js";

/**
 * @function paintInsightInMargin
 * @description Physicalizes a comment card inside the scroll's margin.
 */
export function paintInsightInMargin(vessel, comment, author) {
    if (!vessel || !comment) return;

    // Defensive check: is the spark already there?
    const alreadyVisible = vessel.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
    if (alreadyVisible) return;

    const inlineCard = makeInlineComment(comment);
    inlineCard.dataset.fromAlias = author;
    
    // Command the Marginal Container to exist or provide shelter
    let container = vessel.querySelector(":scope > .marginal-gloss-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "marginal-gloss-container";
        vessel.appendChild(container);
    }
    
    container.appendChild(inlineCard);
}