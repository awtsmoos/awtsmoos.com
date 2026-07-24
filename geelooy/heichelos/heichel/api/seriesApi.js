// B"H
/**
 * @module SeriesAPI
 * @description
 * The Awtsmoos reveals every series through encoded path vessels, so Hebrew,
 * spaces, and friendly aliases cross the browser boundary without fracture.
 * Detail enrichment remains canonical while every request uses one segment law.
 */

import { fetchData, postData, BASE_API_URL } from './core.js';
import { makeSeries } from '/scripts/awtsmoos/api/utils.js';

function segment(value) {
	return encodeURIComponent(String(value ?? ''));
}

function seriesBase(heichelId, seriesId) {
	return `${BASE_API_URL}heichelos/${segment(heichelId)}/series/${segment(seriesId)}`;
}

export async function getSeriesDetails(heichelId, seriesId) {
	return fetchData(`${seriesBase(heichelId, seriesId)}/details`);
}

export async function getSubSeriesDetails(heichelId, parentSeriesId) {
	const list = await fetchData(
		`${seriesBase(heichelId, parentSeriesId)}/subSeries?details=true`
	);
	if (!Array.isArray(list) || list.length === 0) return list || [];
	return Promise.all(list.map(item => enrichSeriesCard(heichelId, item)));
}

async function enrichSeriesCard(heichelId, item) {
	const id = item?.id || item?.seriesId || item?.prateem?.id;
	if (!id) return item;
	const details = await fetchData(`${seriesBase(heichelId, id)}/details`);
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
	return makeSeries({
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
		const reqUrl = `${seriesBase(heichelId, item.parentId)}/clearSubSeries/${segment(item.id)}`;
		const response = await postData(reqUrl, new URLSearchParams({ aliasId }));
		results.push({
			success: Boolean(response && (response.success || response.ok)),
			item
		});
	}
	return results;
}
