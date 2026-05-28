/**
 * B"H
 * @module InlineBulkRequestBatch
 * @description
 * The Awtsmoos lets every visible verse become a doorway. This module now keeps
 * requests exact and quiet: one focused coordinate, optional subsection, and no
 * endless console thunder unless `window.__awtsmoosInlineDebug` is true.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../../unroller.js";
import { normalizeSparkDayuh } from "./coordinate.js";

function debugLog(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.log(...args);
}

function debugError(...args) {
    if (typeof window !== "undefined" && window.__awtsmoosInlineDebug) console.error(...args);
}

/**
 * Reads the verse coordinates presently manifested in the DOM.
 * @returns {Array<string|number>} Unique physical verse indices.
 */
export function getPhysicalVerseIndices() {
    const verseElements = document.querySelectorAll(".section[data-awtsmoos-idx], .section[data-idx]");
    return Array.from(verseElements)
        .map(el => el.dataset.awtsmoosIdx || el.dataset.idx)
        .filter((v, i, a) => a.indexOf(v) === i);
}

function scopedGetPayload(verseSection) {
    const params = new URLSearchParams(location.search);
    const subSection = params.get("sub");
    const get = { verseSection, map: true };
    if (subSection !== null && subSection !== "") get.subSection = subSection;
    return get;
}

/**
 * Builds one API promise for one coordinate.
 * @param {string} alias Commentator alias.
 * @param {object} context Post/heichel/series context.
 * @param {string|number} verseSection Coordinate to request.
 * @returns {Promise<Array<object>>} Purified sparks for that coordinate.
 */
export function fetchCoordinateSparks(alias, context, verseSection) {
    return getCommentsOfAlias({
        seriesId: context.parentSeriesId || context.seriesId,
        postId: context.id,
        heichelId: context.heichel?.id,
        aliasId: alias,
        fromCache: false,
        get: scopedGetPayload(verseSection)
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
 * Builds the complete set of coordinate fetch promises.
 * @param {string} alias Commentator alias.
 * @param {object} context Post/heichel/series context.
 * @returns {Array<Promise<Array<object>>>} Parallel request promises.
 */
export function buildBulkFetchPromises(alias, context) {
    const verseIndices = getPhysicalVerseIndices();
    const requestedIdx = new URLSearchParams(location.search).get("idx");
    const wanted = requestedIdx === null || requestedIdx === "" ? [...verseIndices, "root"] : [String(requestedIdx)];
    debugLog(`B"H - [BulkLoader] Requesting ${wanted.join(", ")} for @${alias}.`);
    return wanted.map(verseSection => fetchCoordinateSparks(alias, context, verseSection));
}
