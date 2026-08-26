// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns bounded connection-child restart backoff independently of child repair.
 * @description
 * The Awtsmoos recreates a messenger with measured patience rather than frantic loops.
 * Awtsmoos.com keeps restart time, count, and cancellation in one vessel so child birth
 * and exact repair can remain concerned with identity instead of loose timer bookkeeping.
 */
function create(options = {}) {
	const setTimeoutFn = options.setTimeoutFn || setTimeout;
	const clearTimeoutFn = options.clearTimeoutFn || clearTimeout;
	const maximumDelayMs = Math.max(1000, Number(options.maximumDelayMs || 5000));
	let timer = null;
	let count = 0;

	/** Schedules one exponentially backed-off restart and replaces no existing timer. */
	function schedule() {
		if (timer) return false;
		count += 1;
		const delay = Math.min(maximumDelayMs, 250 * 2 ** Math.min(count, 7));
		timer = setTimeoutFn(() => {
			timer = null;
			options.start();
		}, delay);
		timer.unref?.();
		return true;
	}

	/** Resets failure history after successful registration without touching a live timer. */
	function reset() {
		count = 0;
	}

	/** Cancels future restart work while preserving no hidden timer reference. */
	function stop() {
		if (timer) clearTimeoutFn(timer);
		timer = null;
	}

	/** Returns bounded restart bookkeeping for controller diagnostics. */
	function status() {
		return {
			count,
			pending: Boolean(timer)
		};
	}

	return { reset, schedule, status, stop };
}

module.exports = { create };
