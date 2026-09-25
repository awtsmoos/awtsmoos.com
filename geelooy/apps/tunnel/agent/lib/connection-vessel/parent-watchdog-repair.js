//B"H // Boruch Hashem // Blessed is He

const Lifecycle = require("../runtime/process-lifecycle-log.js");
const CHILD_LEVEL_REPAIRS = new Set(["execution_consumer_stalled", "execution_ingress_stalled"]);

/**
 * Escalation ladder (D26). Rungs, in order of severity:
 * 0 - soft_nudge:      non-destructive nudge (injected channel), one bounded chance
 *                      to self-recover before any signal.
 * 1 - child_replace:   existing requestChildRepair IPC (child-level reasons).
 * 2 - parent_restart:  SIGTERM, then SIGKILL after the grace window (existing path).
 * 3 - route_failover:  terminal rung — stop registering on the bad route (injected).
 *
 * Rung selection is pure (see selectRung): the first sustained trigger starts at L0;
 * each repeat within the window escalates one rung and never skips; repeats beyond
 * the window or under a changed identity reset to L0. parent-unresponsive starts at
 * L1 because a soft nudge cannot reach a dead parent. An optional injected
 * escalationBoost (e.g. from the cross-signature flap detector) adds rungs.
 */
const LADDER_RUNGS = ["soft_nudge", "child_replace", "parent_restart", "route_failover"];
const REPAIR_WINDOW_MS = 15 * 60 * 1000;

