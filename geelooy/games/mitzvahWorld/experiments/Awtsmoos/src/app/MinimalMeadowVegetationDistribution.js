// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationDistribution.js
 * @description Distributes bounded irregular dry, moist, meadow, and riverbank cells from one seed.
 * The Awtsmoos scatters abundance without sameness; Awtsmoos.com lets water invite reeds, ridges
 * remain sparse, quadrants retain life, and every full clump remain inside the playable vessel.
 */

import {
	MINIMAL_MEADOW_PLAYABLE_HALF_SIZE,
	MINIMAL_MEADOW_POPULATION_SEED,
	MINIMAL_MEADOW_VEGETATION_ANCHORS
} from './MinimalMeadowWorldPopulationConfig.js';
import {
	minimalMeadowPopulationAllows,
	minimalMeadowPopulationClearance
} from './MinimalMeadowWorldPopulationExclusions.js';
import {
	minimalMeadowHasSpacing,
	minimalMeadowSeededUnit
} from './MinimalMeadowWorldPopulationMath.js';
import { minimalMeadowRiverSample } from './MinimalMeadowRiverPath.js';

const CELL_EXTENT = 4.5;
const COLORS = Object.freeze(['#f5d75b', '#f6a3c0', '#b99bf2', '#f4f0d7']);

export function createMinimalMeadowVegetationDistribution(terrain, options = {}) {
	const target = options.mobile ? 28 : 42;
	const cells = [];
	appendAnchors(cells, terrain);
	appendRiverBanks(cells, terrain, options.mobile ? 12 : 18);
	for (let attempt = 0; attempt < 1800 && cells.length < target; attempt += 1) {
		appendCell(cells, terrain, coordinate(attempt, 71), coordinate(attempt, 79),
			attempt + 500, 'seeded-meadow', 'vegetation');
	}
	return cells.slice(0, target).map((cell, index) => Object.freeze({
		...cell,
		id: `meadow-vegetation-cell-${index + 1}`
	}));
}

function appendAnchors(cells, terrain) {
	for (let index = 0; index < MINIMAL_MEADOW_VEGETATION_ANCHORS.length; index += 1) {
		const anchor = MINIMAL_MEADOW_VEGETATION_ANCHORS[index];
		appendCell(cells, terrain, anchor.x, anchor.z, index, 'quadrant-anchor', 'vegetation');
	}
}

function appendRiverBanks(cells, terrain, count) {
	for (let index = 0; index < count; index += 1) {
		const t = 0.06 + index / Math.max(1, count - 1) * 0.86;
		const sample = minimalMeadowRiverSample(t);
		const before = minimalMeadowRiverSample(Math.max(0, t - 0.01));
		const after = minimalMeadowRiverSample(Math.min(1, t + 0.01));
		const length = Math.max(0.001, Math.hypot(after.x - before.x, after.z - before.z));
		const side = index % 2 ? -1 : 1;
		const offset = sample.width + 3.1
			+ minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, index, 83) * 2.4;
		appendCell(cells, terrain,
			sample.x - (after.z - before.z) / length * offset * side,
			sample.z + (after.x - before.x) / length * offset * side,
			index + 100, 'river-bank', 'bank-vegetation');
	}
}

function appendCell(cells, terrain, x, z, key, source, role) {
	if (!insidePlayableCell(x, z) || !minimalMeadowPopulationAllows(x, z, role)) {
		return;
	}
	if (!minimalMeadowHasSpacing(cells, x, z, 5.8)) {
		return;
	}
	const evidence = minimalMeadowPopulationClearance(x, z);
	const moisture = Math.max(0, Math.min(1, 1 - evidence.riverGap / 28));
	const drySignal = Math.sin(x * 0.071) + Math.cos(z * 0.063);
	const zone = source === 'river-bank'
		? 'river-bank'
		: moisture > 0.45 ? 'moist-meadow' : drySignal > 0.85 ? 'dry-meadow' : 'grass-meadow';
	const sparse = zone === 'dry-meadow';
	cells.push({
		clumps: (sparse ? 5 : 9)
			+ Math.floor(minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 89) * (sparse ? 4 : 8)),
		color: COLORS[Math.floor(minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 97) * COLORS.length)],
		moisture,
		source,
		x,
		y: terrain.heightAt(x, z),
		z,
		zone
	});
}

function insidePlayableCell(x, z) {
	return Math.abs(x) + CELL_EXTENT <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE
		&& Math.abs(z) + CELL_EXTENT <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE;
}

function coordinate(index, salt) {
	return (minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, index, salt) * 2 - 1)
		* MINIMAL_MEADOW_PLAYABLE_HALF_SIZE;
}
