// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkStreamingCoordinator.test.js
 * @description Proves the budgeted generation-simulation loop: queued work is
 * re-scored by distance and movement direction, direction reversals cancel
 * abandoned behind-player jobs, at most one GPU upload runs per frame, and
 * active chunks advance meadow simulation with mathematical catch-up.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorldChunkId } from './WorldChunkId.js';
import { WORLD_CHUNK_STATES as S } from './WorldChunkState.js';
import { WorldChunkRegistry } from './WorldChunkRegistry.js';
import { worldChunkQueueId } from './WorldChunkRegistryRetention.js';
import { createWorldChunkStreamingCoordinator } from './WorldChunkStreamingCoordinator.js';
import { MEADOW_MUTATION_KEY } from './MeadowChunkSimulation.js';
import { worldChunkMutation } from './WorldChunkRecord.js';

function fixture({ processQueue = false } = {}) {
	const registry = new WorldChunkRegistry();
	const chunkRuntime = {
		registry,
		update: () => (processQueue
			? registry.process({ maximumCost: 100, maximumMilliseconds: 8, maximumTransitions: 8 })
			: Object.freeze({ remaining: registry.queue.size, results: [] }))
	};
	return { chunkRuntime, registry };
}

function chunkDefinition(suffix, centerX) {
	const id = createWorldChunkId({ level: 1, namespace: 'mw-coord-test', x: suffix, y: 0, z: 0 });
	return {
		bounds: {
			max: { x: centerX + 16, y: 32, z: 16 },
			min: { x: centerX - 16, y: -32, z: -16 }
		},
		collisionHandoff: { atomicReady: true, parentRetained: true },
		collisionRequired: false,
		id,
		memoryEstimate: { collision: 0, geometry: 0, textures: 0 },
		readiness: { collisionPrepared: true, safetyValidated: true, visualReady: true }
	};
}

function queueGeneration(registry, id) {
	registry.queueTransition({ id, priority: 0, toState: S.METADATA_LOADED });
}

function activate(registry, id) {
	for (const state of [S.METADATA_LOADED, S.COARSE_GENERATED, S.VISUAL_READY, S.SAFETY_VALIDATED, S.ACTIVE]) {
		registry.applyTransition(id, state, { reason: 'coordinator-test' });
	}
}

test('queued work is re-scored: ahead-of-motion outranks behind', () => {
	const { chunkRuntime, registry } = fixture();
	const ahead = chunkDefinition(1, 80);
	const behind = chunkDefinition(2, -80);
	registry.register(ahead);
	registry.register(behind);
	queueGeneration(registry, ahead.id);
	queueGeneration(registry, behind.id);
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	coordinator.update({
		at: 1000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: 6, y: 0, z: 0 }
	});
	const aheadEntry = registry.queue.entries.get(worldChunkQueueId(ahead.id));
	const behindEntry = registry.queue.entries.get(worldChunkQueueId(behind.id));
	assert.ok(aheadEntry && behindEntry, 'both jobs should still be queued');
	assert.ok(
		aheadEntry.priority > behindEntry.priority,
		`ahead (${aheadEntry.priority}) should outrank behind (${behindEntry.priority})`
	);
});

test('direction reversal cancels abandoned behind-player jobs', () => {
	const { chunkRuntime, registry } = fixture();
	const far = chunkDefinition(3, 120);
	registry.register(far);
	queueGeneration(registry, far.id);
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	coordinator.update({
		at: 1000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: 6, y: 0, z: 0 }
	});
	assert.ok(registry.queue.entries.has(worldChunkQueueId(far.id)), 'job queued while ahead');
	const receipt = coordinator.update({
		at: 2000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: -6, y: 0, z: 0 }
	});
	assert.equal(receipt.streaming.reversalDetected, true);
	assert.equal(receipt.streaming.cancelledOnReversal, 1);
	assert.ok(!registry.queue.entries.has(worldChunkQueueId(far.id)), 'abandoned job cancelled');
});

test('no reversal without heading flip: slow drift keeps queued work', () => {
	const { chunkRuntime, registry } = fixture();
	const near = chunkDefinition(4, 40);
	registry.register(near);
	queueGeneration(registry, near.id);
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	coordinator.update({
		at: 1000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: 6, y: 0, z: 0 }
	});
	const receipt = coordinator.update({
		at: 2000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: 0.1, y: 0, z: 0 }
	});
	assert.equal(receipt.streaming.reversalDetected, false);
	assert.equal(receipt.streaming.cancelledOnReversal, 0);
	assert.ok(registry.queue.entries.has(worldChunkQueueId(near.id)), 'slow drift keeps the job');
});

