// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesAPI
 * @description
 * The Awtsmoos lets a stable series key open its real chapter and child counts instead of an empty shell;
 * Awtsmoos.com enriches navigation cards from lightweight series details while preserving every encoded legacy identity.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';
import { makeSeries } from '/scripts/awtsmoos/api/utils.js';

export async function getSeriesDetails(heichelId, seriesId) {
	return AwtsmoosRequest.fetch(
		`${seriesBase(heichelId, seriesId)}/details`
	);
}

export async function getSubSeriesDetails(heichelId, parentSeriesId) {
	const list = await AwtsmoosRequest.fetch(
		`${seriesBase(heichelId, parentSeriesId)}/subSeries?details=true`
	);
	if (!Array.isArray(list) || list.length === 0) {
		return list || [];
	}
	return Promise.all(
		list.map(item => enrichSeriesCard(heichelId, item))
	);
}

export async function getAlternateGroupDetails(heichelId, parentSeriesId) {
	return AwtsmoosRequest.fetch(
		`${seriesBase(heichelId, parentSeriesId)}/alternateGroups?details=true`
	);
}

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

async function enrichSeriesCard(heichelId, item) {
	const id = item?.id
		|| item?.seriesId
		|| item?.prateem?.id;
	if (!id) {
		return item;
	}
	const details = await getSeriesDetails(heichelId, id);
	const posts = Array.isArray(details?.posts)
		? details.posts
		: [];
	const subSeries = Array.isArray(details?.subSeries)
		? details.subSeries
		: [];
	return {
		...item,
		posts,
		subSeries,
		postsCount: posts.length,
		subSeriesCount: subSeries.length
	};
}

function seriesBase(heichelId, seriesId) {
	return `${BASE_API_URL}heichelos/${segment(heichelId)}/series/${segment(seriesId)}`;
}

function segment(value) {
	return encodeURIComponent(String(value || ''));
}
