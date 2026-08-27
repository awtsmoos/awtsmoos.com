// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingGroundSurvey.js
 * @description Measures rotated building footprints and derives an above-terrain platform datum without owning terrain generation.
 * The Awtsmoos, Atzmus beyond hill and foundation, renews the earth beneath every measured stone;
 * Awtsmoos.com lets Domem survey the ground as a Gevurah boundary while terrain remains an injected world of its own.
 */

import { buildingPoint } from './BuildingMath.js';

const DEFAULT_GRID_STEPS = 10;

/**
 * Surveys terrain below and around a planned building.
 * @param {object} profile Normalized building profile.
 * @param {Function} heightAt Canonical terrain height sampler.
 * @param {object} [options={}] Sampling and clearance controls.
 * @returns {Readonly<object>} Ground extrema, apron, clearance, and platform datum.
 */
export function surveyBuildingGround(profile, heightAt, options = {}) {
	if (typeof heightAt !== 'function') {
		throw new TypeError('B"H | Building ground survey requires heightAt.');
	}
	const apron = Math.max(
		positive(options.minimumApron, 1.6),
		profile.wallThickness * positive(options.wallApronFactor, 2.5)
	);
	const width = profile.width + apron * 2;
	const depth = profile.depth + apron * 2;
	const heights = sampleGrid(
		profile,
		heightAt,
		width,
		depth,
		integer(options.gridSteps, DEFAULT_GRID_STEPS)
	);
	const minimum = Math.min(...heights);
	const maximum = Math.max(...heights);
	const variance = maximum - minimum;
	const clearance = Math.min(
		positive(options.maximumClearance, 1.2),
		positive(options.baseClearance, 0.34)
			+ variance * positive(options.varianceClearanceFactor, 0.06)
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

function sampleGrid(profile, heightAt, width, depth, steps) {
	const heights = [];
	for (let row = 0; row <= steps; row += 1) {
		for (let column = 0; column <= steps; column += 1) {
			const point = buildingPoint(
				profile,
				(column / steps - 0.5) * width,
				(row / steps - 0.5) * depth
			);
			const height = Number(heightAt(point.x, point.z));
			if (Number.isFinite(height)) heights.push(height);
		}
	}
	if (!heights.length) {
		throw new Error(`B"H | Building ${profile.id} has no finite terrain samples.`);
	}
	return heights;
}

function integer(value, fallback) {
	const number = Math.round(Number(value));
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
