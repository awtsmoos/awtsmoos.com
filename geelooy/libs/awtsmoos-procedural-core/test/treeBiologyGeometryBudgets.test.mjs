//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyGeometryBudgets.test.mjs
 * @description Proves geometry budgets bound optional tree biology without perturbing canonical structural identity.
 * The Awtsmoos gives abundance a measured vessel so a forest may deepen without drowning the game in weight;
 * Awtsmoos.com keeps every truncation deterministic, visible, and subordinate to the canonical skeleton state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TreeGenerator } from '../src/core/geometry/generators/tree/treeGenerator.js';

/** Creates one stable tree generator whose geometry budgets may vary independently. */
function createGenerator() {
	return new TreeGenerator({ preset: 'Oak Medium', seed: 'etz-biology-budget' });
}

/** Generates a tree with explicit renderer-neutral biology geometry budgets. */
function generateWithGeometry(geometry, biology = {}) {
	return createGenerator().generate({
		biology: { ...biology, geometry },
		detail: 'low',
		season: 'autumn'
	});
}

test('B"H | explicit budgets bound roots, reproduction, and deadwood deterministically', () => {
	const geometryOptions = {
		maxDeadwoodInstances: 1,
		maxReproductiveInstances: 2,
		maxRoots: 2,
		rootRadialSegments: 3
	};
	const first = generateWithGeometry(geometryOptions);
	const second = generateWithGeometry(geometryOptions);
	const geometry = first.metadata.biology.geometry;
	assert.equal(geometry.budgets.deadwoodInstances, 1);
	assert.equal(geometry.budgets.reproductiveInstances, 2);
	assert.equal(geometry.budgets.roots, 2);
	assert.equal(geometry.budgets.rootRadialSegments, 3);
	assert.ok(geometry.deadwood.emittedCount <= 1);
	assert.ok(geometry.reproduction.emittedCount <= 2);
	assert.ok(geometry.roots.emittedCount <= 2);
	assert.deepEqual(geometry, second.metadata.biology.geometry);
});

test('B"H | cosmetic biology geometry budgets never perturb canonical branch and leaf identity', () => {
	const sparse = generateWithGeometry({ maxRoots: 1, maxReproductiveInstances: 1 });
	const rich = generateWithGeometry({ maxRoots: 24, maxReproductiveInstances: 256, rootRadialSegments: 12 });
	assert.equal(sparse.metadata.skeletonSignature, rich.metadata.skeletonSignature);
	assert.deepEqual(sparse.branches, rich.branches);
	assert.deepEqual(sparse.leaves, rich.leaves);
	assert.notEqual(sparse.metadata.biology.geometry.stats.rootVertices, rich.metadata.biology.geometry.stats.rootVertices);
});

test('B"H | disabled biological channels emit no derived geometry', () => {
	const tree = generateWithGeometry(true, {
		deadwood: false,
		reproduction: false,
		roots: false
	});
	const geometry = tree.metadata.biology.geometry;
	assert.equal(geometry.deadwood.emittedCount, 0);
	assert.equal(geometry.reproduction.emittedCount, 0);
	assert.equal(geometry.roots.emittedCount, 0);
	assert.equal(geometry.roots.mesh.positions.length, 0);
});