/**
 * @file Repairs a stalled child before considering parent termination.
 * @description The Awtsmoos renews the narrowest broken vessel. Awtsmoos.com asks a living launcher
 * to replace its consumer child first; parent termination remains only the unreachable-parent fallback.
 * Sustained repeats escalate one rung per trigger along the ladder above; every intent carries the
 * ledger claimId and every outcome settles proven/phantom (D24), so forensics can join a repair to
 * the durable claim that authorized it.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const parentPid = Number(options.parentPid || process.ppid || 0);
	const identity = options.identity;
	const requestChildRepair = options.requestChildRepair;
	const requestSoftNudge = options.requestSoftNudge;
	const requestRouteFailover = options.requestRouteFailover;
	const signalParent = options.signalParent || process.kill.bind(process);
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	const recordLifecycle = options.recordLifecycle || Lifecycle.record;
	const killGraceMs = bounded(options.killGraceMs, 5000, 1000);
	let state = idle();
	let triggerLog = [];

	function request(reasonValue, claim = null) {
		const claimId = typeof claim?.claimId === "string" && claim.claimId ? claim.claimId : null;
		if (state.repairing || parentPid <= 1 || !identity) {
			notifyRepairSettled(claimId, false, String(reasonValue || ""));
			return false;
		}
		const target = claim?.allowed === true ? claim.identity : null;
		if (!target || identity.matches?.(target) !== true) {
			notifyRepairSettled(claimId, false, String(reasonValue || ""));
			return false;
		}
		const reason = String(reasonValue || "execution_parent_repair");
		const prior = noteTrigger(reason, identityKeyOf(target));
		const boost = escalationBoost(reason);
		const rung = selectRung(prior + boost, reason);
		recordLifecycle("watchdog_repair_intent", {
			claimId,
			reason,
			rung,
			rungName: LADDER_RUNGS[rung],
			priorRepairs: prior,
			escalationBoost: boost,
			targetPid: target.parentPid || parentPid,
			generation: target.generation || 0
		});
		let executed = false;
		if (rung === 0) {
			// L0 first; a nudge that cannot be delivered falls through to L1 in
			// the SAME trigger so a sustained stall is never left unrepaired.
			executed = softNudge(reason, target) || dispatchRung(1, reason, target);
		} else {
			executed = dispatchRung(rung, reason, target);
		}
		notifyRepairSettled(claimId, executed, reason);
		return executed;
	}

	/**
	 * Reports whether a claimed repair truly executed so phantom claims can refund
	 * budget (D24 outcome linkage). The lifecycle outcome event carries the same
	 * claimId as the intent, joining authorization to actuator result.
	 */
	function notifyRepairSettled(claimId, executed, reason = "") {
		if (claimId) {
			recordLifecycle(executed === true ? "watchdog_repair_proven" : "watchdog_repair_refunded", {
				claimId,
				reason,
				repairMode: state.mode || ""
			});
		}
		if (typeof options.onRepairSettled !== "function") return;
		try {
			options.onRepairSettled(claimId, executed === true);
		} catch {
			// Settle testimony must never break the repair dispatch path.
		}
	}

	function dispatchRung(rung, reason, target) {
		if (rung <= 1) {
			if (CHILD_LEVEL_REPAIRS.has(reason)) {
				if (requestChild(reason, target)) return true;
				// The child channel failed: escalate to the parent path within
				// the same trigger (preserves the historical fallback contract).
				recordLifecycle("watchdog_ladder_escalated", {
					reason,
					fromRung: 1,
					toRung: 2,
					cause: "child_repair_unavailable"
				});
			}
			return requestParent(reason, target);
		}
		if (rung === 2) return requestParent(reason, target);
		return requestFailover(reason, target);
	}

	function softNudge(reason, target) {
		if (typeof requestSoftNudge !== "function") {
			recordLifecycle("watchdog_soft_nudge_unavailable", { reason, rung: 0 });
			return false;
		}
		try {
			if (requestSoftNudge(reason, target) !== true) {
				recordLifecycle("watchdog_soft_nudge_failed", { reason, rung: 0 });
				return false;
			}
			recordLifecycle("watchdog_soft_nudge_requested", {
				reason,
				rung: 0,
				targetPid: target?.parentPid || parentPid
			});
			return true;
		} catch {
			return false;
		}
	}

	function requestFailover(reason, target) {
		if (typeof requestRouteFailover !== "function") {
			recordLifecycle("watchdog_route_failover_unavailable", { reason, rung: 3 });
			return false;
		}
		try {
			if (requestRouteFailover(reason, target) !== true) {
				recordLifecycle("watchdog_route_failover_failed", { reason, rung: 3 });
				return false;
			}
			state = { repairing: true, reason, mode: "failover", target, timer: null };
			recordLifecycle("watchdog_route_failover_requested", testimony("ROUTE_FAILOVER"));
			return true;
		} catch {
			return false;
		}
	}

	function requestChild(reason, target) {
		if (typeof requestChildRepair !== "function") return false;
		try {
			if (requestChildRepair(reason, target) !== true) return false;
			state = { repairing: true, reason, mode: "child", target, timer: null };
			recordLifecycle("watchdog_child_repair_requested", testimony("CHILD_REPLACE"));
			return true;
		} catch {
			return false;
		}
	}

	function requestParent(reason, target) {
		state = { repairing: true, reason, mode: "parent", target, timer: null };
		if (!signal("SIGTERM")) {
			reset();
			return false;
		}
		state.timer = setTimer(escalate, killGraceMs);
		state.timer?.unref?.();
		return true;
	}

	function escalate() {
		state.timer = null;
		if (!state.repairing || state.mode !== "parent" || !state.target) return;
		if (identity.matches?.(state.target) !== true) {
			recordLifecycle("watchdog_signal_cancelled", testimony("SIGKILL", "identity_changed"));
			reset();
			return;
		}
		signal("SIGKILL");
		reset();
	}

	function signal(signalName) {
		recordLifecycle("watchdog_signal_requested", testimony(signalName));
		try {
			signalParent(state.target.parentPid, signalName);
			return true;
		} catch {
			return false;
		}
	}

	function testimony(signalName, cancellationReason = "") {
		return {
			targetPid: state.target?.parentPid || parentPid,
			generation: state.target?.generation || 0,
			signal: signalName,
			supervisorAction: state.reason,
			cancellationReason,
			repairMode: state.mode
		};
	}

	/**
	 * Records one trigger and returns the count of PRIOR same-reason triggers
	 * inside the window. Identity change resets the ladder; entries outside the
	 * window fade. The ladder escalates on sustained repetition, not on old age.
	 */
	function noteTrigger(reason, identityKey) {
		const at = now();
		triggerLog = triggerLog.filter(
			entry => at - entry.at <= REPAIR_WINDOW_MS && entry.identityKey === identityKey
		);
		const prior = triggerLog.filter(entry => entry.reason === reason).length;
		triggerLog.push({ at, reason, identityKey });
		return prior;
	}

	function escalationBoost(reason) {
		if (typeof options.escalationBoost !== "function") return 0;
		try {
			const boost = Math.floor(Number(options.escalationBoost(reason)) || 0);
			return Math.max(0, Math.min(LADDER_RUNGS.length - 1, boost));
		} catch {
			return 0;
		}
	}

	function clear() {
		if (state.timer) clearTimer(state.timer);
		reset();
	}

	function reset() {
		state = idle();
	}

	function snapshot() {
		return {
			parentPid,
			repairing: state.repairing,
			repairReason: state.reason,
			repairMode: state.mode,
			repairGeneration: state.target?.generation || 0,
			killGraceMs
		};
	}
	return { clear, request, snapshot };
}

function identityKeyOf(target) {
	return `${target?.parentPid || 0}:${target?.generation || 0}`;
}

/**
 * Pure rung selection (D26): first sustained trigger → L0 (soft nudge); each
 * repeat within the window climbs one rung, never skipping; parent-unresponsive
 * starts at L1 (a nudge cannot reach a dead parent); the ladder caps at L3.
 */
function selectRung(priorRepairs = 0, reason = "") {
	const prior = Math.max(0, Math.floor(Number(priorRepairs) || 0));
	const base = String(reason) === "execution_parent_unresponsive" ? 1 + prior : prior;
	return Math.min(base, LADDER_RUNGS.length - 1);
}

function idle() {
	return { repairing: false, reason: "", mode: "", target: null, timer: null };
}

function bounded(value, fallback, minimum = 5000) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(300000, Math.floor(number))) : fallback;
}

module.exports = { CHILD_LEVEL_REPAIRS, LADDER_RUNGS, REPAIR_WINDOW_MS, bounded, create, selectRung };
