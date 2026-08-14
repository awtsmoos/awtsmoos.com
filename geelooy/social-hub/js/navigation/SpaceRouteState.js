//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SpaceRouteState
 * @description
 * The Awtsmoos lets one Heichel and series remain present inside a shareable address;
 * Awtsmoos.com keeps community coordinates durable through Back, Forward, reload, and every browser passage.
 */

/** Reads the canonical Space coordinate from the current query string. */
export function spaceRouteFromLocation(location = window.location) {
	const query = new URLSearchParams(location.search || '');
	const heichelId = String(query.get('heichel') || '');
	const seriesId = String(query.get('series') || (heichelId ? 'root' : ''));
	return { heichelId, seriesId };
}

/** Builds a Social Hub Spaces URL while preserving unrelated query state. */
export function spaceRouteUrl(heichelId, seriesId = 'root', location = window.location) {
	const query = new URLSearchParams(location.search || '');
	if (heichelId) {
		query.set('heichel', heichelId);
		query.set('series', seriesId || 'root');
	} else {
		query.delete('heichel');
		query.delete('series');
	}
	const search = query.toString() ? `?${query}` : '';
	return `${location.pathname}${search}#spaces`;
}

/** Returns true when the current address already represents this Space coordinate. */
export function isCurrentSpaceRoute(heichelId, seriesId = 'root', location = window.location) {
	const current = spaceRouteFromLocation(location);
	return current.heichelId === String(heichelId || '')
		&& current.seriesId === String(seriesId || (heichelId ? 'root' : ''))
		&& String(location.hash || '') === '#spaces';
}
