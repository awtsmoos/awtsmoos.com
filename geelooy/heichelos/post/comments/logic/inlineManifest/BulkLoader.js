/**
 * B"H
 * @module BulkLoader
 * @description
 * Eager page-wide inline loading. Each active alias fetches every rendered verse
 * once, caches the result in memory for this page, and returns all sparks for
 * placement. URL `idx`/`sub` never narrows inline loading.
 */

import { buildBulkFetchPromises, getPhysicalVerseIndices } from "./bulk/requestBatch.js";
import { normalizeSparkDayuh, chooseTruestDuplicateSpark } from "./bulk/coordinate.js";
import { ensureSparkIdentity } from "./bulk/sparkIdentity.js";

const pageCache = new Map();

function debugLog(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.log(...args);
}

function debugError(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.error(...args);
}

function contextKey(alias, context) {
    const verses = getPhysicalVerseIndices().join(",");
    return [context?.heichel?.id, context?.parentSeriesId || context?.seriesId, context?.id, alias, verses].join("|");
}

function absorbSpark(sparkMap, spark, alias) {
    if (!spark || typeof spark !== "object") return;
    spark.dayuh = normalizeSparkDayuh(spark, spark.dayuh?.verseSection);
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

export async function loadAllCommentsForAlias(alias, context) {
    if (!alias || !context) return [];
    const key = contextKey(alias, context);
    if (pageCache.has(key)) return pageCache.get(key);

    try {
        const rawResults = await Promise.all(buildBulkFetchPromises(alias, context));
        const allSparks = convergeSparks(rawResults, alias);
        pageCache.set(key, allSparks);
        debugLog(`B"H - [BulkLoader] ${allSparks.length} page sparks for @${alias}.`);
        return allSparks;
    } catch (error) {
        debugError("B\"H - [BulkLoader] Transmission failure:", error);
        return [];
    }
}

export function clearInlinePageCache(alias = null) {
    if (!alias) {
        pageCache.clear();
        return;
    }
    Array.from(pageCache.keys()).forEach(key => {
        if (key.includes(`|${alias}|`)) pageCache.delete(key);
    });
}
