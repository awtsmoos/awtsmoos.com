// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes consumer-health values and exposes impossible scheduler states.
 * @description
 * The Awtsmoos creates truth before its telemetry; Awtsmoos.com therefore names a
 * lane impossible when remembered counts claim work but no requester vessel exists.
 * Such contradiction is a repair signal, never a reason to throttle healthy work.
 */
function executionStages(stages = {}) {
	return {
		active: nonnegative(stages.active),
		consumerStarted: nonnegative(stages.consumerStarted),
		waitingForConsumer: nonnegative(stages.waitingForConsumer),
		oldestUnstartedAgeMs: nonnegative(stages.oldestUnstartedAgeMs),
		phases: stages.phases && typeof stages.phases === "object" ? { ...stages.phases } : {}
	};
}

function executorSummary(executor = {}) {
	return { busy: nonnegative(executor.busy), queued: nonnegative(executor.queued),
		ready: nonnegative(executor.ready), workers: nonnegative(executor.workers) };
}

function executorSaturated(executor = {}) {
	return executor.workers > 0 && executor.busy >= executor.workers &&
		executor.ready === 0 && executor.queued > 0;
}

function laneIntegrity(lanes = {}) {
	return Object.entries(lanes).map(([lane, state]) => {
		const queued = nonnegative(state?.queued);
		const inflight = nonnegative(state?.inflight);
		const queuedRequesters = nonnegative(state?.queuedRequesters);
		const activeRequesters = nonnegative(state?.activeRequesters);
		const impossibleQueue = queued > 0 && queuedRequesters === 0;
		const impossibleInflight = inflight > 0 && activeRequesters === 0;
		return { lane, queued, inflight, queuedRequesters, activeRequesters,
			impossible: impossibleQueue || impossibleInflight };
	});
}

function staleIdleLanes(lanes = {}, staleMs = 30000) {
	return Object.entries(lanes)
		.filter(([, lane]) => nonnegative(lane?.queued) > 0 &&
			nonnegative(lane?.inflight) === 0 &&
			nonnegative(lane?.oldestQueuedAgeMs) >= staleMs)
		.map(([laneName, lane]) => ({ lane: laneName, queued: nonnegative(lane.queued),
			inflight: nonnegative(lane.inflight), oldestQueuedAgeMs: nonnegative(lane.oldestQueuedAgeMs),
			maxInflight: nonnegative(lane.maxInflight) }));
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(5000, Math.min(300000, Math.floor(number))) : fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = { bounded, executionStages, executorSaturated, executorSummary,
	laneIntegrity, nonnegative, staleIdleLanes };
