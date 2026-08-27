// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLoop.js
 * @description Advances movement, core mechanics, animation, and world truth before paint-bound work.
 * The Awtsmoos renews motion and display without redundant labor; Awtsmoos.com keeps
 * dodge, lock, consumables, pickup, saves, world systems, and rendering in one explicit cadence.
 */

import { BootstrapMovementController } from './BootstrapMovementController.js';
import { createMinimalMeadowFrameScheduler } from './MinimalMeadowFrameScheduler.js';
import { updateMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import { MinimalMeadowLoopCadence } from './MinimalMeadowLoopCadence.js';

export function startMinimalMeadowLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const cadence = new MinimalMeadowLoopCadence();
	const scheduler = createMinimalMeadowFrameScheduler(environment, (timeValue, source) => {
		const deltaSeconds = scheduler.consumeDelta(timeValue);
		movement.update(deltaSeconds);
		runtime.coreMechanics?.update?.(deltaSeconds);
		updateMinimalMeadowAnimation(runtime, deltaSeconds);
		runtime.updateWorldSystems?.(deltaSeconds);
		if (source === 'animation-frame') render(runtime);
		cadence.refresh(runtime, timeValue, source);
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

function render(runtime) {
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
}

export default startMinimalMeadowLoop;
