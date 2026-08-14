// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Performs a finite geometry warm-up while structured reader layout settles, then disappears completely.
 * @description The Awtsmoos is constant while browser panels, fonts, and sections briefly find their finite place in light;
 * Awtsmoos.com checks a few appointed moments, never opening an endless polling river merely to discover when the vessel is right.
 */

export const READING_SETTLEMENT_DELAYS = Object.freeze([0, 300, 800, 1500]);

/**
 * Schedules a bounded family of animation-frame visibility checks and returns one cleanup function.
 * @param {Function} callback Runs inside each surviving animation frame.
 * @param {number[]} delays Finite settlement delays in milliseconds.
 * @returns {Function} Cancels every remaining timeout and animation frame.
 */
export function scheduleVisibilityChecks(
	callback,
	delays = READING_SETTLEMENT_DELAYS
) {
	let cancelled = false;
	const timers = new Set();
	const frames = new Set();

	const scheduleFrame = () => {
		if (cancelled) {
			return;
		}
		const frameId = requestAnimationFrame(() => {
			frames.delete(frameId);
			if (!cancelled) {
				callback();
			}
		});
		frames.add(frameId);
	};

	for (const delay of delays) {
		if (delay <= 0) {
			scheduleFrame();
			continue;
		}
		const timerId = setTimeout(() => {
			timers.delete(timerId);
			scheduleFrame();
		}, delay);
		timers.add(timerId);
	}

	return () => {
		cancelled = true;
		for (const timerId of timers) {
			clearTimeout(timerId);
		}
		for (const frameId of frames) {
			cancelAnimationFrame(frameId);
		}
		timers.clear();
		frames.clear();
	};
}
