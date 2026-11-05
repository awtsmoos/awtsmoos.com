// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkStreamingCoordinator.js
 * @description Runs the budgeted deterministic generation-and-simulation loop around
 * the existing chunk runtime. The Awtsmoos orders every vessel by nearness and by
 * the traveler's heading; Awtsmoos.com re-scores queued work each streaming tick,
 * cancels jobs abandoned by a direction reversal, allows exactly one bounded GPU
 * upload per frame, and advances meadow simulation at a low fixed rate with
 * mathematical catch-up for chunks that were away.
 *
 * The coordinator wraps WorldChunkRuntime without changing it: call update()
 * where chunkRuntime.update() was called; the existing 2 ms visual budget,
 * safety gates, and lifecycle rules stay exactly as they were.
 */

import {
	MEADOW_MUTATION_KEY,
	MEADOW_SIM_DT,
	catchUpMeadowState,
	createMeadowState,
	disturbMeadowState
} from './MeadowChunkSimulation.js';
import {
	applyWorldChunkMutation,
	worldChunkMutation
} from './WorldChunkRecord.js';
import { scoreWorldChunkPriority } from './WorldChunkPriority.js';
import { WORLD_CHUNK_STATES as S } from './WorldChunkState.js';
import {
	clampUnit,
	dot,
	magnitude,
	normalize,
	subtract
} from './WorldChunkMath.js';

const UPLOADS_PER_FRAME = 1;
const REVERSAL_MIN_SPEED = 0.5;
const BEHIND_SIGNAL_CUTOFF = 0.25;
/** Maximum chunks advanced per 2 Hz sim tick; closed-form catch-up keeps slices exact. */
const MAX_SIM_CHUNKS_PER_TICK = 64;

/** Chunk states whose queued jobs may be cancelled on reversal (never active matter). */
const CANCELLABLE_STATES = new Set([
	S.UNKNOWN,
	S.METADATA_LOADED,
	S.COARSE_GENERATED,
	S.VISUAL_READY,
	S.COLLISION_PREPARED
]);

/** Creates one streaming coordinator around an existing chunk runtime. */
export function createWorldChunkStreamingCoordinator({ chunkRuntime } = {}) {
	if (!chunkRuntime?.registry?.queue) {
		throw new TypeError('A chunk runtime with a registry queue is required.');
	}
	const state = {
		chunkRuntime,
		lastAt: null,
		lastVelocity: null,
		simAccumulator: 0,
		simCursor: 0,
		stats: {
			cancelledOnReversal: 0,
			prioritized: 0,
			reversals: 0,
			simChunks: 0,
			simTicks: 0,
			uploadsDeferred: 0
		},
		uploadsRemainingThisFrame: UPLOADS_PER_FRAME
	};
	return {
		/** Applies one disturbance impulse to a chunk's meadow growth value. */
		disturbChunk: (chunkId, amount) => disturbChunk(state, chunkId, amount),
		/** Immutable coordinator diagnostics. */
		diagnostics: () => diagnostics(state),
		/**
		 * Enqueues one GPU-upload job through the per-frame upload gate.
		 * At most one such job executes per update(); the rest defer honestly
		 * to the next frame via queue replacement (never lost, never doubled).
		 */
		enqueueGpuUpload: (job) => enqueueGpuUpload(state, job),
		/** Runs prioritization, reversal cancellation, sim, then the runtime update. */
		update: (frame = {}) => update(state, frame)
	};
}

function update(state, frame) {
	const { chunkRuntime } = state;
	const at = Number.isFinite(frame.at) ? frame.at : Date.now();
	const playerPosition = frame.playerPosition || { x: 0, y: 0, z: 0 };
	const playerVelocity = frame.playerVelocity || null;
	const cameraDirection = frame.cameraDirection || null;
	state.uploadsRemainingThisFrame = UPLOADS_PER_FRAME;
	const evidence = {
		cancelledOnReversal: 0,
		prioritized: 0,
		reversalDetected: false,
		simChunks: 0,
		simTicks: 0,
		uploadsDeferred: 0
	};
	const focus = {
		cameraDirection: cameraDirection || { x: 0, y: 0, z: 0 },
		position: playerPosition,
		velocity: playerVelocity || { x: 0, y: 0, z: 0 }
	};
	evidence.reversalDetected = detectReversal(state, playerVelocity);
	if (evidence.reversalDetected) {
		evidence.cancelledOnReversal = cancelBehindJobs(state, focus);
		state.stats.reversals += 1;
		state.stats.cancelledOnReversal += evidence.cancelledOnReversal;
	}
	evidence.prioritized = rescoreQueue(state, focus);
	state.stats.prioritized += evidence.prioritized;
	const deltaSeconds = state.lastAt === null
		? 0
		: Math.max(0, (at - state.lastAt) / 1000);
	state.lastAt = at;
	state.simAccumulator += deltaSeconds;
	const deferredBefore = state.stats.uploadsDeferred;
	if (state.simAccumulator >= MEADOW_SIM_DT) {
		state.simAccumulator %= MEADOW_SIM_DT;
		evidence.simTicks = 1;
		evidence.simChunks = stepMeadowSimulation(state, at / 1000);
		state.stats.simTicks += 1;
		state.stats.simChunks += evidence.simChunks;
	}
	const receipt = chunkRuntime.update({
		at,
		frameTimeMilliseconds: frame.frameTimeMilliseconds,
		playerPosition
	});
	evidence.uploadsDeferred = state.stats.uploadsDeferred - deferredBefore;
	return Object.freeze({ ...receipt, streaming: Object.freeze(evidence) });
}

