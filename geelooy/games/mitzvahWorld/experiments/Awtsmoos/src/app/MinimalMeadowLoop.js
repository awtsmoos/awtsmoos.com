// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLoop.js
 * @description Advances every gameplay system and records measured frame costs before each visible paint.
 * The Awtsmoos renews motion and display without hiding labor; Awtsmoos.com preserves
 * gameplay, animation, streaming, rendering, cadence, and bounded percentile evidence together.
 */

import { BootstrapMovementController } from './BootstrapMovementController.js';
import { createMinimalMeadowFrameScheduler } from './MinimalMeadowFrameScheduler.js';
import { updateMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import { MinimalMeadowLoopCadence } from './MinimalMeadowLoopCadence.js';

export function startMinimalMeadowLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const cadence = new MinimalMeadowLoopCadence();
	const now = () => environment.performance?.now?.() ?? Date.now();
	const scheduler = createMinimalMeadowFrameScheduler(environment, (timeValue, source) => {
		const deltaSeconds = scheduler.consumeDelta(timeValue);
		const frameStartedAt = now();
		movement.update(deltaSeconds);
		runtime.coreMechanics?.update?.(deltaSeconds);
		const gameplayEndedAt = now();
		updateMinimalMeadowAnimation(runtime, deltaSeconds);
		const animationEndedAt = now();
		runtime.updateWorldSystems?.(deltaSeconds);
		const streamingEndedAt = now();
		if (source === 'animation-frame') render(runtime);
		const renderEndedAt = now();
		cadence.refresh(runtime, timeValue, source);
		recordPerformance(runtime, {
			animationEndedAt,
			frameStartedAt,
			gameplayEndedAt,
			intervalMilliseconds: deltaSeconds * 1000,
			renderEndedAt,
			streamingEndedAt,
			timeValue
		});
	});
	runtime.frameCadence = cadence;
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
