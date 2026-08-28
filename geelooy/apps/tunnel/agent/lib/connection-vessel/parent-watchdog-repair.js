//B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("../runtime/process-lifecycle-log.js");

/**
 * @file Signals only the exact parent identity named by durable repair authority.
 * @description
 * The Awtsmoos recreates each life beyond the shell of a recycled PID;
 * Awtsmoos.com requires a durable claim before TERM or KILL may ever be bid.
 * Fresh health or changed identity closes Gevurah's gate and keeps force safely hid.
 */
function create(options = {}) {
	const parentPid = Number(options.parentPid || process.ppid || 0);
	const identity = options.identity;
	const signalParent = options.signalParent || process.kill.bind(process);
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	const recordLifecycle = options.recordLifecycle || Lifecycle.record;
	const killGraceMs = bounded(options.killGraceMs, 5000, 1000);
	let repairing = false;
	let reason = "";
	let timer = null;
	let targetIdentity = null;

	/** Starts TERM only from an allowed durable exact-identity claim. */
	function request(nextReason, claim = null) {
		if (repairing || parentPid <= 1 || !identity) return false;
		const claimedIdentity = claim?.allowed === true
			? claim.identity
			: null;
		if (!claimedIdentity || identity.matches?.(claimedIdentity) !== true) return false;
		repairing = true;
		reason = String(nextReason || "execution_parent_repair");
		targetIdentity = { ...claimedIdentity };
		if (!signal("SIGTERM")) {
			resetState();
			return false;
		}
		timer = setTimer(escalate, killGraceMs);
		timer?.unref?.();
		return true;
	}

	/** Escalates only while the same generation and process birth still exist. */
	function escalate() {
		timer = null;
		if (!repairing || !targetIdentity) return;
		if (identity.matches?.(targetIdentity) !== true) {
			recordLifecycle("watchdog_signal_cancelled", lifecycle("SIGKILL", "identity_changed"));
			resetState();
			return;
		}
		signal("SIGKILL");
		resetState();
	}

	/** Cancels delayed force whenever current evidence no longer authorizes repair. */
	function clear() {
		if (timer) clearTimer(timer);
		resetState();
	}

	/** Records intent before force, then signals only the claimed PID. */
	function signal(signalName) {
		recordLifecycle("watchdog_signal_requested", lifecycle(signalName));
		try {
			signalParent(targetIdentity.parentPid, signalName);
			return true;
		} catch {
			return false;
		}
	}

	/** Builds lifecycle evidence without persisting the full process birth token. */
	function lifecycle(signalName, cancellationReason = "") {
		return {
			targetPid: targetIdentity?.parentPid || parentPid,
			generation: targetIdentity?.generation || 0,
			signal: signalName,
			supervisorAction: reason,
			cancellationReason
		};
	}

	function resetState() {
		repairing = false;
		reason = "";
		targetIdentity = null;
		timer = null;
	}

	function snapshot() {
		return {
			parentPid,
			repairing,
			repairReason: reason,
			repairGeneration: targetIdentity?.generation || 0,
			killGraceMs
		};
	}

	return { clear, request, snapshot };
}

function bounded(value, fallback, minimum = 5000) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(300000, Math.floor(number)))
		: fallback;
}

module.exports = { bounded, create };
