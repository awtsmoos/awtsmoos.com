/**
 * B"H
 * @module InlineBulkRequestBatch
 * @description
 * Chapter 208: The inline reader fetches gently but completely. Node tests can
 * import this module without the browser-only API utility; the utility is loaded
 * only when a real fetch is made inside the reader.
 */

import { unrollApiResponse } from "../../unroller.js";
import { normalizeSparkDayuh } from "./coordinate.js";
export { getPhysicalVerseIndices } from "./renderedVerses.js";
import { getPhysicalVerseIndices } from "./renderedVerses.js";

async function getCommentsOfAlias() {
    return (await import("/scripts/awtsmoos/api/utils.js")).getCommentsOfAlias;
}

function debugLog(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.log(...args);
}

function debugError(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.error(...args);
}

function requestPayload(verseSection) {
    return { verseSection, map: true, includeRich: true };
}

function requestSeriesId(context) { return context.parentSeriesId || context.seriesId || "root"; }
function requestPostId(context) { return context.id || context.postId; }
function requestHeichelId(context) { return context.heichel?.id || context.heichelId; }

export function getRequestVerseScope(root = document) {
    return getPhysicalVerseIndices(root);
}

/**
 * Fetches all sparks for one alias at one verse/root coordinate.
 * @param {string} alias Alias id.
 * @param {object} context Post context.
 * @param {string|number} verseSection Verse coordinate.
 * @returns {Promise<object[]>} Unrolled sparks.
 */
export async function fetchCoordinateSparks(alias, context, verseSection) {
    try {
        const fetchAliasComments = await getCommentsOfAlias();
        const res = await fetchAliasComments({
            seriesId: requestSeriesId(context),
            postId: requestPostId(context),
            heichelId: requestHeichelId(context),
            aliasId: alias,
            fromCache: true,
            get: requestPayload(verseSection)
        });
        const unrolled = unrollApiResponse(res).map(spark => {
            if (spark && typeof spark === "object") spark.dayuh = normalizeSparkDayuh(spark, verseSection);
            return spark;
        });
        debugLog(`B"H - [BulkLoader] ${unrolled.length} sparks for @${alias} at ${verseSection}.`);
        return unrolled;
    } catch (error) {
        debugError(`B"H - [BulkLoader] Fetch rupture for @${alias} at ${verseSection}:`, error);
        return [];
    }
}

/**
 * Builds eager fetch promises for root and every rendered verse.
 * @param {string} alias Alias id.
 * @param {object} context Post context.
 * @returns {Promise<object[]>[]} Fetch promises.
 */
export function buildBulkFetchPromises(alias, context) {
    const wanted = getRequestVerseScope();
    debugLog(`B"H - [BulkLoader] Eager reader request for @${alias}: ${wanted.join(", ")}.`);
    return wanted.map(verseSection => fetchCoordinateSparks(alias, context, verseSection));
}
