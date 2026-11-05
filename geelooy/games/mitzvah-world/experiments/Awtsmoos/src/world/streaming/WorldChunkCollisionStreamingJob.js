// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingJob.js
 * @description Holds one production collision transition and its durable evidence.
 * The Awtsmoos renews one ground through ordered vessels; Awtsmoos.com records
 * each explicit state edge while concealing live triangles, generators, and octrees.
 */
import { createCollisionStreamingJobDiagnostics } from './WorldChunkCollisionStreamingJobDiagnostics.js';
import { WorldChunkCollisionStreamingGenerationTelemetry } from './WorldChunkCollisionStreamingGenerationTelemetry.js';
import {
	WORLD_CHUNK_COLLISION_STREAMING_STATES as S,
	canTransitionCollisionStreaming,
	isCollisionStreamingTerminal
} from './WorldChunkCollisionStreamingStates.js';

export class WorldChunkCollisionStreamingJob {
	constructor(request) {
		this.request = request;
		this.state = S.GENERATION_PENDING;
		this.generator = null;
		this.generated = null;
		this.handoff = null;
		this.childIds = Object.freeze([]);
		this.nextValidationIndex = 0;
		this.observationFrames = 0;
		this.cancelRequest = null;
		this.retirementRequest = null;
		this.error = null;
		this.rollback = null;
		this.lastAt = request.requestedAt;
		this.history = [];
		this.generationTelemetry = new WorldChunkCollisionStreamingGenerationTelemetry();
	}

	/** Returns whether the scheduler has reached a terminal state. */
	get terminal() {
		return isCollisionStreamingTerminal(this.state);
	}

	/** Records one legal state transition with deterministic sequence time. */
	transition(nextState, operation, at, details = null) {
		this.assertTime(at);
		if (!canTransitionCollisionStreaming(this.state, nextState)) {
			throw new Error(`Illegal collision streaming transition: ${this.state} -> ${nextState}`);
		}
		const previousState = this.state;
		this.state = nextState;
		this.lastAt = at;
		this.history.push(Object.freeze({
			operation,
			at,
			from: previousState,
			to: nextState,
			details
		}));
		return this.state;
	}

	/** Stores one measured generation step without growing lifecycle history. */
	recordGenerationStep(receipt, durationMs, at) {
		this.assertTime(at);
		this.lastAt = at;
		this.generationTelemetry.record(receipt, durationMs);
	}

	/** Stores generated runtime data while exposing only immutable diagnostics. */
	setGenerated(generated) {
		this.generated = generated;
		this.childIds = Object.freeze(
			generated.definitions.map((definition) => definition.chunkId)
		);
	}

	/** Requests deterministic cancellation before retained activation. */
	requestCancel(reason, at) {
		this.assertTime(at);
		this.cancelRequest = Object.freeze({ reason, at });
	}

	/** Requests parent retirement after retained observation. */
	requestRetirement(at) {
		this.assertTime(at);
		this.retirementRequest = Object.freeze({ at });
	}

	/** Stores compact failure evidence without retaining the Error object. */
	setError(error, operation) {
		this.error = Object.freeze({
			operation,
			name: error?.name || 'Error',
			message: error?.message || String(error)
		});
	}

	/** Returns immutable diagnostics without source triangles or octrees. */
	diagnostics() {
		return createCollisionStreamingJobDiagnostics(this);
	}

	assertTime(at) {
		if (!Number.isFinite(at) || at < this.lastAt) {
			throw new TypeError('Collision streaming time must be finite and nondecreasing.');
		}
	}
}
