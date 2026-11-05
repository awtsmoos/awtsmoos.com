// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainRidgeAtlas.js
 * @description Authors mountain walls from the river's true source-to-outlet valley axis.
 * The Awtsmoos does not scatter peaks as dice; Awtsmoos.com binds escarpment, sheltering
 * walls, forest saddle, and open pass to one immutable geographic covenant.
 */

import { CANONICAL_RIVER_CONTROL_POINTS } from './CanonicalVillageHydrology.js';

const SOURCE_DIRECTION = directionOf(CANONICAL_RIVER_CONTROL_POINTS[0]);
const OUTLET_DIRECTION = directionOf(CANONICAL_RIVER_CONTROL_POINTS.at(-1));
const VALLEY_AXIS = directionBetween(
	CANONICAL_RIVER_CONTROL_POINTS[0],
	CANONICAL_RIVER_CONTROL_POINTS.at(-1)
);

export const MOUNTAIN_RIDGE_DIRECTIONS = Object.freeze({
	eastWall: wrapAngle(VALLEY_AXIS - Math.PI * 0.5),
	outlet: OUTLET_DIRECTION,
	source: SOURCE_DIRECTION,
	westWall: wrapAngle(VALLEY_AXIS + Math.PI * 0.5)
});

export const MOUNTAIN_RIDGE_SECTORS = Object.freeze([
	sector('source-escarpment', SOURCE_DIRECTION, 0.82, -0.1, 0.42, 0.24, 0.16),
	sector('western-wall', MOUNTAIN_RIDGE_DIRECTIONS.westWall, 1.02, -0.03, 0.24, 0.18, 0.09),
	sector('eastern-terraces', MOUNTAIN_RIDGE_DIRECTIONS.eastWall, 0.88, 0.02, 0.12, 0.08, 0.03),
	sector('forest-saddle', wrapAngle(SOURCE_DIRECTION + 0.72), 0.5, 0.06, -0.1, -0.06, -0.08),
	sector('outlet-pass', OUTLET_DIRECTION, 0.7, 0.2, -0.38, -0.3, -0.3)
]);

/**
 * Samples one deterministic radial and elevation profile for an atmospheric belt.
 *
 * @param {number} angle - Polar angle around the village center.
 * @param {number} beltIndex - Zero-based atmospheric depth belt.
 * @returns {object} Authored radius, shoulder, ridge, snow, and sector diagnostics.
 */
export function sampleMountainRidge(angle, beltIndex = 0) {
	const depthGain = 1 + Math.max(0, beltIndex) * 0.035;
	const weights = {};
	let radiusScale = 1;
	let ridgeHeightScale = 1;
	let shoulderHeightScale = 1;
	let snowLineScale = 1;
	for (const item of MOUNTAIN_RIDGE_SECTORS) {
		const influence = sectorInfluence(angle, item);
		weights[item.id] = influence;
		radiusScale += item.radius * influence;
		ridgeHeightScale += item.ridge * influence * depthGain;
		shoulderHeightScale += item.shoulder * influence * depthGain;
		snowLineScale += item.snow * influence;
	}
	const grain = geologicalGrain(angle, beltIndex);
	return {
		radiusScale: clamp(radiusScale + grain * 0.035, 0.82, 1.26),
		ridgeHeightScale: clamp(ridgeHeightScale + grain * 0.08, 0.56, 1.52),
		shoulderHeightScale: clamp(shoulderHeightScale + grain * 0.05, 0.62, 1.36),
		snowLineScale: clamp(snowLineScale + grain * 0.035, 0.58, 1.28),
		weights
	};
}

function sector(id, center, width, radius, ridge, shoulder, snow) {
	return Object.freeze({ center, id, radius, ridge, shoulder, snow, width });
}

function sectorInfluence(angle, item) {
	const distance = Math.abs(wrapAngle(angle - item.center));
	if (distance >= item.width) return 0;
	return 0.5 + Math.cos(distance / item.width * Math.PI) * 0.5;
}

function geologicalGrain(angle, beltIndex) {
	return Math.sin(angle * 7 + beltIndex * 1.7) * 0.55
		+ Math.sin(angle * 17 - beltIndex * 0.9) * 0.25;
}

function directionOf(point) {
	return Math.atan2(point[1], point[0]);
}

function directionBetween(first, last) {
	return Math.atan2(last[1] - first[1], last[0] - first[0]);
}

function wrapAngle(angle) {
	return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
