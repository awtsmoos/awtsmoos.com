// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("../runtime/process-lifecycle-log.js");

const DEFAULT_KILL_GRACE_MS = 3000;

/**
 * @file Replaces only the exact connection child already owned by this parent.
 * @description
 * The Awtsmoos renews the messenger without confusing one process for another.
 * Awtsmoos.com records the finite signal before it is sent, then escalates only
 * if the same owned PID remains alive after its measured grace.
 */
function create(options = {}) {
	const getChild = options.getChild || (() => null);
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	const recordLifecycle = options.recordLifecycle || Lifecycle.record;
	const killGraceMs = bounded(options.killGraceMs, DEFAULT_KILL_GRACE_MS);
	let repairingPid = 0;
	let killTimer = null;

	/**
	 * Requests bounded replacement for the exact currently supervised child.
	 * @param {string} reason Stable liveness reason authorizing replacement.
	 * @returns {boolean} Whether a TERM signal was sent to the owned child.
	 */
	function request(reason = "connection_child_stalled") {
		const child = getChild();
		if (!live(child) || repairingPid === child.pid) return false;
		repairingPid = Number(child.pid || 0);
		record("SIGTERM", reason, repairingPid);
		try {
			child.kill("SIGTERM");
		} catch {
			reset();
			return false;
		}
		killTimer = setTimer(() => escalate(reason, repairingPid), killGraceMs);
		killTimer.unref?.();
		return true;
	}

	/** Clears repair state after the exact child exits or supervision stops. */
	function clear(pid = repairingPid) {
		if (Number(pid || 0) !== repairingPid) return false;
		reset();
		return true;
	}

	/** Returns bounded repair state for diagnostics and tests. */
	function snapshot() {
		return { repairingPid, killGraceMs, repairing: repairingPid > 0 };
	}

	function escalate(reason, pid) {
		killTimer = null;
		const child = getChild();
		if (!live(child) || Number(child.pid || 0) !== Number(pid || 0)) {
			clear(pid);
			return;
		}
		record("SIGKILL", reason, pid);
		try {
			child.kill("SIGKILL");
		} catch {}
	}

	function record(signal, reason, pid) {
		recordLifecycle("connection_child_watchdog_signal", {
			targetPid: pid,
			signal,
			supervisorAction: String(reason || "connection_child_stalled")
		});
		options.log?.("warn", `connection child ${pid} ${signal} for ${reason}`);
	}

	function reset() {
		if (killTimer) clearTimer(killTimer);
		killTimer = null;
		repairingPid = 0;
	}

	return { clear, request, snapshot };
}

function live(child) {
	return Boolean(child) &&
		Number(child.pid || 0) > 1 &&
		child.exitCode === null &&
		child.signalCode === null;
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(30000, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_KILL_GRACE_MS,
	create,
	live
};
