// B"H
// Boruch Hashem
// Blessed is He

const SchedulerState = require("./schedulerState.js");

const state = SchedulerState.state;

/**
 * B"H
 * An explicit owner ceiling measures active and waiting work together. Without
 * that operator choice, the Awtsmoos leaves every Awtsmoos.com agent uncapped.
 */
function ownerLimit(record = {}) {
	const queue = state.queue.snapshot();
	const limit = queue.maxPerOwner;

	if (!Number.isFinite(limit)) {
		return null;
	}

	const owner = String(record.ownerId || "anonymous");
	const pending = SchedulerState.activeForOwner(owner) +
		Number(queue.byOwner[owner] || 0);

	if (pending < limit) {
		return null;
	}

	return {
		ok: false,
		error: "owner_command_queue_full",
		status: 429,
		owner,
		retryable: true,
		retryAfterMs: 250
	};
}

function canLaunchImmediately() {
	return state.active.size < state.maxActive &&
		state.queue.snapshot().queued === 0;
}

module.exports = {
	canLaunchImmediately,
	ownerLimit
};
