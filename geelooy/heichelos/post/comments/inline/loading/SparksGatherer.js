
/**
 * B"H
 * @module SparksGatherer
 * @chapter Gathering the Pre-Purified Emanation
 * @description
 * Every spark must be summoned by Name and Coordinate.
 * 
 * HEALED: We have severed the connection to the flawed Master Cache (ApiPortal). 
 * This Gatherer now directly invokes the `BulkLoader`, which performs the exact 
 * same verse-by-verse API parallelization that makes the Sidebar function perfectly.
 */

import { loadAllCommentsForAlias } from "/heichelos/post/comments/logic/inlineManifest/BulkLoader.js";

/**
 * @class SparksGatherer
 */
export class SparksGatherer {
    /**
     * @method collect
     * @description 
     * Summons all purified insights for an identity directly from the API 
     * by blasting parallel requests across every manifest coordinate.
     * 
     * @param {string} alias - The identity to summon.
     * @param {Object} postContext - The Divine Context (post, heichel, series).
     * @returns {Promise<Array>}
     */
    static async collect(alias, postContext) {
        if (!alias) return [];
        
        console.log(`%c B"H - [SparksGatherer] The Oracle has commanded the manifestation of @${alias}. Initiating absolute Bulk Load sequence...`, "color: #00ccff; font-weight: bold;");
        
        if (postContext) {
            const networkSparks = await loadAllCommentsForAlias(alias, postContext);
            console.log(`B"H - [SparksGatherer] Collection complete. Delivering ${networkSparks?.length || 0} sparks to the Weaver.`);
            return networkSparks || [];
        }
        
        console.warn(`B"H - [SparksGatherer] No post context provided for @${alias}. The void remains.`);
        return [];
    }

    static clearCacheForAlias() { /* Reverted to pure network architecture */ }
    static clearAllCache() { /* Reverted to pure network architecture */ }
}
