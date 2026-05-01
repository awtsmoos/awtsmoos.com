
/**
 * B"H
 * @module InlineManifestConductor
 * @chapter Orchestrating the Border Lights
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "./unroller.js";
import { findInsertionVessel } from "./inlineManifest/locator.js";
import { paintInsightInMargin } from "./inlineManifest/painter.js";

// B"H - FIXED: Pointing correctly to the Hub in parent directory
import { getInlineAliases } from "../state.js";

/**
 * @function manifestAliasInline
 */
export async function manifestAliasInline(alias) {
    if (!alias) return;
    try {
        const response = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId, 
            postId: window?.post?.id, 
            heichelId: window?.post?.heichel?.id,
            aliasId: alias, 
            fromCache: false, 
            get: { all: true }
        });

        const sparks = unrollApiResponse(response);
        sparks.forEach(spark => {
            const vessel = findInsertionVessel(spark);
            if (vessel) paintInsightInMargin(vessel, spark, alias);
        });
    } catch (e) { console.error("B\"H - Conductive rupture:", e); }
}

/**
 * @function manifestAllActiveInlines
 */
export async function manifestAllActiveInlines() {
    getInlineAliases().forEach(async (author) => await manifestAliasInline(author));
}

/**
 * @function dissolveAliasInline
 */
export function dissolveAliasInline(alias) {
    document.querySelectorAll(`.inline-comment[data-from-alias="${alias}"]`).forEach(card => {
        const room = card.parentNode;
        card.remove();
        if (room && room.classList.contains("marginal-gloss-container") && room.children.length === 0) {
            room.remove();
        }
    });
}
