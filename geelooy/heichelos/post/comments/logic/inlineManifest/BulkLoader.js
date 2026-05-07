
/**
 * B"H
 * @module BulkLoader
 * @chapter The Unified Surge of Light
 * @description
 * In the Seder Histalshelus of the API, we often find ourselves fetching 
 * sparks one by one. Because the API requires precise `verseSection` coordinates 
 * to return data, we fire a massive parallel burst across every known verse index 
 * to guarantee we retrieve every single insight.
 * 
 * We use a Set to immediately destroy any overlapping duplicates returned by the API.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../unroller.js";

/**
 * @function loadAllCommentsForAlias
 * @description
 * Connects to the Heavens (the database) by querying every verse index 
 * to fetch every single comment belonging to an alias within a post.
 * 
 * @param {string} alias - The identity of the commentator.
 * @param {Object} context - The Divine Context (post, heichel, series).
 * @returns {Promise<Array>} - A promise resolving to an array of unique purified sparks.
 */
export async function loadAllCommentsForAlias(alias, context) {
    if (!alias || !context) {
        console.warn("B\"H - [BulkLoader] Missing alias or context for summoning.");
        return [];
    }

    try {
        console.log(`%c B"H - [BulkLoader] Fetching multi-verse burst transmission for @${alias}...`, "color: #ff9900; font-weight: bold;");

        const numVerses = window.sectionDayuh ? window.sectionDayuh.length : 0;
        const fetchPromises = [];

        for (let i = 0; i < numVerses; i++) {
            fetchPromises.push(getCommentsOfAlias({
                seriesId: context.parentSeriesId || context.seriesId,
                postId: context.id,
                heichelId: context.heichel?.id,
                aliasId: alias,
                fromCache: true, // Use the API-level cache here since there's no RAM cache in this path
                get: { verseSection: i, map: true }
            }));
        }

        fetchPromises.push(getCommentsOfAlias({
            seriesId: context.parentSeriesId || context.seriesId,
            postId: context.id,
            heichelId: context.heichel?.id,
            aliasId: alias,
            fromCache: true,
            get: { verseSection: "root", map: true }
        }));

        const rawResults = await Promise.all(fetchPromises);
        const allSparks = [];
        const seenIds = new Set();
        
        rawResults.forEach(res => {
            const unrolled = unrollApiResponse(res);
            if (Array.isArray(unrolled)) {
                unrolled.forEach(spark => {
                    if (spark && spark.id && !seenIds.has(String(spark.id))) {
                        seenIds.add(String(spark.id));
                        allSparks.push(spark);
                    }
                });
            }
        });
        
        if (allSparks.length > 0) {
            console.log(`%c B"H - [BulkLoader] Received ${allSparks.length} unique sparks for @${alias}.`, "color: #00ff00;");
        } else {
            console.log(`%c B"H - [BulkLoader] No sparks found for @${alias} across all verses.`, "color: #999;");
        }

        return allSparks;
    } catch (error) {
        console.error("B\"H - [BulkLoader] Failure in the unified transmission:", error);
        return [];
    }
}
