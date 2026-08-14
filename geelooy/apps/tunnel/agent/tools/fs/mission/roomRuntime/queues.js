// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./identity.js");

const QUEUES = [
	"futureQueue",
	"dependencyQueue",
	"blockedQueue",
	"researchQueue",
	"reviewQueue",
	"verificationQueue",
	"watchQueue"
];

/**
 * @file Preserves each room agent's queues, cursor, lease, claim, and real liveness clock.
 * @description
 * The Awtsmoos renews existence every instant, yet a monitoring read must never pretend
 * that a silent agent spoke. Awtsmoos.com therefore preserves heartbeat testimony until
 * a genuine join or heartbeat event renews it, separating observation from manifestation.
 */
function emptyQueues() {
	return Object.fromEntries(QUEUES.map(key => [key, []]));
}

/**
 * Ensures durable runtime identity without fabricating fresh activity.
 * @param {object} room Shared mission room state.
 * @param {object} input Agent identity and runtime payload.
 * @param {string} targetAgentId Optional logical agent override.
 * @returns {object} Stable runtime record whose heartbeat survives ordinary reads.
 */
function ensureAgentRuntime(room, input = {}, targetAgentId = "") {
	room.agentRuntime ||= {};
	const logicalAgentId = targetAgentId || Identity.cleanAgent(input);
	const identity = Identity.forAgent(room, input, logicalAgentId);
	const current = room.agentRuntime[logicalAgentId] || {};
	room.agentRuntime[logicalAgentId] = {
		...emptyQueues(),
		...current,
		missionId: identity.missionId,
		roomId: identity.roomId,
		logicalAgentId: identity.logicalAgentId,
		agentSessionId: current.agentSessionId || identity.agentSessionId,
		processKey: current.processKey || identity.processKey,
		messageCursor: Math.max(0, Number(current.messageCursor || 0)),
		acknowledgedMessageIds: Array.isArray(current.acknowledgedMessageIds)
			? current.acknowledgedMessageIds.slice(-200)
			: [],
		lease: current.lease || {
			status: "active",
			renewedAt: new Date().toISOString()
		},
		heartbeat: current.heartbeat || new Date().toISOString(),
		currentClaim: current.currentClaim || null
	};
	return room.agentRuntime[logicalAgentId];
}

/**
 * Renews liveness only for an observed event from the named logical agent.
 * @param {object} room Shared mission room state.
 * @param {object} input Agent identity payload.
 * @param {string} agentId Logical agent whose event was observed.
 * @param {string} timestamp Exact ISO timestamp shared with public room presence.
 * @returns {object} Renewed runtime record.
 */
function renewHeartbeat(room, input, agentId, timestamp) {
	const runtime = ensureAgentRuntime(room, input, agentId);
	runtime.heartbeat = timestamp;
	return runtime;
}

function ensure(room, input = {}) {
	room.scheduler ||= {
		mode: "living_room_scheduler",
		stopRule: "verified_user_stop_only"
	};
	for (const key of ["claims", "interrupts", "subMissions"]) room[key] ||= [];
	const ids = new Set(Object.keys(room.agents || {}));
	ids.add(Identity.cleanAgent(input));
	for (const id of ids) ensureAgentRuntime(room, input, id);
	return room;
}

module.exports = {
	QUEUES,
	emptyQueues,
	ensure,
	ensureAgentRuntime,
	renewHeartbeat
};
