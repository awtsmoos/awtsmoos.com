/**
 * B"H
 * @module SeriesAPI
 * @description
 * Series navigation speaks both tongues: the old `/details` route and the new
 * direct/subSeries routes. The root path is never allowed to become a fake
 * error post; it resolves through the real ikar series data.
 */
import { AwtsmoosRequest, BASE_API_URL } from './base.js';
import { makeSeries } from "/scripts/awtsmoos/api/utils.js";

function encoded(value, fallback = 'root') { return encodeURIComponent(value || fallback); }
function base(heichelId) { return `${BASE_API_URL}heichelos/${encoded(heichelId, '')}`; }

export async function getSeriesDetails(heichelId, seriesId = 'root') {
    return AwtsmoosRequest.fetch(`${base(heichelId)}/series/${encoded(seriesId)}/details`);
}

export async function getSubSeriesDetails(heichelId, parentSeriesId = 'root') {
    return AwtsmoosRequest.fetch(`${base(heichelId)}/series/${encoded(parentSeriesId)}/subSeries/details`);
}

export async function createSeries(data) {
    const { heichelId, parentSeriesId = 'root', title, aliasId, inputId, description = '' } = data;
    return makeSeries({ heichelId, parentSeriesId, title, aliasId: window.curAlias || aliasId, inputId, description });
}

export async function editSeriesDetails({ heichelId, seriesId, aliasId, title, description }) {
    return AwtsmoosRequest.send(
        `${base(heichelId)}/series/${encoded(seriesId)}/editSeriesDetails`,
        "PUT",
        new URLSearchParams({ aliasId, title, description })
    );
}
