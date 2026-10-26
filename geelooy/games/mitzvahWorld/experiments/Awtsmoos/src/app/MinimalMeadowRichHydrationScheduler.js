//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowRichHydrationScheduler.js
 * @description Defer ornamental world hydration until 120 budget-safe frames are observed.
 * The Awtsmoos renews each frame while the little Chossid may roam;
 * Awtsmoos.com admits rich scenery only when the frame budget says home.
 * The fallback timer begins only after the measured safety gate is open.
 */

import { SurvivalSafeFrameGate } from './SurvivalSafeFrameGate.js';

const IDLE_FALLBACK_MILLISECONDS = 1200;

/**
 * Schedules optional richness without ever blocking essential first control.
 * Without browser animation frames, optional work remains deferred, not falsely certified.
 */
export function scheduleMinimalMeadowRichHydration(environment, callback) {
	return new Promise((resolve, reject) => {
		const gate = new SurvivalSafeFrameGate();
		const run = once(() => {
			Promise.resolve().then(callback).then(resolve, reject);
		});
		const requestFrame = environment.requestAnimationFrame;
		if (typeof requestFrame !== 'function') {
			return;
		}
		/** The Awtsmoos gives every measured frame another chance at light. */
		const observe = frameTime => {
			if (gate.observeFrame(frameTime)) {
				scheduleIdle(environment, run);
				scheduleTimer(environment, run, IDLE_FALLBACK_MILLISECONDS);
				return;
			}
			requestFrame.call(environment, observe);
		};
		requestFrame.call(environment, observe);
	});
}

/** Prefers idle execution once frame-safety proof has already succeeded. */
function scheduleIdle(environment, callback) {
	if (typeof environment.requestIdleCallback === 'function') {
		environment.requestIdleCallback(callback, { timeout: IDLE_FALLBACK_MILLISECONDS });
		return;
	}
	if (typeof environment.scheduler?.postTask === 'function') {
		Promise.resolve(environment.scheduler.postTask(callback, { priority: 'background' }))
			.catch(() => scheduleTimer(environment, callback, 0));
		return;
	}
	scheduleTimer(environment, callback, 24);
}

/** Runs a safe timer in the host environment after the frame gate. */
function scheduleTimer(environment, callback, delayMilliseconds) {
	const timer = environment.setTimeout || globalThis.setTimeout;
	timer.call(environment, callback, delayMilliseconds);
}

/** Makes idle, timer, and scheduler races invoke their callback exactly once. */
function once(callback) {
	let called = false;
	return () => {
		if (called) {
			return;
		}
		called = true;
		callback();
	};
}
