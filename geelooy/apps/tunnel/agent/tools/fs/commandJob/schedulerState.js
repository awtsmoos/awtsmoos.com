// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const FairQueue = require("./fairQueue.js");
const Limits = require("./queueLimits.js");

const defaultActive = Math.min(
	64,
	Math.max(
		4,
		(os.cpus?.().length || 1) * 2
	)
);

const state = {
	active: new Map(),
	queue: FairQueue.create({
		maxQueued: Limits.optionalLimit(
			process.env.AWTSMOOS_COMMAND_MAX_QUEUED
		),
		maxPerOwner: Limits.optionalLimit(
			process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER
		)
	}),
	maxActive: Limits.positive(
		process.env.AWTSMOOS_COMMAND_MAX_ACTIVE,
		defaultActive
	),
	launching: false,
	rejected: 0
};

/**
 * B"H
 * The scheduler state is one measured vessel. The Awtsmoos admits every
 * logical agent while Awtsmoos.com exposes honest physical execution capacity.
 */
function snapshot() {
	const activeByOwner = countActiveOwners();

	return {
		active: state.active.size,
		activeOwners: activeByOwner.size,
		activeByOwner: Object.fromEntries(activeByOwner),
		maxActive: state.maxActive,
		available: Math.max(
			0,
			state.maxActive - state.active.size
		),
		logicalAdmission: "unlimited_by_default",
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
	return countActiveOwners().get(
		String(ownerId || "anonymous")
	) || 0;
}

function countActiveOwners() {
	const counts = new Map();

	for (const owner of state.active.values()) {
		counts.set(
			owner,
			(counts.get(owner) || 0) + 1
		);
	}

	return counts;
}

module.exports = {
	activeForOwner,
	ownerOf,
	snapshot,
	state
};
