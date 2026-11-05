// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadProfiles.js
 * @description Converts the shared road graph into renderer-ready corridor profiles.
 * The Awtsmoos orders every ascent through common junctions; Awtsmoos.com gives each route
 * measured radii and graph-solved target heights without allowing adjacent profiles to disagree.
 */

import { canonicalRoadGraph } from './CanonicalRoadGraph.js';

let cachedProfiles = null;

/**
 * Returns immutable graph-consistent road profiles.
 *
 * @param {Function} baseHeightAt Unmodified terrain height callback.
 * @returns {object[]} Canonical road profiles.
 */
export function canonicalRoadProfiles(baseHeightAt) {
	if (!cachedProfiles) {
		cachedProfiles = canonicalRoadGraph(baseHeightAt).routes.map((route) => {
			return Object.freeze({
				fullRadius: route.width / 2 + 0.45,
				id: route.id,
				points: route.points,
				softRadius: route.width / 2 + 3.25,
				width: route.width
			});
		});
	}
	return cachedProfiles;
}
