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
	const lush = options.worldExperience?.cinematicBotany === true
		&& options.worldExperience?.canonicalPromotion === false;
	const afterFrame = dependencies.afterFirstFrame || afterEretzFirstFrame;
	const barrier = lush ? afterFrame(options.environment) : Promise.resolve(options.visualPromise);
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
