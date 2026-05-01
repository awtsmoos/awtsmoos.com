
/**
 * B"H
 * @module InlineMutator
 * @chapter Switching the Worlds
 */

import { isAliasInline, getInlineAliases } from "./providers/StateProvider.js";
import { manifestAliasInline } from "./providers/ManifestProvider.js";
import { hideCommentsInline } from "./state.js";
import { dissolveAliasInline } from "../logic/inlineManifest.js";
import { updateQueryStringParameter } from "../../functions/utils.js";

/**
 * @function toggleInlineForComments
 * @description Performs the transition between Sidebar and Margin.
 * 
 * @param {Array} commentsIgnored - Compatibility wrapper.
 * @param {string} alias - Identity to flip.
 */
export async function toggleInlineForComments(commentsIgnored, alias) {
    if (!alias) return;
    
    // Commands the registry to check current status
    const isManifest = isAliasInline(alias);
    const isNowVisible = !isManifest;
    
    if (isNowVisible) {
        let registry = getInlineAliases();
        if (!registry.includes(alias)) {
            registry.push(alias);
            // Updating the cosmic heavens
            updateQueryStringParameter("inline", JSON.stringify(registry));
        }
        // Commanding the light to appear
        await manifestAliasInline(alias);
    } else {
        // Commands the state to erase the name
        hideCommentsInline(alias);
        // Commands the margin to dissolve the vessels
        dissolveAliasInline(alias);
    }
}
