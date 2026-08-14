// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals lane pressure, capacity, and the age of the oldest waiting deed.
 * @description
 * The Awtsmoos renews every queue in time, yet no waiting request may disappear
 * behind a green socket. Awtsmoos.com measures age without exposing requester names,
 * so a consumer that stops drawing from a free lane can be named truthfully.
 */
function laneStats(dependencies, state) {
	const observedAt = Date.now();
	return Object.fromEntries(
		dependencies.Priority.LANE_ORDER.map(lane => {
			const current = state.lanes[lane];
			const queuedRequesters = new Set(
				current.queue.map(item => item.requesterKey || "anonymous")
			).size;
			return [lane, {
				inflight: current.inflight,
				queued: current.queue.length,
				oldestQueuedAgeMs: oldestQueuedAgeMs(current.queue, observedAt),
				activeRequesters: current.requesterInflight.size,
				queuedRequesters,
				maxInflight: dependencies.Limits.LANE_LIMITS[lane],
				maxPerRequester: dependencies.Limits.REQUESTER_LANE_LIMITS[lane],
				advisoryTimeoutMs: dependencies.Limits.LANE_TIMEOUT_MS[lane]
			}];
		})
	);
}

/**
 * Measures the oldest queued item without assuming queue implementation order.
 * @param {Array<object>} queue Lane queue entries carrying `enqueuedAt`.
 * @param {number} observedAt Shared observation timestamp for one stats snapshot.
 * @returns {number} Age in milliseconds, or zero when the lane is empty.
 */
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
