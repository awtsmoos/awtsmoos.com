// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowWorldPopulation.test.mjs
 * @description Proves deterministic groves, species, six variants, ecology zones, finite bounds, and protected access.
 * The Awtsmoos scatters life without chaos and preserves passage without emptiness; Awtsmoos.com
 * measures every road gap, doorway covenant, river source, quadrant, and botanical distinction.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { minimalMeadowHeightAt } from '../../app/MinimalMeadowTerrainShape.js';
import { createMinimalMeadowTreePlacements } from '../../app/MinimalMeadowTreePlacements.js';
import { createMinimalMeadowVegetationDistribution } from '../../app/MinimalMeadowVegetationDistribution.js';
import {
	minimalMeadowPopulationAllows,
	minimalMeadowPopulationClearance
} from '../../app/MinimalMeadowWorldPopulationExclusions.js';
import {
	minimalMeadowPopulationBounds,
	minimalMeadowQuadrantCounts
} from '../../app/MinimalMeadowWorldPopulationMath.js';

const terrain = { heightAt: minimalMeadowHeightAt };
const ECOLOGY_ZONES = new Set([
	'dry-upland',
	'flower-meadow',
	'mixed-meadow',
	'path-edge',
	'wet-meadow'
]);

for (const profile of [
	{ mobile: true, trees: 22, vegetation: 28 },
	{ mobile: false, trees: 32, vegetation: 42 }
]) {
	test(`B"H population profile ${profile.mobile ? '390x844' : 'desktop'} is deterministic and finite`, () => {
		const firstTrees = createMinimalMeadowTreePlacements(terrain, { mobile: profile.mobile });
		const secondTrees = createMinimalMeadowTreePlacements(terrain, { mobile: profile.mobile });
		const firstVegetation = createMinimalMeadowVegetationDistribution(terrain, { mobile: profile.mobile });
		const secondVegetation = createMinimalMeadowVegetationDistribution(terrain, { mobile: profile.mobile });
		assert.deepEqual(firstTrees, secondTrees);
		assert.deepEqual(firstVegetation, secondVegetation);
		assert.equal(firstTrees.length, profile.trees);
		assert.equal(firstVegetation.length, profile.vegetation);
		assert.equal(new Set(firstTrees.map(tree => tree.groveId)).size, 7);
		assertPlayableBounds(firstTrees, tree => tree.radius);
		assertPlayableBounds(firstVegetation, () => 4.5);
		assertAllQuadrants(firstTrees);
		assertAllQuadrants(firstVegetation);
		assertTreeVariation(firstTrees);
		assertVegetationEcology(firstVegetation, profile.mobile);
	});
}

test('B"H trees and vegetation honor road, house, entrance, quest, clearing, and water rules', () => {
	const trees = createMinimalMeadowTreePlacements(terrain, { mobile: false });
	const vegetation = createMinimalMeadowVegetationDistribution(terrain, { mobile: false });
	for (const tree of trees) {
		const evidence = minimalMeadowPopulationClearance(tree.x, tree.z);
		assert.equal(minimalMeadowPopulationAllows(tree.x, tree.z, 'tree'), true);
		assert.ok(evidence.road >= 10 && evidence.house >= 5 && evidence.entrance >= 2);
		assert.ok(evidence.quest >= 12 && evidence.clearing >= 0 && evidence.riverGap >= 5.5);
	}
	for (const cell of vegetation) {
		const role = cell.source === 'river-bank' ? 'bank-vegetation' : 'vegetation';
		assert.equal(minimalMeadowPopulationAllows(cell.x, cell.z, role), true);
	}
});

function assertPlayableBounds(items, extentSelector) {
	const bounds = minimalMeadowPopulationBounds(items, extentSelector);
	assert.equal(bounds.finite, true);
	assert.ok(bounds.minX >= -106 && bounds.maxX <= 106);
	assert.ok(bounds.minZ >= -106 && bounds.maxZ <= 106);
}

function assertAllQuadrants(items) {
	for (const count of Object.values(minimalMeadowQuadrantCounts(items))) assert.ok(count > 0);
}

function assertTreeVariation(trees) {
	assert.ok(new Set(trees.map(tree => tree.preset)).size >= 3);
	assert.equal(new Set(trees.map(tree => tree.materialVariant)).size, 6);
	assert.ok(new Set(trees.map(tree => tree.yaw.toFixed(5))).size > trees.length * 0.8);
	assert.ok(new Set(trees.map(tree => tree.scaleY.toFixed(4))).size > trees.length * 0.7);
}

function assertVegetationEcology(cells, mobile) {
	const zones = new Set(cells.map(cell => cell.zone));
	assert.ok([...zones].every(zone => ECOLOGY_ZONES.has(zone)));
	assert.equal(zones.has('wet-meadow'), true);
	assert.equal(zones.has('flower-meadow'), true);
	if (!mobile) assert.equal(zones.has('dry-upland'), true);
	assert.equal(cells.some(cell => cell.source === 'river-bank'), true);
	assert.ok(new Set(cells.map(cell => cell.x.toFixed(3))).size > cells.length * 0.8);
}
