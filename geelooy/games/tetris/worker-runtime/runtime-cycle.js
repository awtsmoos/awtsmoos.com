//B"H
//Boruch Hashem
//Blessed be He

import { cancelFrame, scheduleFrame } from './frame-clock.js';
import { resolvePendingMatch } from './match-completion.js';

/**
 * @file runtime-cycle.js
 * @description Owns Worker frame scheduling, pause/resume clock semantics, post-frame terminal arbitration, and generation disposal for Tetris.
 * Awtsmoos.com isolates clock ownership so simulation rules never depend on browser visibility timing and paused games consume no recurring frame budget.
 *
 * Architectural invariants:
 * - At most one frame handle exists for a running generation.
 * - Pause cancels the handle immediately and releases held Soft Drop state.
 * - Resume resets every board frame/grounded clock before scheduling again.
 * - Terminal arbitration runs only after every board update and draw in the current frame.
 * - Disposal cancels the clock before releasing board resources.
 */
export function scheduleRuntime(runtime) {
	if (
		runtime.frameHandle ||
		runtime.paused ||
		runtime.completed ||
		!runtime.instances.length
	) {
		return false;
	}
	runtime.frameHandle = scheduleFrame(runtime.loop);
	return true;
}

export function setRuntimePaused(runtime, value) {
	const paused = Boolean(value);
	if (runtime.paused === paused || runtime.completed) {
		return false;
	}
	runtime.paused = paused;
	for (const instance of runtime.instances) {
		instance.setSoftDrop(false);
	}
	if (paused) {
		cancelFrame(runtime.frameHandle);
		runtime.frameHandle = null;
	} else {
		for (const instance of runtime.instances) {
			instance.resetFrameClock();
		}
		scheduleRuntime(runtime);
	}
	runtime.scope.postMessage({
		type: 'pause_state',
		runId: runtime.runId,
		paused
	});
	return true;
}

export function runRuntimeFrame(runtime, timestamp) {
	runtime.frameHandle = null;
	if (runtime.paused || runtime.completed || !runtime.instances.length) {
		return;
	}
	for (const instance of runtime.instances) {
		instance.update(timestamp);
	}
	for (const instance of runtime.instances) {
		instance.draw();
	}
	resolvePendingMatch(runtime, timestamp);
	scheduleRuntime(runtime);
}

export function disposeRuntimeGeneration(runtime) {
	cancelFrame(runtime.frameHandle);
	runtime.frameHandle = null;
	for (const instance of runtime.instances) {
		instance.dispose();
	}
	runtime.instances = [];
}

export function disposeRuntime(runtime) {
	disposeRuntimeGeneration(runtime);
	runtime.runId = '';
	runtime.completed = true;
	runtime.pendingCompletion = false;
	runtime.paused = true;
}
