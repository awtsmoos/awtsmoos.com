
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
 * HEALED: The legacy 'getCommentsOfAlias' function threw "NO verseitile" 
 * errors when commanded to map everything. This Transmitter has been elevated 
 * to contact the absolute endpoint directly, unrolling the response and filtering 
 * it securely.
 */

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
            const hId = postContext.heichel?.id;
            const pId = postContext.id;
            const seriesContextStr = postContext.parentSeriesId && postContext.parentSeriesId !== "root" 
                ? `/series/${encodeURIComponent(postContext.parentSeriesId)}` 
                : "";

            // The absolute path to the reservoir of insights
            const url = `/api/social/heichelos/${encodeURIComponent(hId)}${seriesContextStr}/post/${encodeURIComponent(pId)}/comments`;
            
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            
            const data = await res.json();
            const unrolled = unrollApiResponse(data);
            
            // Purify and filter for the exact Guardian
            const targetAlias = String(alias).toLowerCase();
            const filtered = unrolled.filter(c => {
                const cAuth = String(c.author || c.aliasId || "").toLowerCase();
                return cAuth === targetAlias;
            });
            
            return filtered;
        } catch (error) {
            console.error(`B"H - [Transmitter] Rupture in the transmission for @${alias}:`, error);
            return [];
        }
    }
}
