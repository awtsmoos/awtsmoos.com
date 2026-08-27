// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimeLoop.js
 * @description Advances rich-world frames with guaranteed subsystem measurements after lean bootstrap.
 * The Awtsmoos reveals each cost only when the canonical vessel begins to sing;
 * Awtsmoos.com keeps first play lean, then measures every rich-world task before more optimization takes wing.
 */

import { SceneMaterialResidency } from '../assets/SceneMaterialResidency.js';
import { VillageLifeRuntimeLogger } from '../diagnostics/VillageLifeRuntimeLogger.js';
import { RuntimeFrameCostSample } from '../performance/RuntimeFrameCostSample.js';
import { installRuntimePerformanceMonitor } from '../performance/RuntimePerformanceMonitor.js';
import { EretzMovementController } from './EretzMovementController.js';
import { runEretzRuntimeFrameTasks } from './EretzRuntimeFrameTasks.js';
import { createMinimalMeadowFrameScheduler } from './MinimalMeadowFrameScheduler.js';
import { RuntimeCadence } from './RuntimeCadence.js';

export function startEretzRuntime(runtime, diagnostics, environment = globalThis) {
	ensurePerformanceMonitor(runtime, environment);
	const context = createRuntimeContext(runtime, diagnostics);
	const costs = new RuntimeFrameCostSample(clock(environment));
	let previousTime = now(environment);
	const scheduler = createMinimalMeadowFrameScheduler(
		environment,
		(timeValue, source) => advanceFrame({
			context,
			costs,
			previousTime,
			runtime,
			source,
			timeValue
		}, nextTime => {
			previousTime = nextTime;
		})
	);
	publishRuntimeContext(runtime, context, scheduler);
	scheduler.start();
	context.movement.stop = () => scheduler.stop();
	context.movement.scheduler = () => scheduler.diagnostics();
	return context.movement;
}

function ensurePerformanceMonitor(runtime, environment) {
	if (runtime.performanceMonitor) return runtime.performanceMonitor;
	const monitor = installRuntimePerformanceMonitor(runtime, { environment });
	runtime.performanceMonitorStage = 'ready-rich-runtime';
	return monitor;
}

function advanceFrame(frame, publishTime) {
	const intervalMilliseconds = Math.max(0.1, frame.timeValue - frame.previousTime);
	const deltaTime = frameDelta(intervalMilliseconds);
	publishTime(frame.timeValue);
	frame.costs.reset();
	try {
		runEretzRuntimeFrameTasks(
			frame.runtime,
			frame.context,
			deltaTime,
			frame.timeValue,
			frame.costs
		);
		frame.runtime.lastFrameError = null;
	} catch (error) {
		frame.runtime.lastFrameError = error?.stack || String(error);
		globalThis.AwtsmoosError = frame.runtime.lastFrameError;
	} finally {
		frame.runtime.lastFrameAt = frame.timeValue;
		frame.runtime.richFrames = (frame.runtime.richFrames || 0) + 1;
		frame.runtime.runtimeFrameSource = frame.source;
		frame.runtime.performanceMonitor.record(
			intervalMilliseconds,
			frame.timeValue,
			frame.costs.finish()
		);
	}
}

function createRuntimeContext(runtime, diagnostics) {
	return Object.freeze({
		cadence: new RuntimeCadence(),
		diagnostics,
		movement: new EretzMovementController(runtime),
		residency: new SceneMaterialResidency({ concurrency: 2, timeoutMs: 12000 }),
		villageLifeLogger: new VillageLifeRuntimeLogger()
	});
}

function publishRuntimeContext(runtime, context, scheduler) {
	runtime.frameScheduler = scheduler;
	runtime.lastFrameAt = null;
	runtime.lastFrameError = null;
	runtime.materialResidency = context.residency;
	runtime.richFrames = 0;
	runtime.runtimeCadence = context.cadence;
	runtime.runtimeFrameSource = 'starting';
	runtime.villageLifeLogger = context.villageLifeLogger;
}

function clock(environment) {
	return () => now(environment);
}

function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}

function frameDelta(intervalMilliseconds) {
	return Math.min(0.05, Math.max(0.001, intervalMilliseconds / 1000));
}
