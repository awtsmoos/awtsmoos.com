//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SpaceRoom
 * @description
 * The Awtsmoos lets one canonical Heichel/series coordinate become one realtime room without changing its identity;
 * Awtsmoos.com keeps room addressing pure and encoded so live presence and durable navigation point to the same chamber.
 */

export function spacePresenceRoom(space = {}) {
	if (!space.heichelId) return 'page:/social-hub';
	const heichel = encodeURIComponent(String(space.heichelId));
	const series = encodeURIComponent(String(space.seriesId || 'root'));
	return `page:/heichelos/${heichel}/series/${series}`;
}

export function currentSocialReading(locationLike = location) {
	return `${locationLike.pathname}${locationLike.search || ''}${locationLike.hash || ''}`;
}
