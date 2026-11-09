// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBudgetedGenerationLoop.js
 * @description The Chapter 4 budgeted generation-and-simulation loop for Mitzvah World.
 * One assembly around the existing chunk runtime that enforces every fixed budget:
 *
 *  1. Before control, ONLY the deterministic spawn chunk is generated (see
 *     MitzvahWorldSpawnChunkGate). Neighbor requests are refused, not queued.
 *     The spawn chunk is the one synchronous generation the task permits: it is
 *     the ground the player stands on, generated once before the first frame.
 *  2. After control, neighbors are prioritized by distance AND movement
 *     direction (ahead first, behind last) and drained in that order.
 *  3. CPU generation runs under an explicit ~2 ms per-frame budget
 *     (MitzvahWorldGenerationBudget). A whole chunk costs far more than 2 ms,
 *     so neighbor generation is ROW-SLICED: the loop samples a few height rows
 *     per frame, checks the budget after each row, and yields mid-chunk when
 *     the budget is spent, resuming next frame — never a synchronous bulk
 *     generation. GPU uploads go through the coordinator's gate: exactly one
 *     bounded upload per frame.
 *  4. A direction reversal cancels abandoned generation jobs (chunks the player
 *     is now moving away from) instead of completing them; the coordinator
 *     cancels the matching registry lifecycle jobs the same way. A partially
 *     generated job returns its pooled buffer on cancellation.
 *  5. Per-chunk simulation state stays minimal (seed, moisture, wind phase,
 *     grass disturbance, last-update timestamp — MeadowChunkSimulation) and the
 *     ONE shared wind state lives on `loop.windState` (MitzvahWorldWindState):
 *     seed plus wind phase, readable by the Task 4 grass system. A chunk's
 *     meadow record is durable across unload, so revisiting coordinates
 *     regenerates identical terrain and restores the environmental change
 *     (e.g. trampled grass), caught up analytically to now.
 *  6. Nearby simulation advances at 5 Hz with analytical catch-up for
 *     unloaded chunks (coordinator + MeadowChunkSimulation) — no tick replay.
 *  7. Chunk containers, typed buffers, shared materials, and vegetation
 *     batches all come from one ChunkContainerPool and return to it on unload.
 *
 * The loop does NOT own the final build, the release gate, or the live boot
 * wiring: call `update(frame)` from the runtime frame step once the loop is
 * assembled around the real chunk runtime, and call `grantControl()` when the
 * player first takes control.
 */

import { createChunkContainerPool } from './ChunkContainerPool.js';
import {
	MEADOW_MUTATION_KEY,
	catchUpMeadowState,
	createMeadowState,
	meadowGrassCover
} from './MeadowChunkSimulation.js';
import { createMitzvahWorldGenerationBudget } from './MitzvahWorldGenerationBudget.js';
import {
	MITZVAH_WORLD_SPAWN_CHUNK_SIZE,
	MITZVAH_WORLD_SPAWN_GRID_CELLS,
	createMitzvahWorldSpawnChunkGate,
	generateMitzvahWorldChunk,
	generateMitzvahWorldChunkRows,
	mitzvahWorldChunkBounds,
	mitzvahWorldChunkSeed
} from './MitzvahWorldSpawnChunkGate.js';
import {
	advanceMitzvahWorldWindState,
	createMitzvahWorldWindState
} from './MitzvahWorldWindState.js';
import { createWorldChunkId } from './WorldChunkId.js';
import { applyWorldChunkMutation, createWorldChunkRecord, worldChunkMutation } from './WorldChunkRecord.js';
import { WORLD_CHUNK_STATES as S } from './WorldChunkState.js';
import { scoreWorldChunkPriority } from './WorldChunkPriority.js';
import { createWorldChunkStreamingCoordinator } from './WorldChunkStreamingCoordinator.js';
import {
	clampUnit,
	dot,
	magnitude,
	normalize,
	subtract
} from './WorldChunkMath.js';

