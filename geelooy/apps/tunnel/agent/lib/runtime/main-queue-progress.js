// B"H

/**
 * B"H — Progress receipts keep queued work visible without owning admission or
 * dispatch. The timer is bounded, unreferenced, and released before execution.
 */
function createQueueProgress(dependencies) {
	function start(item, lane) {
		send(item.ws, item.data, lane, item.enqueuedAt, 'queued_waiting_for_lane', {
			queuePosition: estimatePosition(lane),
			queued: true
		});
		item.queueKeepalive = setInterval(() => {
			if (!item.ws || !item.ws.opened) return clear(item);
			send(item.ws, item.data, lane, item.enqueuedAt, 'queued_waiting_for_lane', {
				queuePosition: estimatePosition(lane),
				queued: true
			});
		}, dependencies.Limits.KEEPALIVE_MS);
		item.queueKeepalive.unref?.();
	}

	function send(ws, data, lane, enqueuedAt, phase, extra = {}) {
		const payload = dependencies.requestPayload(data);
		const queuedMs = Math.max(0, Date.now() - enqueuedAt);
		dependencies.streamEvent('action.progress', payload, {
			lane,
			queuedMs,
			message: phase
		});
		dependencies.Send.safeSend(ws, {
			type: 'TUNNEL_PROGRESS',
			id: data.id,
			...dependencies.Correlation.fields(payload),
			action: payload.action || 'unknown',
			ok: true,
			phase,
			lane,
			queuedMs,
			stillRunning: true,
			longLivedConnection: true,
			keepAliveMs: dependencies.Limits.KEEPALIVE_MS,
			message: 'B"H: request is still alive; the tunnel keeps the sight-line open instead of returning 504.',
			queueStats: dependencies.stats(),
			...extra
		});
	}

	function clear(item) {
		if (!item?.queueKeepalive) return;
		clearInterval(item.queueKeepalive);
		item.queueKeepalive = null;
	}

	function estimatePosition(lane) {
		return (dependencies.state.lanes[lane]?.queue || []).length + 1;
	}

	return { clear, send, start };
}

module.exports = { createQueueProgress };
