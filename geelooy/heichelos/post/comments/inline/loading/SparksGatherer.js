
/**
 * B"H
 * @module SparksGatherer
 * @chapter Gathering the Pre-Purified Emanation
 * @description
 * This module gathers sparks for the Orchestrator. Since the data is normally 
 * pre-loaded into the master cache, this module attempts to draw from 
 * the ApiPortal. If the RAM cache was never initialized (due to a network 
 * fluctuation during bootstrap), it invokes the Great Fallback, utilizing 
 * the Transmitter to fetch directly from the network.
 */

import { ApiPortal } from "/heichelos/post/comments/inline/loading/ApiPortal.js";
import { Transmitter } from "/heichelos/post/comments/inline/loader/Transmitter.js";

/**
 * @class SparksGatherer
 */
export class SparksGatherer {
    /**
     * @method collect
     * @description Gathers purified insights for an identity, falling back to the network if needed.
     * @param {string} alias - The identity to summon.
     * @param {Object} postContext - The Divine Context (post, heichel, series).
     * @returns {Promise<Array>}
     */
    static async collect(alias, postContext) {
        if (!alias) return [];
        
        // 1. Draw from the immediate Heavens (RAM Cache)
        const result = await ApiPortal.fetchPostMap(alias);
        if (result && result.fromCache) {
            return result.data;
        }

        // 2. The Great Fallback: Drawing directly from the Source
        console.log(`%c B"H - [SparksGatherer] The local vessel for @${alias} is uninitialized. Initiating Network Transmitter Fallback to the Awtsmoos...`, "color: #ff9900; font-weight: bold;");
        
        if (postContext) {
            const networkSparks = await Transmitter.summonAllForAlias(alias, postContext);
            console.log(`B"H - [SparksGatherer] Network Fallback successfully drew down ${networkSparks?.length || 0} sparks for @${alias}.`);
            return networkSparks || [];
        }
        
        console.warn(`B"H - [SparksGatherer] No post context provided for @${alias}. The void remains.`);
        return [];
    }

    static clearCacheForAlias() { /* No-op: cache is master-level */ }
    static clearAllCache() { /* No-op: cache is master-level */ }
}