const BEHIND_SIGNAL_CUTOFF = 0.25;
const SPAWN_ACTIVATION_PATH = Object.freeze([
	S.METADATA_LOADED,
	S.COARSE_GENERATED,
	S.VISUAL_READY,
	S.SAFETY_VALIDATED,
	S.ACTIVE
]);
const CACHE_PATH = Object.freeze({
	[S.ACTIVE]: [S.DORMANT, S.UNLOADING, S.CACHED],
	[S.CACHED]: [],
	[S.COLLISION_PREPARED]: [S.DORMANT, S.UNLOADING, S.CACHED],
	[S.COARSE_GENERATED]: [S.CACHED],
	[S.DORMANT]: [S.UNLOADING, S.CACHED],
	[S.FAILED]: [S.CACHED],
	[S.METADATA_LOADED]: [S.CACHED],
	[S.SAFETY_VALIDATED]: [S.DORMANT, S.UNLOADING, S.CACHED],
	[S.UNKNOWN]: [S.METADATA_LOADED, S.CACHED],
	[S.UNLOADING]: [S.CACHED],
	[S.VISUAL_READY]: [S.DORMANT, S.UNLOADING, S.CACHED]
});
/** One shared terrain material for every chunk: shared by key, never per-load. */
const TERRAIN_MATERIAL_KEY = 'mitzvah-world:terrain';

/** Creates one budgeted generation-and-simulation loop around a chunk runtime. */
export function createMitzvahWorldBudgetedGenerationLoop({
	chunkRuntime,
	worldSeed = 0,
	spawnChunkX = 0,
	spawnChunkZ = 0,
	chunkSize = MITZVAH_WORLD_SPAWN_CHUNK_SIZE,
	gridCells = MITZVAH_WORLD_SPAWN_GRID_CELLS,
	pool = createChunkContainerPool(),
	budget = null,
	windState = createMitzvahWorldWindState(worldSeed, 0),
	generateChunk = generateMitzvahWorldChunk,
	generateChunkRows = generateMitzvahWorldChunkRows,
	clock = defaultClock
} = {}) {
	if (!chunkRuntime?.registry?.queue) {
		throw new TypeError('A chunk runtime with a registry queue is required.');
	}
	// One clock for all slice measurement: the budget owns it when supplied,
	// otherwise the caller's clock feeds both the budget and the slices.
	const generationBudget = budget
		|| createMitzvahWorldGenerationBudget({ clock });
	const sliceClock = budget ? () => generationBudget.now() : clock;
	const gate = createMitzvahWorldSpawnChunkGate({
		chunkSize,
		generateChunk,
		gridCells,
		pool,
		spawnChunkX,
		spawnChunkZ,
		worldSeed
	});
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	const state = {
		budget: generationBudget,
		chunkRuntime,
		clock: sliceClock,
		controlGranted: false,
		coordinator,
		gate,
		generateChunkRows,
		generatedChunks: new Map(),
		gridCells,
		chunkSize,
		lastAt: null,
		pendingGeneration: new Map(),
		pool,
		retainedMeadow: new Map(),
		spawnReady: false,
		stats: {
			generationCancelledOnReversal: 0,
			generationCompleted: 0,
			generationRows: 0,
			generationYieldedFrames: 0,
			neighborsRefused: 0,
			neighborsRequested: 0,
			spawnGenerationMilliseconds: 0,
			unloads: 0,
			uploadsEnqueued: 0
		},
		windState,
		worldSeed: worldSeed >>> 0
	};
	return {
		/** The shared wind state (seed + wind phase) — Task 4 grass reads this. */
		get windState() {
			return state.windState;
		},
		/** The spawn gate (spawn-only-before-control policy). */
		spawnGate: gate,
		/** The chunk-container / buffer / material / vegetation pool. */
		pool,
		/** The per-frame CPU generation budget. */
		budget: generationBudget,
		/** The streaming coordinator (prioritization, cancellation, upload gate, 5 Hz sim). */
		coordinator,
		/** Generates and activates the deterministic spawn chunk (idempotent). */
		generateSpawnChunk: (timeSeconds) => generateSpawnChunk(state, timeSeconds),
		/** Grants player control; neighbor generation may start after this. */
		grantControl: () => grantControl(state),
		/** Requests one neighbor chunk for generation (refused before control). */
		requestNeighbor: (chunkX, chunkZ, options) => requestNeighbor(state, chunkX, chunkZ, options),
		/** Applies a bounded grass-disturbance impulse to one chunk. */
		disturbChunk: (chunkId, amount) => coordinator.disturbChunk(chunkId, amount),
		/** Runs one budgeted frame: spawn, prioritization, cancellation, sim, generation drain. */
		update: (frame) => update(state, frame),
		/** Unloads one neighbor chunk and returns every pooled vessel. */
		unloadNeighbor: (chunkId) => unloadNeighbor(state, chunkId),
		/**
		 * Unloads generated and pending neighbor chunks farther than `radius`
		 * chunks (Chebyshev) from the player's current chunk, returning every
		 * pooled vessel. Bounds the live window so heap and render-object
		 * counts stabilize after travelling away and returning.
		 */
		pruneFarNeighbors: (playerChunkX, playerChunkZ, radius = 2) => pruneFarNeighbors(state, playerChunkX, playerChunkZ, radius),
		/** Returns the pooled generation record for a generated chunk, or null. */
		generatedChunk: (chunkId) => {
			const generated = state.generatedChunks.get(chunkId);
			return generated ? Object.freeze({ ...generated }) : null;
		},
		/** Immutable loop diagnostics. */
		diagnostics: () => diagnostics(state)
	};
}

