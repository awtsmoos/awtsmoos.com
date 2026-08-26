// B"H
// Boruch Hashem
// Blessed is He

const ChildLiveness = require("./controller-child-liveness.js");

/**
 * @file Owns the periodic clock that converts child liveness testimony into repair requests.
 * @description
 * The Awtsmoos renews every moment without confusing the clock with the judge.
 * Awtsmoos.com keeps cadence here, while liveness decides and exact repair acts elsewhere,
 * so timing machinery cannot silently grow into another process-kill authority.
 */
function create(options = {}) {
	let timer = null;
	const setIntervalFn = options.setIntervalFn || setInterval;
	const clearIntervalFn = options.clearIntervalFn || clearInterval;

	/** Inspects one child-liveness witness and delegates only an authorized restart reason. */
	function inspect() {
		if (!options.getChild?.() || options.isStopping?.()) return false;
		const report = options.liveness.inspect();
		if (!report.shouldRestart) return false;
		return options.repair.request(report.reason);
	}

	/** Arms one unrefed watchdog timer for the supervisor lifetime. */
	function start() {
		if (timer) return false;
		const intervalMs = Number(
			options.liveness.status().checkMs || ChildLiveness.DEFAULT_CHECK_MS
		);
		timer = setIntervalFn(inspect, intervalMs);
		timer.unref?.();
		return true;
	}

	/** Clears the watchdog timer without touching child or repair state. */
	function stop() {
		if (!timer) return false;
		clearIntervalFn(timer);
		timer = null;
		return true;
	}

	/** Returns whether this cadence vessel is presently armed. */
	function status() {
		return { running: Boolean(timer) };
	}

	return { inspect, start, status, stop };
}

module.exports = { create };
