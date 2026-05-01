
/**
 * B"H
 * @module CoordinateInteraction
 * @chapter Mapping the Seeker's Journey
 * @description
 * Every post is a landscape. To navigate it, we must keep track of 
 * the seeker's 'Coordinates'—the query parameters in the URL. 
 * This module ensures the Path remains accurate and that links 
 * leading to the "Holy Site" (the Editing page) are correctly formed.
 */

/**
 * @function updateQueryStringParameter
 * @description
 * Modifies the seeker's coordinates without forcing a restart 
 * of the manifest world.
 * 
 * @param {string} key - The dimension to modify (e.g. 'idx' or 'sub').
 * @param {string|null} value - The new point on that axis.
 */
export function updateQueryStringParameter(key, value) {
    const url = new URL(window.location);
    if(value === null || value === undefined) {
         url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, value);
    }
    // We update history silently to maintain the seeker's state
    window.history.replaceState({ path: url.href }, '', url.href);
}

/**
 * @function getLinkHrefOfEditing
 * @description
 * Prepares the mystical URL search parameters needed for a seeker 
 * with authority to transition into the state of Editing.
 * 
 * @returns {string} - The encoded path details.
 */
export function getLinkHrefOfEditing() {
    return `&parentSeriesId=${window.series?.id}&returnURL=${encodeURIComponent(location.href)}`;
}
