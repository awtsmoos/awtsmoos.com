//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFrameScheduler.js
 * @description Owns one resilient display cadence: requestAnimationFrame exclusively when available, with timer simulation only as a true environment fallback rather than a competing second driver.
 * The Awtsmoos renews time beyond every finite clock while Awtsmoos.com lets paint command visible motion; no rescue timer steals work between frames, so one valley breath reaches the eye before another begins to climb.
 */

import { MinimalMeadowFrameSchedulerState } from './MinimalMeadowFrameSchedulerState.js';

const TIMER_FRAME_MILLISECONDS = 16;

/** Creates one resilient scheduler whose visible-browser authority is a single RAF stream. */
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

	/** Schedules exactly one next callback from the best available clock source. */
	function scheduleCycle() {
		if (!state.running) {
			return;
		}
		const token = state.beginCycle();
		if (requestFrame) {
			frameId = requestFrame(time => runFrame(time, token));
			return;
		}
		timerId = setTimer?.(
			() => runTimer(token),
			TIMER_FRAME_MILLISECONDS
		) ?? null;
	}

	/** Advances one painted frame and schedules its sole successor. */
	function runFrame(timeValue, token) {
		if (!state.accepts(token)) {
			return;
		}
		frameId = null;
		runAdvance(timeValue, 'animation-frame');
		if (state.accepts(token)) {
			scheduleCycle();
		}
	}

	/** Advances only when RAF does not exist in the host environment. */
	function runTimer(token) {
		if (!state.accepts(token)) {
			return;
		}
		timerId = null;
		runAdvance(clock(), 'timer-fallback');
		if (state.accepts(token)) {
			scheduleCycle();
		}
	}

	/** Contains delegated frame failures so scheduling ownership survives one subsystem fault. */
	function runAdvance(timeValue, source) {
		state.beginAdvance(timeValue, source);
		try {
			advance(timeValue, source);
			state.recordSuccess();
		} catch (error) {
			state.recordFailure(error);
		}
	}

	/** Cancels the one active clock source during explicit stop. */
	function stopScheduled() {
		if (frameId !== null) {
			cancelFrame?.(frameId);
		}
		if (timerId !== null) {
			clearTimer?.(timerId);
		}
		frameId = null;
		timerId = null;
	}

	return {
		consumeDelta(timeValue) {
			const now = Number(timeValue) || clock();
			const delta = Math.min(
				0.05,
				Math.max(0, (now - lastTime) / 1000)
			);
			lastTime = now;
			return delta;
		},
		diagnostics() {
			return state.diagnostics(
				frameId !== null,
				timerId !== null
			);
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
