// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalFixture.mjs
 * @description Creates fresh deterministic incremental generation test vessels.
 * The Awtsmoos renews equal worlds from equal seeds; Awtsmoos.com gives every
 * test its own source, cursor, and octree without sharing mutable revelation.
 */
import { createWorldChunkCollisionIncrementalGenerator } from '../../world/streaming/WorldChunkCollisionIncrementalGenerator.js';
import {
	GENERATED_PARENT_BOUNDS,
	GENERATED_PARENT_ID
} from './WorldChunkCollisionGeneratedFixture.mjs';
import { createGeneratedHandoffFixture } from './WorldChunkCollisionGeneratedHandoffFixture.mjs';

/** Returns fresh options and one unstepped generator. */
export function createIncrementalCollisionFixture(overrides = {}) {
	const generated = createGeneratedHandoffFixture();
	const options = Object.freeze({
		parentId: GENERATED_PARENT_ID,
		parentBounds: GENERATED_PARENT_BOUNDS,
		parentSeed: 314159,
		generationVersion: 3,
		triangles: generated.triangles,
		defaultStepUnits: 7,
		sortRunSize: 4,
		...overrides
	});
	return Object.freeze({
		...generated,
		options,
		generator: createWorldChunkCollisionIncrementalGenerator(options)
	});
}

/** Drains one generator with a stable unit budget and returns progress history. */
export function drainIncrementalGenerator(generator, maximumUnits = 7) {
	const history = [];
	while (!generator.diagnostics().completed) {
		history.push(generator.step({ maximumUnits }));
		if (history.length > 100000) {
			throw new Error('Incremental generation fixture exceeded its drain guard.');
		}
	}
	return Object.freeze(history);
}

/** Returns serializable final evidence without octree object identity. */
export function stableIncrementalResult(result) {
	return Object.freeze({
		layout: result.layout,
		assignment: Object.freeze({
			...result.assignment,
			assignments: result.assignment.assignments.map((assigned) => Object.freeze({
				child: assigned.child,
				triangleKeys: assigned.triangleKeys
			}))
		}),
		definitions: result.definitions.map((definition) => Object.freeze({
			chunkId: definition.chunkId,
			parentId: definition.parentId,
			generationVersion: definition.generationVersion,
			expectedBounds: definition.expectedBounds,
			triangleKeys: definition.triangleKeys,
			deterministicSeed: definition.deterministicSeed,
			storedTriangles: definition.octree.all([]).length
		})),
		diagnostics: result.diagnostics
	});
}
