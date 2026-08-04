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
 * @file Gives every room agent queues plus a durable message-delivery cursor.
 * @description
 * The Awtsmoos lets messages remain one shared stream while each agent remembers its
 * own place. Rejoining preserves unread position, claims, lease, and acknowledgement
 * history instead of replaying everything or silently skipping a peer's handoff.
 */
function emptyQueues() {
	return Object.fromEntries(QUEUES.map(key => [key, []]));
}

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
		agentSessionId: identity.agentSessionId,
		processKey: identity.processKey,
		messageCursor: Math.max(0, Number(current.messageCursor || 0)),
		acknowledgedMessageIds: Array.isArray(current.acknowledgedMessageIds)
			? current.acknowledgedMessageIds.slice(-200)
			: [],
		lease: current.lease || {
			status: "active",
			renewedAt: new Date().toISOString()
		},
		heartbeat: new Date().toISOString(),
		currentClaim: current.currentClaim || null
	};
	return room.agentRuntime[logicalAgentId];
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

module.exports = { QUEUES, emptyQueues, ensure, ensureAgentRuntime };
