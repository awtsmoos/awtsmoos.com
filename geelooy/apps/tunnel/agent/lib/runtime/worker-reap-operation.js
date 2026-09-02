// B"H
// Boruch Hashem
// Blessed is He

const Await = require("./worker-reap-await.js");
const Preflight = require("./worker-reap-preflight.js");

/**
 * @file Claims and finalizes worker cleanup after stale-only preflight permits custody to move.
 * @description
 * The Awtsmoos lets each destructive transition wait for present testimony at its gate;
 * Awtsmoos.com preserves the established reap covenant while stale suspicion first consults fate.
 * Timeout and cancellation keep their authority, and terminal projection remains one faithful shore.
 */
function createReapOperation(options = {}) {
	const {
		registry,
		state,
		reapTimeoutMs
	} = options;

	return async function reapWorker(workerId, request = {}) {
		const reason = request.reason || "worker_reap_requested";
		const status = request.status || "cancelled";
		const deferred = await Preflight.preflightStale(
			registry,
			workerId,
			request,
			status,
			reason
		);
		if (deferred) {
			return deferred;
		}
		const claimed = registry.claimReap(workerId, {
			reapReason: reason,
			reapRequestedStatus: status
		});
		if (!claimed.claimed) {
			return {
				ok: true,
				claimed: false,
				record: claimed.record
			};
		}
		state.totalReaped += 1;
		state.lastReapAt = new Date().toISOString();
		const outcome = await invokeControl(
			claimed.control,
			request,
			reason,
			status,
			reapTimeoutMs
		);
		if (outcome.timedOut) {
			state.totalTimeouts += 1;
		}
		return {
			ok: outcome.ok,
			claimed: true,
			outcome,
			record: registry.finishWorker(
				workerId,
				terminalPatch(status, reason, outcome)
			)
		};
	};
}

/** Invokes the established private cleanup contract through the bounded deadline vessel. */
function invokeControl(control, request, reason, status, timeoutMs) {
	if (typeof control?.reap !== "function") {
		return Promise.resolve({
			ok: false,
			timedOut: false,
			error: "worker_reap_control_missing"
		});
	}
	return Await.settleWithin(() => control.reap({
		...request,
		reason,
		status
	}), timeoutMs);
}

/** Preserves the established terminal cleanup/result projection used by registry telemetry. */
function terminalPatch(requestedStatus, reason, outcome) {
	const result = outcome.result || {};
	const state = outcome.ok
		? result.status || requestedStatus
		: "cleanup_failed";
	return {
		...result,
		state,
		reaping: false,
		reaped: true,
		reapReason: reason,
		reapFinishedAt: new Date().toISOString(),
		reapTimedOut: outcome.timedOut === true,
		error: outcome.ok
			? result.error
			: outcome.error
	};
}

module.exports = {
	createReapOperation,
	invokeControl,
	preflightStale: Preflight.preflightStale,
	terminalPatch
};
