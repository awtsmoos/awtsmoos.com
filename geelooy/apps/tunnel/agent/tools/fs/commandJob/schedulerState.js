// B"H
// Boruch Hashem
// Blessed is He

const ConcurrencyProfile = require("./concurrencyProfile.js");
const FairQueue = require("./fairQueue.js");
const Limits = require("./queueLimits.js");
const QueueStartLease = require("./queueStartLease.js");

const profile = ConcurrencyProfile.resolve();
const state = {
	active: new Map(),
	expired: 0,
	queue: FairQueue.create({
		maxQueued: Limits.optionalLimit(process.env.AWTSMOOS_COMMAND_MAX_QUEUED),
		maxPerOwner: Limits.optionalLimit(process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER)
	}),
	maxActive: profile.maxActive,
	profile,
	launching: false,
	rejected: 0
};

/**
 * @file Exposes command scheduler capacity and bounded pre-launch custody.
 * @description
 * The Awtsmoos lets logical owners remain abundant while Awtsmoos.com makes the
 * finite physical lane, queue-start clock, and expired custody visible for recovery.
 */
function snapshot() {
	const activeByOwner = countActiveOwners();
	return {
		active: state.active.size,
		activeOwners: activeByOwner.size,
		activeByOwner: Object.fromEntries(activeByOwner),
		maxActive: state.maxActive,
		available: Math.max(0, state.maxActive - state.active.size),
		logicalAdmission: state.profile.logicalAdmission,
		concurrencyTier: state.profile.tier,
		concurrencyProfile: state.profile.name,
		concurrencySource: state.profile.source,
		queueStartTimeoutMs: QueueStartLease.timeoutMs(),
		queueStartExpired: state.expired,
		rejected: state.rejected,
		...state.queue.snapshot()
	};
}

function ownerOf(payload = {}) {
	return String(
		payload.agentSessionId ||
		payload.logicalAgentId ||
		payload.missionId ||
		payload.clientRequestId ||
		payload.controlRequestId ||
		"anonymous"
	).trim() || "anonymous";
}

function activeForOwner(ownerId) {
	return countActiveOwners().get(String(ownerId || "anonymous")) || 0;
}

function countActiveOwners() {
	const counts = new Map();
	for (const owner of state.active.values()) {
		counts.set(owner, (counts.get(owner) || 0) + 1);
	}
	return counts;
}

module.exports = {
	activeForOwner,
	ownerOf,
	profile,
	snapshot,
	state
};
