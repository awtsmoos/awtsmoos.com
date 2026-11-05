// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocations.js
 * @description Composes one geographic identity from shared staging, cameras, facets, and cinematic lanes.
 * The Awtsmoos is beyond every border yet renews each measured place; Awtsmoos.com lets gameplay keep its bridge crossing
 * while cinema stands downstream where broad living water, garden bank, and Chossid can share one honest frame.
 */

import { CANONICAL_CAMERAS_BY_ID } from './CanonicalVillageCameras.js';
import { resolveCanonicalVillageLocationId } from './CanonicalVillageLocationAliases.js';
import { canonicalVillageLocationFacets } from './CanonicalVillageLocationFacets.js';
import { canonicalVillageLocationShots } from './CanonicalVillageLocationShots.js';
import { canonicalVillageLocationStaging } from './CanonicalVillageLocationStaging.js';

const RIVER_SAFE_BOUNDS = bounds(-24, 4, 34, -7, 24, 60);

export const CANONICAL_VILLAGE_LOCATIONS = Object.freeze([
	location('river-garden', 'Lower River Garden', point(14, 3.8, 42),
		'broad lower river, reflective lake edge, reeds, wet stones and open garden bank', null, RIVER_SAFE_BOUNDS,
		['water', 'vegetation', 'landscape'], camera([-20, 8, 48], [7.5, 4.1, 42.3], 50)),
	location('village-well', 'Village Well', point(-8, 6, 20),
		'open fieldstone village well courtyard and timber homes', null, null, ['architecture', 'community'],
		camera([-28, 9, 32], [-8, 6, 20], 54)),
	location('arrival-horizon', 'Arrival Horizon', point(9, 7, 27),
		'golden alpine horizon, meadow road, trees and village', 'arrival-hero', null,
		['landscape', 'road', 'vegetation']),
	location('waterfall-portal', 'Waterfall Portal', point(51, 13, -45),
		'rock portal, waterfall, mountain path and open sky', 'waterfall-portal', null,
		['water', 'rock', 'landscape']),
	location('shul-terrace', 'Shul Terrace', point(-34, 10, -24),
		'shul terrace, cottages, lamps, trees and stone paths', 'shul-terrace', null,
		['architecture', 'community', 'vegetation']),
	location('market-square', 'Market Square', point(-24, 7, 11),
		'market plaza, authored homes, road, props and living valley', 'market-eye', null,
		['architecture', 'community', 'road'])
]);

export const CANONICAL_VILLAGE_LOCATIONS_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_LOCATIONS.map(profile => [profile.id, profile])
));

export function canonicalVillageLocation(id) {
	return CANONICAL_VILLAGE_LOCATIONS_BY_ID[resolveCanonicalVillageLocationId(id)] || null;
}

export function canonicalVillageLocationShot(profileOrId, rig) {
	const profile = typeof profileOrId === 'string' ? canonicalVillageLocation(profileOrId) : profileOrId;
	return profile?.shots?.[String(rig || '')] || null;
}

export function listCanonicalVillageLocations() {
	return [...CANONICAL_VILLAGE_LOCATIONS];
}

function location(id, label, focus, prompt, cameraId, cameraSafeBounds, heroRoles, cameraValue = null) {
	const staging = canonicalVillageLocationStaging(id);
	return Object.freeze({
		actor: actorFrom(staging, id),
		camera: cameraValue || cameraFrom(cameraId),
		cameraSafeBounds,
		facets: canonicalVillageLocationFacets(id),
		focus: Object.freeze(focus),
		heroRoles: Object.freeze(heroRoles),
		id,
		label,
		prompt,
		schemaVersion: '2026.08-geographic-v4',
		shots: canonicalVillageLocationShots(id),
		staging
	});
}

function actorFrom(staging, id) {
	const pad = staging.find(value => value.role === 'cinematic-actor');
	if (!pad) throw new Error(`Missing cinematic actor staging for ${id}.`);
	return Object.freeze({ ...pad.position });
}

function cameraFrom(id) {
	if (!id) return null;
	const source = CANONICAL_CAMERAS_BY_ID[id];
	if (!source) throw new Error(`Missing canonical village camera ${id}.`);
	return camera([source.position.x, source.position.y, source.position.z],
		[source.target.x, source.target.y, source.target.z], source.fov);
}

function camera(position, target, fieldOfView) {
	return Object.freeze({ fieldOfView, position: Object.freeze(point(...position)), target: Object.freeze(point(...target)) });
}

function bounds(minX, minY, minZ, maxX, maxY, maxZ) {
	return Object.freeze({ max: Object.freeze(point(maxX, maxY, maxZ)), min: Object.freeze(point(minX, minY, minZ)) });
}

function point(x, y, z) {
	return { x, y, z };
}
