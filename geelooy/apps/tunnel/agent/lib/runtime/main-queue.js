// B"H
const { createQueueProgress } = require('./main-queue-progress.js');

/**
 * B"H — Admission is bounded by lane, while control keeps its reserved road.
 * Progress timing lives in its own vessel and cannot enlarge queue ownership.
 */
function createQueueRuntime(dependencies) {
	let scheduleDrain = () => {};
	const progress = createQueueProgress(dependencies);

	function setScheduleDrain(callback) {
		scheduleDrain = callback;
	}

	function enqueueRequest(ws, raw) {
		const data = dependencies.routedData(raw);
		const item = { ws, data, enqueuedAt: Date.now(), queueKeepalive: null };
		const payload = data.payload;
		const lane = dependencies.Priority.laneOf(item);
		const currentStats = dependencies.stats();
		const gate = dependencies.Circuit.canAccept(
			lane,
			currentStats,
			dependencies.Circuit.DEFAULTS,
			payload
		);
		dependencies.streamEvent('action.received', payload, { lane });
		if (!gate.ok) return rejectCircuit(ws, data, payload, lane, currentStats, gate);
		if (!dependencies.Priority.canQueue(dependencies.state.lanes, lane, dependencies.Limits)) {
			return rejectFull(ws, data, payload, lane, currentStats);
		}
		dependencies.streamEvent('action.queued', payload, { lane });
		progress.start(item, lane);
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		scheduleDrain();
		return undefined;
	}

	function rejectCircuit(ws, data, payload, lane, currentStats, gate) {
		dependencies.streamEvent('action.error', payload, {
			lane,
			ok: false,
			status: gate.status || 503,
			error: gate.reason || gate.error || 'circuit_rejected'
		});
		return dependencies.Send.safeSend(ws, {
			type: 'TUNNEL_RESPONSE',
			id: data.id,
			...dependencies.Correlation.fields(payload),
			lane,
			...gate,
			queueStats: currentStats
		});
	}

	function rejectFull(ws, data, payload, lane, currentStats) {
		const error = lane === dependencies.Priority.LANES.P0
			? 'agent_control_queue_full'
			: 'agent_queue_full';
		dependencies.streamEvent('action.error', payload, {
			lane,
			ok: false,
			status: 429,
			error
		});
		return dependencies.Send.safeSend(ws, {
			type: 'TUNNEL_RESPONSE',
			id: data.id,
			...dependencies.Correlation.fields(payload),
			ok: false,
			status: 429,
			error,
			lane,
			queueStats: currentStats,
			recovery: {
				retryAfterMs: 1000,
				instruction: 'Retry after queued work drains, or cancel stale workers.'
			}
		});
	}

	function nextLane() {
		for (const lane of dependencies.Priority.LANE_ORDER) {
			if (dependencies.Priority.canStartLane(dependencies.state.lanes, lane, dependencies.Limits)) {
				return lane;
			}
		}
		return '';
	}

	return {
		clearQueueKeepalive: progress.clear,
		enqueueRequest,
		nextLane,
		sendProgress: progress.send,
		setScheduleDrain
	};
}

module.exports = { createQueueRuntime };
