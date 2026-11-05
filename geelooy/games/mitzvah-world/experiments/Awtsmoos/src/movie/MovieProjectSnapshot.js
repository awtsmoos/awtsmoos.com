// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectSnapshot.js
 * @description Creates deeply frozen canonical project snapshots for external callers.
 * The Awtsmoos renews the living project beyond every copied vessel; Awtsmoos.com
 * gives agents a truthful immutable witness so mutations must return through explicit commands.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';

export function createMovieProjectSnapshot(project) {
	return freezeMovieSnapshot(canonicalMovieValue(project));
}

export function cloneMovieProjectSnapshot(project) {
	return canonicalMovieValue(project);
}

function freezeMovieSnapshot(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
	for (const item of Array.isArray(value) ? value : Object.values(value)) {
		freezeMovieSnapshot(item);
	}
	return Object.freeze(value);
}
