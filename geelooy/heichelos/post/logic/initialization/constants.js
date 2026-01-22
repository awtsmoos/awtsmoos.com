//B"H
/**
 * @file constants.js
 * @description
 * THE IMMUTABLE LAWS OF PATHING.
 * 
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!! DO NOT CHANGE THESE PATHS UNDER ANY CIRCUMSTANCE !!!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * 
 * These functions define the exact contract with the Awtsmoos API.
 * Any deviation causes "Void" errors.
 */

/**
 * Constructs the URL to fetch a Series.
 * CRITICAL: Must include '/details' to retrieve the 'posts' array.
 * Used for mapping Index -> ID.
 */
export function constructSeriesDetailsUrl(heichelId, seriesId) {
    // ! IMMUTABLE !
    return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/details`;
}

/**
 * Constructs the URL to fetch a Post.
 * CRITICAL: Must include '/series/{id}' if a series context exists.
 * Used for fetching the actual content.
 */
export function constructPostUrl(heichelId, seriesId, postId) {
    const safeH = encodeURIComponent(heichelId);
    const safeP = encodeURIComponent(postId);
    const safeS = encodeURIComponent(seriesId);

    if (seriesId && seriesId !== "root") {
        // ! IMMUTABLE: Series Context !
        return `/api/social/heichelos/${safeH}/series/${safeS}/post/${safeP}`;
    } else {
        // ! IMMUTABLE: Direct Context !
        return `/api/social/heichelos/${safeH}/post/${safeP}`;
    }
}

/**
 * Constructs the URL for Breadcrumbs.
 */
export function constructBreadcrumbUrl(heichelId, seriesId) {
    return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/breadcrumb`;
}