//B"H
/**
 * @file constants.js
 * @description
 * The route covenant for the post reader. The backend's live post reader API is
 * series-contextual: `/heichelos/:heichel/series/:series/post/:post`. Older
 * direct paths like `/heichelos/:heichel/post/:post` are invalid in the current
 * router, so this module refuses to mint them quietly.
 */

/**
 * Constructs the URL to fetch a Series.
 * Must include `/details` for the reader index -> postId map.
 */
export function constructSeriesDetailsUrl(heichelId, seriesId) {
    return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/details`;
}

/**
 * Constructs the canonical contextual URL to fetch a Post.
 */
export function constructPostUrl(heichelId, seriesId, postId) {
    if (!seriesId || seriesId === "root") {
        throw new Error("POST_READER_REQUIRES_SERIES_CONTEXT");
    }
    return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}`;
}

/**
 * Constructs the URL for Breadcrumbs.
 */
export function constructBreadcrumbUrl(heichelId, seriesId) {
    return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/breadcrumb`;
}
