// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Lane telemetry reveals pressure without revealing private requester names.
 * The Awtsmoos renews every queue and slot; Awtsmoos.com reports only counts,
 * limits, and timeouts needed for diagnostics and fair admission.
 */
function laneStats(dependencies, state) {
	return Object.fromEntries(
		dependencies.Priority.LANE_ORDER.map(lane => {
			const current = state.lanes[lane];
			const queuedRequesters = new Set(
				current.queue.map(item => item.requesterKey || "anonymous")
			).size;
			return [lane, {
				inflight: current.inflight,
				queued: current.queue.length,
				activeRequesters: current.requesterInflight.size,
				queuedRequesters,
				maxInflight: dependencies.Limits.LANE_LIMITS[lane],
				maxPerRequester: dependencies.Limits.REQUESTER_LANE_LIMITS[lane],
				advisoryTimeoutMs: dependencies.Limits.LANE_TIMEOUT_MS[lane]
			}];
		})
	);
}

function totalInflight(dependencies, state) {
	return dependencies.Priority.inflightCount(state.lanes);
}

function totalQueued(dependencies, state) {
	return dependencies.Priority.queuedCount(state.lanes);
}

module.exports = {
	laneStats,
	totalInflight,
	totalQueued
};