function generateSpawnChunk(state, timeSeconds = 0) {
	if (state.spawnReady) return state.gate.generateSpawnChunk(timeSeconds);
	const generated = state.gate.generateSpawnChunk(timeSeconds);
	registerRecord(state, generated.record);
	for (const next of SPAWN_ACTIVATION_PATH) {
		state.chunkRuntime.registry.applyTransition(generated.id, next, {
			reason: 'mitzvah-world-spawn-chunk'
		});
	}
	state.spawnReady = true;
	return generated;
}

function grantControl(state) {
	const granted = state.gate.grantControl();
	state.controlGranted = true;
	return granted;
}

function requestNeighbor(state, chunkX, chunkZ, { priority = 0 } = {}) {
	const id = createWorldChunkId({
		level: 0,
		namespace: 'mitzvah-world',
		x: chunkX,
		y: 0,
		z: chunkZ
	});
	state.stats.neighborsRequested += 1;
	const answer = state.gate.requestNeighbor(id);
	if (!answer.accepted) {
		state.stats.neighborsRefused += 1;
		return answer;
	}
	if (state.pendingGeneration.has(id) || state.generatedChunks.has(id)) {
		return Object.freeze({ accepted: true, chunkId: id, reason: 'already-known' });
	}
	const seed = mitzvahWorldChunkSeed(state.worldSeed, id);
	const nowSeconds = state.lastAt === null ? 0 : state.lastAt / 1000;
	const retained = state.retainedMeadow.get(id);
	const meadow = retained
		? catchUpMeadowState(retained, seed, nowSeconds)
		: createMeadowState(seed, nowSeconds);
	const record = createWorldChunkRecord({
		bounds: mitzvahWorldChunkBounds(chunkX, chunkZ, state.chunkSize),
		collisionRequired: false,
		deterministicSeed: seed,
		durableMutations: {
			[MEADOW_MUTATION_KEY]: meadow
		},
		id,
		readiness: {
			collisionPrepared: true,
			safetyValidated: true,
			visualReady: true
		}
	});
	registerRecord(state, record);
	state.chunkRuntime.registry.queueTransition({
		id,
		priority,
		toState: S.METADATA_LOADED
	});
	state.pendingGeneration.set(id, {
		chunkId: id,
		chunkX,
		chunkZ,
		heights: null,
		meadow: null,
		priority,
		rowsDone: 0,
		rowsTotal: state.gridCells + 1,
		seed
	});
	return Object.freeze({ accepted: true, chunkId: id, reason: 'control-granted' });
}

