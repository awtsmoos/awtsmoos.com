// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationDistribution.js
 * @description Distributes quality-budgeted ecological cells from one deterministic meadow seed.
 * The Awtsmoos scatters wet-bank blossom, dry restraint, and fertile abundance without sameness;
 * Awtsmoos.com preserves paths, spacing, quadrants, playable bounds, and explicit density budgets.
 */

import {
	MINIMAL_MEADOW_PLAYABLE_HALF_SIZE,
	MINIMAL_MEADOW_POPULATION_SEED,
	MINIMAL_MEADOW_VEGETATION_ANCHORS
} from './MinimalMeadowWorldPopulationConfig.js';
import { minimalMeadowPopulationAllows } from './MinimalMeadowWorldPopulationExclusions.js';
import {
	minimalMeadowHasSpacing,
	minimalMeadowSeededUnit
} from './MinimalMeadowWorldPopulationMath.js';
import { minimalMeadowRiverSample } from './MinimalMeadowRiverPath.js';
import { createMinimalMeadowVegetationCellProfile } from './MinimalMeadowVegetationCellProfile.js';
import { minimalMeadowVegetationBudget } from './MinimalMeadowVegetationQualityBudget.js';

const CELL_EXTENT = 4.5;

export function createMinimalMeadowVegetationDistribution(terrain, options = {}) {
	const budget = minimalMeadowVegetationBudget(options);
	const cells = [];
	const context = { ...options, budget };
	appendAnchors(cells, terrain, context);
	appendRiverBanks(cells, terrain, budget.riverCells, context);
	for (let attempt = 0; attempt < 2800 && cells.length < budget.cells; attempt += 1) {
		appendCell(
			cells,
			terrain,
			coordinate(attempt, 71),
			coordinate(attempt, 79),
			attempt + 500,
			'seeded-meadow',
			'vegetation',
			context
		);
	}
	return cells.slice(0, budget.cells).map((cell, index) => Object.freeze({
		...cell,
		budget,
		id: `meadow-vegetation-cell-${index + 1}`
	}));
}

function appendAnchors(cells, terrain, options) {
	for (let index = 0; index < MINIMAL_MEADOW_VEGETATION_ANCHORS.length; index += 1) {
		const anchor = MINIMAL_MEADOW_VEGETATION_ANCHORS[index];
		appendCell(cells, terrain, anchor.x, anchor.z, index,
			'quadrant-anchor', 'vegetation', options);
	}
}

function appendRiverBanks(cells, terrain, count, options) {
	for (let index = 0; index < count; index += 1) {
		const t = 0.06 + index / Math.max(1, count - 1) * 0.86;
		const sample = minimalMeadowRiverSample(t);
		const before = minimalMeadowRiverSample(Math.max(0, t - 0.01));
		const after = minimalMeadowRiverSample(Math.min(1, t + 0.01));
		const length = Math.max(0.001, Math.hypot(after.x - before.x, after.z - before.z));
		const side = index % 2 ? -1 : 1;
		const offset = sample.width + 3.1 + unit(index, 83) * 2.4;
		appendCell(
			cells,
			terrain,
			sample.x - (after.z - before.z) / length * offset * side,
			sample.z + (after.x - before.x) / length * offset * side,
			index + 100,
			'river-bank',
			'bank-vegetation',
			options
		);
	}
}

function appendCell(cells, terrain, x, z, key, source, role, options) {
	if (!insidePlayableCell(x, z) || !minimalMeadowPopulationAllows(x, z, role)) return;
	const spacing = options.mobile ? 6.2 : 4.9;
	if (!minimalMeadowHasSpacing(cells, x, z, spacing)) return;
	const profile = createMinimalMeadowVegetationCellProfile(terrain, x, z, key, options);
	if (!profile) return;
	cells.push({
		...profile,
		source,
		x,
		y: terrain.heightAt(x, z),
		z
	});
}

function insidePlayableCell(x, z) {
	return Math.abs(x) + CELL_EXTENT <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE
		&& Math.abs(z) + CELL_EXTENT <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE;
}

function coordinate(index, salt) {
	return (unit(index, salt) * 2 - 1) * MINIMAL_MEADOW_PLAYABLE_HALF_SIZE;
}

function unit(index, salt) {
	return minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, index, salt);
}
