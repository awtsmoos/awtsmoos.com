/**
 * B"H
 * @module BulkLoader
 * @chapter The Quiet Unified Surge
 * @description
 * The Awtsmoos reveals inline commentary through many small vessels: request
 * batching, coordinate truth, identity forging, and duplicate judgment. This
 * conductor now stays quiet by default so the reader is not buried in logs.
 */

import { buildBulkFetchPromises } from "./bulk/requestBatch.js";
import { normalizeSparkDayuh, chooseTruestDuplicateSpark } from "./bulk/coordinate.js";
import { ensureSparkIdentity } from "./bulk/sparkIdentity.js";
import { filterSparksToUrlScope } from "./bulk/urlScope.js";

function debugLog(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.log(...args);
}

function debugError(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.error(...args);
}

function absorbSpark(sparkMap, spark, alias) {
    if (!spark || typeof spark !== "object") return;
    if (!spark.dayuh || typeof spark.dayuh !== "object") {
        spark.dayuh = normalizeSparkDayuh(spark, spark.dayuh?.verseSection);
    }
    ensureSparkIdentity(spark, alias);
    const idKey = String(spark.id);
    sparkMap.set(idKey, chooseTruestDuplicateSpark(sparkMap.get(idKey), spark));
}

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
    if (!alias || !context) return [];

    try {
        const fetchPromises = buildBulkFetchPromises(alias, context);
        const rawResults = await Promise.all(fetchPromises);
        const allSparks = filterSparksToUrlScope(convergeSparks(rawResults, alias));
        debugLog(`B"H - [BulkLoader] ${allSparks.length} scoped sparks for @${alias}.`);
        return allSparks;
    } catch (error) {
        debugError("B\"H - [BulkLoader] Transmission failure:", error);
        return [];
    }
}
