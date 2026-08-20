// B"H
// Boruch Hashem
// Blessed is He

const FairQueue = require("./priority/fairQueue.js");

/**
 * @file Reveals lane pressure without exposing requester names or flattening ownership.
 * @description
 * The Awtsmoos renews each waiting vessel in its own time. Awtsmoos.com counts
 * requester queues directly, measures the oldest waiting deed across them, and
 * reports both active and pending isolation limits without merging their identities.
 */
function laneStats(dependencies, state) {
	const observedAt = Date.now();
	return Object.fromEntries(
		dependencies.Priority.LANE_ORDER.map(lane => {
			const current = state.lanes[lane];
			const queue = FairQueue.items(current);
			return [lane, {
				inflight: current.inflight,
				queued: current.queued,
				oldestQueuedAgeMs: oldestQueuedAgeMs(queue, observedAt),
				activeRequesters: current.requesterInflight.size,
				queuedRequesters: current.requesterQueues.size,
				maxInflight: dependencies.Limits.LANE_LIMITS[lane],
				maxPerRequester: dependencies.Limits.REQUESTER_LANE_LIMITS[lane],
				maxQueuedPerRequester: dependencies.Limits.REQUESTER_QUEUE_LIMITS[lane],
				advisoryTimeoutMs: dependencies.Limits.LANE_TIMEOUT_MS[lane]
			}];
		})
	);
}

function oldestQueuedAgeMs(queue = [], observedAt = Date.now()) {
	let oldestAt = Infinity;
	for (const item of queue) {
		const enqueuedAt = Number(item?.enqueuedAt || 0);
		if (enqueuedAt > 0 && enqueuedAt < oldestAt) oldestAt = enqueuedAt;
	}
	return Number.isFinite(oldestAt)
		? Math.max(0, observedAt - oldestAt)
		: 0;
}

function totalInflight(dependencies, state) {
	return dependencies.Priority.inflightCount(state.lanes);
}

function totalQueued(dependencies, state) {
	return dependencies.Priority.queuedCount(state.lanes);
}

module.exports = {
	laneStats,
	oldestQueuedAgeMs,
	totalInflight,
	totalQueued
};
