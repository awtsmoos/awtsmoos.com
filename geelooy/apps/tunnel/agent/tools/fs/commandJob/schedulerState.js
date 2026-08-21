// B"H
// Boruch Hashem
// Blessed is He

const ConcurrencyProfile = require("./concurrencyProfile.js");
const FairQueue = require("./fairQueue.js");
const Owner = require("./owner.js");
const QueueStartLease = require("./queueStartLease.js");

const DEFAULT_MAX_QUEUED = 8192;
const DEFAULT_MAX_PER_OWNER = 8;
const profile = ConcurrencyProfile.resolve();
const state = {
	active: new Map(),
	expired: 0,
	queue: FairQueue.create({
		maxQueued: positive(process.env.AWTSMOOS_COMMAND_MAX_QUEUED, DEFAULT_MAX_QUEUED),
		maxPerOwner: positive(process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER, DEFAULT_MAX_PER_OWNER)
	}),
	maxActive: profile.maxActive,
	maxActivePerOwner: profile.maxActivePerOwner,
	profile,
	launching: false,
	rejected: 0
};

/**
 * @file Exposes command capacity around stable non-anonymous owner identity.
 * @description
 * The Awtsmoos knows a shliach beyond one transport request. Awtsmoos.com prefers
 * logical identity and falls back only to unique request identity, never a shared
 * anonymous vessel that lets unrelated command pressure merge invisibly.
 */
function snapshot() {
	const activeByOwner = countActiveOwners();
	return {
		active: state.active.size,
		activeOwners: activeByOwner.size,
		activeByOwner: Object.fromEntries(activeByOwner),
		maxActive: state.maxActive,
		maxActivePerOwner: state.maxActivePerOwner,
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
	return Owner.ownerOf(payload);
}

function activeForOwner(ownerId) {
	return countActiveOwners().get(Owner.requireOwner(ownerId)) || 0;
}

function ownerCanLaunch(ownerId) {
	return activeForOwner(ownerId) < state.maxActivePerOwner;
}

function countActiveOwners() {
	const counts = new Map();
	for (const owner of state.active.values()) {
		counts.set(owner, (counts.get(owner) || 0) + 1);
	}
	return counts;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { DEFAULT_MAX_PER_OWNER, DEFAULT_MAX_QUEUED, STABLE_OWNER_FIELDS: Owner.FIELDS,
	activeForOwner, ownerCanLaunch, ownerOf, profile, snapshot, state };