/** Returns true when the player reversed heading since the last update. */
function detectReversal(state, velocity) {
	const previous = state.lastVelocity;
	state.lastVelocity = velocity ? { ...velocity } : null;
	if (!previous || !velocity) return false;
	if (magnitude(previous) < REVERSAL_MIN_SPEED || magnitude(velocity) < REVERSAL_MIN_SPEED) {
		return false;
	}
	return dot(previous, velocity) < 0;
}

/** Cancels queued pre-activation jobs for chunks now behind the player. */
function cancelBehindJobs(state, focus) {
	const { registry } = state.chunkRuntime;
	const velocity = focus.velocity;
	if (!velocity || magnitude(velocity) === 0) return 0;
	const heading = normalize({ ...velocity });
	let cancelled = 0;
	for (const entry of [...registry.queue.entries.values()]) {
		const chunkId = entry?.metadata?.chunkId;
		if (!chunkId) continue;
		const record = registry.get(chunkId);
		if (!record || !CANCELLABLE_STATES.has(record.state)) continue;
		const toChunk = subtract(chunkCenter(record), focus.position);
		const signal = clampUnit((dot(heading, normalize(toChunk)) + 1) / 2);
		if (signal < BEHIND_SIGNAL_CUTOFF && registry.queue.cancel(entry.id)) {
			cancelled += 1;
		}
	}
	return cancelled;
}

/** Re-scores every queued chunk job by distance and movement direction. */
function rescoreQueue(state, focus) {
	const { queue } = state.chunkRuntime.registry;
	let rescored = 0;
	for (const entry of [...queue.entries.values()]) {
		const chunkId = entry?.metadata?.chunkId;
		if (!chunkId) continue;
		const record = state.chunkRuntime.registry.get(chunkId);
		if (!record) continue;
		const priority = scoreWorldChunkPriority(record, focus);
		queue.enqueue({
			apply: entry.apply,
			cost: entry.cost,
			id: entry.id,
			metadata: entry.metadata,
			priority
		});
		rescored += 1;
	}
	return rescored;
}

/** Advances meadow simulation for a bounded slice of active chunks. */
function stepMeadowSimulation(state, nowSeconds) {
	const { registry } = state.chunkRuntime;
	const activeIds = [];
	for (const record of registry.records.values()) {
		if (record.state === S.ACTIVE) activeIds.push(record.id);
	}
	if (activeIds.length === 0) return 0;
	const sliceSize = Math.min(MAX_SIM_CHUNKS_PER_TICK, activeIds.length);
	let advanced = 0;
	for (let step = 0; step < sliceSize; step += 1) {
		const id = activeIds[(state.simCursor + step) % activeIds.length];
		const record = registry.get(id);
		if (!record || record.state !== S.ACTIVE) continue;
		const seed = record.deterministicSeed >>> 0;
		let meadow = worldChunkMutation(record, MEADOW_MUTATION_KEY);
		if (!meadow || typeof meadow !== 'object') {
			meadow = createMeadowState(seed, nowSeconds);
		}
		const next = catchUpMeadowState(meadow, seed, nowSeconds);
		registry.records.set(
			id,
			applyWorldChunkMutation(record, MEADOW_MUTATION_KEY, next)
		);
		advanced += 1;
	}
	state.simCursor = (state.simCursor + sliceSize) % activeIds.length;
	return advanced;
}

function disturbChunk(state, chunkId, amount) {
	const record = state.chunkRuntime.registry.get(chunkId);
	if (!record) return false;
	const seed = record.deterministicSeed >>> 0;
	const meadow = worldChunkMutation(record, MEADOW_MUTATION_KEY)
		|| createMeadowState(seed, state.lastAt === null ? 0 : state.lastAt / 1000);
	state.chunkRuntime.registry.records.set(
		chunkId,
		applyWorldChunkMutation(record, MEADOW_MUTATION_KEY, disturbMeadowState(meadow, amount))
	);
	return true;
}

function enqueueGpuUpload(state, job = {}) {
	const queue = state.chunkRuntime.registry.queue;
	if (!job.id || typeof job.apply !== 'function') return false;
	const wrappedApply = (metadata) => {
		if (state.uploadsRemainingThisFrame <= 0) {
			state.stats.uploadsDeferred += 1;
			queue.enqueue({
				apply: wrappedApply,
				cost: job.cost,
				id: job.id,
				metadata: { ...(job.metadata || {}), gpuUpload: true },
				priority: job.priority
			});
			return { deferred: 'gpu-upload-budget' };
		}
		state.uploadsRemainingThisFrame -= 1;
		return job.apply(metadata);
	};
	return queue.enqueue({
		apply: wrappedApply,
		cost: job.cost,
		id: job.id,
		metadata: { ...(job.metadata || {}), gpuUpload: true },
		priority: job.priority
	});
}

function diagnostics(state) {
	return Object.freeze({ ...state.stats });
}

function chunkCenter(record) {
	if (record?.center) return { ...record.center };
	const minimum = record?.bounds?.min || { x: 0, y: 0, z: 0 };
	const maximum = record?.bounds?.max || { x: 0, y: 0, z: 0 };
	return {
		x: (minimum.x + maximum.x) / 2,
		y: (minimum.y + maximum.y) / 2,
		z: (minimum.z + maximum.z) / 2
	};
}
