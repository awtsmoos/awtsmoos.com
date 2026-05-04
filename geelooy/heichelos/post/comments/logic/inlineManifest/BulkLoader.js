
/**
 * B"H
 * @module BulkLoader
 * @chapter The Unified Surge of Light
 * @description
 * In the Seder Histalshelus of the API, we often find ourselves fetching 
 * sparks one by one. But just as the Torah is one long Word of G-d, 
 * we here seek to draw down all the insights of a particular Guardian (Alias)
 * for an entire Post in a single, unified transmission.
 * 
 * This module reaches into the depths of the Awtsmoos API and returns 
 * the complete map of comments, ready to be distributed across the verses.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../unroller.js";

/**
 * @function loadAllCommentsForAlias
 * @description
 * Connects to the Heavens (the database) to fetch every single comment 
 * belonging to an alias within a specific post and heichel context.
 * 
 * @param {string} alias - The identity of the commentator.
 * @param {Object} context - The Divine Context (post, heichel, series).
 * @returns {Promise<Array>} - A promise resolving to an array of purified sparks.
 */
export async function loadAllCommentsForAlias(alias, context) {
    if (!alias || !context) {
        console.warn("B\"H - [BulkLoader] Missing alias or context for summoning.");
        return [];
    }

    try {
        console.log(`%c B"H - [BulkLoader] Fetching unified transmission for @${alias}...`, "color: #ff9900; font-weight: bold;");

        // B"H - We omit the verseSection to tell the API we want everything for this post.
        const response = await getCommentsOfAlias({
            seriesId: context.parentSeriesId || context.seriesId,
            postId: context.id,
            heichelId: context.heichel?.id,
            aliasId: alias,
            fromCache: false,
            get: { map: true } // Requesting the full map for the post
        });

        const sparks = unrollApiResponse(response);
        
        if (sparks && sparks.length > 0) {
            console.log(`%c B"H - [BulkLoader] Received ${sparks.length} sparks for @${alias}.`, "color: #00ff00;");
        } else {
            console.log(`%c B"H - [BulkLoader] No sparks found for @${alias} in this realm.`, "color: #999;");
        }

        return sparks;
    } catch (error) {
        console.error("B\"H - [BulkLoader] Failure in the unified transmission:", error);
        return [];
    }
}
