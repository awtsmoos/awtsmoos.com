/**
 * B"H
 * @module InlineBulkRequestBatch
 * @description
 * The Awtsmoos lets every visible verse become a doorway. This module builds
 * those doorway requests and purifies their replies into coordinate-bearing sparks.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../../unroller.js";
import { normalizeSparkDayuh } from "./coordinate.js";

/**
 * Reads the verse coordinates presently manifested in the DOM.
 * @returns {Array<string|number>} Unique physical verse indices.
 */
export function getPhysicalVerseIndices() {
    const verseElements = document.querySelectorAll('.section[data-awtsmoos-idx], .section[data-idx]');
    return Array.from(verseElements)
        .map(el => el.dataset.awtsmoosIdx || el.dataset.idx)
        .filter((v, i, a) => a.indexOf(v) === i);
}

/**
 * Builds one API promise for one coordinate.
 * @param {string} alias Commentator alias.
 * @param {object} context Post/heichel/series context.
 * @param {string|number} verseSection Coordinate to request.
 * @returns {Promise<Array<object>>} Purified sparks for that coordinate.
 */
export function fetchCoordinateSparks(alias, context, verseSection) {
    const label = verseSection === "root" ? "Root" : `Verse ${verseSection}`;
    console.log(`B"H - [BulkLoader] Firing API request for @${alias} at ${label}.`);

    return getCommentsOfAlias({
        seriesId: context.parentSeriesId || context.seriesId,
        postId: context.id,
        heichelId: context.heichel?.id,
        aliasId: alias,
        fromCache: false,
        get: { verseSection, map: true }
    }).then(res => {
        const unrolled = unrollApiResponse(res).map(spark => {
            if (spark && typeof spark === "object") {
                spark.dayuh = normalizeSparkDayuh(spark, verseSection);
            }
            return spark;
        });
        console.log(`B"H - [BulkLoader:${label}] API replied with ${unrolled.length} sparks for @${alias}.`);
        return unrolled;
    }).catch(error => {
        console.error(`B"H - [BulkLoader:${label}] Rupture fetching for @${alias}:`, error);
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
    console.log(`%c B"H - [BulkLoader] ${verseIndices.length} verses found for @${alias}; requesting ${wanted.join(", ")}.`, "color: #ff9900; font-weight: bold;");
    return wanted.map(verseSection => fetchCoordinateSparks(alias, context, verseSection));
}
