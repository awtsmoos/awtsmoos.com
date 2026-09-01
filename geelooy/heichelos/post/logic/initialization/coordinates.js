// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SovereignCoordinates
 * @description
 * The Awtsmoos resolves persisted posts and date-born Chitas posts through one reader covenant;
 * Awtsmoos.com lets a native Torah composition enter before storage lookup while every ordinary route remains evident.
 */

import { constructSeriesDetailsUrl, constructPostUrl, constructBreadcrumbUrl } from './constants.js?v=root-series-context-001';
import { unrollApiResponse } from '../../comments/logic/unroller.js';
import { purifyAwtsmoosString } from '../../functions/text/Purification.js';
import { isDynamicChitasRequest, loadDynamicChitasPost } from '../chitas/dynamicPost.js?v=native-chitas-002';

export function parseReaderPath(pathname = location.pathname) {
	const segments = String(pathname).split('/').filter(Boolean);
	const heichelMarker = segments.indexOf('heichelos');
	const seriesMarker = segments.indexOf('series');
	const hId = heichelMarker >= 0 ? decodeURIComponent(segments[heichelMarker + 1] || '') : '';
	const sId = seriesMarker >= 0 ? decodeURIComponent(segments[seriesMarker + 1] || 'root') : 'root';
	const explicitPostMarker = segments[seriesMarker + 2] === 'post';
	const candidate = explicitPostMarker ? segments[seriesMarker + 3] : segments[seriesMarker + 2];
	return { hId, sId, pCoord: decodeURIComponent(candidate || '0'), explicitPostMarker };
}

function resolvePost(series, pCoord) {
	if (!Array.isArray(series?.posts)) return { pId: pCoord, pIdx: 0 };
	if (/^\d+$/.test(pCoord) && pCoord.length < 5) {
		const pIdx = Number(pCoord);
		return { pId: series.posts[pIdx], pIdx };
	}
	return { pId: pCoord, pIdx: Math.max(0, series.posts.indexOf(pCoord)) };
}

function canonicalPath({ hId, sId, pId }) {
	return `/heichelos/${encodeURIComponent(hId)}/series/${encodeURIComponent(sId)}/post/${encodeURIComponent(pId)}${location.search}${location.hash}`;
}

function publishContext({ post, series, hId, pIdx, breadcrumb = [] }) {
	window.post = post;
	window.series = series;
	window.heichelId = hId;
	window.breadcrumb = breadcrumb;
	window.currentIndexInSeries = pIdx;
	return { post, series, hId, pIdx };
}

async function loadDynamicContext({ hId, sId, pCoord, explicitPostMarker }) {
	const dynamic = await loadDynamicChitasPost(hId, pCoord);
	if (!explicitPostMarker) {
		const cleanPath = canonicalPath({ hId, sId, pId: dynamic.post.id });
		history.replaceState({ path: cleanPath }, '', cleanPath);
	}
	return publishContext({ ...dynamic, hId, breadcrumb: [{ id: 'root', name: 'Root' }, { id: sId, name: 'Daily Chitas' }] });
}

export async function loadInitial() {
	const parsed = parseReaderPath();
	const { hId, sId, pCoord, explicitPostMarker } = parsed;
	if (!hId) throw new Error('Manifestation Void: Heichel identity is hidden.');
	if (isDynamicChitasRequest(sId, pCoord)) return loadDynamicContext(parsed);
	const seriesResponse = await fetch(constructSeriesDetailsUrl(hId, sId));
	if (!seriesResponse.ok) throw new Error(`Series Gateway Error: ${seriesResponse.status}`);
	const rawSeries = await seriesResponse.json();
	const unrolled = unrollApiResponse(rawSeries);
	const series = Array.isArray(unrolled) ? unrolled[0] : (rawSeries.success || rawSeries);
	const { pId, pIdx } = resolvePost(series, pCoord);
	if (!pId) throw new Error(`Void Rupture: Could not identify Chapter ${pCoord}.`);
	if (!explicitPostMarker || pCoord !== pId) {
		const cleanPath = canonicalPath({ hId, sId, pId });
		history.replaceState({ path: cleanPath }, '', cleanPath);
	}
	if (series?.prateem) {
		series.prateem.name = purifyAwtsmoosString(series.prateem.name);
		series.prateem.description = purifyAwtsmoosString(series.prateem.description);
	}
	const postResponse = await fetch(constructPostUrl(hId, sId, pId));
	if (!postResponse.ok) throw new Error(`Post Gateway Error: ${postResponse.status}`);
	const postData = await postResponse.json();
	const post = postData?.success || postData;
	post.id = pId;
	post.title = purifyAwtsmoosString(post.title);
	let breadcrumb = [];
	try {
		const response = await fetch(constructBreadcrumbUrl(hId, sId));
		if (response.ok) breadcrumb = unrollApiResponse(await response.json()).reverse();
	} catch (_) {}
	return publishContext({ post, series, hId, pIdx, breadcrumb });
}
