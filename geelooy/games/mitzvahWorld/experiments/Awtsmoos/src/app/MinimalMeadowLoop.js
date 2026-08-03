// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLoop.js
 * @description Advances and paints the enriched meadow on display frames and timer-backed rescue.
 * The Awtsmoos renews traveler, forest, river, blossom, battle, and visible light through one stream;
 * Awtsmoos.com keeps real rendering alive when finite paint bells pause, preserving the living dream.
 */

import { BootstrapMovementController } from './BootstrapMovementController.js';
import { createMinimalMeadowFrameScheduler } from './MinimalMeadowFrameScheduler.js';
import { updateMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import { MinimalMeadowLoopCadence } from './MinimalMeadowLoopCadence.js';

export function startMinimalMeadowLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const cadence = new MinimalMeadowLoopCadence();
	const clock = () => environment.performance?.now?.() ?? Date.now();
	const scheduler = createMinimalMeadowFrameScheduler(environment, (timeValue, source) => {
		advanceMinimalMeadowFrame(runtime, movement, cadence, scheduler, {
			clock,
			source,
			timeValue
		});
	});
	publishLoopState(runtime, cadence, scheduler);
	render(runtime);
	scheduler.start();
	return {
		controller: movement,
		scheduler: () => ({
			...scheduler.diagnostics(),
			cadence: cadence.diagnostics()
		}),
		snapshot: () => movement.snapshot(),
		stop: () => scheduler.stop()
	};
}

function advanceMinimalMeadowFrame(runtime, movement, cadence, scheduler, frame) {
	const deltaSeconds = scheduler.consumeDelta(frame.timeValue);
	const frameStartedAt = frame.clock();
	try {
		movement.update(deltaSeconds);
		runtime.coreMechanics?.update?.(deltaSeconds);
		const gameplayEndedAt = frame.clock();
		updateMinimalMeadowAnimation(runtime, deltaSeconds);
		const animationEndedAt = frame.clock();
		runtime.updateWorldSystems?.(deltaSeconds);
		const streamingEndedAt = frame.clock();
		render(runtime);
		const renderEndedAt = frame.clock();
		publishFrameEvidence(runtime, frame);
		cadence.refresh(runtime, frame.timeValue, frame.source);
		recordPerformance(runtime, {
			animationEndedAt,
			frameStartedAt,
			gameplayEndedAt,
			intervalMilliseconds: deltaSeconds * 1000,
			renderEndedAt,
			streamingEndedAt,
			timeValue: frame.timeValue
		});
	} catch (error) {
		runtime.lastFrameError = error?.stack || String(error);
		environmentError(runtime, error);
	}
}

function publishLoopState(runtime, cadence, scheduler) {
	runtime.bootstrapFrames = 0;
	runtime.enrichedFrames = 0;
	runtime.frameCadence = cadence;
	runtime.frameScheduler = scheduler;
	runtime.lastFrameAt = null;
	runtime.lastFrameError = null;
	runtime.runtimeFrameSource = 'starting';
}

function publishFrameEvidence(runtime, frame) {
	runtime.bootstrapFrames += 1;
	runtime.enrichedFrames += runtime.updateWorldSystems ? 1 : 0;
	runtime.lastFrameAt = frame.timeValue;
	runtime.lastFrameError = null;
	runtime.runtimeFrameSource = frame.source;
}

function environmentError(runtime, error) {
	globalThis.AwtsmoosError = runtime.lastFrameError || error?.message || String(error);
}

function recordPerformance(runtime, marks) {
	const monitor = runtime.performanceMonitor;
	if (!monitor) return;
	monitor.record(marks.intervalMilliseconds, marks.timeValue, {
		animationMilliseconds: marks.animationEndedAt - marks.gameplayEndedAt,
		cpuFrameMilliseconds: marks.renderEndedAt - marks.frameStartedAt,
		gameplayMilliseconds: marks.gameplayEndedAt - marks.frameStartedAt,
		renderSubmissionMilliseconds: marks.renderEndedAt - marks.streamingEndedAt,
		streamingMilliseconds: marks.streamingEndedAt - marks.animationEndedAt
	});
}

function render(runtime) {
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
}

export default startMinimalMeadowLoop;