function update(state, frame = {}) {
	const { chunkRuntime } = state;
	const at = Number.isFinite(frame.at) ? frame.at : Date.now();
	const nowSeconds = at / 1000;
	const playerPosition = frame.playerPosition || { x: 0, y: 0, z: 0 };
	const playerVelocity = frame.playerVelocity || null;
	const cameraDirection = frame.cameraDirection || null;
	state.budget.beginFrame();
	const evidence = {
		cancelledGenerationOnReversal: 0,
		generationCompleted: 0,
		generationRows: 0,
		generationYielded: false,
		pendingGeneration: state.pendingGeneration.size,
		reversalDetected: false
	};
	// Ground first: the spawn chunk is the only generation allowed before control.
	// It is synchronous and one-time; its cost is measured, not hidden.
	if (!state.spawnReady) {
		const sliceStart = state.clock();
		generateSpawnChunk(state, nowSeconds);
		state.stats.spawnGenerationMilliseconds = state.clock() - sliceStart;
		state.budget.spend(state.stats.spawnGenerationMilliseconds);
	}
	// The shared wind state advances every frame for the Task 4 grass system.
	const deltaSeconds = state.lastAt === null
		? 0
		: Math.max(0, (at - state.lastAt) / 1000);
	state.lastAt = at;
	state.windState = advanceMitzvahWorldWindState(state.windState, deltaSeconds);
	// Coordinator: re-score by distance and direction, cancel reversed registry
	// jobs, run the 5 Hz sim with catch-up, allow one bounded GPU upload, then
	// run the runtime update under its own two-millisecond visual cap.
	const receipt = state.coordinator.update({
		at,
		cameraDirection,
		frameTimeMilliseconds: frame.frameTimeMilliseconds,
		playerPosition,
		playerVelocity
	});
	evidence.reversalDetected = receipt.streaming.reversalDetected;
	if (evidence.reversalDetected) {
		evidence.cancelledGenerationOnReversal = cancelBehindGenerationJobs(
			state,
			playerPosition,
			playerVelocity
		);
		state.stats.generationCancelledOnReversal += evidence.cancelledGenerationOnReversal;
	}
	// Neighbor generation drains only after control, in priority order, one row
	// at a time inside the per-frame CPU budget. When the budget is spent the
	// loop yields mid-chunk and resumes next frame — never bulk generation.
	if (state.controlGranted && state.pendingGeneration.size > 0) {
		const focus = {
			cameraDirection: cameraDirection || { x: 0, y: 0, z: 0 },
			position: playerPosition,
			velocity: playerVelocity || { x: 0, y: 0, z: 0 }
		};
		const ordered = [...state.pendingGeneration.values()]
			.sort((left, right) => {
				const leftRecord = chunkRuntime.registry.get(left.chunkId);
				const rightRecord = chunkRuntime.registry.get(right.chunkId);
				return scoreWorldChunkPriority(rightRecord, focus)
					- scoreWorldChunkPriority(leftRecord, focus);
			});
		for (const job of ordered) {
			if (!state.pendingGeneration.has(job.chunkId)) continue;
			const outcome = advanceNeighborGeneration(state, job, nowSeconds, evidence);
			if (outcome === 'completed') {
				evidence.generationCompleted += 1;
				state.stats.generationCompleted += 1;
				continue;
			}
			if (outcome === 'yielded') {
				evidence.generationYielded = true;
				break;
			}
		}
	}
	if (evidence.generationYielded) state.stats.generationYieldedFrames += 1;
	evidence.pendingGeneration = state.pendingGeneration.size;
	return Object.freeze({
		...receipt,
		controlGranted: state.controlGranted,
		generation: Object.freeze(evidence),
		spawnReady: state.spawnReady,
		windPhase: state.windState.windPhase
	});
}

