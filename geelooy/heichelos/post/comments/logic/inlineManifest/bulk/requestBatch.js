/**
 * B"H
 * @module InlineBulkRequestBatch
 * @description
 * No lazy loading. When inline commentary is active, every rendered verse on the
 * page is requested immediately. The client then places each spark either in its
 * explicit `dayuh.subSection` or once at the verse-end chamber.
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

export function getPhysicalVerseIndices() {
    const verseElements = document.querySelectorAll(".post-reader-localized-context .section[data-awtsmoos-idx], .post-reader-localized-context .section[data-idx]");
    return Array.from(verseElements)
        .map(el => el.dataset.awtsmoosIdx || el.dataset.idx)
        .filter((value, index, list) => value !== undefined && value !== null && list.indexOf(value) === index);
}

function requestPayload(verseSection) {
    return { verseSection, map: true };
}

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

export function buildBulkFetchPromises(alias, context) {
    const wanted = getPhysicalVerseIndices();
    debugLog(`B"H - [BulkLoader] Eager page request for @${alias}: ${wanted.join(", ")}.`);
    return wanted.map(verseSection => fetchCoordinateSparks(alias, context, verseSection));
}
