/**
 * B"H
 * @module SeriesAPI
 * @description
 * Chapter 401: The series list stops pretending empty branches are empty.
 *
 * The Awtsmoos hides oceans inside a single card. A parent series may have no
 * direct posts yet hold thirty-nine sub-series. The browser now asks the detail
 * endpoint for each visible child and carries those counts back into the card,
 * so the UI speaks the real shape of the tree instead of a flat zero.
 */

import { fetchData, postData, BASE_API_URL } from './core.js';
import { makeSeries } from "/scripts/awtsmoos/api/utils.js";

export async function getSeriesDetails(heichelId, seriesId) {
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${encodeURIComponent(seriesId)}/details`);
}

export async function getSubSeriesDetails(heichelId, parentSeriesId) {
    const url = `${BASE_API_URL}heichelos/${heichelId}/series/${encodeURIComponent(parentSeriesId)}/subSeries?details=true`;
    const list = await fetchData(url);
    if (!Array.isArray(list) || list.length === 0) return list || [];
    return Promise.all(list.map(item => enrichSeriesCard(heichelId, item)));
}

async function enrichSeriesCard(heichelId, item) {
    const id = item?.id || item?.seriesId || item?.prateem?.id;
    if (!id) return item;
    const details = await fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${encodeURIComponent(id)}/details`);
    const posts = Array.isArray(details?.posts) ? details.posts : [];
    const subSeries = Array.isArray(details?.subSeries) ? details.subSeries : [];
    return {
        ...item,
        posts,
        subSeries,
        postsCount: posts.length,
        subSeriesCount: subSeries.length
    };
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
        const reqUrl = `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/clearSubSeries/${item.id}`;
        const res = await postData(reqUrl, new URLSearchParams({ aliasId }));
        results.push({ success: Boolean(res && (res.success || res.ok)), item });
    }
    return results;
}
