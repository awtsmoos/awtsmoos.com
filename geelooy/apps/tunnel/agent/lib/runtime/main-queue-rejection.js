// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Returns explicit admission semantics for pressure, identity, and expiry.
 * @description
 * The Awtsmoos knows each deed by its true name. Awtsmoos.com therefore never
 * invents an anonymous shliach, never hides whether custody was accepted, and
 * never turns an observation failure into permission to repeat a mutation.
 */
function createQueueRejection(dependencies) {
	function circuit(ws, data, payload, lane, gate, currentStats) {
		return finish(ws, data, payload, {
			ok: false,
			status: gate.status || 503,
			error: gate.reason || gate.error || "circuit_rejected",
			lane,
			acceptanceState: "NOT_ACCEPTED",
			safeToRetry: true,
			...gate,
			queueStats: currentStats
		});
	}

	function identity(ws, data, payload, error) {
		return finish(ws, data, payload, {
			ok: false,
			status: 400,
			error: "invalid_request_identity",
			code: error?.code || "INVALID_REQUEST_IDENTITY",
			missingFields: error?.missingFields || [],
			acceptanceState: "NOT_ACCEPTED",
			safeToRetry: true
		});
	}

	function full(ws, data, payload, lane, currentStats, gate = {}) {
		const requesterFull = gate.reason === "requester_queue_full";
		return finish(ws, data, payload, {
			ok: false,
			status: 429,
			error: requesterFull ? "requester_queue_full" : laneError(dependencies, lane),
			lane,
			queueScope: requesterFull ? "requester" : "machine",
			requesterQueued: gate.requesterQueued,
			requesterLimit: gate.requesterLimit,
			acceptanceState: "NOT_ACCEPTED",
			safeToRetry: true,
			queueStats: currentStats
		});
	}

	function expired(item, lane, queuedMs) {
		const payload = dependencies.requestPayload(item.data);
		return finish(item.ws, item.data, payload, {
			ok: false,
			status: 503,
			error: "agent_queue_wait_expired",
			lane,
			queuedMs: Math.max(0, Number(queuedMs || 0)),
			consumerStarted: false,
			queueWaitExpired: true,
			acceptanceState: "ACCEPTED",
			safeToRetry: false,
			reconciliationRequired: true
		});
	}

	function finish(ws, data, payload, result) {
		dependencies.retryControl.complete(data, payload, result);
		dependencies.streamEvent("action.error", payload, result);
		return dependencies.Send.safeSend(ws, {
			type: "TUNNEL_RESPONSE",
			id: data.id,
			...dependencies.Correlation.fields(payload),
			...result
		});
	}

	return {
		circuit,
		expired,
		full,
		identity
	};
}

function laneError(dependencies, lane) {
	if (lane === dependencies.Priority.LANES.P0) return "agent_control_queue_full";
	if (lane === dependencies.Priority.LANES.P0_WAIT) return "agent_wait_queue_full";
	if (lane === dependencies.Priority.LANES.P0_OBSERVE) return "agent_observe_queue_full";
	return "agent_queue_full";
}

module.exports = { createQueueRejection };
