
/**
 * B"H
 * @module InlineManifestConductor
 * @chapter Commanding the Border Lights
 * @description
 * This conductor serves as the High Priest (Kohen Gadol) of the margins.
 * It iterates through every physical verse, draws down the entire map of 
 * insights for that verse, and unrolls them seamlessly into the DOM.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "./unroller.js";
import { resolveCoordinateToDOM } from "./inlineManifest/CoordinateResolver.js";
import { weaveInsightIntoMargin, dissolveMarginalWeave } from "./inlineManifest/MarginalDOMWeaver.js";
import { getInlineAliases } from "../state.js";

/**
 * @function manifestAliasInline
 * @description Fetches all insights for a Guardian, verse by verse, and weaves them.
 * 
 * @param {string} alias - The identity to summon.
 */
export async function manifestAliasInline(alias) {
    if (!alias) return;
    try {
        console.log(`%c B"H - [InlineConductor] Summoning Marginal Revelations for @${alias}`, "color: #ff00ff; font-weight: bold;");
        
        // Find all physical verses currently manifested in the scroll
        const sections = document.querySelectorAll('.section');
        let placedCount = 0;

        for (const sec of sections) {
            const verseIdx = sec.dataset.awtsmoosIdx || sec.dataset.idx;
            if (verseIdx === undefined || verseIdx === null) continue;

            const response = await getCommentsOfAlias({
                seriesId: window?.post?.parentSeriesId, 
                postId: window?.post?.id, 
                heichelId: window?.post?.heichel?.id,
                aliasId: alias, 
                fromCache: false, 
                get: { verseSection: verseIdx, map: true } 
            });

            // Flatten the Map safely
            const sparks = unrollApiResponse(response);
            
            if (!sparks || sparks.length === 0) continue;

            sparks.forEach(spark => {
                // Ensure coordinate identity is absolute
                if (!spark.dayuh) spark.dayuh = {};
                if (spark.dayuh.verseSection === undefined || spark.dayuh.verseSection === null) {
                    spark.dayuh.verseSection = verseIdx;
                }
                
                const vessel = resolveCoordinateToDOM(spark.dayuh);
                if (vessel) {
                    weaveInsightIntoMargin(vessel, spark, alias);
                    placedCount++;
                }
            });
        }
        
        console.log(`%c B"H -[InlineConductor] Successfully placed ${placedCount} insights for @${alias} in the margins!`, "color: #00ff00; font-weight: bold;");
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
