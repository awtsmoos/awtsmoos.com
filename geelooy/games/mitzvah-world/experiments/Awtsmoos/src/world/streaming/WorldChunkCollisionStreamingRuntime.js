// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingRuntime.js
 * @description Schedules one collision operation and bounded generation per update.
 * The Awtsmoos reveals continuity through ordered restraint; Awtsmoos.com keeps
 * generation measured, activation retained, retirement explicit, and failure reversible.
 */
import {
	acceptCollisionStreamingRequest,
	requestCollisionStreamingCancellation,
	requestCollisionStreamingRetirement
} from './WorldChunkCollisionStreamingControl.js';
import {
	advanceCollisionStreamingJob,
	cancelCollisionStreamingJob,
	recoverCollisionStreamingFailure
} from './WorldChunkCollisionStreamingEngine.js';
import { createWorldChunkCollisionIncrementalGenerator } from './WorldChunkCollisionIncrementalGenerator.js';
import { WorldChunkCollisionOneShotGenerator } from './WorldChunkCollisionOneShotGenerator.js';
import { createCollisionStreamingUpdate } from './WorldChunkCollisionStreamingValues.js';

export class WorldChunkCollisionStreamingRuntime {
	constructor({ index, parentRecord, sourceTriangles, generate, measure } = {}) {
		this.index = index;
		this.parentRecord = parentRecord;
		this.sourceTriangles = sourceTriangles;
		this.dependencies = Object.freeze({
			createGenerator: generate
				? (options) => new WorldChunkCollisionOneShotGenerator(options, generate)
				: createWorldChunkCollisionIncrementalGenerator,
			measure: measure || measureOperation
		});
		this.currentJob = null;
		this.lastJob = null;
	}

	/** Accepts one stable manually triggered bootstrap subdivision request. */
	request(options = {}) {
		return acceptCollisionStreamingRequest(this, options);
	}

	/** Requests cancellation while rollback can restore parent-only ownership. */
	cancel(options = {}) {
		return requestCollisionStreamingCancellation(this, options);
	}

	/** Requests explicit parent retirement after retained observation. */
	requestRetirement(options = {}) {
		return requestCollisionStreamingRetirement(this, options);
	}

	/** Executes at most one collision lifecycle operation. */
	update(options = {}) {
		const job = this.currentJob;
		if (!job || job.terminal) {
			return this.receipt('idle');
		}
		const update = createCollisionStreamingUpdate(options, true);
		job.assertTime(update.at);
		if (update.maximumOperations === 0) {
			return this.receipt('budget-exhausted');
		}
		const maximumGenerationUnits = Math.min(
			update.maximumGenerationUnits ?? job.request.maximumGenerationUnits,
			job.request.maximumGenerationUnits
		);
		try {
			const operation = job.cancelRequest
				? cancelCollisionStreamingJob(job, this.index, update.at)
				: advanceCollisionStreamingJob({
					job,
					index: this.index,
					dependencies: this.dependencies,
					at: update.at,
					maximumGenerationUnits
				});
			return this.receipt(operation);
		} catch (error) {
			const operation = recoverCollisionStreamingFailure(
				job,
				this.index,
				error,
				update.at
			);
			return this.receipt(operation);
		}
	}

	/** Returns live scheduler evidence without exposing source geometry. */
	diagnostics() {
		return Object.freeze({
			limitation: 'individual-octree-insertions-remain-synchronous',
			currentJob: this.currentJob?.diagnostics() || null,
			lastJob: this.lastJob
		});
	}

	receipt(operation) {
		return Object.freeze({
			operation,
			state: this.currentJob?.state || 'idle',
			job: this.currentJob?.diagnostics() || null,
			ownership: this.index.diagnostics()
		});
	}
}

function measureOperation(operation) {
	const start = globalThis.performance?.now?.() ?? 0;
	const value = operation();
	const end = globalThis.performance?.now?.() ?? start;
	return Object.freeze({ value, durationMs: Math.max(0, end - start) });
}
