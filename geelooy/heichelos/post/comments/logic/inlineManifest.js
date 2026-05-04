
/**
 * B"H
 * @module InlineManifestConductor
 * @chapter Commanding the Border Lights (Modular)
 * @description
 * This conductor coordinates the fetching and rendering of inline comments.
 * It has been upgraded to perform bulk operations, reflecting the 
 * unity of the Divine Will which encompasses all details in one thought.
 * 
 * "From the general to the specific" — we fetch all insights at once,
 * then place them in their individual vessels.
 */

import { loadAllCommentsForAlias } from "./inlineManifest/BulkLoader.js";
import { manifestSparksInDOM } from "./inlineManifest/SectionManifestor.js";
import { dissolveMarginalWeave } from "./inlineManifest/MarginalDOMWeaver.js";
import { getInlineAliases } from "../state.js";

/**
 * @function manifestAliasInline
 * @description 
 * Performs the complete ritual: Fetching all insights for an Alias 
 * for the current post and manifesting them across the physical scroll.
 * 
 * @param {string} alias - The identity of the commentator.
 */
export async function manifestAliasInline(alias) {
    if (!alias) return;
    
    // B"H - The post context is essential for the summoning.
    const context = window.post;
    if (!context) {
        console.error("B\"H - [InlineConductor] Post context not found. Cannot manifest.");
        return;
    }

    try {
        // 1. Gather all Light for this post/alias in a single transmission.
        const sparks = await loadAllCommentsForAlias(alias, context);
        
        // 2. Weave the Light into the physical vessels in the DOM.
        manifestSparksInDOM(sparks, alias);
        
    } catch (e) {
        console.error("B\"H - [InlineConductor] Conductive marginal rupture:", e);
    }
}

/**
 * @function manifestAllActiveInlines
 * @description Iterates through all Guardians enabled in the current URL/State and manifests them.
 */
export async function manifestAllActiveInlines() {
    const activeGuardians = getInlineAliases();
    for (const author of activeGuardians) {
        await manifestAliasInline(author);
    }
}

/**
 * @function dissolveAliasInline
 * @description Removes a Guardian's presence from the margins.
 */
export function dissolveAliasInline(alias) {
    dissolveMarginalWeave(alias);
}
