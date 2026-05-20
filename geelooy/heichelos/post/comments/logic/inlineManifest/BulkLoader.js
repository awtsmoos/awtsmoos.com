/**
 * B"H
 * @module BulkLoader
 * @chapter The Unified Surge Refactored
 * @description
 * The Awtsmoos reveals inline commentary through many small vessels: request
 * batching, coordinate truth, identity forging, and duplicate judgment. This
 * file now conducts those vessels without becoming a swollen chamber itself.
 */

import { buildBulkFetchPromises } from "./bulk/requestBatch.js";
import { normalizeSparkDayuh, chooseTruestDuplicateSpark } from "./bulk/coordinate.js";
import { ensureSparkIdentity } from "./bulk/sparkIdentity.js";
import { filterSparksToUrlScope } from "./bulk/urlScope.js";
import { filterSparksToUrlScope } from "./bulk/urlScope.js";

/**
 * Adds one spark to the dedupe map after restoring coordinate and identity.
 * @param {Map<string, object>} sparkMap Map of comment id to retained spark.
 * @param {object} spark Raw or normalized spark.
 * @param {string} alias Commentator alias.
 * @returns {void}
 */
function absorbSpark(sparkMap, spark, alias) {
    if (!spark || typeof spark !== "object") return;

    if (!spark.dayuh || typeof spark.dayuh !== "object") {
        spark.dayuh = normalizeSparkDayuh(spark, spark.dayuh?.verseSection);
    }

    ensureSparkIdentity(spark, alias);
    const idKey = String(spark.id);
    sparkMap.set(idKey, chooseTruestDuplicateSpark(sparkMap.get(idKey), spark));
}

/**
 * Flattens all coordinate batches into unique, best-coordinate sparks.
 * @param {Array<Array<object>>} rawResults Parallel API results.
 * @param {string} alias Commentator alias.
 * @returns {Array<object>} Unique purified sparks.
 */
function convergeSparks(rawResults, alias) {
    const sparkMap = new Map();

    rawResults.forEach(unrolledArray => {
        if (!Array.isArray(unrolledArray)) return;
        unrolledArray.forEach(spark => absorbSpark(sparkMap, spark, alias));
    });

    return Array.from(sparkMap.values());
}

/**
 * Loads all comments for an alias across visible verse coordinates.
 * @param {string} alias Commentator identity.
 * @param {object} context Post, heichel, and series context.
 * @returns {Promise<Array<object>>} Unique purified inline commentary sparks.
 */
export async function loadAllCommentsForAlias(alias, context) {
    if (!alias || !context) {
        console.warn("B\"H - [BulkLoader] Missing alias or context for summoning.");
        return [];
    }

    try {
        const fetchPromises = buildBulkFetchPromises(alias, context);
        console.log(`B"H - [BulkLoader] Waiting for ${fetchPromises.length} parallel requests...`);
        const rawResults = await Promise.all(fetchPromises);
        const allSparks = filterSparksToUrlScope(convergeSparks(rawResults, alias));

        if (allSparks.length > 0) {
            console.log(`%c B"H - [BulkLoader] Gathered ${allSparks.length} unique sparks for @${alias}.`, "color: #00ff00; font-weight: bold;");
        } else {
            console.log(`%c B"H - [BulkLoader] Gathered 0 sparks for @${alias}.`, "color: #999; font-style: italic;");
        }

        return allSparks;
    } catch (error) {
        console.error("B\"H - [BulkLoader] Catastrophic failure in transmission:", error);
        return [];
    }
}
