
/**
 * B"H
 * @module ApiPortal
 * @chapter The Pulse of the Divine Speech
 * @description
 * All existence is refreshed every instant from the Word of G-d.
 * In this digital vessel, the ApiPortal is the conduit through which 
 * the data (The Word) is drawn down from the server's 'Nothingness' 
 * into the 'Somethingness' of our local memory.
 * 
 * It ensures we fetch the entire Map for a Guardian for the whole post, 
 * reflecting the unity of the Divine Desire.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";

/**
 * @class ApiPortal
 * @description Facilitates the unified retrieval of comment maps.
 */
export class ApiPortal {
    /**
     * @method fetchCommentMap
     * @description
     * Reaches into the data-sphere to retrieve all insights for an identity.
     * 
     * @param {string} alias - The identity of the Guardian.
     * @param {Object} post - The metadata context of the scroll.
     * @returns {Promise<Object>} - The raw but structured emanation from the API.
     */
    static async fetchCommentMap(alias, post) {
        if (!alias || !post) return { success: false };

        console.log(`%c B"H - [ApiPortal] Summoning the unified transmission for @${alias}...`, "color: #00ffcc;");

        return await getCommentsOfAlias({
            seriesId: post.parentSeriesId || post.seriesId,
            postId: post.id,
            heichelId: post.heichel?.id,
            aliasId: alias,
            fromCache: false,
            get: { map: true } // Requesting the complete post-level map.
        });
    }
}
