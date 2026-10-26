// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file coordinates.js
 * @description
 * The Awtsmoos resolves the reader's route into one true teaching coordinate before history is canonicalized.
 * Numeric paths remain indices until ordered series data identifies their post; explicit post paths remain identities.
 */

import { unrollApiResponse } from '/scripts/awtsmoos/api/utils.js';
import {
	constructBreadcrumbUrl,
	constructPostUrl,
	constructSeriesDetailsUrl,
	constructSeriesPostsUrl
} from './constants.js?v=reader-runtime-007';
import { fetchJson } from './ReaderFetch.js?v=reader-runtime-007';
import {
	isNumericSeriesCoordinate,
	resolveReaderCoordinate
} from './ReaderCoordinateResolver.mjs?v=reader-runtime-007';

/** Parses reader routes with backward compatibility for shorthand coordinates. */
export function parseReaderPath(pathname = window.location.pathname) {
	const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);
	const heichelIndex = parts.indexOf('heichelos');
	if (heichelIndex < 0) return null;
	const hId = parts[heichelIndex + 1] || '';
	const seriesMarker = parts[heichelIndex + 2];
	if (seriesMarker !== 'series') return null;
	const sId = parts[heichelIndex + 3] || 'root';
	const explicitPostMarker = parts[heichelIndex + 4] === 'post';
	const pCoord = explicitPostMarker ? parts[heichelIndex + 5] : parts[heichelIndex + 4];
	return pCoord ? { hId, sId, pCoord, explicitPostMarker } : null;
}

function unwrap(value) {
	const unrolled = unrollApiResponse(value);
	return unrolled ?? value?.success ?? value;
}

async function loadSeriesSources(hId, sId, pCoord, explicitPostMarker) {
	const detailsUrl = constructSeriesDetailsUrl(hId, sId);
	const needsCanonicalPosts = !explicitPostMarker && isNumericSeriesCoordinate(pCoord);
	const [seriesRaw, postsRaw] = await Promise.all([
		fetchJson(detailsUrl),
		needsCanonicalPosts
			? fetchJson(constructSeriesPostsUrl(hId, sId)).catch(() => null)
			: Promise.resolve(null)
	]);
	let series = unwrap(seriesRaw);
	if (!series || series?.error || typeof series !== 'object') series = { id: sId, posts: [] };
	return { series, canonicalPosts: postsRaw };
}

/** Resolves the initial route without ever converting an unresolved numeric index into a post ID. */
export async function loadInitial(pathname = window.location.pathname) {
	const parsed = parseReaderPath(pathname);
	if (!parsed) throw new Error('READER_CLIENT_ROUTE_INVALID');
	const { hId, sId, pCoord, explicitPostMarker } = parsed;
	const { series, canonicalPosts } = await loadSeriesSources(hId, sId, pCoord, explicitPostMarker);
	const { pId, pIdx } = resolveReaderCoordinate({
		pCoord,
		explicitPostMarker,
		seriesPosts: series?.posts,
		canonicalPosts
	});
	if (!pId) throw new Error(`READER_CLIENT_SERIES_INDEX_MISSING_${pCoord}`);
	if (!explicitPostMarker || pCoord !== pId) {
		history.replaceState({}, '', `/heichelos/${encodeURIComponent(hId)}/series/${encodeURIComponent(sId)}/post/${encodeURIComponent(pId)}`);
	}
	const [postRaw, breadcrumbRaw] = await Promise.all([
		fetchJson(constructPostUrl(hId, sId, pId)),
		fetchJson(constructBreadcrumbUrl(hId, sId)).catch(() => null)
	]);
	const post = unwrap(postRaw);
	if (!post || post?.error) throw new Error(`READER_CLIENT_POST_MISSING_${pId}`);
	const breadcrumb = breadcrumbRaw ? unwrap(breadcrumbRaw) : null;
	return { hId, sId, pId, pIdx, post, series, breadcrumb };
}
