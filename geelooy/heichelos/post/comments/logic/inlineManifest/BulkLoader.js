// B"H
/** Eager inline loading with imported-corpus fallback for every rendered verse. */
import { buildBulkFetchPromises, getPhysicalVerseIndices } from "./bulk/requestBatch.js";
import { normalizeSparkDayuh, chooseTruestDuplicateSpark } from "./bulk/coordinate.js";
import { ensureSparkIdentity } from "./bulk/sparkIdentity.js";
const pageCache = new Map();
function contextKey(alias, context) {
    const verses = getPhysicalVerseIndices().join(",");
    return [context?.heichel?.id, context?.parentSeriesId || context?.seriesId, context?.id, alias, verses].join("|");
}
function absorbSpark(sparkMap, spark, alias) {
    if (!spark || typeof spark !== "object") return;
    spark.dayuh = normalizeSparkDayuh(spark, spark.dayuh?.verseSection ?? spark.verseSection);
    ensureSparkIdentity(spark, alias);
    const idKey = String(spark.id);
    sparkMap.set(idKey, chooseTruestDuplicateSpark(sparkMap.get(idKey), spark));
}
function convergeSparks(rawResults, alias) {
    const sparkMap = new Map();
    rawResults.forEach(rows => { if (Array.isArray(rows)) rows.forEach(spark => absorbSpark(sparkMap, spark, alias)); });
    return Array.from(sparkMap.values());
}
function corpusUrl(alias, context) {
    const params = new URLSearchParams({
        heichelId:context?.heichel?.id || window.heichelId || "ikar",
        seriesId:context?.parentSeriesId || context?.seriesId || window.series?.id || "root",
        postId:context?.id || window.post?.id || "",
        aliasId:alias
    });
    return `/api/social/search/rag/post-comments?${params}`;
}
async function corpusFallback(alias, context) {
    try {
        const response = await fetch(corpusUrl(alias, context), { cache:"no-store" });
        const payload = await response.json();
        const rows = payload?.success || payload;
        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        if (window.__awtsmoosInlineDebug) console.error('B"H corpus inline fallback failed', error);
        return [];
    }
}
export async function loadAllCommentsForAlias(alias, context) {
    if (!alias || !context) return [];
    const key = contextKey(alias, context);
    if (pageCache.has(key)) return pageCache.get(key);
    let allSparks = [];
    try { allSparks = convergeSparks(await Promise.all(buildBulkFetchPromises(alias, context)), alias); } catch (_) {}
    if (!allSparks.length) allSparks = convergeSparks([await corpusFallback(alias, context)], alias);
    pageCache.set(key, allSparks);
    if (window.__awtsmoosInlineDebug) console.log(`B"H - [BulkLoader] ${allSparks.length} page sparks for @${alias}.`);
    return allSparks;
}
export function clearInlinePageCache(alias=null) {
    if (!alias) { pageCache.clear(); return; }
    Array.from(pageCache.keys()).forEach(key => { if (key.includes(`|${alias}|`)) pageCache.delete(key); });
}
