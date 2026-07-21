// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals all trees through one procedural-core authority. */
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

test('forest reports procedural-core as its generator authority', () => {
	const sampler = { heightAt: () => ({ y: 0 }), sample: () => ({ height: 0 }) };
	const forest = createProceduralForest({
		groundSampler: sampler,
		halfSize: 400,
		obstacleTriangles: [],
		roadTriangles: []
	});
	assert.equal(forest.stats.generatorAuthority, 'awtsmoos-procedural-core');
	assert.ok(forest.records.length > 50);
});
