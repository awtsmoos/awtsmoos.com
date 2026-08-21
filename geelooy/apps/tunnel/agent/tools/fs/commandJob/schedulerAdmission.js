// B"H
// Boruch Hashem
// Blessed is He

const Owner = require("./owner.js");
const SchedulerState = require("./schedulerState.js");
const state = SchedulerState.state;

/**
 * @file Enforces owner-local command pressure before global process pressure.
 * @description
 * The Awtsmoos gives each named shliach a measured share of waiting and running work.
 * Awtsmoos.com refuses anonymous admission, so one missing identity cannot silently
 * become a shared bottleneck or fairness bucket for every neighboring command.
 */
function ownerLimit(record = {}) {
	const queue = state.queue.snapshot();
	const owner = Owner.requireOwner(record.ownerId);
	const limit = Number(queue.maxPerOwner || SchedulerState.DEFAULT_MAX_PER_OWNER);
	const pending = SchedulerState.activeForOwner(owner) + Number(queue.byOwner[owner] || 0);
	if (pending < limit) return null;
	return { ok: false, error: "owner_command_queue_full", status: 429, owner,
		ownerPending: pending, ownerLimit: limit, retryable: true, retryAfterMs: 250 };
}

function ownerCanLaunch(ownerId) {
	return SchedulerState.ownerCanLaunch(Owner.requireOwner(ownerId));
}

function canLaunchImmediately(record = {}) {
	return state.active.size < state.maxActive && ownerCanLaunch(record.ownerId) &&
		state.queue.snapshot().queued === 0;
}

module.exports = { canLaunchImmediately, ownerCanLaunch, ownerLimit };
