// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns admission pressure and queue expiry into explicit terminal evidence.
 * @description
 * The Awtsmoos never lets a waiting deed vanish. Awtsmoos.com distinguishes one
 * requester's private saturation from machine pressure, so a crowded agent learns
 * to slow itself without making neighboring shluchim believe the whole tunnel failed.
 */
function createQueueRejection(dependencies) {
	function circuit(ws, data, payload, lane, gate, currentStats) {
		const result = {
			ok: false,
			status: gate.status || 503,
			error: gate.reason || gate.error || "circuit_rejected",
			lane,
			...gate,
			queueStats: currentStats
		};
		return finish(ws, data, payload, result);
	}

	function full(ws, data, payload, lane, currentStats, gate = {}) {
		const requesterFull = gate.reason === "requester_queue_full";
		const error = requesterFull
			? "requester_queue_full"
			: laneError(dependencies, lane);
		return finish(ws, data, payload, {
			ok: false,
			status: 429,
			error,
			lane,
			queueScope: requesterFull ? "requester" : "machine",
			requesterQueued: gate.requesterQueued,
			requesterLimit: gate.requesterLimit,
			queueStats: currentStats,
			recovery: {
				retryAfterMs: requesterFull ? 250 : 1000,
				instruction: requesterFull
					? "Wait for this requester's queued work to drain or cancel its stale work."
					: "Retry after machine queue pressure drains; control and cancellation remain reserved."
			}
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
			recovery: {
				retryAfterMs: 250,
				instruction: "Retry as a fresh request; this queued custody was terminalized before execution began."
			}
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

	return { circuit, expired, full };
}

function laneError(dependencies, lane) {
	if (lane === dependencies.Priority.LANES.P0) return "agent_control_queue_full";
	if (lane === dependencies.Priority.LANES.P0_WAIT) return "agent_wait_queue_full";
	if (lane === dependencies.Priority.LANES.P0_OBSERVE) return "agent_observe_queue_full";
	return "agent_queue_full";
}

module.exports = { createQueueRejection };
