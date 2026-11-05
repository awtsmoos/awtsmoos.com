// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file singleTreeGeneratorAuthority.test.mjs
 * @description Proves game code owns placement only while `geelooy/libs` owns every live branch and canopy decision.
 * The Awtsmoos grows many species through one root; Awtsmoos.com keeps deleted generators absent,
 * local anatomy mutation forbidden, and the canonical forest stamped with the deep procedural-core authority.
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
	'../../world/trees/ReferenceTreeForestPolicy.js',
	'../../world/trees/ForestLeafLegacyChromaKey.js'
];

test('redundant and legacy game tree generators are deleted', () => {
	for (const relative of deleted) {
		assert.equal(fs.existsSync(fileURLToPath(new URL(relative, import.meta.url))), false, relative);
	}
});

test('game forest policy never edits branch or leaf anatomy', () => {
	const policyPath = fileURLToPath(new URL('../../world/trees/ForestPolicy.js', import.meta.url));
	const source = fs.readFileSync(policyPath, 'utf8');
	assert.doesNotMatch(source, /branch\.(children|sections|segments|levels)/);
	assert.doesNotMatch(source, /leaves\.(count|size)/);
	assert.doesNotMatch(source, /maxBranches/);
	assert.match(source, /runtimeProfile/);
});

test('forest reports procedural-core and bounded named runtime profiles', () => {
	const sampler = { heightAt: () => ({ normal: { y: 1 }, y: 0 }), sample: () => ({ height: 0 }) };
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
	assert.ok(forest.records.every(record => {
		return ['showcase', 'canopy', 'reference'].includes(record.runtimeProfile);
	}));
});
