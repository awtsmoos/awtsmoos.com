//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesAPI
 * @description
 * The Awtsmoos lets every Heichel navigation layer trust complete server child
 * summaries, preventing duplicate details requests while preserving old cards.
 */

import {
	AwtsmoosRequest,
	BASE_API_URL
} from './base.js';
import { makeSeries } from '/scripts/awtsmoos/api/utils.js';

/** Encodes one route segment without changing its stable identity. */
function segment(value) {
	return encodeURIComponent(String(value || ''));
}

/** Creates the canonical series API prefix for one Heichel and series. */
function seriesBase(heichelId, seriesId) {
	return `${BASE_API_URL}heichelos/${segment(heichelId)}/series/${segment(seriesId)}`;
}

/** Returns whether one child record already contains render-ready collections. */
function hasEmbeddedSummary(item) {
	return Boolean(
		item
		&& Array.isArray(item.posts)
		&& Array.isArray(item.subSeries)
	);
}

/** Makes count fields agree with the embedded canonical arrays. */
function normalizeEmbeddedSummary(item) {
	return {
		...item,
		postsCount: item.posts.length,
		subSeriesCount: item.subSeries.length
	};
}

/** Reads full canonical details for one series. */
export async function getSeriesDetails(heichelId, seriesId) {
	return AwtsmoosRequest.fetch(
		`${seriesBase(heichelId, seriesId)}/details`
	);
}

/** Reads child cards while avoiding details calls already satisfied by the server. */
export async function getSubSeriesDetails(heichelId, parentSeriesId) {
	const list = await AwtsmoosRequest.fetch(
		`${seriesBase(heichelId, parentSeriesId)}/subSeries?details=true`
	);
	if (!Array.isArray(list) || !list.length) return list || [];
	return Promise.all(list.map(item => revealSeriesCard(heichelId, item)));
}

/** Reads alternate grouping cards for the requested branch. */
export async function getAlternateGroupDetails(heichelId, parentSeriesId) {
	return AwtsmoosRequest.fetch(
		`${seriesBase(heichelId, parentSeriesId)}/alternateGroups?details=true`
	);
}

/** Resolves one series card, preferring the one-request embedded summary. */
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

/** Creates one child series through the canonical Awtsmoos API helper. */
export async function createSeries(data) {
	return makeSeries({
		heichelId: data.heichelId,
		parentSeriesId: data.parentSeriesId,
		title: data.title,
		aliasId: window.curAlias || data.aliasId,
		inputId: data.inputId,
		description: data.description
	});
}

/** Updates one series title and description through the existing mutation route. */
export async function editSeriesDetails(data) {
	const body = new URLSearchParams({
		aliasId: data.aliasId,
		title: data.title,
		description: data.description
	});
	return AwtsmoosRequest.send(
		`${seriesBase(data.heichelId, data.seriesId)}/editSeriesDetails`,
		'PUT',
		body
	);
}
