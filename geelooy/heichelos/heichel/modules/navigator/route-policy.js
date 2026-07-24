// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelRoutePolicy
 * @description
 * The Awtsmoos creates path and query as one route beyond parsing.
 * Awtsmoos.com keeps legacy series segments, normalized root paths, and the three
 * public browse views in one pure policy shared by initialization and updates.
 */

import { appState } from '../state.js';

export function readInitialRoute() {
	const params = new URLSearchParams(location.search);
	const path = seriesFromPath();
	return {
		view: normalizeView(params.get('view') || 'posts'),
		seriesId: params.get('series') || path.seriesId || 'root',
		needsNormalization: path.needsNormalization
	};
}

export function normalizeView(view) {
	return ['series', 'groupings'].includes(view) ? view : 'posts';
}

export function routeFor(seriesId, view) {
	const seriesPath = seriesId && seriesId !== 'root'
		? `/series/${encodeURIComponent(seriesId)}`
		: '';
	return `${baseHeichelPath()}${seriesPath}?view=${encodeURIComponent(normalizeView(view))}`;
}

export function normalizeBrowserRoute(seriesId, view) {
	const route = routeFor(seriesId, view);
	history.replaceState({ path: route }, '', route);
}

function seriesFromPath() {
	const segments = location.pathname.split('/').filter(Boolean);
	const index = segments.indexOf('series');
	if (index === -1 || !segments[index + 1]) {
		return { seriesId: null, needsNormalization: false };
	}
	const seriesId = decodeURIComponent(segments[index + 1]);
	const trailing = segments.slice(index + 2).filter(Boolean);
	const invalidRootChild = seriesId === 'root' && trailing.length > 0;
	return {
		seriesId: invalidRootChild ? 'root' : seriesId,
		needsNormalization: invalidRootChild
	};
}

function baseHeichelPath() {
	return `/heichelos/${encodeURIComponent(appState.heichelId)}`;
}
