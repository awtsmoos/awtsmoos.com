// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingControl.js
 * @description Validates external request, cancellation, and retirement commands.
 * The Awtsmoos grants motion through exact vessels; Awtsmoos.com refuses every
 * overlapping command, premature retirement, and unsafe post-activation reversal.
 */
import { WorldChunkCollisionStreamingJob } from './WorldChunkCollisionStreamingJob.js';
import { WORLD_CHUNK_COLLISION_STREAMING_STATES as S } from './WorldChunkCollisionStreamingStates.js';
import {
	createCollisionStreamingRequest,
	requireCollisionStreamingText,
	requireCollisionStreamingTime
} from './WorldChunkCollisionStreamingValues.js';

const RETAINED_STATES = Object.freeze([
	S.RETAINED_ACTIVE,
	S.OBSERVING,
	S.RETIREMENT_READY
]);

/** Replaces only a terminal job with one validated production request. */
export function acceptCollisionStreamingRequest(runtime, options) {
	if (runtime.currentJob && !runtime.currentJob.terminal) {
		throw new Error('A collision streaming job is already active.');
	}
	if (!runtime.index.hasActive(runtime.parentRecord.id)) {
		throw new Error('The bootstrap collision parent is not active.');
	}
	runtime.lastJob = runtime.currentJob?.diagnostics() || runtime.lastJob;
	const request = createCollisionStreamingRequest(
		options,
		runtime.parentRecord,
		runtime.sourceTriangles
	);
	runtime.currentJob = new WorldChunkCollisionStreamingJob(request);
	return runtime.currentJob.diagnostics();
}

/** Records a safe pre-activation cancellation request. */
export function requestCollisionStreamingCancellation(runtime, options) {
	const job = requireActiveCollisionStreamingJob(runtime);
	if (RETAINED_STATES.includes(job.state)) {
		return Object.freeze({
			accepted: false,
			reason: 'retained-activation-already-visible'
		});
	}
	job.requestCancel(
		requireCollisionStreamingText(
			options?.reason ?? 'cancelled-by-request',
			'Cancellation reason'
		),
		requireCollisionStreamingTime(options?.at, 'Cancellation time')
	);
	return Object.freeze({ accepted: true, state: job.state });
}

/** Records retirement authorization after retained activation. */
export function requestCollisionStreamingRetirement(runtime, options) {
	const job = requireActiveCollisionStreamingJob(runtime);
	if (!RETAINED_STATES.includes(job.state)) {
		throw new Error(`Parent retirement is unavailable during ${job.state}.`);
	}
	const requestedAt = requireCollisionStreamingTime(
		options?.at,
		'Retirement request time'
	);
	if (requestedAt <= job.lastAt) {
		throw new Error('Retirement request time must follow lifecycle time.');
	}
	job.requestRetirement(requestedAt);
	return job.diagnostics();
}

/** Returns one active nonterminal job or throws. */
export function requireActiveCollisionStreamingJob(runtime) {
	if (!runtime.currentJob || runtime.currentJob.terminal) {
		throw new Error('No active collision streaming job exists.');
	}
	return runtime.currentJob;
}
