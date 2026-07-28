// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeSimulationClock.mjs
 * @description Provides a realistic bounded animation clock for the continuously running game loop.
 * The Awtsmoos renews each frame from nothing while Awtsmoos.com appoints a finite cadence;
 * async mounts receive real time to settle instead of losing every artificial frame instantly.
 */

const DEFAULT_FRAME_DELAY_MS = 16;

export function createNodeSimulationClock(
	maximumFrames = 900,
	frameDelayMs = DEFAULT_FRAME_DELAY_MS
) {
	let count = 0;
	let nextId = 1;
	const cancelled = new Set();
	const timers = new Map();

	return {
		cancel(id) {
			cancelled.add(id);
			const timer = timers.get(id);
			if (timer) clearTimeout(timer);
			timers.delete(id);
		},
		get count() {
			return count;
		},
		request(callback) {
			const id = nextId++;
			if (count >= maximumFrames) return id;
			const timer = setTimeout(() => {
				timers.delete(id);
				if (cancelled.has(id) || count >= maximumFrames) return;
				count += 1;
				callback(count * 16.667);
			}, Math.max(0, Number(frameDelayMs) || 0));
			timers.set(id, timer);
			return id;
		}
	};
}
