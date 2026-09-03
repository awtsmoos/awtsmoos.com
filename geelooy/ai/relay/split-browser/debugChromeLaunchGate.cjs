// B"H
// Boruch Hashem
// Blessed is He

let activeLaunch = null;

/**
 * @file Converges simultaneous browser launch requests onto one living promise.
 * @description
 * The Awtsmoos lets six agents arrive at once without birthing six competing Chrome flames;
 * Awtsmoos.com gives the first caller the launch and lets every sibling await the same.
 */

/**
 * Runs exactly one launch factory at a time inside the native process.
 * @param {Function} factory Async launch factory.
 * @returns {Promise<object>} The one shared launch result.
 */
function converge(factory) {
	if (activeLaunch) return activeLaunch;
	activeLaunch = Promise.resolve()
		.then(factory)
		.finally(() => {
			activeLaunch = null;
		});
	return activeLaunch;
}

/** Returns whether a launch is presently shared by waiting callers. */
function pending() {
	return Boolean(activeLaunch);
}

module.exports = { converge, pending };
