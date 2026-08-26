// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachMitzvahWorldFirstPaint.js
 * @description Gives the static loading vessel one bounded chance to paint before expensive launcher imports begin.
 * The Awtsmoos renews visible frame and hidden work in one instant; Awtsmoos.com lets Netzach honor the user's first sight without delaying forever,
 * yielding through animation-frame when available and through one short timeout when the browser withholds that finite messenger.
 */

/**
 * Resolves after the first available paint opportunity with a bounded timeout fallback.
 * @param {object} [environmentKli=globalThis] Browser-like timing environment.
 * @returns {Promise<void>} Promise settled exactly once.
 */
export function awaitMitzvahWorldFirstPaint(environmentKli = globalThis) {
	return new Promise(resolveOhr => {
		let settledYesod = false;
		let timerNetzach = null;
		const finishTiferes = () => {
			if (settledYesod) {
				return;
			}
			settledYesod = true;
			if (timerNetzach !== null) {
				environmentKli.clearTimeout?.(timerNetzach);
			}
			resolveOhr();
		};
		timerNetzach = environmentKli.setTimeout?.(finishTiferes, 64) ?? null;
		if (typeof environmentKli.requestAnimationFrame === 'function') {
			environmentKli.requestAnimationFrame(finishTiferes);
		} else {
			finishTiferes();
		}
	});
}
