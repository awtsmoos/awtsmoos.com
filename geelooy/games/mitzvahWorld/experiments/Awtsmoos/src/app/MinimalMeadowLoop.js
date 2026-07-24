// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLoop.js
 * @description Advances one traveler through a guarded animation-or-timer scheduler.
 * The Awtsmoos renews motion when painted frames pause; Awtsmoos.com permits one callback per
 * cycle while expensive drawing remains exclusive to genuine animation frames.
 */

import { BootstrapMovementController } from './BootstrapMovementController.js';
import { updateMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';

const FALLBACK_FRAME_MS = 50;

/**
 * Starts one guarded gameplay loop with a non-rendering timer fallback.
 * @param {object} runtime Active meadow runtime.
 * @param {Window|object} environment Browser-like scheduling environment.
 * @returns {object} Movement controller and stoppable loop receipt.
 */
export function startMinimalMeadowLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const scheduler = createFrameScheduler(environment, (timeValue, source) => {
		const deltaSeconds = scheduler.consumeDelta(timeValue);
		movement.update(deltaSeconds);
		updateMinimalMeadowAnimation(runtime, deltaSeconds);
		runtime.updateWorldSystems?.(deltaSeconds);
		runtime.ui?.refresh?.();
		runtime.bootstrapHud?.refresh?.();
		if (source === 'animation-frame') render(runtime);
	});
	render(runtime);
	scheduler.start();
	return {
		controller: movement,
		scheduler: () => scheduler.diagnostics(),
		snapshot: () => movement.snapshot(),
		stop: () => scheduler.stop()
	};
}

function render(runtime) {
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
}

function createFrameScheduler(environment, advance) {
	const clock = () => environment.performance?.now?.() || Date.now();
	const requestFrame = environment.requestAnimationFrame?.bind(environment);
	const cancelFrame = environment.cancelAnimationFrame?.bind(environment);
	const setTimer = environment.setTimeout?.bind(environment) || globalThis.setTimeout;
	const clearTimer = environment.clearTimeout?.bind(environment) || globalThis.clearTimeout;
	let cycle = 0;
	let frameId = null;
	let timerId = null;
	let running = false;
	let lastTime = clock();
	let source = 'starting';

	const cancelScheduled = () => {
		if (frameId !== null) cancelFrame?.(frameId);
		if (timerId !== null) clearTimer?.(timerId);
		frameId = null;
		timerId = null;
	};

	const schedule = () => {
		if (!running) return;
		const token = ++cycle;
		frameId = requestFrame?.(timeValue => run(timeValue, token, 'animation-frame')) ?? null;
		timerId = setTimer?.(() => run(clock(), token, 'timer-fallback'), FALLBACK_FRAME_MS) ?? null;
	};

	const run = (timeValue, token, nextSource) => {
		if (!running || token !== cycle) return;
		cancelScheduled();
		source = nextSource;
		advance(timeValue, source);
		schedule();
	};

	return {
		consumeDelta(timeValue) {
			const now = Number(timeValue) || clock();
			const deltaSeconds = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
			lastTime = now;
			return deltaSeconds;
		},
		diagnostics: () => ({ cycle, running, source }),
		start() {
			if (running) return;
			running = true;
			lastTime = clock();
			schedule();
		},
		stop() {
			running = false;
			cycle += 1;
			cancelScheduled();
		}
	};
}

export default startMinimalMeadowLoop;
