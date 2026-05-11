
/**
 * B"H
 * @module ApiPortal
 * @chapter The Unified Source
 * @description
 * This portal draws directly from the 'masterCommentCache' stored in the 
 * commentaryStore. Since all comments for the post are fetched during 
 * bootstrap, this module filters that local reservoir for the requested alias.
 * 
 * HEALED: The Great Filter Kelipah has been shattered. The matching is now 
 * case-insensitive and looks for both 'author' and 'aliasId' fields to 
 * ensure no spark is left behind.
 */

import { commentaryStore } from "/heichelos/post/comments/state/store.js";

/**
 * @class ApiPortal
 */
export class ApiPortal {
    /**
     * @method fetchPostMap
     * @description Returns all unique comments for an alias from the local cache, alongside validation.
     * @param {string} alias - Identity to filter for.
     * @returns {Promise<Object>} - { fromCache: boolean, data: Array }
     */
    static async fetchPostMap(alias) {
        if (!alias) return { fromCache: false, data: [] };

        console.log(`B"H - [ApiPortal] Gazing into the RAM Cache for @${alias}. Is the vessel prepared?`, Array.isArray(commentaryStore.masterCommentCache));

        if (Array.isArray(commentaryStore.masterCommentCache)) {
            const targetAlias = String(alias).toLowerCase();
            
            // Deep diagnostic: what are we looking at?
            if (commentaryStore.masterCommentCache.length > 0) {
                console.log(`B"H - [ApiPortal] First spark in cache properties:`, Object.keys(commentaryStore.masterCommentCache[0]));
                console.log(`B"H - [ApiPortal] First spark author value:`, commentaryStore.masterCommentCache[0].author || commentaryStore.masterCommentCache[0].aliasId);
            }

            // B"H - Purified filtering logic
            const filtered = commentaryStore.masterCommentCache.filter(c => {
                const cAuth = String(c.author || c.aliasId || "").toLowerCase();
                return cAuth === targetAlias;
            });
            
            console.log(`B"H - [ApiPortal] The RAM Cache is active! Served ${filtered.length} unique sparks for @${alias}.`);
            return { fromCache: true, data: filtered };
        }

        console.warn(`B"H - [ApiPortal] The RAM Cache is an empty void. Returning to nothingness to trigger the Great Fallback.`);
        // Fallback: If cache is uninitialized, return fromCache: false to trigger network fallback
        return { fromCache: false, data: [] };
    }
}
