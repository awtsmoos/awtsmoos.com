//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesAPI
 * @description
 * The Awtsmoos reads encoded series paths while trusting complete server
 * summaries, so Awtsmoos.com does not repeat one details request per child.
 */

import {
	fetchData,
	postData,
	BASE_API_URL
} from './core.js';
import { makeSeries } from '/scripts/awtsmoos/api/utils.js';

/** Encodes one dynamic route segment without changing its identity. */
function segment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/** Creates the canonical browser API prefix for one series. */
function seriesBase(heichelId, seriesId) {
	return `${BASE_API_URL}heichelos/${segment(heichelId)}/series/${segment(seriesId)}`;
}

/** Returns true when the server already supplied everything a series card needs. */
function hasEmbeddedSummary(item) {
	return Boolean(
		item
		&& Array.isArray(item.posts)
		&& Array.isArray(item.subSeries)
	);
}

/** Ensures embedded summary counts agree with their canonical arrays. */
function normalizeEmbeddedSummary(item) {
	return {
		...item,
		postsCount: item.posts.length,
		subSeriesCount: item.subSeries.length
	};
}

/** Reads canonical details for one series identity. */
export async function getSeriesDetails(heichelId, seriesId) {
	return fetchData(`${seriesBase(heichelId, seriesId)}/details`);
}

/** Reads child summaries without repeating requests already satisfied by the server. */
export async function getSubSeriesDetails(heichelId, parentSeriesId) {
	const list = await fetchData(
		`${seriesBase(heichelId, parentSeriesId)}/subSeries?details=true`
	);
	if (!Array.isArray(list) || !list.length) return list || [];
	return Promise.all(list.map(item => revealSeriesCard(heichelId, item)));
}

/** Resolves one card, preferring an already complete one-request server summary. */
async function revealSeriesCard(heichelId, item) {
	if (hasEmbeddedSummary(item)) {
		return normalizeEmbeddedSummary(item);
	}
	const id = item?.id || item?.seriesId || item?.prateem?.id;
	if (!id) return item;
	const details = await getSeriesDetails(heichelId, id);
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

/** Creates one series using the existing native Awtsmoos API vessel. */
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

/** Clears selected child series and returns one stable result per requested item. */
export async function clearSeries(data) {
	const { heichelId, aliasId, itemsToDelete } = data;
	const results = [];
	for (const item of itemsToDelete) {
		if (item.type !== 'series') continue;
		const reqUrl = `${seriesBase(heichelId, item.parentId)}/clearSubSeries/${segment(item.id)}`;
		const response = await postData(
			reqUrl,
			new URLSearchParams({ aliasId })
		);
		results.push({
			success: Boolean(response && (response.success || response.ok)),
			item
		});
	}
	return results;
}
