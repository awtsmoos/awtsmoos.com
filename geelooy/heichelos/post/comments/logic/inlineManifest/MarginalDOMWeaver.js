/**
 * B"H
 * @module MarginalDOMWeaver
 * @chapter Weaving the Garments of the Gloss
 * @description
 * Once the exact physical vessel (Paragraph/Verse) is found, this weaver 
 * builds the structured 'Gilyon' (margin).
 * It enforces order: Shelter -> Guardian Gateway -> Insight Card.
 * 
 * We have reinforced the structural integrity by ensuring the elements 
 * forcefully declare their visibility via inline styles during construction.
 */

import { makeInlineComment } from "../../render/core.js";
import { makeInlineCommentHolder } from "../../render/factories/CommentHolderFactory.js";

/**
 * @function weaveInsightIntoMargin
 * @description 
 * Takes an exact physical text element and a data comment, generating
 * the HTML card and appending it into the neatly structured holder.
 */
export function weaveInsightIntoMargin(targetVessel, comment, alias) {
    if (!targetVessel || !comment || !comment.id) return;

    // 1. Establish the Shelter 
    // Safely find the direct child shelter without using :scope
    let shelter = null;
    for (const child of targetVessel.children) {
        if (child.classList.contains("marginal-gloss-shelter")) {
            shelter = child;
            break;
        }
    }

    if (!shelter) {
        shelter = document.createElement("div");
        shelter.className = "marginal-gloss-shelter";
        // B"H - Force display
        shelter.style.setProperty("display", "flex", "important");
        targetVessel.appendChild(shelter);
    }
    
    // 2. Establish the Guardian Gateway
    let gateway = null;
    for (const child of shelter.children) {
        if (child.classList.contains("commentator") && child.dataset.alias === alias) {
            gateway = child;
            break;
        }
    }

    if (!gateway) {
        gateway = makeInlineCommentHolder(alias, targetVessel, comment.dayuh.verseSection);
        shelter.appendChild(gateway);
    }

    const listContainer = gateway.querySelector(".comments-holder-inline");
    // B"H - Force the list container to remain open
    if(listContainer) {
        listContainer.style.setProperty("display", "flex", "important");
    }

    // 3. Guard against double-manifestation
    const existing = listContainer.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
    if (existing) return;

    // 4. Forge the physical card and append it to the Gateway's list
    const inlineCard = makeInlineComment(comment);
    inlineCard.dataset.fromAlias = alias; 
    
    listContainer.appendChild(inlineCard);
}

/**
 * @function dissolveMarginalWeave
 * @description 
 * Erases a Guardian's physical presence from the margins when they are 
 * deselected from the Sidebar.
 */
export function dissolveMarginalWeave(alias) {
    if (!alias) return;

    // Target the Guardian Gateways globally
    const activeGateways = document.querySelectorAll(`.commentator.inline-holder[data-alias="${alias}"]`);
    
    activeGateways.forEach(gateway => {
        const shelter = gateway.parentNode;
        
        // Return the gateway to the void
        gateway.remove();
        
        // If the shelter is now empty of all guardians, remove it too
        if (shelter && shelter.classList.contains("marginal-gloss-shelter") && shelter.children.length === 0) {
            shelter.remove();
        }
    });
}