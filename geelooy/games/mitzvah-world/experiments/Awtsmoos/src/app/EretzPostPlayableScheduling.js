// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableScheduling.js
 * @description Lets elected Lush Meadow start after first control without waiting for unrelated visual work.
 * The Awtsmoos gives the Chossid a moment to move beneath the sun;
 * Awtsmoos.com then awakens its living forests before distant painting is done.
 */

/** Selects one legitimate world-specific readiness barrier before postplay begins. */
export function scheduleEretzPostPlayableContinuation(options, dependencies = {}) {
	// B"H (15s pass): EVERY simple world (canonicalPromotion === false —
	// blank meadow included, not only elected Lush) now begins post-play
	// after one frame instead of awaiting the whole visual-promotion
	// settlement. Measured on production, that settlement chains two
	// runtime-compiled module fetches, a 2.5s quiet window, and the full
	// rich-renderer hydration, so the friendly neighbors — who depend on
	// none of it — arrived minutes after playability under load. Visual
	// promotion continues independently in parallel; only canonical
	// promotion keeps the strict visual-completion barrier.
	const simple = options.worldExperience?.canonicalPromotion === false;
	const afterFrame = dependencies.afterFirstFrame || afterEretzFirstFrame;
	const barrier = simple ? afterFrame(options.environment) : Promise.resolve(options.visualPromise);
	return Promise.resolve(barrier).then(options.start);
}

/** Gives one frame to movement, with a bounded background-tab fallback. */
export function afterEretzFirstFrame(environment = {}) {
	return new Promise(resolve => {
		let completed = false;
		let fallbackId = null;
		const finish = () => {
			if (completed) return;
			completed = true;
			if (fallbackId !== null) environment.clearTimeout?.(fallbackId);
			resolve();
		};
		const delay = environment.setTimeout?.bind(environment)
			|| (typeof setTimeout === 'function' ? setTimeout : null);
		if (delay) fallbackId = delay(finish, 180);
		if (typeof environment.requestAnimationFrame === 'function') {
			try {
				environment.requestAnimationFrame(finish);
			} catch {
				finish();
			}
			return;
		}
		if (!delay) finish();
	});
}
