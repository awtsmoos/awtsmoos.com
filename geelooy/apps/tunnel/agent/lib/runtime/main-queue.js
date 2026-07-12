// B"H

/**
 * B"H — Admission is bounded by lane; retry and control retain a reserved road,
 * while queued requests emit proof that they remain alive.
 */
function createQueueRuntime(dependencies) {
	let scheduleDrain = () => {};

	function setScheduleDrain(callback) {
		scheduleDrain = callback;
	}

	function enqueueRequest(ws, raw) {
		const data = dependencies.routedData(raw);
		const item = { ws, data, enqueuedAt: Date.now(), queueKeepalive: null };
		const payload = data.payload;
		if (dependencies.retryControl.handleIngress(ws, data, payload)) return undefined;
		const lane = dependencies.Priority.laneOf(item);
		const currentStats = dependencies.stats();
		const gate = dependencies.Circuit.canAccept(
			lane,
			currentStats,
			dependencies.Circuit.DEFAULTS,
			payload
		);
		dependencies.streamEvent('action.received', payload, { lane });
		if (!gate.ok) return rejectCircuit(ws, data, payload, lane, gate, currentStats);
		if (!dependencies.Priority.canQueue(dependencies.state.lanes, lane, dependencies.Limits)) {
			return rejectFull(ws, data, payload, lane, currentStats);
		}
		dependencies.streamEvent('action.queued', payload, { lane });
		startQueueKeepalive(item, lane);
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		scheduleDrain();
		return undefined;
	}

	function rejectCircuit(ws, data, payload, lane, gate, currentStats) {
		const result = {
			ok: false,
			status: gate.status || 503,
			error: gate.reason || gate.error || 'circuit_rejected',
			lane,
			...gate,
			queueStats: currentStats
		};
		dependencies.retryControl.complete(data, payload, result);
		dependencies.streamEvent('action.error', payload, result);
		return dependencies.Send.safeSend(ws, {
			type: 'TUNNEL_RESPONSE', id: data.id,
			...dependencies.Correlation.fields(payload), ...result
		});
	}

	function rejectFull(ws, data, payload, lane, currentStats) {
		const error = lane === dependencies.Priority.LANES.P0
			? 'agent_control_queue_full'
			: 'agent_queue_full';
		const result = {
			ok: false,
			status: 429,
			error,
			lane,
			queueStats: currentStats,
			recovery: { retryAfterMs: 1000, instruction: 'Retry after queued work drains, or cancel stale workers.' }
		};
		dependencies.retryControl.complete(data, payload, result);
		dependencies.streamEvent('action.error', payload, result);
		return dependencies.Send.safeSend(ws, {
			type: 'TUNNEL_RESPONSE', id: data.id,
			...dependencies.Correlation.fields(payload), ...result
		});
	}

	function startQueueKeepalive(item, lane) {
		sendProgress(item.ws, item.data, lane, item.enqueuedAt, 'queued_waiting_for_lane', {
			queuePosition: estimateQueuePosition(lane), queued: true
		});
		item.queueKeepalive = setInterval(() => {
			if (!item.ws || !item.ws.opened) return clearQueueKeepalive(item);
			sendProgress(item.ws, item.data, lane, item.enqueuedAt, 'queued_waiting_for_lane', {
				queuePosition: estimateQueuePosition(lane), queued: true
			});
		}, dependencies.Limits.KEEPALIVE_MS);
		item.queueKeepalive.unref?.();
	}

	function sendProgress(ws, data, lane, enqueuedAt, phase, extra = {}) {
		const payload = dependencies.requestPayload(data);
		const queuedMs = Math.max(0, Date.now() - enqueuedAt);
		const progress = { lane, queuedMs, phase, ...extra };
		dependencies.retryControl.progress(data, payload, progress);
		dependencies.streamEvent('action.progress', payload, { ...progress, message: phase });
		dependencies.Send.safeSend(ws, {
			type: 'TUNNEL_PROGRESS', id: data.id,
			...dependencies.Correlation.fields(payload),
			action: payload.action || 'unknown', ok: true, phase, lane, queuedMs,
			stillRunning: true, longLivedConnection: true,
			keepAliveMs: dependencies.Limits.KEEPALIVE_MS,
			message: 'B"H: request is still alive; the tunnel keeps the sight-line open.',
			queueStats: dependencies.stats(), ...extra
		});
	}

	function clearQueueKeepalive(item) {
		if (!item?.queueKeepalive) return;
		clearInterval(item.queueKeepalive);
		item.queueKeepalive = null;
	}

	function estimateQueuePosition(lane) {
		return (dependencies.state.lanes[lane]?.queue || []).length + 1;
	}

	function nextLane() {
		for (const lane of dependencies.Priority.LANE_ORDER) {
			if (dependencies.Priority.canStartLane(dependencies.state.lanes, lane, dependencies.Limits)) return lane;
		}
		return '';
	}

	return { clearQueueKeepalive, enqueueRequest, nextLane, sendProgress, setScheduleDrain };
}

module.exports = { createQueueRuntime };
