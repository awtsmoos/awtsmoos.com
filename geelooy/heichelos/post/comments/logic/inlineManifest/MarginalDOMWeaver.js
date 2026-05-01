
/**
 * B"H
 * @module MarginalDOMWeaver
 * @chapter Weaving the Garments of the Gloss
 * @description
 * Once the correct vessel (Coordinate) is found, this weaver physicalizes 
 * the 'Gilyon' (margin) and places the commentary card inside it. 
 * "It is a tree of life to those who grasp it" — the margin holds the 
 * branches of interpretation firmly to the trunk of the text.
 */

import { makeInlineComment } from "../../render/core.js";

/**
 * @function weaveInsightIntoMargin
 * @description 
 * Takes an exact physical text element and a data comment, generating
 * the HTML card and appending it carefully to the element's side structure.
 * 
 * @param {HTMLElement} targetVessel - The text container located by CoordinateResolver.
 * @param {Object} comment - The raw JSON spark from the server.
 * @param {string} alias - The divine name of the speaker.
 */
export function weaveInsightIntoMargin(targetVessel, comment, alias) {
    if (!targetVessel || !comment || !comment.id) return;

    // 1. Guard against double-manifestation (Do not duplicate sparks)
    const existing = targetVessel.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
    if (existing) return;

    // 2. Forge the physical card using the core factory
    const inlineCard = makeInlineComment(comment);
    inlineCard.dataset.fromAlias = alias; // Tag it so we can easily dissolve it if the toggle is disabled
    
    // 3. Locate or create the Shelter (The Marginal Container)
    // We use :scope to ensure we only look at immediate children, preventing deep nesting issues.
    let shelter = targetVessel.querySelector(":scope > .marginal-gloss-shelter");
    
    if (!shelter) {
        // Speak the shelter into existence
        shelter = document.createElement("div");
        shelter.className = "marginal-gloss-shelter";
        targetVessel.appendChild(shelter);
    }
    
    // 4. Emplace the card
    shelter.appendChild(inlineCard);
}

/**
 * @function dissolveMarginalWeave
 * @description 
 * The ritual of erasure. Removes all inline comments authored by a specific alias.
 * If a shelter becomes empty, the shelter itself is returned to the void.
 * 
 * @param {string} alias - The identity whose insights should vanish.
 */
export function dissolveMarginalWeave(alias) {
    if (!alias) return;

    const activeCards = document.querySelectorAll(`.inline-comment[data-from-alias="${alias}"]`);
    
    activeCards.forEach(card => {
        const shelter = card.parentNode;
        
        // Remove the specific spark
        card.remove();
        
        // Check if the shelter is now a void. If so, collapse it.
        if (shelter && shelter.classList.contains("marginal-gloss-shelter") && shelter.children.length === 0) {
            shelter.remove();
        }
    });
}