/**
 * Advances one neighbor generation job by budget-checked rows. Returns
 * 'completed' when the chunk is fully generated (upload enqueued),
 * 'yielded' when the frame budget is spent mid-chunk, or 'pending' when the
 * job left the queue another way.
 */
function advanceNeighborGeneration(state, job, nowSeconds, evidence) {
	if (!state.pendingGeneration.has(job.chunkId)) return 'pending';
	if (job.heights === null) {
		const samplesPerSide = state.gridCells + 1;
		job.heights = state.pool.acquireFloat32(samplesPerSide * samplesPerSide);
		// A revisited chunk keeps its environmental change: the retained meadow
		// (disturbance included) is caught up analytically to now, while the
		// terrain regenerates identically from seed + coordinates.
		const retained = state.retainedMeadow.get(job.chunkId);
		job.meadow = retained
			? catchUpMeadowState(retained, job.seed, nowSeconds)
			: null;
		if (retained) state.retainedMeadow.delete(job.chunkId);
	}
	while (job.rowsDone < job.rowsTotal) {
		if (!state.budget.hasTimeLeft()) return 'yielded';
		const sliceStart = state.clock();
		const written = state.generateChunkRows({
			chunkSize: state.chunkSize,
			chunkX: job.chunkX,
			chunkZ: job.chunkZ,
			gridCells: state.gridCells,
			heights: job.heights,
			rowCount: 1,
			rowStart: job.rowsDone
		});
		job.rowsDone += written;
		evidence.generationRows += written;
		state.stats.generationRows += written;
		if (!state.budget.spend(state.clock() - sliceStart)) return 'yielded';
		if (written === 0) break;
	}
	if (job.rowsDone < job.rowsTotal) return 'yielded';
	const record = state.chunkRuntime.registry.get(job.chunkId);
	// Retained revisit state first, then the record's own meadow (it may carry
	// a disturbance applied while the chunk was pending), then a fresh record.
	const existing = record ? worldChunkMutation(record, MEADOW_MUTATION_KEY) : null;
	const meadow = job.meadow || existing || createMeadowState(job.seed, nowSeconds);
	if (record) {
		state.chunkRuntime.registry.records.set(
			job.chunkId,
			applyWorldChunkMutation(record, MEADOW_MUTATION_KEY, meadow)
		);
	}
	const material = state.pool.acquireMaterial(
		TERRAIN_MATERIAL_KEY,
		() => ({ key: TERRAIN_MATERIAL_KEY, roughness: 0.9 })
	);
	const vegetation = state.pool.acquireVegetationBatch(
		Math.round(32 + 96 * meadowGrassCover(meadow))
	);
	state.generatedChunks.set(job.chunkId, {
		chunkX: job.chunkX,
		chunkZ: job.chunkZ,
		heights: job.heights,
		material,
		materialKey: TERRAIN_MATERIAL_KEY,
		vegetation
	});
	state.pendingGeneration.delete(job.chunkId);
	state.coordinator.enqueueGpuUpload({
		apply: () => ({ uploaded: job.chunkId }),
		id: `gpu-upload:${job.chunkId}`,
		metadata: { chunkId: job.chunkId },
		priority: job.priority
	});
	state.stats.uploadsEnqueued += 1;
	return 'completed';
}

/** Cancels pending generation jobs for chunks now behind the player. */
function cancelBehindGenerationJobs(state, playerPosition, velocity) {
	if (!velocity || magnitude(velocity) === 0) return 0;
	const heading = normalize({ ...velocity });
	let cancelled = 0;
	for (const job of [...state.pendingGeneration.values()]) {
		const record = state.chunkRuntime.registry.get(job.chunkId);
		if (!record) continue;
		const toChunk = subtract(chunkCenter(record), playerPosition);
		const signal = clampUnit((dot(heading, normalize(toChunk)) + 1) / 2);
		if (signal < BEHIND_SIGNAL_CUTOFF) {
			if (job.heights !== null) state.pool.releaseFloat32(job.heights);
			state.pendingGeneration.delete(job.chunkId);
			cancelled += 1;
		}
	}
	return cancelled;
}

