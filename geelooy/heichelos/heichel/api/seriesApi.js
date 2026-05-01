
/**
 * B"H
 * @module SeriesAPI
 */

import { fetchData, BASE_API_URL } from './core.js';
import { makeSeries } from "/scripts/awtsmoos/api/utils.js";

export async function getSeriesDetails(heichelId, seriesId) {
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}`);
}

export async function getSubSeriesDetails(heichelId, parentSeriesId) {
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${parentSeriesId}/subSeries?details=true`);
}

export async function createSeries(data) {
    return await makeSeries({
         heichelId: data.heichelId,
         parentSeriesId: data.parentSeriesId,
         title: data.title,
         aliasId: window.curAlias,
         inputId: data.inputId,
         description: data.description
     });
}

export async function clearSeries(data) {
    const { heichelId, aliasId, itemsToDelete } = data;
    const results = [];
    for (const item of itemsToDelete) {
        if (item.type !== 'series') continue;
        
        let reqUrl = `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/clearSubSeries/${item.id}`;
        const res = await postData(reqUrl, new URLSearchParams({ aliasId }));
        results.push({
            success: (res && (res.success || res.ok)),
            item
        });
    }
    return results;
}