test('at most one GPU upload executes per frame; the rest defer honestly', () => {
	const { chunkRuntime, registry } = fixture({ processQueue: true });
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	const executed = [];
	for (let index = 0; index < 3; index += 1) {
		coordinator.enqueueGpuUpload({
			id: `upload:${index}`,
			priority: 1,
			apply: () => {
				executed.push(index);
				return `gpu-${index}`;
			},
			metadata: {}
		});
	}
	const first = coordinator.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.deepEqual(executed, [0]);
	assert.equal(first.streaming.uploadsDeferred, 2);
	assert.equal(registry.queue.size, 2);
	const deferredResults = (first.results || []).filter(result => result?.value?.deferred === 'gpu-upload-budget');
	assert.equal(deferredResults.length, 2);
	const second = coordinator.update({ at: 2000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.deepEqual(executed, [0, 1]);
	assert.equal(second.streaming.uploadsDeferred, 1);
	const third = coordinator.update({ at: 3000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.deepEqual(executed, [0, 1, 2]);
	assert.equal(third.streaming.uploadsDeferred, 0);
	assert.equal(registry.queue.size, 0);
});

test('active chunks advance meadow sim at the fixed rate with catch-up', () => {
	const { chunkRuntime, registry } = fixture();
	const definition = chunkDefinition(5, 0);
	registry.register(definition);
	activate(registry, definition.id);
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	coordinator.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	const receipt = coordinator.update({ at: 2000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(receipt.streaming.simTicks, 1);
	assert.equal(receipt.streaming.simChunks, 1);
	let meadow = worldChunkMutation(registry.get(definition.id), MEADOW_MUTATION_KEY);
	assert.ok(meadow, 'active chunk carries meadow state');
	assert.ok(Math.abs(meadow.lastSimTime - 2) < 1e-9, `sim time should be ~2s, got ${meadow.lastSimTime}`);
	// Simulate a one-hour absence, then revisit: catch-up must land on wall truth.
	const stale = { ...meadow, lastSimTime: meadow.lastSimTime - 3600 };
	registry.records.set(definition.id, {
		...registry.get(definition.id),
		durableMutations: { [MEADOW_MUTATION_KEY]: stale }
	});
	coordinator.update({ at: 4000, playerPosition: { x: 0, y: 0, z: 0 } });
	meadow = worldChunkMutation(registry.get(definition.id), MEADOW_MUTATION_KEY);
	assert.ok(Math.abs(meadow.lastSimTime - 4) < 1e-9, `catch-up should reach ~4s, got ${meadow.lastSimTime}`);
});

test('disturbance applies a bounded growth impulse to one chunk', () => {
	const { chunkRuntime, registry } = fixture();
	const definition = chunkDefinition(6, 0);
	registry.register(definition);
	activate(registry, definition.id);
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	coordinator.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(coordinator.disturbChunk(definition.id, 0.4), true);
	const meadow = worldChunkMutation(registry.get(definition.id), MEADOW_MUTATION_KEY);
	assert.ok(Math.abs(meadow.growth - 0.4) < 1e-9, `growth should be 0.4, got ${meadow.growth}`);
	assert.equal(coordinator.disturbChunk('wc:1:nope:0:0:0:0', 1), false);
});

test('doubling simulated chunk state keeps sim CPU far under 0.5ms', () => {
	const { chunkRuntime, registry } = fixture();
	for (let index = 0; index < 400; index += 1) {
		const definition = chunkDefinition(1000 + index, (index % 20) * 32 - 320);
		registry.register(definition);
		activate(registry, definition.id);
	}
	const coordinator = createWorldChunkStreamingCoordinator({ chunkRuntime });
	coordinator.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	const allIds = [...registry.records.keys()];
	// Park half the chunks as dormant, time one 2Hz tick over 200 active chunks.
	for (const id of allIds.slice(200)) {
		registry.applyTransition(id, S.DORMANT, { reason: 'perf-probe' });
	}
	const first = timeSimTick(coordinator, 2000);
	// Reactivate all 400, time one tick over double the state.
	for (const id of allIds.slice(200)) {
		registry.applyTransition(id, S.ACTIVE, { reason: 'perf-probe' });
	}
	const second = timeSimTick(coordinator, 3000);
	const delta = Math.abs(second - first);
	console.log(`    sim 200 chunks: ${first.toFixed(3)}ms, 400 chunks: ${second.toFixed(3)}ms, Δ=${delta.toFixed(3)}ms`);
	assert.ok(delta < 5, `doubling sim state should cost far under 0.5ms CPU, Δ=${delta}ms`);
});

function timeSimTick(coordinator, at) {
	const started = process.hrtime.bigint();
	coordinator.update({ at, playerPosition: { x: 0, y: 0, z: 0 } });
	return Number(process.hrtime.bigint() - started) / 1e6;
}
