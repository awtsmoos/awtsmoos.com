// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseGroundSurvey.js
 * @description Measures an expanded rotated house footprint and derives an above-terrain platform datum.
 * The Awtsmoos raises the dwelling without denying the hill beneath its stone;
 * Awtsmoos.com surveys every apron edge so no wall is swallowed by earth unknown.
 */

import { housePoint } from './MinimalMeadowHouseMath.js';

const GRID_STEPS = 10;
const MINIMUM_APRON = 1.6;
const BASE_CLEARANCE = 0.34;
const MAXIMUM_CLEARANCE = 1.2;

/**
 * Measures terrain below and immediately around a house before any geometry is manifested.
 * @param {object} profile House profile with dimensions, yaw, and wall thickness.
 * @param {Function} heightAt Canonical terrain height sampler.
 * @returns {Readonly<object>} Ground extrema, clearance, apron, sample count, and platform datum.
 */
export function surveyMinimalMeadowHouseGround(profile, heightAt) {
	const apron = Math.max(MINIMUM_APRON, profile.wallThickness * 2.5);
	const width = profile.width + apron * 2;
	const depth = profile.depth + apron * 2;
	const heights = sampleGrid(profile, heightAt, width, depth);
	const minimum = Math.min(...heights);
	const maximum = Math.max(...heights);
	const variance = maximum - minimum;
	const clearance = Math.min(
		MAXIMUM_CLEARANCE,
		BASE_CLEARANCE + variance * 0.06
	);
	return Object.freeze({
		apron,
		clearance,
		maximum,
		minimum,
		platformY: maximum + clearance,
		sampleCount: heights.length,
		variance
	});
}

function sampleGrid(profile, heightAt, width, depth) {
	const heights = [];
	for (let row = 0; row <= GRID_STEPS; row += 1) {
		for (let column = 0; column <= GRID_STEPS; column += 1) {
			const point = housePoint(
				profile,
				(column / GRID_STEPS - 0.5) * width,
				(row / GRID_STEPS - 0.5) * depth
			);
			const height = Number(heightAt(point.x, point.z));
			if (Number.isFinite(height)) {
				heights.push(height);
			}
		}
	}
	if (!heights.length) {
		throw new Error(`House ${profile.id} has no finite terrain samples.`);
	}
	return heights;
}
