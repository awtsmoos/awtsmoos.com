// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalBuildEngine.js
 * @description Advances octree initialization, insertion, proof, and finalization.
 * The Awtsmoos fills every child without leaving the parent; Awtsmoos.com reveals
 * ownership only after each bounded vessel has been built and measured completely.
 */
import { createCollisionIncrementalFinalDiagnostics } from './WorldChunkCollisionIncrementalDiagnostics.js';
import { WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES as P } from './WorldChunkCollisionIncrementalPhases.js';

/** Advances one supported build-side phase or returns null. */
export function advanceCollisionIncrementalBuild(generator, maximumUnits) {
	switch (generator.phase) {
		case P.INITIALIZE_OCTREES:
			return initializeOctrees(generator, maximumUnits);
		case P.INSERT_TRIANGLES:
			return insertTriangles(generator, maximumUnits);
		case P.VERIFY_CHILDREN:
			return verifyChildren(generator, maximumUnits);
		case P.FINALIZE_CHILDREN:
			return finalizeChildren(generator, maximumUnits);
		default:
			return null;
	}
}

function initializeOctrees(generator, maximumUnits) {
	const units = generator.octrees.initialize(maximumUnits);
	if (generator.octrees.initializeCursor === generator.layout.children.length) {
		generator.phase = P.INSERT_TRIANGLES;
	}
	return units;
}

function insertTriangles(generator, maximumUnits) {
	const units = generator.octrees.insert(maximumUnits);
	if (generator.octrees.insertChildCursor === generator.layout.children.length) {
		generator.phase = P.VERIFY_CHILDREN;
	}
	return units;
}

function verifyChildren(generator, maximumUnits) {
	const units = generator.octrees.verify(maximumUnits);
	if (generator.octrees.verifyCursor === generator.layout.children.length) {
		generator.phase = P.FINALIZE_CHILDREN;
	}
	return units;
}

function finalizeChildren(generator, maximumUnits) {
	const units = generator.octrees.finalize(maximumUnits);
	if (generator.octrees.finalizeCursor === generator.layout.children.length) {
		completeGeneration(generator);
	}
	return units;
}

function completeGeneration(generator) {
	const diagnostics = createCollisionIncrementalFinalDiagnostics({
		options: generator.options,
		layout: generator.layout,
		assignment: generator.assignment,
		childDiagnostics: generator.octrees.childDiagnostics
	});
	generator.resultValue = Object.freeze({
		parentId: generator.options.parentId,
		layout: generator.layout,
		assignment: generator.assignment,
		definitions: Object.freeze(generator.octrees.definitions),
		diagnostics
	});
	generator.phase = P.COMPLETE;
}
