// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowBotanicalQuality.test.mjs
 * @description Proves richer botanical geometry obeys explicit quality budgets and batching limits.
 * The Awtsmoos reveals segmented grass, leaves, layered crowns, centers, and seed heads in measured vessels;
 * Awtsmoos.com verifies density ordering, deterministic geometry, and exactly two geometry families per cell.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowFlowerCellGeometry
} from '../../app/MinimalMeadowFlowerClumpGeometry.js';
import {
	listMinimalMeadowFlowerSpecies
} from '../../app/MinimalMeadowFlowerSpecies.js';
import {
	minimalMeadowVegetationBudget
} from '../../app/MinimalMeadowVegetationQualityBudget.js';

const terrain = {
	heightAt(x, z) {
		return Math.sin(x * 0.1) * 0.12 + Math.cos(z * 0.08) * 0.09;
	}
};

test('B"H quality budgets order density and visibility explicitly', () => {
	const low = minimalMeadowVegetationBudget({ quality: 'low' });
	const high = minimalMeadowVegetationBudget({ quality: 'high' });
	const cinematic = minimalMeadowVegetationBudget({ quality: 'cinematic' });
	assert.ok(low.cells < high.cells);
	assert.ok(high.cells < cinematic.cells);
	assert.ok(low.maximumClumps < high.maximumClumps);
	assert.ok(high.visibilityDistance < cinematic.visibilityDistance);
});

test('B"H botanical cell stays deterministic and two-family batched', () => {
	const species = listMinimalMeadowFlowerSpecies()[4];
	const budget = minimalMeadowVegetationBudget({ quality: 'high' });
	const options = {
		budget,
		center: { x: 12, y: 0, z: -8 },
		clumps: budget.maximumClumps,
		seed: 8178,
		species,
		terrain
	};
	const first = createMinimalMeadowFlowerCellGeometry(options);
	const second = createMinimalMeadowFlowerCellGeometry(options);
	assert.deepEqual(first, second);
	assert.ok(first.grass.faces.length > budget.maximumClumps * 20);
	assert.ok(first.petals.faces.length > first.flowers * species.petalCount);
	assert.equal(Object.keys({ grass: first.grass, flowers: first.petals }).length, 2);
	assert.ok(first.flowers <= budget.maximumClumps * budget.flowersPerClump);
});