function registerRecord(state, record) {
	if (!state.chunkRuntime.registry.has(record.id)) {
		state.chunkRuntime.registry.register({ ...record });
	}
}

function unloadNeighbor(state, chunkId) {
	if (chunkId === state.gate.spawnChunkId) return false;
	const generated = state.generatedChunks.get(chunkId);
	const pending = state.pendingGeneration.get(chunkId);
	if (pending?.heights) {
		state.pool.releaseFloat32(pending.heights);
	}
	state.pendingGeneration.delete(chunkId);
	if (generated) {
		state.pool.releaseFloat32(generated.heights);
		state.pool.releaseVegetationBatch(generated.vegetation);
		state.pool.releaseMaterial(generated.materialKey);
		state.generatedChunks.delete(chunkId);
	}
	// A pending GPU upload for an unloaded chunk must not execute later.
	state.chunkRuntime.registry.queue.cancel(`gpu-upload:${chunkId}`);
	const record = state.chunkRuntime.registry.get(chunkId);
	if (!record) return generated !== undefined || pending !== undefined;
	// The five-field meadow record is durable, not render state: it survives
	// unload so a revisit restores the environmental change (e.g. trampled
	// grass) while the terrain regenerates identically underneath it.
	const retainedMeadow = worldChunkMutation(record, MEADOW_MUTATION_KEY);
	if (retainedMeadow) state.retainedMeadow.set(chunkId, retainedMeadow);
	const path = CACHE_PATH[record.state];
	if (!path) return false;
	for (const next of path) {
		state.chunkRuntime.registry.applyTransition(chunkId, next, {
			reason: 'mitzvah-world-neighbor-unload'
		});
	}
	state.chunkRuntime.registry.removeCached(chunkId);
	state.stats.unloads += 1;
	return true;
}

/**
 * Unloads generated and pending neighbor chunks beyond `radius` chunks
 * (Chebyshev distance) from the player's current chunk. The spawn chunk is
 * never pruned. Returns how many chunks were unloaded.
 */
function pruneFarNeighbors(state, playerChunkX, playerChunkZ, radius = 2) {
	if (!Number.isFinite(playerChunkX) || !Number.isFinite(playerChunkZ)) return 0;
	const limit = Math.max(0, Math.floor(radius));
	let pruned = 0;
	const beyond = (chunkX, chunkZ) => Math.max(
		Math.abs(chunkX - playerChunkX),
		Math.abs(chunkZ - playerChunkZ)
	) > limit;
	for (const [id, generated] of [...state.generatedChunks.entries()]) {
		if (beyond(generated.chunkX, generated.chunkZ)) {
			if (unloadNeighbor(state, id)) pruned += 1;
		}
	}
	for (const job of [...state.pendingGeneration.values()]) {
		if (beyond(job.chunkX, job.chunkZ)) {
			if (unloadNeighbor(state, job.chunkId)) pruned += 1;
		}
	}
	return pruned;
}

function diagnostics(state) {
	return Object.freeze({
		controlGranted: state.controlGranted,
		coordinator: state.coordinator.diagnostics(),
		generatedChunks: state.generatedChunks.size,
		generationBudget: state.budget.diagnostics(),
		pendingGeneration: state.pendingGeneration.size,
		pool: state.pool.diagnostics(),
		registryRecords: state.chunkRuntime.registry.size,
		registryQueue: state.chunkRuntime.registry.queue.size,
		retainedMeadowChunks: state.retainedMeadow.size,
		spawnChunkId: state.gate.spawnChunkId,
		spawnReady: state.spawnReady,
		stats: Object.freeze({ ...state.stats }),
		windPhase: state.windState.windPhase,
		windSeed: state.windState.seed,
		worldSeed: state.worldSeed
	});
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

function defaultClock() {
	return typeof performance !== 'undefined' && typeof performance.now === 'function'
		? performance.now()
		: Date.now();
}
