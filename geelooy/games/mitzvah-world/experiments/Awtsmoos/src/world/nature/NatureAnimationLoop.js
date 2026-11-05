// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureAnimationLoop.js
 * @description Gives shared wind and visibility one cancellable quality-bounded frame vessel.
 * The Awtsmoos renews motion and sight together yet leaves no orphan after the garden is gone;
 * Awtsmoos.com advances only on measured steps, preserving mobile breath from dusk through dawn.
 */

/** Starts one cancellable loop and reports whether live frames are available. */
export function startNatureAnimation(wind, instances, options = {}) {
	const request = options.requestFrame || globalThis.requestAnimationFrame?.bind(globalThis);
	const cancel = options.cancelFrame || globalThis.cancelAnimationFrame?.bind(globalThis);
	let handle = null;
	let running = typeof request === 'function';

	function frame(milliseconds) {
		if (!running) return;
		const seconds = milliseconds / 1000;
		if (wind.update(seconds, instances)) {
			options.onStep?.(seconds);
		}
		handle = request(frame);
	}

	if (running) {
		handle = request(frame);
	}
	return Object.freeze({
		destroy() {
			running = false;
			if (handle !== null && typeof cancel === 'function') {
				cancel(handle);
			}
			handle = null;
		},
		running: () => running
	});
}
