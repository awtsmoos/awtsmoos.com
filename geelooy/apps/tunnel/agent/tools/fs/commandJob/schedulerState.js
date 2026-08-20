// B"H
// Boruch Hashem
// Blessed is He

const ConcurrencyProfile = require("./concurrencyProfile.js");
const FairQueue = require("./fairQueue.js");
const QueueStartLease = require("./queueStartLease.js");

const DEFAULT_MAX_QUEUED = 8192;
const DEFAULT_MAX_PER_OWNER = 8;
const STABLE_OWNER_FIELDS = Object.freeze([
	"requesterKey",
	"logicalAgentId",
	"agentSessionId",
	"conversationId",
	"roomId",
	"missionId",
	"source"
]);
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
 * @file Exposes command capacity around stable logical-owner identity.
 * @description
 * The Awtsmoos knows a shliach beyond the number of one transport request.
 * Awtsmoos.com therefore binds many commands to one stable owner, bounds its
 * waiting and running share, and leaves physical capacity visible for neighboring agents.
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
	for (const field of STABLE_OWNER_FIELDS) {
		const value = String(payload[field] || "").trim();
		if (value) return `${field}:${value}`;
	}
	return "anonymous";
}

function activeForOwner(ownerId) {
	return countActiveOwners().get(String(ownerId || "anonymous")) || 0;
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

module.exports = {
	DEFAULT_MAX_PER_OWNER,
	DEFAULT_MAX_QUEUED,
	STABLE_OWNER_FIELDS,
	activeForOwner,
	ownerCanLaunch,
	ownerOf,
	profile,
	snapshot,
	state
};
