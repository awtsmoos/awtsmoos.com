/**
 * B"H
 * @module HeichelState
 * @description
 * Chapter 614: The address bar is a river with two ancient beds. Some links
 * carry the series in the query, and some carve it into the path itself. This
 * state vessel listens to both, so old links and new routes return to the same
 * revealed point without confusion.
 */

function query() { return new URLSearchParams(location.search); }
function pathParts() { return location.pathname.split("/").filter(Boolean); }
function cleanSeriesId(value) { const id = String(value || "").trim(); return !id || id === "undefined" || id === "null" ? "root" : id; }
function seriesFromPath() {
    const parts = pathParts();
    const seriesIndex = parts.indexOf("series");
    return seriesIndex >= 0 ? parts[seriesIndex + 1] : "";
}
function currentSeries() {
    const q = query();
    return cleanSeriesId(q.get("series") || q.get("seriesId") || q.get("parentSeriesId") || seriesFromPath());
}

export const HeichelState = {
    /** @type {string|null} */
    heichelID: pathParts()[1] || null,

    /** @type {boolean} */
    isEditing: false,

    /** @type {string|null} */
    view: query().get("view"),

    /** @type {string} */
    series: currentSeries(),

    /** @type {boolean} */
    ownsIt: false,

    /** @type {Object|null} */
    heichelData: null,

    /** @type {Array} */
    breadcrumb: [],

    /** @type {number} */
    POST_LENGTH: 256
};
