
/**
 * B"H
 * @module Transmitter
 * @chapter The Unified Transmission
 * @description
 * Fragmentation is the source of all exile. In our code, we seek unity.
 * Instead of fetching sparks verse-by-verse, this Transmitter draws 
 * down the entire map of insights for a specific author in a single 
 * pulse of light (one API request).
 * 
 * Every letter in the Torah is essential; every comment in the post 
 * is retrieved in this unified act.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../../logic/unroller.js";

export class Transmitter {
    /**
     * @method summonAllForAlias
     * @description
     * Reaches across the digital firmament to gather all comments 
     * belonging to a specific identity within the context of a post.
     * 
     * @param {string} alias - The identity to summon.
     * @param {Object} postContext - The metadata of the current scroll (hId, pId, etc).
     * @returns {Promise<Array>} - The purified sparks of insight.
     */
    static async summonAllForAlias(alias, postContext) {
        if (!alias || !postContext) return [];

        try {
            const response = await getCommentsOfAlias({
                seriesId: postContext.parentSeriesId || postContext.seriesId,
                postId: postContext.id,
                heichelId: postContext.heichel?.id,
                aliasId: alias,
                fromCache: false,
                get: { map: true } // B"H - Requests the entire post's map
            });

            return unrollApiResponse(response);
        } catch (error) {
            console.error(`B"H - [Transmitter] Rupture in the transmission for @${alias}:`, error);
            return [];
        }
    }
}
