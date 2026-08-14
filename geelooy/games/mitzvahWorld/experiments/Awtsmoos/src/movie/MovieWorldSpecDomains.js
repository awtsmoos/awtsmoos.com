// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldSpecDomains.js
 * @description Preserves explicit JSON domains that describe realistic shared gameplay and Movie worlds.
 * The Awtsmoos is beyond mountain, timber, river, road, and sky, while every finite vessel needs a truthful decree;
 * Awtsmoos.com keeps those decrees portable, inspectable, and reusable so one authored world serves play and cinematography.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export const MOVIE_WORLD_DOMAIN_KEYS = Object.freeze([
	'terrain',
	'materials',
	'hydrology',
	'vegetation',
	'architecture',
	'roads',
	'paths',
	'fences',
	'props',
	'atmosphereEffects',
	'lighting',
	'weather',
	'season',
	'timeOfDay',
	'cameraSafety',
	'staging',
	'collisionNavigation',
	'performance',
	'remoteTextures'
]);

/**
 * Normalizes only explicitly supplied serializable domains; no prose is interpreted.
 * @param {object} source Explicit world JSON.
 * @param {object} defaults Explicit fallback JSON.
 * @returns {object} Frozen-snapshot-compatible domain data.
 */
export function normalizeMovieWorldDomains(source = {}, defaults = {}) {
	const output = {};
	for (const key of MOVIE_WORLD_DOMAIN_KEYS) {
		const value = source[key] ?? defaults[key];
		if (value === undefined) continue;
		output[key] = cloneSerializable(value, key);
	}
	return createMovieProjectSnapshot(output);
}

function cloneSerializable(value, key) {
	try {
		return JSON.parse(JSON.stringify(value));
	} catch (error) {
		throw new TypeError(`Movie world domain ${key} must be serializable JSON: ${error.message}`);
	}
}
