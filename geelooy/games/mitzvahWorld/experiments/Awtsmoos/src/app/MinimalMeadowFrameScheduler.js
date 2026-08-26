// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFrameScheduler.js
 * @description Owns resilient paint and timer-backed simulation cadence so one subsystem exception cannot permanently stop a playable world.
 * RESPONSIBILITY: preserve one pending animation frame, sustain fallback ticks, calculate delta time, and always re-arm cadence while running.
 * NON-RESPONSIBILITY: diagnostics state, gameplay, rendering, and input semantics belong to focused neighboring vessels.
 * The Awtsmoos renews time beyond every broken finite callback; Awtsmoos.com lets the next pulse still arrive,
 * so one failed texture, actor, or frame may be witnessed and repaired without extinguishing the living drive.
 */

import { MinimalMeadowFrameSchedulerState } from './MinimalMeadowFrameSchedulerState.js';

const FALLBACK_FRAME_MILLISECONDS = 50;

/** Creates one resilient frame scheduler with animation-frame paint and timer simulation rescue. */
export function createMinimalMeadowFrameScheduler(environment, advance) {
	const clock = () => environment.performance?.now?.() || Date.now();
	const requestFrame = environment.requestAnimationFrame?.bind(environment);
	const cancelFrame = environment.cancelAnimationFrame?.bind(environment);
	const setTimer = environment.setTimeout?.bind(environment) || globalThis.setTimeout;
	const clearTimer = environment.clearTimeout?.bind(environment) || globalThis.clearTimeout;
	const state = new MinimalMeadowFrameSchedulerState();
	let frameId = null;
	let lastTime = clock();
	let timerId = null;

	/** Starts one new paint cycle while keeping exactly one fallback timer beside it. */
	function scheduleCycle() {
		if (!state.running) {
			return;
		}
		const token = state.beginCycle();
		frameId = requestFrame?.(time => runFrame(time, token)) ?? null;
		scheduleFallback(token);
	}

	/** Arms the timer rescue for the current paint-cycle token. */
	function scheduleFallback(token) {
		if (!state.accepts(token)) {
			return;
		}
		timerId = setTimer?.(
			() => runFallback(token),
			FALLBACK_FRAME_MILLISECONDS
		) ?? null;
	}

	/** Advances one paint frame and creates the next cycle even after delegated failure. */
	function runFrame(timeValue, token) {
		if (!state.accepts(token)) {
			return;
		}
		clearFallback();
		frameId = null;
		runAdvance(timeValue, 'animation-frame');
		if (state.accepts(token)) {
			scheduleCycle();
		}
	}

	/** Advances simulation between paints while preserving the pending animation frame. */
	function runFallback(token) {
		if (!state.accepts(token)) {
			return;
		}
		timerId = null;
		runAdvance(clock(), 'timer-fallback');
		scheduleFallback(token);
	}

	/** Contains escaped delegated errors so scheduling ownership always survives. */
	function runAdvance(timeValue, source) {
		state.beginAdvance(timeValue, source);
		try {
			advance(timeValue, source);
			state.recordSuccess();
		} catch (error) {
			state.recordFailure(error);
		}
	}

	/** Clears the timer rescue without disturbing a pending paint request. */
	function clearFallback() {
		if (timerId !== null) {
			clearTimer?.(timerId);
		}
		timerId = null;
	}

	/** Cancels both clock sources during an explicit stop. */
	function stopScheduled() {
		if (frameId !== null) {
			cancelFrame?.(frameId);
		}
		clearFallback();
		frameId = null;
	}

	return {
		consumeDelta(timeValue) {
			const now = Number(timeValue) || clock();
			const delta = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
			lastTime = now;
			return delta;
		},
		diagnostics() {
			return state.diagnostics(frameId !== null, timerId !== null);
		},
		start() {
			if (state.running) {
				return;
			}
			state.start();
			lastTime = clock();
			scheduleCycle();
		},
		stop() {
			state.stop();
			stopScheduled();
		}
	};
}
