// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBudgetedGenerationLoop.test.js
 * @description Proves the Chapter 4 budgeted generation-and-simulation loop end to
 * end: spawn-only generation before control, direction-aware neighbor priority,
 * the two-millisecond CPU budget yielding, one bounded GPU upload per frame,
 * reversal cancellation, five-hertz simulation with mathematical catch-up,
 * identical terrain with preserved disturbance on revisit, ahead-chunk readiness
 * while sprinting, the shared wind state, and pool counts returning to baseline.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorldChunkId } from './WorldChunkId.js';
import { WORLD_CHUNK_STATES as S } from './WorldChunkState.js';
import { WorldChunkRegistry } from './WorldChunkRegistry.js';
import { worldChunkMutation } from './WorldChunkRecord.js';
import { MEADOW_MUTATION_KEY } from './MeadowChunkSimulation.js';
import { createMitzvahWorldBudgetedGenerationLoop } from './MitzvahWorldBudgetedGenerationLoop.js';
import { createMitzvahWorldGenerationBudget } from './MitzvahWorldGenerationBudget.js';
import { generateMitzvahWorldChunk, generateMitzvahWorldChunkRows } from './MitzvahWorldSpawnChunkGate.js';
import { mitzvahWorldWindPhaseAt } from './MitzvahWorldWindState.js';

const WORLD_SEED = 0x12345678;
const SPAWN_ID = createWorldChunkId({ level: 0, namespace: 'mitzvah-world', x: 0, y: 0, z: 0 });

function neighborId(chunkX, chunkZ) {
	return createWorldChunkId({ level: 0, namespace: 'mitzvah-world', x: chunkX, y: 0, z: chunkZ });
}

function fixture({ processQueue = true, budget = null, generateChunk = null, generateChunkRows = null } = {}) {
	const registry = new WorldChunkRegistry();
	const chunkRuntime = {
		registry,
		update: () => (processQueue
			? registry.process({ maximumCost: 100, maximumMilliseconds: 8, maximumTransitions: 8 })
			: Object.freeze({ remaining: registry.queue.size, results: [] }))
	};
	const loop = createMitzvahWorldBudgetedGenerationLoop({
		budget: budget || createMitzvahWorldGenerationBudget({ cpuMilliseconds: 1000 }),
		chunkRuntime,
		generateChunk: generateChunk || generateMitzvahWorldChunk,
		generateChunkRows: generateChunkRows || generateMitzvahWorldChunkRows,
		worldSeed: WORLD_SEED
	});
	return { chunkRuntime, loop, registry };
}

function activate(registry, id) {
	const path = [S.UNKNOWN, S.METADATA_LOADED, S.COARSE_GENERATED, S.VISUAL_READY, S.SAFETY_VALIDATED, S.ACTIVE];
	const current = registry.get(id)?.state;
	const start = Math.max(0, path.indexOf(current));
	for (const state of path.slice(start + 1)) {
		registry.applyTransition(id, state, { reason: 'loop-test' });
	}
}

function meadowOf(registry, id) {
	return worldChunkMutation(registry.get(id), MEADOW_MUTATION_KEY);
}

