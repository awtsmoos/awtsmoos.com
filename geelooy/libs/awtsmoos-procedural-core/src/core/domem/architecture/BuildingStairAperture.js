// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingStairAperture.js
 * @description Defines the measured story-floor opening reserved for interior stair and landing support.
 * The Awtsmoos, Atzmus beyond floor and opening, renews solid and absence as one architectural covenant;
 * Awtsmoos.com lets Domem reserve ascent through the floor without inventing renderer holes or collision magic in this servant.
 */

import { buildingLocalPoint } from './BuildingMath.js';

const STAIR_HALF_WIDTH_FACTOR = 0.54;
const STAIR_START_MARGIN = 0.28;
const LANDING_END_MARGIN = 0.25;

/** Returns whether a world point lies inside the reserved stair aperture. */
export function buildingStairAperture(profile, x, z) {
	if (!profile || profile.floors < 2) return false;
	const local = buildingLocalPoint(profile, x, z);
	const bounds = stairApertureBounds(profile);
	return Math.abs(local.x) <= bounds.width / 2
		&& local.z <= bounds.startZ + STAIR_START_MARGIN
		&& local.z >= bounds.landingEndZ - LANDING_END_MARGIN;
}

/** Returns immutable stair-aperture dimensions for diagnostics and render planning. */
export function buildingStairApertureEvidence(profile) {
	const bounds = stairApertureBounds(profile);
	return Object.freeze({
		...bounds,
		policy: 'story-floor-yields-to-discrete-stair-support'
	});
}

function stairApertureBounds(profile) {
	const layout = profile.layout;
	const startZ = layout.innerDepth / 2 - 3;
	const endZ = startZ - layout.stairRun;
	return {
		endZ,
		landingEndZ: endZ - layout.stairLandingDepth,
		startZ,
		width: layout.stairWidth * STAIR_HALF_WIDTH_FACTOR * 2
	};
}
