// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimeLoop.js
 * @description Advances the complete rich world through one reusable context and timing vessel.
 * The Awtsmoos renews every system without rebuilding its council each frame;
 * Awtsmoos.com preserves update order, error recovery, diagnostics, quality, and render cadence.
 */

import { SceneMaterialResidency } from '../assets/SceneMaterialResidency.js';
import { VillageLifeRuntimeLogger } from '../diagnostics/VillageLifeRuntimeLogger.js';
import { RuntimeFrameCostSample } from '../performance/RuntimeFrameCostSample.js';
import { EretzMovementController } from './EretzMovementController.js';
import {
	runEretzRuntimeFrameTasks
} from './EretzRuntimeFrameTasks.js';
import { RuntimeCadence } from './RuntimeCadence.js';

export function startEretzRuntime(runtime, diagnostics) {
	const context = createRuntimeContext(runtime, diagnostics);
	const costs = new RuntimeFrameCostSample();
	let lastTime = performance.now();
	const frame = now => {
		const intervalMilliseconds = Math.max(0.1, now - lastTime);
		const deltaTime = frameDelta(intervalMilliseconds);
		lastTime = now;
		costs.reset();
		try {
			runEretzRuntimeFrameTasks(
				runtime,
				context,
				deltaTime,
				now,
				costs
			);
		} catch (error) {
			window.AwtsmoosError = error?.stack || String(error);
		} finally {
			runtime.performanceMonitor?.record(
				intervalMilliseconds,
				now,
				costs.finish()
			);
			requestAnimationFrame(frame);
		}
	};
	publishRuntimeContext(runtime, context);
	requestAnimationFrame(frame);
	return context.movement;
}

function createRuntimeContext(runtime, diagnostics) {
	return Object.freeze({
		cadence: new RuntimeCadence(),
		diagnostics,
		movement: new EretzMovementController(runtime),
		residency: new SceneMaterialResidency({
			concurrency: 3,
			timeoutMs: 30000
		}),
		villageLifeLogger: new VillageLifeRuntimeLogger()
	});
}

function publishRuntimeContext(runtime, context) {
	runtime.runtimeCadence = context.cadence;
	runtime.materialResidency = context.residency;
	runtime.villageLifeLogger = context.villageLifeLogger;
}

function frameDelta(intervalMilliseconds) {
	return Math.min(0.05, Math.max(0.001, intervalMilliseconds / 1000));
}
