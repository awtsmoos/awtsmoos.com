
/**
 * B"H
 * @module InlineManifestConductor
 * @chapter Commanding the Border Lights
 * @description
 * This conductor serves as the High Priest (Kohen Gadol) of the margins.
 * When the seeker toggles an Alias to be visible inline, this module fetches 
 * the pure data (unrolled sparks), calls the CoordinateResolver to find 
 * their exact home, and orders the MarginalDOMWeaver to place them.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "./unroller.js";

import { resolveCoordinateToDOM } from "./inlineManifest/CoordinateResolver.js";
import { weaveInsightIntoMargin, dissolveMarginalWeave } from "./inlineManifest/MarginalDOMWeaver.js";
import { getInlineAliases } from "../state.js";

/**
 * @function manifestAliasInline
 * @description Fetches all insights for a Guardian and weaves them into the scroll.
 * 
 * @param {string} alias - The identity to summon.
 */
export async function manifestAliasInline(alias) {
    if (!alias) return;
    try {
        console.log(`B"H - [InlineConductor] Fetching Marginal Revelations for @${alias}`);
        
        // B"H - Safe payload. `map: true` retrieves all comments for the post reliably.
        const response = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId, 
            postId: window?.post?.id, 
            heichelId: window?.post?.heichel?.id,
            aliasId: alias, 
            fromCache: false, 
            get: { map: true } // Removed `{all: true}` which caused backend rejection
        });

        const sparks = unrollApiResponse(response);
        
        if (sparks.length === 0) {
            console.log(`B"H - [InlineConductor] @${alias} has no insights for the margins.`);
            return;
        }

        sparks.forEach(spark => {
            const vessel = resolveCoordinateToDOM(spark.dayuh);
            if (vessel) {
                weaveInsightIntoMargin(vessel, spark, alias);
            }
        });
    } catch (e) { 
        console.error("B\"H - Conductive marginal rupture:", e); 
    }
}

/**
 * @function manifestAllActiveInlines
 */
export async function manifestAllActiveInlines() {
    const activeGuardians = getInlineAliases();
    for (const author of activeGuardians) {
        await manifestAliasInline(author);
    }
}

/**
 * @function dissolveAliasInline
 */
export function dissolveAliasInline(alias) {
    dissolveMarginalWeave(alias);
}
