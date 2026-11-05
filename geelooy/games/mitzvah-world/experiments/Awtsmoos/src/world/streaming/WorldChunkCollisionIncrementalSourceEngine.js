// B"H // Boruch Hashem // Blessed is He
/**
 * @file WorldChunkCollisionIncrementalSourceEngine.js
 * @description Advances layout, source, ordering, and assignment phases.
 * The Awtsmoos orders every hidden point before ownership appears; Awtsmoos.com
 * gives each source one bounded passage through identity, order, and child touch.
 */
import { createWorldChunkCollisionChildLayout } from './WorldChunkCollisionChildLayout.js';
import { WorldChunkCollisionIncrementalAssignments } from './WorldChunkCollisionIncrementalAssignments.js';
import { WorldChunkCollisionIncrementalMerge } from './WorldChunkCollisionIncrementalMerge.js';
import { WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES as P } from './WorldChunkCollisionIncrementalPhases.js';
import { WorldChunkCollisionIncrementalSources } from './WorldChunkCollisionIncrementalSources.js';
import { WorldChunkCollisionIncrementalOctrees } from './WorldChunkCollisionIncrementalOctrees.js';

/** Advances one supported source-side phase or returns null. */
export function advanceCollisionIncrementalSource(generator, maximumUnits) {
	switch (generator.phase) {
		case P.LAYOUT:
			return createLayout(generator);
		case P.SCAN_SOURCES:
			return scanSources(generator, maximumUnits);
		case P.SORT_RUNS:
			return sortRuns(generator, maximumUnits);
		case P.MERGE_RUNS:
			return mergeRuns(generator, maximumUnits);
		case P.ASSIGN_SOURCES:
			return assignSources(generator, maximumUnits);
		default:
			return null;
	}
}

function createLayout(generator) {
	generator.layout = createWorldChunkCollisionChildLayout(generator.options);
	generator.sources = new WorldChunkCollisionIncrementalSources();
	generator.phase = P.SCAN_SOURCES;
	return 1;
}

function scanSources(generator, maximumUnits) {
	const units = generator.sources.scan(generator.options.triangles, maximumUnits);
	if (generator.sources.sourceCursor === generator.options.triangles.length) {
		generator.phase = P.SORT_RUNS;
	}
	return units;
}

function sortRuns(generator, maximumUnits) {
	const units = generator.sources.createRuns(
		maximumUnits,
		generator.options.sortRunSize
	);
	if (generator.sources.runCursor === generator.sources.uniqueSources.length) {
		generator.merge = new WorldChunkCollisionIncrementalMerge(generator.sources.runs);
		generator.phase = P.MERGE_RUNS;
	}
	return units;
}

function mergeRuns(generator, maximumUnits) {
	const units = generator.merge.step(maximumUnits);
	if (generator.merge.diagnostics().complete) {
		generator.orderedSources = generator.merge.result();
		generator.assignmentBuilder = new WorldChunkCollisionIncrementalAssignments(
			generator.layout.children,
			generator.options.triangles.length,
			generator.options.triangles.length - generator.orderedSources.length
		);
		generator.phase = P.ASSIGN_SOURCES;
	}
	return units;
}

function assignSources(generator, maximumUnits) {
	const units = generator.assignmentBuilder.step(
		generator.orderedSources,
		maximumUnits
	);
	if (generator.assignmentBuilder.sourceCursor === generator.orderedSources.length) {
		generator.runtimeAssignment = generator.assignmentBuilder.runtimeResult();
		generator.assignment = generator.assignmentBuilder.result();
		generator.octrees = new WorldChunkCollisionIncrementalOctrees(
			generator.runtimeAssignment,
			generator.options.parentId,
			generator.options.generationVersion
		);
		generator.phase = P.INITIALIZE_OCTREES;
	}
	return units;
}
