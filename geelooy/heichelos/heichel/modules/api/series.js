
/**
 * B"H
 * @module SeriesAPI
 * @description
 * Just as the light descends through the Sefirot in a specific 
 * order (Seder Histalshelus), the content of the library is organized 
 * into Series. This module allows the seeker to traverse these 
 * sequences, moving from General to Particular.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';
import { makeSeries } from "/scripts/awtsmoos/api/utils.js";

/**
 * @function getSeriesDetails
 * @description Gets the core definition of a series, including its list of children.
 * @param {string} heichelId 
 * @param {string} seriesId 
 */
export async function getSeriesDetails(heichelId, seriesId) {
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}`);
}

/**
 * @function getSubSeriesDetails
 * @description Unveils the details of the nested chambers within a parent series.
 * @param {string} heichelId 
 * @param {string} parentSeriesId 
 */
export async function getSubSeriesDetails(heichelId, parentSeriesId) {
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/series/${parentSeriesId}/subSeries?details=true`);
}

/**
 * @function createSeries
 * @description Speaks a new series into existence.
 * @param {Object} data - The blueprint of the new creation.
 */
export async function createSeries(data) {
    const { heichelId, parentSeriesId, title, aliasId, inputId, description } = data;
    // B"H - Utilizing the mystical utilities for the actual creation rite
    const result = await makeSeries({
         heichelId,
         parentSeriesId,
         title,
         aliasId: window.curAlias || aliasId,
         inputId,
         description
     });
    return result;
}


/**
 * @function editSeriesDetails
 * @description Refines an existing series name/description without moving it.
 */
export async function editSeriesDetails({ heichelId, seriesId, aliasId, title, description }) {
    return AwtsmoosRequest.send(
        `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/editSeriesDetails`,
        "PUT",
        new URLSearchParams({
            aliasId,
            title,
            description
        })
    );
}
