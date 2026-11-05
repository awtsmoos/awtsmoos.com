// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionChildOctreeFactory.test.mjs
 * @description Proves real custom octrees, exact bounds, and repeatable diagnostics.
 * The Awtsmoos reveals one parent geometry in eight accepted vessels; Awtsmoos.com
 * checks every insertion, assignment, seed, digest, and reversed-input generation.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import {
	GENERATED_PARENT_BOUNDS,
	GENERATED_PARENT_ID,
	createGeneratedBoundaryChildren
} from './WorldChunkCollisionGeneratedFixture.mjs';

test('factory builds eight real octrees with exact child bounds', () => {
	const generated = createGeneratedBoundaryChildren();
	assert.equal(generated.parentId, GENERATED_PARENT_ID);
	assert.deepEqual(generated.layout.parentBounds, GENERATED_PARENT_BOUNDS);
	assert.equal(generated.definitions.length, 8);
	for (const definition of generated.definitions) {
		assert.ok(definition.octree instanceof AwtsmoosOctree);
		assert.deepEqual(
			definition.octree.bounds.toJSON(),
			definition.expectedBounds
		);
		assert.equal(
			definition.octree.all([]).length,
			definition.triangleKeys.length
		);
		assert.equal(definition.parentId, GENERATED_PARENT_ID);
		assert.equal(definition.generationVersion, 3);
	}
});

test('factory records exact source and overlap assignment counts', () => {
	const diagnostics = createGeneratedBoundaryChildren().diagnostics;
	assert.equal(diagnostics.childCount, 8);
	assert.equal(diagnostics.sourceCount, 4);
	assert.equal(diagnostics.uniqueSourceCount, 4);
	assert.equal(diagnostics.duplicateSourceCount, 0);
	assert.equal(diagnostics.totalAssignments, 24);
	assert.equal(diagnostics.overlapDuplicationCount, 20);
	assert.equal(diagnostics.children.length, 8);
	assert.equal(
		diagnostics.children.reduce((total, child) => total + child.triangleCount, 0),
		24
	);
});

test('reversed input geometry produces identical deterministic diagnostics', () => {
	const first = createGeneratedBoundaryChildren();
	const reversed = createGeneratedBoundaryChildren({ reverse: true });
	assert.deepEqual(first.diagnostics, reversed.diagnostics);
	assert.deepEqual(
		first.definitions.map(compactDefinition),
		reversed.definitions.map(compactDefinition)
	);
	assert.equal(Object.isFrozen(first.diagnostics), true);
});

function compactDefinition(definition) {
	return {
		chunkId: definition.chunkId,
		parentId: definition.parentId,
		generationVersion: definition.generationVersion,
		deterministicSeed: definition.deterministicSeed,
		expectedBounds: definition.expectedBounds,
		triangleKeys: definition.triangleKeys
	};
}
