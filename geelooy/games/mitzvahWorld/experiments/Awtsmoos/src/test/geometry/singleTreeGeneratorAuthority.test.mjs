// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file singleTreeGeneratorAuthority.test.mjs
 * @description Proves one procedural authority and its explicit medium-quality forest budget.
 * The Awtsmoos grows many species through one root; Awtsmoos.com keeps duplicate generators absent
 * while thirty-six representative trees preserve complete preset and reference coverage.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createProceduralForest } from '../../world/trees/ProceduralForestSystem.js';

const deleted = [
	'../../world/village/HeroValleyTreeSystem.js',
	'../../world/trees/ReferenceForestGeometry.js',
	'../../world/trees/ReferenceForestMeshBuilder.js',
	'../../world/trees/ReferenceForestMaterials.js',
	'../../world/trees/ReferenceTreeForestPolicy.js'
];

test('redundant game tree generators are deleted', () => {
	for (const relative of deleted) {
		assert.equal(fs.existsSync(fileURLToPath(new URL(relative, import.meta.url))), false, relative);
	}
});

test('forest reports procedural-core and one bounded quality budget', () => {
	const sampler = { heightAt: () => ({ y: 0 }), sample: () => ({ height: 0 }) };
	const forest = createProceduralForest({
		groundSampler: sampler,
		halfSize: 400,
		obstacleTriangles: [],
		roadTriangles: []
	});
	assert.equal(forest.stats.generatorAuthority, 'awtsmoos-procedural-core');
	assert.equal(forest.records.length, forest.stats.qualityBudget.totalCount);
	assert.equal(forest.stats.treeCount, 36);
	assert.equal(forest.stats.allPresetsPresent, true);
	assert.equal(forest.stats.allReferenceSpeciesPresent, true);
});