test('only the spawn chunk generates before control; neighbors are refused', () => {
	const { loop, registry } = fixture();
	const refused = loop.requestNeighbor(1, 0);
	assert.equal(refused.accepted, false);
	assert.equal(refused.reason, 'control-not-granted');
	const first = loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(first.spawnReady, true);
	assert.equal(first.controlGranted, false);
	assert.equal(registry.size, 1);
	assert.equal(registry.get(SPAWN_ID).state, S.ACTIVE);
	const second = loop.update({ at: 2000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(registry.size, 1);
	assert.equal(second.generation.pendingGeneration, 0);
	assert.equal(loop.diagnostics().spawnReady, true);
});

test('granting control opens neighbor generation', () => {
	const { loop, registry } = fixture();
	assert.equal(loop.grantControl(), true);
	const accepted = loop.requestNeighbor(1, 0);
	assert.equal(accepted.accepted, true);
	assert.equal(accepted.chunkId, neighborId(1, 0));
	loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(loop.diagnostics().generatedChunks, 1);
	assert.equal(loop.diagnostics().pendingGeneration, 0);
	assert.ok(registry.get(neighborId(1, 0)), 'neighbor record registered');
});

test('neighbors drain ahead-first by distance and movement direction', () => {
	const order = [];
	const generateChunkRows = (args) => {
		if (args.rowStart === 0) order.push(`${args.chunkX},${args.chunkZ}`);
		return generateMitzvahWorldChunkRows(args);
	};
	const { loop } = fixture({ generateChunkRows });
	loop.grantControl();
	loop.requestNeighbor(-1, 0);
	loop.requestNeighbor(0, 1);
	loop.requestNeighbor(1, 0);
	loop.update({
		at: 1000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: 6, y: 0, z: 0 }
	});
	assert.deepEqual(order, ['1,0', '0,1', '-1,0']);
	assert.equal(loop.diagnostics().generatedChunks, 3);
});

test('the two-millisecond budget yields mid-chunk and finishes on later frames', () => {
	const clock = fakeClock();
	const budget = createMitzvahWorldGenerationBudget({ clock: () => clock.now });
	const generateChunk = (args) => {
		clock.advance(0.5);
		return generateMitzvahWorldChunk(args);
	};
	const generateChunkRows = (args) => {
		clock.advance(0.5);
		return generateMitzvahWorldChunkRows(args);
	};
	const { loop } = fixture({ budget, generateChunk, generateChunkRows });
	loop.grantControl();
	loop.requestNeighbor(1, 0);
	loop.requestNeighbor(2, 0);
	loop.requestNeighbor(3, 0);
	// Frame 1: the spawn chunk takes 0.5 ms, leaving 3 rows of the first
	// neighbor (3 x 0.5 ms) before the 2 ms budget is spent mid-chunk.
	const first = loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(first.generation.generationCompleted, 0);
	assert.equal(first.generation.generationYielded, true);
	assert.equal(first.generation.pendingGeneration, 3);
	assert.equal(first.generation.generationRows, 3);
	let frames = 1;
	let completedAfterNine = 0;
	while (loop.diagnostics().pendingGeneration > 0 && frames < 40) {
		frames += 1;
		const receipt = loop.update({ at: 1000 + frames * 1000, playerPosition: { x: 0, y: 0, z: 0 } });
		if (frames === 9) completedAfterNine = receipt.generation.generationCompleted;
	}
	assert.equal(frames, 25, `3 chunks x 33 rows at ~4 rows/frame should take 25 frames, took ${frames}`);
	assert.equal(completedAfterNine, 1, 'first chunk should complete on frame 9');
	assert.equal(loop.diagnostics().generatedChunks, 3);
	assert.equal(loop.diagnostics().stats.generationRows, 99);
	assert.equal(loop.diagnostics().stats.generationYieldedFrames, 24);
});

test('exactly one bounded GPU upload executes per frame', () => {
	const { loop } = fixture();
	loop.grantControl();
	loop.requestNeighbor(1, 0);
	loop.requestNeighbor(2, 0);
	loop.requestNeighbor(3, 0);
	const first = loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(countUploaded(first), 0, 'uploads enqueue during the drain, after the runtime update');
	const second = loop.update({ at: 2000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(countUploaded(second), 1);
	assert.equal(countDeferred(second), 2);
	const third = loop.update({ at: 3000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(countUploaded(third), 1);
	assert.equal(countDeferred(third), 1);
	const fourth = loop.update({ at: 4000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(countUploaded(fourth), 1);
	assert.equal(countDeferred(fourth), 0);
	assert.equal(loop.diagnostics().registryQueue, 0);
});

test('a direction reversal cancels abandoned generation jobs', () => {
	const budget = createMitzvahWorldGenerationBudget({ cpuMilliseconds: 0 });
	const { loop, registry } = fixture({ budget, processQueue: false });
	loop.grantControl();
	loop.requestNeighbor(3, 0);
	loop.update({
		at: 1000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: 6, y: 0, z: 0 }
	});
	assert.equal(loop.diagnostics().pendingGeneration, 1);
	const receipt = loop.update({
		at: 2000,
		playerPosition: { x: 0, y: 0, z: 0 },
		playerVelocity: { x: -6, y: 0, z: 0 }
	});
	assert.equal(receipt.streaming.reversalDetected, true);
	assert.equal(receipt.streaming.cancelledOnReversal, 1);
	assert.equal(receipt.generation.cancelledGenerationOnReversal, 1);
	assert.equal(loop.diagnostics().pendingGeneration, 0);
	assert.ok(!registry.queue.entries.has(`world-chunk:${neighborId(3, 0)}`));
});

test('spawn simulation runs at 5 Hz with mathematical catch-up', () => {
	const { loop, registry } = fixture();
	loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	const receipt = loop.update({ at: 2000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.equal(receipt.streaming.simTicks, 1);
	assert.equal(receipt.streaming.simChunks, 1);
	let meadow = meadowOf(registry, SPAWN_ID);
	assert.ok(Math.abs(meadow.lastUpdateTime - 2) < 1e-9, `sim time should be ~2s, got ${meadow.lastUpdateTime}`);
	const stale = { ...meadow, lastUpdateTime: meadow.lastUpdateTime - 3600 };
	registry.records.set(SPAWN_ID, {
		...registry.get(SPAWN_ID),
		durableMutations: { [MEADOW_MUTATION_KEY]: stale }
	});
	loop.update({ at: 4000, playerPosition: { x: 0, y: 0, z: 0 } });
	meadow = meadowOf(registry, SPAWN_ID);
	assert.ok(Math.abs(meadow.lastUpdateTime - 4) < 1e-9, `catch-up should reach ~4s, got ${meadow.lastUpdateTime}`);
});

test('revisiting coordinates reproduces identical terrain and preserves disturbance', () => {
	const { loop, registry } = fixture();
	loop.grantControl();
	loop.requestNeighbor(1, 0);
	loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	const id = neighborId(1, 0);
	const generatedHeights = captureHeights(loop, id);
	assert.equal(loop.disturbChunk(id, 0.4), true);
	const disturbed = meadowOf(registry, id);
	assert.ok(Math.abs(disturbed.grassDisturbance - 0.4) < 1e-9);
	assert.equal(loop.unloadNeighbor(id), true);
	assert.equal(loop.diagnostics().retainedMeadowChunks, 1);
	assert.equal(loop.diagnostics().registryRecords, 1);
	loop.requestNeighbor(1, 0);
	loop.update({ at: 1200, playerPosition: { x: 0, y: 0, z: 0 } });
	const revisitedHeights = captureHeights(loop, id);
	assert.deepEqual(revisitedHeights, generatedHeights, 'terrain must reproduce exactly');
	const revisited = meadowOf(registry, id);
	// The disturbance was applied at simulated t=0 and the revisit lands at
	// t=1.2s: analytical decay must give exactly 0.4 * exp(-1.2 / 4).
	const expectedDisturbance = 0.4 * Math.exp(-1.2 / 4);
	assert.ok(
		Math.abs(revisited.grassDisturbance - expectedDisturbance) < 1e-9,
		`disturbance should survive with analytical decay, got ${revisited.grassDisturbance}, expected ${expectedDisturbance}`
	);
	assert.ok(revisited.lastUpdateTime >= 1.2);
});

test('a sprinting player has the ahead chunk ready long before the boundary', () => {
	const { loop } = fixture({
		budget: createMitzvahWorldGenerationBudget({ cpuMilliseconds: 2 })
	});
	loop.grantControl();
	for (const [x, z] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1]]) {
		loop.requestNeighbor(x, z);
	}
	const sprintSpeed = 8;
	let aheadReadyAtFrame = -1;
	for (let frame = 0; frame < 120; frame += 1) {
		const at = 1000 + frame * (1000 / 60);
		const playerX = 16 + sprintSpeed * frame * (1 / 60);
		loop.update({
			at,
			playerPosition: { x: playerX, y: 0, z: 16 },
			playerVelocity: { x: sprintSpeed, y: 0, z: 0 }
		});
		if (aheadReadyAtFrame < 0 && loop.generatedChunk(neighborId(1, 0)) !== null) {
			aheadReadyAtFrame = frame;
		}
		if (aheadReadyAtFrame >= 0) break;
	}
	assert.ok(aheadReadyAtFrame >= 0, 'ahead chunk should generate');
	console.log(`    ahead chunk ready at frame ${aheadReadyAtFrame} (boundary crossing at frame 120)`);
	assert.ok(aheadReadyAtFrame <= 30, `ahead chunk ready at frame ${aheadReadyAtFrame}, must be <= 30`);
});

test('shared wind state advances with the loop and matches the analytical phase', () => {
	const { loop } = fixture();
	assert.equal(loop.windState.seed, WORLD_SEED);
	assert.equal(loop.windState.windPhase, mitzvahWorldWindPhaseAt(WORLD_SEED, 0));
	loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	loop.update({ at: 2000, playerPosition: { x: 0, y: 0, z: 0 } });
	assert.ok(
		Math.abs(loop.windState.windPhase - mitzvahWorldWindPhaseAt(WORLD_SEED, 1)) < 1e-12,
		`wind phase should track one second of wind, got ${loop.windState.windPhase}`
	);
	assert.equal(loop.diagnostics().windSeed, WORLD_SEED);
});

test('round trip returns counts near baseline and reuses pooled vessels', () => {
	const { loop } = fixture();
	loop.update({ at: 1000, playerPosition: { x: 0, y: 0, z: 0 } });
	const baseline = loop.diagnostics();
	assert.equal(baseline.registryRecords, 1);
	loop.grantControl();
	const roundTrip = () => {
		for (const [x, z] of [[1, 0], [2, 0], [0, 1], [1, 1]]) {
			loop.requestNeighbor(x, z);
		}
		for (let frame = 0; frame < 10 && loop.diagnostics().pendingGeneration > 0; frame += 1) {
			loop.update({ at: 2000 + frame * 100, playerPosition: { x: 0, y: 0, z: 0 } });
		}
		assert.equal(loop.diagnostics().generatedChunks, 4);
		for (let frame = 0; frame < 10 && loop.diagnostics().registryQueue > 0; frame += 1) {
			loop.update({ at: 3000 + frame * 100, playerPosition: { x: 0, y: 0, z: 0 } });
		}
		for (const [x, z] of [[1, 0], [2, 0], [0, 1], [1, 1]]) {
			assert.equal(loop.unloadNeighbor(neighborId(x, z)), true);
		}
	};
	roundTrip();
	const afterFirst = loop.diagnostics();
	assert.equal(afterFirst.registryRecords, 1, 'only the spawn chunk remains');
	assert.equal(afterFirst.registryQueue, 0);
	assert.equal(afterFirst.pendingGeneration, 0);
	assert.equal(afterFirst.generatedChunks, 0);
	assert.equal(afterFirst.pool.materialRefs, 0);
	roundTrip();
	const afterSecond = loop.diagnostics();
	assert.equal(afterSecond.registryRecords, 1);
	assert.equal(afterSecond.registryQueue, 0);
	assert.equal(
		afterSecond.pool.retainedBytes,
		afterFirst.pool.retainedBytes,
		'retained bytes must not grow across round trips'
	);
	assert.ok(afterSecond.pool.float32Hits > 0, 'height buffers should be reused');
	assert.ok(afterSecond.pool.vegetationBatchHits > 0, 'vegetation batches should be reused');
	assert.ok(afterSecond.pool.materialHits > 0, 'the shared terrain material should be reused');
});

test('a five-hertz tick over 64 active chunks stays fast and catch-up costs no more', () => {
	const { loop, registry } = fixture({
		budget: createMitzvahWorldGenerationBudget({ cpuMilliseconds: 0 })
	});
	loop.grantControl();
	const ids = [];
	for (let index = 0; index < 63; index += 1) {
		const chunkX = (index % 7) + 1;
		const chunkZ = Math.floor(index / 7) + 1;
		loop.requestNeighbor(chunkX, chunkZ);
		ids.push(neighborId(chunkX, chunkZ));
	}
	let at = 1000;
	loop.update({ at, playerPosition: { x: 0, y: 0, z: 0 } });
	while (registry.queue.size > 0) {
		at += 100;
		loop.update({ at, playerPosition: { x: 0, y: 0, z: 0 } });
	}
	for (const id of ids) activate(registry, id);
	const fresh = timeTick(loop, 2000);
	assert.equal(fresh.ticks, 1);
	assert.equal(fresh.chunks, 64);
	for (const id of ids) {
		const record = registry.get(id);
		const meadow = meadowOf(registry, id);
		registry.records.set(id, {
			...record,
			durableMutations: {
				[MEADOW_MUTATION_KEY]: { ...meadow, lastUpdateTime: meadow.lastUpdateTime - 3600 }
			}
		});
	}
	const stale = timeTick(loop, 3000);
	assert.equal(stale.ticks, 1);
	assert.equal(stale.chunks, 64);
	for (const id of ids) {
		const meadow = meadowOf(registry, id);
		assert.ok(Math.abs(meadow.lastUpdateTime - 3) < 1e-9, 'one-hour catch-up must land on wall truth');
	}
	console.log(`    sim tick fresh 64 chunks: ${fresh.milliseconds.toFixed(3)}ms, 1h-stale: ${stale.milliseconds.toFixed(3)}ms`);
	assert.ok(fresh.milliseconds < 25, `fresh sim tick took ${fresh.milliseconds}ms`);
	assert.ok(
		stale.milliseconds < 4 * fresh.milliseconds + 10,
		`catch-up must not cost more than a normal tick: fresh ${fresh.milliseconds}ms, stale ${stale.milliseconds}ms`
	);
});

function timeTick(loop, at) {
	const started = process.hrtime.bigint();
	const receipt = loop.update({ at, playerPosition: { x: 0, y: 0, z: 0 } });
	return {
		chunks: receipt.streaming.simChunks,
		milliseconds: Number(process.hrtime.bigint() - started) / 1e6,
		ticks: receipt.streaming.simTicks
	};
}

function countUploaded(receipt) {
	return (receipt.results || []).filter(result => result?.value?.uploaded).length;
}

function countDeferred(receipt) {
	return (receipt.results || []).filter(result => result?.value?.deferred === 'gpu-upload-budget').length;
}

function captureHeights(loop, chunkId) {
	const generated = loop.generatedChunk(chunkId);
	return generated ? [...generated.heights] : null;
}

function fakeClock() {
	let now = 1000;
	return {
		get now() {
			return now;
		},
		advance(milliseconds) {
			now += milliseconds;
		}
	};
}
