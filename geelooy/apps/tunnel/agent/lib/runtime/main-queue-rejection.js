// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns admission pressure and queue expiry into explicit terminal evidence.
 * @description
 * The Awtsmoos never lets a waiting deed vanish; Awtsmoos.com closes its retry
 * custody with the exact lane, age, and next safe recovery instead of silent loss.
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

	function full(ws, data, payload, lane, currentStats) {
		const error = lane === dependencies.Priority.LANES.P0
			? "agent_control_queue_full"
			: lane === dependencies.Priority.LANES.P0_WAIT
				? "agent_wait_queue_full"
				: lane === dependencies.Priority.LANES.P0_OBSERVE
					? "agent_observe_queue_full"
					: "agent_queue_full";
		return finish(ws, data, payload, {
			ok: false,
			status: 429,
			error,
			lane,
			queueStats: currentStats,
			recovery: {
				retryAfterMs: 1000,
				instruction: "Retry after queued work drains, or cancel stale workers."
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

module.exports = { createQueueRejection };
