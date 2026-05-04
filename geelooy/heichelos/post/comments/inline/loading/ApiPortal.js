
/**
 * B"H
 * @module ApiPortal
 * @chapter The Unified Source
 * @description
 * All data flows from the Infinite into the Finite.
 * This portal ensures a unified transmission of all insights 
 * for a specific Guardian within the context of the current post.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";

/**
 * @class ApiPortal
 */
export class ApiPortal {
    /**
     * @method fetchPostMap
     * @description Summons all comments for an alias in the current post context.
     * @param {string} alias - Identity to summon.
     * @param {Object} post - Scroll context.
     * @returns {Promise<Object>} - API response.
     */
    static async fetchPostMap(alias, post) {
        if (!alias || !post) {
            console.warn("B\"H - [ApiPortal] Missing context for summon.");
            return { success: false };
        }

        console.log(`%c B"H - [ApiPortal] Sending unified pulse for @${alias}...`, "color: #00ffcc;");

        return await getCommentsOfAlias({
            seriesId: post.parentSeriesId || post.seriesId,
            postId: post.id,
            heichelId: post.heichel?.id,
            aliasId: alias,
            fromCache: false,
            get: { map: true }
        });
    }
}
