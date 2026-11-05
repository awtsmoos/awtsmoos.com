// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalGenerator.js
 * @description Coordinates deterministic bounded child-collision generation.
 * The Awtsmoos recreates the ground each instant; Awtsmoos.com reveals its finite
 * preparation through resumable phases that never seize ownership prematurely.
 */
import { advanceCollisionIncrementalBuild } from './WorldChunkCollisionIncrementalBuildEngine.js';
import {
	WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES as P,
	isCollisionIncrementalTerminal
} from './WorldChunkCollisionIncrementalPhases.js';
import {
	createCollisionIncrementalProgress,
	createCollisionIncrementalReceipt,
	releaseCollisionIncrementalStructures
} from './WorldChunkCollisionIncrementalProgress.js';
import { advanceCollisionIncrementalSource } from './WorldChunkCollisionIncrementalSourceEngine.js';
import {
	createCollisionIncrementalOptions,
	requireCollisionGenerationUnits
} from './WorldChunkCollisionIncrementalValues.js';

export class WorldChunkCollisionIncrementalGenerator {
	constructor(options = {}) {
		this.options = createCollisionIncrementalOptions(options);
		this.phase = P.LAYOUT;
		this.stepCount = 0;
		this.totalUnits = 0;
		this.resultValue = null;
		this.disposedReason = null;
		this.layout = null;
		this.sources = null;
		this.merge = null;
		this.orderedSources = null;
		this.assignmentBuilder = null;
		this.runtimeAssignment = null;
		this.assignment = null;
		this.octrees = null;
	}

	/** Advances bounded deterministic work and returns compact progress. */
	step({ maximumUnits = this.options.defaultStepUnits } = {}) {
		const budget = requireCollisionGenerationUnits(maximumUnits);
		if (isCollisionIncrementalTerminal(this.phase) || budget === 0) {
			return createCollisionIncrementalReceipt(this, 0);
		}
		const previousPhase = this.phase;
		let consumed = 0;
		let guard = 0;
		while (consumed < budget && !isCollisionIncrementalTerminal(this.phase)) {
			const before = this.phase;
			const units = this.advance(budget - consumed);
			consumed += units;
			guard += 1;
			if (units === 0 && this.phase === before) {
				throw new Error(`Incremental generation stalled during ${this.phase}.`);
			}
			if (guard > 32) {
				throw new Error('Incremental generation exceeded its phase guard.');
			}
		}
		this.stepCount += 1;
		this.totalUnits += consumed;
		return createCollisionIncrementalReceipt(this, consumed, previousPhase);
	}

	/** Returns the completed generation result. */
	result() {
		if (this.phase !== P.COMPLETE || !this.resultValue) {
			throw new Error('Incremental collision generation is not complete.');
		}
		return this.resultValue;
	}

	/** Releases runtime-only structures before ownership preparation. */
	dispose(reason = 'disposed') {
		if (this.phase === P.COMPLETE) {
			throw new Error('Completed collision generation cannot be disposed.');
		}
		this.disposedReason = String(reason);
		this.phase = P.DISPOSED;
		releaseCollisionIncrementalStructures(this);
	}

	/** Returns progress without source triangles or octrees. */
	diagnostics() {
		return createCollisionIncrementalProgress(this);
	}

	advance(maximumUnits) {
		const sourceUnits = advanceCollisionIncrementalSource(this, maximumUnits);
		if (sourceUnits !== null) {
			return sourceUnits;
		}
		const buildUnits = advanceCollisionIncrementalBuild(this, maximumUnits);
		if (buildUnits !== null) {
			return buildUnits;
		}
		throw new Error(`No incremental engine supports phase ${this.phase}.`);
	}
}

/** Creates one production incremental child-collision generator. */
export function createWorldChunkCollisionIncrementalGenerator(options) {
	return new WorldChunkCollisionIncrementalGenerator(options);
}
