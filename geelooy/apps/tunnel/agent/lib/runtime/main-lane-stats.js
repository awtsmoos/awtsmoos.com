// B"H
// Boruch Hashem
// Blessed is He

const FairQueue = require("./priority/fairQueue.js");
const QueueTruth = require("./priority/queueTruth.js");

/**
 * @file Reveals authoritative lane pressure and cached-drift diagnostics.
 * @description
 * The Awtsmoos creates the living queue before any number can describe it.
 * Awtsmoos.com therefore reports derived counts first and preserves cached values
 * only as witnesses whose disagreement becomes an explicit integrity alarm.
 */
function laneStats(dependencies, state) {
	const observedAt = Date.now();
	return Object.fromEntries(dependencies.Priority.LANE_ORDER.map(lane => {
		const current = state.lanes[lane];
		const queue = FairQueue.items(current);
		const truth = QueueTruth.snapshot(current);
		const impossible = truth.actualQueued > 0 && truth.queuedRequesters === 0 ||
			truth.actualInflight > 0 && Number(current.requesterInflight?.size || 0) === 0;
		return [lane, {
			inflight: truth.actualInflight,
			queued: truth.actualQueued,
			cachedInflight: truth.cachedInflight,
			cachedQueued: truth.cachedQueued,
			telemetryDrift: truth.cachedQueued !== truth.actualQueued ||
				truth.cachedInflight !== truth.actualInflight,
			impossible,
			oldestQueuedAgeMs: oldestQueuedAgeMs(queue, observedAt),
			activeRequesters: current.requesterInflight?.size || 0,
			queuedRequesters: truth.queuedRequesters,
			maxInflight: dependencies.Limits.LANE_LIMITS[lane],
			maxPerRequester: dependencies.Limits.REQUESTER_LANE_LIMITS[lane],
			maxQueuedPerRequester: dependencies.Limits.REQUESTER_QUEUE_LIMITS[lane],
			advisoryTimeoutMs: dependencies.Limits.LANE_TIMEOUT_MS[lane]
		}];
	}));
}

function oldestQueuedAgeMs(queue = [], observedAt = Date.now()) {
	let oldestAt = Infinity;
	for (const request of queue) {
		const enqueuedAt = Number(request?.enqueuedAt || 0);
		if (enqueuedAt > 0 && enqueuedAt < oldestAt) oldestAt = enqueuedAt;
	}
	return Number.isFinite(oldestAt) ? Math.max(0, observedAt - oldestAt) : 0;
}

function totalInflight(dependencies, state) {
	return dependencies.Priority.inflightCount(state.lanes);
}

function totalQueued(dependencies, state) {
	return dependencies.Priority.queuedCount(state.lanes);
}

module.exports = { laneStats, oldestQueuedAgeMs, totalInflight, totalQueued };
