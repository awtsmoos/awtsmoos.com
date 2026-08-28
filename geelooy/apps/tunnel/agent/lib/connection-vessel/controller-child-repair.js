//B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("../runtime/process-lifecycle-log.js");
const RepairValues = require("./controller-child-repair-values.js");

/**
 * @file Replaces only the exact connection-child generation owned by this parent.
 * @description
 * The Awtsmoos renews each messenger without lending yesterday's PID to today's life.
 * Awtsmoos.com records TERM before force, while object identity guards the generation:
 * even if an operating system reuses one numeric PID, a delayed KILL cannot cross the gate.
 */
function create(options = {}) {
	const getChild = options.getChild || (() => null);
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	const recordLifecycle = options.recordLifecycle || Lifecycle.record;
	const killGraceMs = RepairValues.bounded(
		options.killGraceMs,
		RepairValues.DEFAULT_KILL_GRACE_MS
	);
	let repairingChild = null;
	let repairingPid = 0;
	let killTimer = null;

	/**
	 * Requests bounded replacement for the exact currently supervised child object.
	 * A changed child object is a new generation even when its numeric PID is reused.
	 * @param {string} reason Stable liveness reason authorizing replacement.
	 * @returns {boolean} Whether a TERM signal was sent to the owned child generation.
	 */
	function request(reason = "connection_child_stalled") {
		const child = getChild();
		if (!RepairValues.live(child)) return false;
		if (repairingChild === child) return false;
		if (repairingChild && repairingChild !== child) reset();
		repairingChild = child;
		repairingPid = Number(child.pid || 0);
		record("SIGTERM", reason, repairingPid);
		try {
			child.kill("SIGTERM");
		} catch {
			reset();
			return false;
		}
		const target = child;
		killTimer = setTimer(() => escalate(reason, target), killGraceMs);
		killTimer.unref?.();
		return true;
	}

	/** Clears repair state after the exact owned PID exits or supervision stops. */
	function clear(pid = repairingPid) {
		if (Number(pid || 0) !== repairingPid) return false;
		reset();
		return true;
	}

	/** Returns bounded repair state without exposing the child-process object itself. */
	function snapshot() {
		return {
			repairingPid,
			killGraceMs,
			repairing: Boolean(repairingChild)
		};
	}

	/** Escalates only when the same child object and PID remain the supervised generation. */
	function escalate(reason, target) {
		killTimer = null;
		const child = getChild();
		const sameGeneration = child === target && repairingChild === target;
		const samePid = Number(child?.pid || 0) === repairingPid;
		if (!sameGeneration || !samePid || !RepairValues.live(child)) {
			if (repairingChild === target) reset();
			return;
		}
		record("SIGKILL", reason, repairingPid);
		try {
			child.kill("SIGKILL");
		} catch {}
	}

	/** Persists lifecycle testimony before any destructive signal is attempted. */
	function record(signal, reason, pid) {
		recordLifecycle("connection_child_watchdog_signal", {
			targetPid: pid,
			signal,
			supervisorAction: String(reason || "connection_child_stalled")
		});
		options.log?.("warn", `connection child ${pid} ${signal} for ${reason}`);
	}

	/** Releases timer and exact-generation testimony together. */
	function reset() {
		if (killTimer) clearTimer(killTimer);
		killTimer = null;
		repairingChild = null;
		repairingPid = 0;
	}

	return { clear, request, snapshot };
}

module.exports = {
	DEFAULT_KILL_GRACE_MS: RepairValues.DEFAULT_KILL_GRACE_MS,
	create,
	live: RepairValues.live
};
