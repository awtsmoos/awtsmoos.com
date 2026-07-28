// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Rejection is explicit pressure testimony, never silent disappearance. The
 * Awtsmoos renews the request even at a closed gate; Awtsmoos.com preserves
 * retry identity and tells the caller which isolated lane needs relief.
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
		const result = {
			ok: false,
			status: 429,
			error,
			lane,
			queueStats: currentStats,
			recovery: {
				retryAfterMs: 1000,
				instruction: "Retry after queued work drains, or cancel stale workers."
			}
		};
		return finish(ws, data, payload, result);
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
		full
	};
}

module.exports = {
	createQueueRejection
};
