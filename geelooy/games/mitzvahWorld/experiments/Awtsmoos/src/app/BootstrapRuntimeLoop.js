// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeLoop.js
 * @description Owns the first playable heartbeat and feeds heavy diagnostics only when an opt-in session installed them.
 * Keter crowns one visible pulse while Yesod carries simulation below; the Awtsmoos recreates every frame before the browser may request it,
 * and Awtsmoos.com records live control only after movement and rendering have truly crossed the gate.
 */

import {
	FrameBudgetWindow
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/performance/FrameBudgetWindow.js';
import {
	advanceBootstrapGameplay,
	primeBootstrapGameplay,
	recordBootstrapFrameFailure,
	recordBootstrapFrameSuccess,
	refreshBootstrapPresentation,
	renderBootstrapGameplay
} from './BootstrapFrameExecution.js';
import { createBootstrapFrameScheduler } from './BootstrapFrameScheduler.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES
} from './MitzvahWorldEssentialBoot.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import { RuntimeLongTaskMonitor } from '../performance/RuntimeLongTaskMonitor.js';

const MAX_FRAME_DELTA_SECONDS = 0.05;
const FRAME_BUDGET_P95_MS = 16.7;
const LONG_TASK_BUDGET_MS = 50;

/** Starts the main visual gameplay loop without multiplying animation clocks. */
export function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const frameWindow = new FrameBudgetWindow(240);
	const longTaskMonitor = new RuntimeLongTaskMonitor();
	const scheduler = createBootstrapFrameScheduler(environment);
	let active = true;
	let lastTime = now(environment);
	let lastUiAt = -Infinity;

	const frame = (currentTime, source = 'unknown') => {
		if (!active) {
			return;
		}
		const gap = Math.max(1, currentTime - lastTime);
		const deltaSeconds = frameDelta(gap);
		lastTime = currentTime;
		frameWindow.add(gap);
		try {
			advanceBootstrapGameplay(runtime, movement, deltaSeconds);
			renderBootstrapGameplay(runtime, currentTime);
			lastUiAt = refreshBootstrapPresentation(
				runtime,
				currentTime,
				lastUiAt
			);
			runtime.performanceMonitor?.record?.(
				gap,
				currentTime
			);
			recordBootstrapFrameSuccess(runtime, currentTime, source);
		} catch (error) {
			recordBootstrapFrameFailure(runtime, environment, error);
		}
		scheduler.schedule(frame);
	};

	publishLoopState(runtime, frameWindow, scheduler, longTaskMonitor);
	primeBootstrapGameplay(runtime, movement, lastTime);
	publishMovementReady(environment);
	scheduler.schedule(frame);
	movement.stop = (options = {}) => {
		active = false;
		scheduler.cancel();
		if (!options.preserveUi) {
			runtime.bootstrapMinimap?.destroy?.();
		}
	};
	movement.scheduler = () => ({
		active,
		frameSource: runtime.runtimeFrameSource
	});
	return movement;
}

/** Publishes live-control evidence only after the prime movement/render path succeeds. */
function publishMovementReady(environment) {
	completeMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
		{ importerStage: 'bootstrap-runtime-prime' }
	);
	markMitzvahWorldStartupMilestone(environment, 'playerControllable');
}

/** Publishes frame evidence and scheduler ownership for runtime diagnostics. */
function publishLoopState(runtime, frameWindow, scheduler, longTaskMonitor) {
	runtime.bootstrapFrames = 0;
	runtime.enrichedFrames = 0;
	runtime.frameCadence = frameWindow;
	runtime.frameBudget = frameWindow;
	runtime.frameScheduler = scheduler;
	runtime.longTaskMonitor = longTaskMonitor;
	runtime.lastFrameAt = null;
	runtime.lastFrameError = null;
	runtime.runtimeFrameSource = 'starting';
	// Frame-budget evidence for the 60 FPS covenant: minimal-meadow p95 frame time
	// must stay <= 16.7ms and no observed long task may exceed 50ms.
	runtime.frameBudgetVerdict = () => {
		const frames = frameWindow.view();
		const longTasks = longTaskMonitor.snapshot();
		return Object.freeze({
			frameBudgetP95Ms: FRAME_BUDGET_P95_MS,
			frames,
			longTaskBudgetMs: LONG_TASK_BUDGET_MS,
			longTasks,
			p95WithinBudget: Number.isFinite(frames.p95Ms) ? frames.p95Ms <= FRAME_BUDGET_P95_MS : null,
			noLongTaskOverBudget: longTasks.available
				? (longTasks.maximumMilliseconds ?? 0) <= LONG_TASK_BUDGET_MS
				: null
		});
	};
}

/** Returns the best monotonic time available from the runtime vessel. */
function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}

/** Bounds one simulation delta so a delayed frame cannot explode movement. */
function frameDelta(milliseconds) {
	return Math.min(
		MAX_FRAME_DELTA_SECONDS,
		Math.max(0.001, milliseconds / 1000)
	);
}
