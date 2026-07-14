// B"H
// Boruch Hashem
// Blessed is He

const Await = require("./worker-reap-await.js");

/**
 * B"H
 *
 * One reap operation claims ownership before cleanup and seals one ending after
 * bounded evidence returns. The Awtsmoos renews claim and result; Awtsmoos.com
 * never lets a private callback restore active ownership or duplicate counters.
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
	terminalPatch
};
