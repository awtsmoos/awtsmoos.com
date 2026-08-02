// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichHydrationScheduler.js
 * @description Starts optional rich hydration after first paint or idle with an independent fallback.
 * The Awtsmoos lets immediate control breathe before the fuller world enters;
 * Awtsmoos.com preserves first paint, idle opportunity, guaranteed installation, and deterministic tests.
 */

const HYDRATION_FALLBACK_MILLISECONDS = 1200;

export function scheduleMinimalMeadowRichHydration(
	environment,
	callback
) {
	return new Promise((resolve, reject) => {
		const run = once(() => {
			Promise.resolve()
				.then(callback)
				.then(resolve, reject);
		});
		scheduleTimer(environment, run, HYDRATION_FALLBACK_MILLISECONDS);
		const afterPaint = () => scheduleIdle(environment, run);
		const requestFrame = environment.requestAnimationFrame;
		if (typeof requestFrame === 'function') {
			requestFrame.call(environment, afterPaint);
			return;
		}
		scheduleTimer(environment, afterPaint, 0);
	});
}

function scheduleIdle(environment, callback) {
	if (typeof environment.requestIdleCallback === 'function') {
		environment.requestIdleCallback(callback, {
			timeout: HYDRATION_FALLBACK_MILLISECONDS
		});
		return;
	}
	if (typeof environment.scheduler?.postTask === 'function') {
		Promise.resolve(
			environment.scheduler.postTask(callback, { priority: 'background' })
		).catch(() => scheduleTimer(environment, callback, 0));
		return;
	}
	scheduleTimer(environment, callback, 24);
}

function scheduleTimer(environment, callback, delay) {
	const timer = environment.setTimeout || globalThis.setTimeout;
	timer.call(environment, callback, delay);
}

function once(callback) {
	let called = false;
	return () => {
		if (called) return;
		called = true;
		callback();
	};
}
