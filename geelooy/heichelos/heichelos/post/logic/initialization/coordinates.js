// B"H
/**
 * @module Coordinates
 * @description
 * Chapter 3: The Duplicate Corridor Learns The True Map.
 *
 * This legacy reader corridor lives under `heichelos/heichelos/post`, while
 * its constants live in the active reader corridor under `heichelos/post`.
 * A local `./constants.js` request therefore walked into absence and could be
 * answered by JSON instead of JavaScript. The import now ascends to the outer
 * Heichelos root and descends into the real constants scroll.
 *
 * The Awtsmoos creates every finite coordinate from nothing every instant; this
 * file does not invent coordinates. It reads the URL, asks the API gates, and
 * gives the rest of the reader one clear vessel: `{ post, series, hId, pIdx }`.
 */

import {
    constructSeriesDetailsUrl,
    constructPostUrl,
    constructBreadcrumbUrl
} from "../../../../post/logic/initialization/constants.js";

/**
 * Reads URL coordinates and loads the initial post payload.
 *
 * @returns {Promise<object>} Initial post, series, heichel id, and post index.
 * @throws {Error} When required Heichel or post coordinates are missing.
 */
export async function loadInitial() {
    console.log("B\"H - [Coordinates] Initiating spatial awareness.");

    const segments = location.pathname.split("/").filter(Boolean);
    const coordinates = parseCoordinates(segments);

    if (!coordinates.hId) {
        throw new Error("Coordinate Rupture: Heichel ID missing.");
    }

    const series = await loadSeriesIfNeeded(coordinates);
    const pId = resolvePostId(coordinates, series);

    if (!pId) {
        throw new Error("Post Void. The Scribe cannot find the page.");
    }

    const post = await loadPost(coordinates.hId, coordinates.sId, pId);
    const breadcrumb = await loadBreadcrumb(coordinates.hId, coordinates.sId);

    window.post = post;
    window.series = series;
    window.heichelId = coordinates.hId;
    window.breadcrumb = breadcrumb;

    return {
        post,
        series,
        hId: coordinates.hId,
        pIdx: coordinates.pIdx
    };
}

/**
 * Parses path segments into reader coordinates.
 *
 * @param {Array<string>} segments - Location path segments.
 * @returns {object} Parsed coordinates.
 */
function parseCoordinates(segments) {
    const coordinates = {
        hId: null,
        sId: "root",
        pId: null,
        pIdx: 0,
        rawPostSegment: null
    };

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];

        if (seg === "heichelos" && segments[i + 1]) {
            coordinates.hId = decodeURIComponent(segments[i + 1]);
        }

        if (seg === "series" && segments[i + 1]) {
            coordinates.sId = decodeURIComponent(segments[i + 1]);
            readSeriesPostSegment(coordinates, segments[i + 2]);
        }

        if (seg === "post" && segments[i + 1]) {
            coordinates.pId = decodeURIComponent(segments[i + 1]);
        }
    }

    return coordinates;
}

/**
 * Reads a possible post segment after `/series/:id/`.
 *
 * @param {object} coordinates - Mutable coordinate object.
 * @param {string|undefined} rawSegment - Raw segment from the URL.
 * @returns {void}
 */
function readSeriesPostSegment(coordinates, rawSegment) {
    if (!rawSegment) return;

    coordinates.rawPostSegment = decodeURIComponent(rawSegment);
    const maybeIndex = parseInt(coordinates.rawPostSegment, 10);

    if (!Number.isNaN(maybeIndex)) {
        coordinates.pIdx = maybeIndex;
    }
}

/**
 * Loads series details when the post is identified by series position.
 *
 * @param {object} coordinates - Parsed coordinates.
 * @returns {Promise<object|null>} Series details or null.
 */
async function loadSeriesIfNeeded(coordinates) {
    if (coordinates.sId === "root" || coordinates.pId !== null) return null;

    const response = await fetch(constructSeriesDetailsUrl(coordinates.hId, coordinates.sId));
    if (!response.ok) return null;

    return await response.json();
}

/**
 * Resolves the final post id from explicit path, series index, or raw segment.
 *
 * @param {object} coordinates - Parsed coordinates.
 * @param {object|null} series - Optional loaded series.
 * @returns {string|null} Post id.
 */
function resolvePostId(coordinates, series) {
    if (coordinates.pId) return coordinates.pId;
    if (series?.posts && series.posts[coordinates.pIdx]) return series.posts[coordinates.pIdx];
    return coordinates.rawPostSegment || null;
}

/**
 * Loads the post payload.
 *
 * @param {string} hId - Heichel id.
 * @param {string} sId - Series id.
 * @param {string} pId - Post id.
 * @returns {Promise<object>} Post payload.
 */
async function loadPost(hId, sId, pId) {
    const response = await fetch(constructPostUrl(hId, sId, pId));

    if (!response.ok) {
        throw new Error(`Gateway Severed: ${response.status}`);
    }

    return await response.json();
}

/**
 * Loads breadcrumb data, tolerating failures.
 *
 * @param {string} hId - Heichel id.
 * @param {string} sId - Series id.
 * @returns {Promise<Array<object>>} Breadcrumb list.
 */
async function loadBreadcrumb(hId, sId) {
    try {
        const response = await fetch(constructBreadcrumbUrl(hId, sId));
        if (!response.ok) return [];
        return (await response.json()).reverse();
    } catch (e) {
        return [];
    }
}
