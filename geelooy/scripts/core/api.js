// B"H
// /scripts/core/api.js
// THE CELESTIAL MESSENGER
// This vessel is the sole conduit to the heavens (the server).
// It speaks the universal language of fetching, ensuring every request
// is wrapped in sanctity and error-handling.

const BASE_URL = "/api/social/";

/**
 * A prayer whispered to the server, awaiting a response.
 * @param {string} path The celestial path to the desired knowledge.
 * @returns {Promise<any>} The divine data, parsed from its vessel.
 */
async function fetchAwtsmoos(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            console.error(`Celestial Rupture: ${response.status} at ${path}`);
            throw new Error(`Server responded with ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error(`B"H - The messenger faltered on path ${path}:`, e);
        return null;
    }
}

/**
 * An offering sent upwards to the server, inscribed with intent.
 * @param {string} path The celestial path to the altar.
 * @param {URLSearchParams} body The inscribed offering.
 * @returns {Promise<any>} The server's acknowledgment of the offering.
 */
async function postAwtsmoos(path, body) {
    try {
        const response = await fetch(path, {
            method: "POST",
            body,
        });
        if (!response.ok) {
            console.error(`Offering Rejected: ${response.status} at ${path}`);
            throw new Error(`Server responded with ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error(`B"H - The offering was lost on path ${path}:`, e);
        return null;
    }
}

// -- HEICHEL-SPECIFIC INVOCATIONS --

export const getHeichelDetails = (heichelId) =>
    fetchAwtsmoos(`${BASE_URL}heichelos/${heichelId}`);

export const getHeichelContent = (heichelId, seriesId) =>
    fetchAwtsmoos(`${BASE_URL}heichelos/${heichelId}/series/${seriesId}`);

export const checkOwnership = (aliasId, heichelId) =>
    fetchAwtsmoos(`${BASE_URL}alias/${aliasId}/heichelos/${heichelId}/ownership`);

// -- POST-SPECIFIC INVOCATIONS --

export const getPostDetails = (heichelId, seriesId, postId) => {
    const seriesPath = seriesId === 'root' ? '' : `series/${seriesId}/`;
    return fetchAwtsmoos(`${BASE_URL}heichelos/${heichelId}/${seriesPath}post/${postId}`);
};

export const getPostBreadcrumb = (heichelId, seriesId) =>
    fetchAwtsmoos(`${BASE_URL}heichelos/${heichelId}/series/${seriesId}/breadcrumb`);