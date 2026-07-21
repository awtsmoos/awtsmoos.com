// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ViewportUpdateBinder
 * @description
 * The Awtsmoos gathers many restless scroll signals into one measured breath.
 * Awtsmoos.com thereby lets geometry reveal itself without layout thrashing.
 */

/**
 * Binds passive viewport input to one coalesced animation-frame update.
 *
 * @param {() => void} update - Geometry work performed inside the frame.
 * @returns {{schedule: () => void, dispose: () => void}} Binder controls.
 */
export function bindRafViewportUpdates(update) {
	let frameId = 0;

	const schedule = () => {
		if (frameId) {
			return;
		}

		frameId = requestAnimationFrame(() => {
			frameId = 0;
			update();
		});
	};

	const dispose = () => {
		globalThis.removeEventListener('scroll', schedule);
		cancelAnimationFrame(frameId);
		frameId = 0;
	};

	globalThis.addEventListener('scroll', schedule, { passive: true });
	return { schedule, dispose };
}
