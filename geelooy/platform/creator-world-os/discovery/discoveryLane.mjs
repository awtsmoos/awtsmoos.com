// B"H
// Boruch Hashem
// Blessed is He
/** @module DiscoveryLane @description Names ranked and unranked discovery paths explicitly. */

export const DISCOVERY_LANES = Object.freeze([
	'chronological',
	'following',
	'heichel-curated',
	'source-nearby',
	'radiance'
]);

/** Creates a frozen discovery lane configuration. */
export function createDiscoveryLane(input) {
	const id = String(input?.id || '').trim();
	if (!DISCOVERY_LANES.includes(id)) {
		throw new TypeError(`Unsupported discovery lane: ${id}`);
	}
	return Object.freeze({
		id,
		label: String(input?.label || defaultLabel(id)),
		ranked: id === 'radiance',
		filters: Object.freeze({ ...(input?.filters || {}) }),
		limit: Math.max(1, Number(input?.limit || 25))
	});
}

function defaultLabel(id) {
	return id.split('-').map(word => {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}).join(' ');
}
