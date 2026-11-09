// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBudgetedGenerationWiring.test.js
 * @description Proves the Chapter 4 budgeted generation loop is wired into the live
 * runtime frame step (Task 3): one loop around the live chunk runtime, its
 * coordinator the single live coordinator, update called every frame, control
 * granted after the spawn-only first frame, the neighbor ring requested after
 * control, far neighbors pruned, and live diagnostics exposed for the 4 ms
 * generation/upload slice check.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldChunkRegistry } from '../world/streaming/WorldChunkRegistry.js';
import { createMitzvahWorldGenerationBudget } from '../world/streaming/MitzvahWorldGenerationBudget.js';
import {
	MITZVAH_WORLD_LIVE_WINDOW_RADIUS,
	updateMitzvahWorldBudgetedGeneration
} from './MitzvahWorldBudgetedGenerationWiring.js';

function fixture() {
	const registry = new WorldChunkRegistry();
	const chunkRuntime = {
		frameTimeMilliseconds: 8,
		registry,
		update: () => registry.process({ maximumCost: 100, maximumMilliseconds: 8, maximumTransitions: 8 })
	};
	const runtime = {
		chunkRuntime,
		model: { position: { x: 0, y: 0, z: 0 } }
	};
	return { chunkRuntime, registry, runtime };
}

function frame(runtime, at = 1000) {
	return {
		at,
		cameraDirection: null,
		frameTimeMilliseconds: 8,
		playerPosition: runtime.model.position,
		playerVelocity: null
	};
}

test('creates one loop and exposes its coordinator as the single live coordinator', () => {
	const { runtime } = fixture();
	const receipt = updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime));
	assert.ok(receipt);
	assert.ok(runtime.budgetedGenerationLoop);
	assert.strictEqual(runtime.streamingCoordinator, runtime.budgetedGenerationLoop.coordinator);
	// Second frame reuses the same loop and coordinator (no second coordinator).
	updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime, 1016));
	assert.strictEqual(runtime.streamingCoordinator, runtime.budgetedGenerationLoop.coordinator);
});

test('first frame is spawn-only; control is granted after it and neighbors are requested', () => {
	const { runtime } = fixture();
	const first = updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime));
	assert.equal(first.spawnReady, true);
	assert.equal(first.controlGranted, false);
	assert.equal(first.generation.pendingGeneration, 0);
	// Second frame: control granted, neighbor ring requested.
	const second = updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime, 1016));
	assert.equal(second.controlGranted, true);
	const diagnostics = runtime.budgetedGenerationDiagnostics;
	assert.ok(diagnostics);
	assert.equal(diagnostics.controlGranted, true);
	assert.ok(diagnostics.pendingGeneration > 0, 'neighbor ring is requested after control');
	assert.ok(diagnostics.generationBudget, 'budget diagnostics are exposed live');
});

test('neighbor ring follows the player chunk and far neighbors are pruned', () => {
	const { runtime } = fixture();
	updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime));
	updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime, 1016));
	const before = runtime.budgetedGenerationDiagnostics.pendingGeneration
		+ runtime.budgetedGenerationDiagnostics.generatedChunks;
	assert.ok(before > 0);
	// Sprint far away: the ring re-centers and far chunks are pruned to the window.
	runtime.model.position = { x: 32 * 10, y: 0, z: 0 };
	for (let step = 0; step < 6; step += 1) {
		updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime, 2000 + step * 16));
	}
	const after = runtime.budgetedGenerationDiagnostics;
	const live = after.pendingGeneration + after.generatedChunks;
	assert.ok(live <= (2 * MITZVAH_WORLD_LIVE_WINDOW_RADIUS + 1) ** 2,
		`live window stays bounded, got ${live}`);
});

test('returns null without a chunk runtime and never creates a coordinator', () => {
	const runtime = { model: { position: { x: 0, y: 0, z: 0 } } };
	const receipt = updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime));
	assert.equal(receipt, null);
	assert.equal(runtime.budgetedGenerationLoop, undefined);
	assert.equal(runtime.streamingCoordinator, undefined);
});

test('generation budget is the live 2 ms budget', () => {
	const { runtime } = fixture();
	updateMitzvahWorldBudgetedGeneration(runtime, frame(runtime));
	const budget = runtime.budgetedGenerationDiagnostics.generationBudget;
	assert.equal(budget.budgetMilliseconds, 2);
	assert.equal(typeof budget.spentMilliseconds, 'number');
});
