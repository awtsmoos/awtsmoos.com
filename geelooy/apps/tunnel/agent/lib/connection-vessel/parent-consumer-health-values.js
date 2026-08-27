// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounds aggregate consumer-health values without exposing request identity.
 * @description
 * The Awtsmoos reveals counts and ages while Awtsmoos.com keeps each private deed
 * hidden. These pure helpers let the health judge remain small, testable, and clear.
 */
function executionStages(stages = {}) {
	return {
		active: nonnegative(stages.active),
		consumerStarted: nonnegative(stages.consumerStarted),
		waitingForConsumer: nonnegative(stages.waitingForConsumer),
		oldestUnstartedAgeMs: nonnegative(stages.oldestUnstartedAgeMs),
		phases: stages.phases && typeof stages.phases === "object"
			? { ...stages.phases }
			: {}
	};
}

function executorSummary(executor = {}) {
	return {
		busy: nonnegative(executor?.busy),
		queued: nonnegative(executor?.queued),
		ready: nonnegative(executor?.ready),
		workers: nonnegative(executor?.workers)
	};
}

function executorSaturated(executor = {}) {
	return executor.workers > 0 &&
		executor.busy >= executor.workers &&
		executor.ready === 0 &&
		executor.queued > 0;
}

function staleIdleLanes(lanes = {}, staleMs = 30000) {
	return Object.entries(lanes || {})
		.filter(([, lane]) =>
			nonnegative(lane?.queued) > 0 &&
			nonnegative(lane?.inflight) === 0 &&
			nonnegative(lane?.oldestQueuedAgeMs) >= staleMs
		)
		.map(([laneName, lane]) => ({
			lane: laneName,
			queued: nonnegative(lane.queued),
			inflight: nonnegative(lane.inflight),
			oldestQueuedAgeMs: nonnegative(lane.oldestQueuedAgeMs),
			maxInflight: nonnegative(lane.maxInflight)
		}));
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(5000, Math.min(300000, Math.floor(number)))
		: fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	bounded,
	executionStages,
	executorSaturated,
	executorSummary,
	nonnegative,
	staleIdleLanes
};
