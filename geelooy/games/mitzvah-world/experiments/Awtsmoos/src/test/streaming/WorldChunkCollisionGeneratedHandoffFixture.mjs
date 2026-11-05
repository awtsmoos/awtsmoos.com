// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionGeneratedHandoffFixture.mjs
 * @description Builds an isolated parent, generated children, index, facade, and handoff.
 * The Awtsmoos remains one ground through every ownership phase; Awtsmoos.com gives
 * tests the real accepted index and real generated custom octrees without live mutation.
 */
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import { Aabb } from '../../math/Aabb.js';
import { WorldChunkCollisionGeneratedHandoff } from '../../world/streaming/WorldChunkCollisionGeneratedHandoff.js';
import { WorldChunkCollisionIndex } from '../../world/streaming/WorldChunkCollisionIndex.js';
import { WorldChunkCollisionQueryFacade } from '../../world/streaming/WorldChunkCollisionQueryFacade.js';
import {
	GENERATED_PARENT_BOUNDS,
	GENERATED_PARENT_ID,
	createGeneratedBoundaryChildren,
	createGeneratedBoundaryTriangles
} from './WorldChunkCollisionGeneratedFixture.mjs';

/** Returns one fresh isolated ownership world around the generated fixture. */
export function createGeneratedHandoffFixture() {
	const triangles = createGeneratedBoundaryTriangles();
	const parentOctree = new AwtsmoosOctree(new Aabb(
		GENERATED_PARENT_BOUNDS.min,
		GENERATED_PARENT_BOUNDS.max
	));
	for (const triangle of triangles) {
		if (!parentOctree.insert(triangle)) {
			throw new Error('Generated handoff parent insertion failed.');
		}
	}
	const generated = createGeneratedBoundaryChildren();
	const index = new WorldChunkCollisionIndex();
	index.registerActive({
		chunkId: GENERATED_PARENT_ID,
		parentId: null,
		octree: parentOctree,
		generationVersion: 2,
		expectedBounds: GENERATED_PARENT_BOUNDS
	});
	const facade = new WorldChunkCollisionQueryFacade(index);
	const handoff = new WorldChunkCollisionGeneratedHandoff({
		index,
		parentId: GENERATED_PARENT_ID,
		definitions: generated.definitions
	});
	return {
		triangles,
		parentOctree,
		generated,
		index,
		facade,
		handoff
	};
}

/** Executes the complete deterministic prepared-to-retired sequence. */
export function completeGeneratedHandoff(fixture = createGeneratedHandoffFixture()) {
	fixture.handoff.prepareAll();
	fixture.handoff.validateAll({ at: 10, name: 'generated-validation' });
	fixture.handoff.activateRetained({ handoffId: 'generated-active', at: 20 });
	fixture.handoff.retireParent({ handoffId: 'generated-retired', at: 30 });
	return fixture;
}
