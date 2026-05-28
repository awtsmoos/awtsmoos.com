/**
 * B"H
 * @module InlineBulkRequestBatch
 * @description
 * Chapter 8: The Awtsmoos demands the whole page at once. Every rendered verse
 * is requested immediately for the alias. URL subsection focus is forbidden from
 * narrowing inline manifestation.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../../unroller.js";
import { normalizeSparkDayuh } from "./coordinate.js";
export { getPhysicalVerseIndices } from "./renderedVerses.js";
import { getPhysicalVerseIndices } from "./renderedVerses.js";

function debugLog(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.log(...args);
}

function debugError(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.error(...args);
}

function requestPayload(verseSection) {
    return { verseSection, map: true };
}

/**
 * Fetches all sparks for one alias at one verse.
 * @param {string} alias Alias id.
 * @param {object} context Post context.
 * @param {string|number} verseSection Verse coordinate.
 * @returns {Promise<object[]>} Unrolled sparks.
 */
export function fetchCoordinateSparks(alias, context, verseSection) {
    return getCommentsOfAlias({
        seriesId: context.parentSeriesId || context.seriesId,
        postId: context.id,
        heichelId: context.heichel?.id,
        aliasId: alias,
        fromCache: true,
        get: requestPayload(verseSection)
    }).then(res => {
        const unrolled = unrollApiResponse(res).map(spark => {
            if (spark && typeof spark === "object") spark.dayuh = normalizeSparkDayuh(spark, verseSection);
            return spark;
        });
        debugLog(`B"H - [BulkLoader] ${unrolled.length} sparks for @${alias} at verse ${verseSection}.`);
        return unrolled;
    }).catch(error => {
        debugError(`B"H - [BulkLoader] Fetch rupture for @${alias} at verse ${verseSection}:`, error);
        return [];
    });
}

/**
 * Builds eager fetch promises for every rendered verse.
 * @param {string} alias Alias id.
 * @param {object} context Post context.
 * @returns {Promise<object[]>[]} Fetch promises.
 */
export function buildBulkFetchPromises(alias, context) {
    const wanted = getPhysicalVerseIndices();
    debugLog(`B"H - [BulkLoader] Eager page request for @${alias}: ${wanted.join(", ")}.`);
    return wanted.map(verseSection => fetchCoordinateSparks(alias, context, verseSection));
}
