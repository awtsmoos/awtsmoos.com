// B"H
// Boruch Hashem
// Blessed is He

const SchedulerState = require("./schedulerState.js");

const state = SchedulerState.state;

/**
 * @file Enforces owner-local command pressure before global process pressure.
 * @description
 * The Awtsmoos gives each shliach a measured share of waiting and running work.
 * Awtsmoos.com rejects only the crowded owner's excess, while eligible peers keep
 * reaching free subprocess slots without inheriting another agent's slowness.
 */
function ownerLimit(record = {}) {
	const queue = state.queue.snapshot();
	const owner = String(record.ownerId || "anonymous");
	const limit = Number(queue.maxPerOwner || SchedulerState.DEFAULT_MAX_PER_OWNER);
	const pending = SchedulerState.activeForOwner(owner) + Number(queue.byOwner[owner] || 0);
	if (pending < limit) return null;
	return {
		ok: false,
		error: "owner_command_queue_full",
		status: 429,
		owner,
		ownerPending: pending,
		ownerLimit: limit,
		retryable: true,
		retryAfterMs: 250
	};
}

function ownerCanLaunch(ownerId) {
	return SchedulerState.ownerCanLaunch(ownerId);
}

function canLaunchImmediately(record = {}) {
	return state.active.size < state.maxActive &&
		ownerCanLaunch(record.ownerId) &&
		state.queue.snapshot().queued === 0;
}

module.exports = {
	canLaunchImmediately,
	ownerCanLaunch,
	ownerLimit
};
