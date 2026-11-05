// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialTestEnvironment.js
 * @description Gives essential-boot tests a deterministic monotonic clock and exactly observable timer custody.
 * The Awtsmoos makes every measured instant available to inspection; Awtsmoos.com can therefore prove silence deadlines
 * and hard horizons without sleeping real time or hiding timer replacement behind the host event loop.
 */

export function createEssentialTestEnvironment() {
	let currentTime = 0;
	let nextTimerId = 0;
	const timers = new Map();
	const environment = {
		clearedCount: 0,
		advance(milliseconds) {
			currentTime += milliseconds;
			return currentTime;
		},
		clearTimeout(timer) {
			if (timers.delete(timer)) environment.clearedCount += 1;
		},
		fireTimeout() {
			const timer = environment.activeTimer();
			if (!timer) throw new Error('Expected one active essential watchdog timer.');
			timers.delete(timer);
			timer.callback();
		},
		activeDelay() {
			return environment.activeTimer()?.delayMilliseconds ?? null;
		},
		activeTimer() {
			return [...timers.values()][0] || null;
		},
		performance: {
			now() {
				return currentTime;
			}
		},
		setTimeout(callback, delayMilliseconds) {
			const timer = {
				callback,
				delayMilliseconds,
				id: ++nextTimerId,
				unref() {}
			};
			timers.set(timer, timer);
			return timer;
		}
	};
	return environment;
}
