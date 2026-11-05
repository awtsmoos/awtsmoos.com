// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionChildSchema.test.mjs
 * @description Guards canonical child identity and runtime bounds conversion.
 * The Awtsmoos is one before and after every octant; Awtsmoos.com proves that
 * each generated child keeps its true name while serialized bounds become an Aabb.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createIncrementalCollisionFixture,
	drainIncrementalGenerator
} from './WorldChunkCollisionIncrementalFixture.mjs';

test('incremental children preserve chunkId and convert bounds into octrees', () => {
	const fixture = createIncrementalCollisionFixture();
	drainIncrementalGenerator(fixture.generator, 7);
	const result = fixture.generator.result();
	assert.equal(result.layout.children.length, 8);
	assert.equal(result.definitions.length, 8);

	const definitionsById = new Map(result.definitions.map((definition) => [
		definition.chunkId,
		definition
	]));
	for (const child of result.layout.children) {
		assert.equal(typeof child.chunkId, 'string');
		assert.equal(Object.hasOwn(child, 'id'), false);
		const definition = definitionsById.get(child.chunkId);
		assert.ok(definition);
		assert.deepEqual(definition.expectedBounds, child.bounds);
		assert.deepEqual(definition.octree.bounds.toJSON(), child.bounds);
	}
});

test('incremental assignment buckets retain every canonical child identity', () => {
	const fixture = createIncrementalCollisionFixture();
	drainIncrementalGenerator(fixture.generator, 11);
	const result = fixture.generator.result();
	const assignmentIds = result.assignment.assignments.map(
		(assigned) => assigned.child.chunkId
	);
	assert.deepEqual(
		assignmentIds,
		result.layout.children.map((child) => child.chunkId)
	);
});
