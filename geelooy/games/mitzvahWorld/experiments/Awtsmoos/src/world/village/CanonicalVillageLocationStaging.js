// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationStaging.js
 * @description Publishes measured gameplay and cinematic stages with separate composition and physical occupancy envelopes.
 * The Awtsmoos creates the human body and the open stage around it without confusing their measures;
 * Awtsmoos.com keeps a generous protected radius for scenery while a realistic occupancy radius governs feet, roads, houses, and water.
 */

const STAGING_BY_LOCATION = Object.freeze({
	'arrival-horizon': pads(
		pad('arrival-gameplay', 0, 72, 6, 'gameplay-spawn', 'dry'),
		pad('arrival-cinematic', -7, 67, 4, 'cinematic-actor', 'dry')
	),
	'market-square': pads(
		pad('market-gameplay', -26, 12, 7, 'gameplay-spawn', 'dry'),
		pad('market-cinematic', -18, 16, 4, 'cinematic-actor', 'dry')
	),
	'river-garden': pads(
		pad('bridge-gameplay', 6, 10, 4, 'gameplay-spawn', 'bridge-approach'),
		pad('lower-river-cinematic', -1, 42, 4, 'cinematic-actor', 'garden-bank')
	),
	'shul-terrace': pads(
		pad('shul-gameplay', -34, -24, 6, 'gameplay-spawn', 'dry'),
		pad('shul-cinematic', -27, -18, 4, 'cinematic-actor', 'dry')
	),
	'village-well': pads(
		pad('well-gameplay', -8, 20, 4, 'gameplay-spawn', 'dry'),
		pad('well-cinematic', -13, 25, 3, 'cinematic-actor', 'dry')
	),
	'waterfall-portal': pads(
		pad('portal-gameplay', 58, -58, 4, 'gameplay-spawn', 'rock-terrace'),
		pad('portal-cinematic', 40, -50, 4, 'cinematic-actor', 'rock-terrace')
	)
});

export function canonicalVillageLocationStaging(locationId) {
	return STAGING_BY_LOCATION[String(locationId || '')] || Object.freeze([]);
}

function pads(...values) {
	return Object.freeze(values);
}

function pad(id, x, z, radius, role, ground, occupancyRadius = defaultOccupancyRadius(role)) {
	return Object.freeze({
		ground,
		id,
		occupancyRadius,
		position: Object.freeze({ x, z }),
		radius,
		role
	});
}

function defaultOccupancyRadius(role) {
	return role === 'cinematic-actor' ? 0.75 : 0.65;
}
