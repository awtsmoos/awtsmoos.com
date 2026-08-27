// B"H
// Boruch Hashem
// Blessed is He

const Runtime = require("../roomRuntime.js");

/**
 * @file Delivers unread direct, global, and spawn-group room messages per agent cursor.
 * @description
 * The Awtsmoos gives every shliach an independent place in one sequenced river.
 * Awtsmoos.com advances only that agent's cursor and matches sibling-group speech
 * without copying message bodies, so hundreds may converse without quadratic weight.
 */
function inbox(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const runtime = Runtime.ensureAgentRuntime(room, input, agentId);
	const recipient = room.agents?.[agentId] || {
		agentId,
		spawnGroupId: input.spawnGroupId || ""
	};
	const cursorBefore = Math.max(0, Number(input.afterSequence ?? runtime.messageCursor ?? 0));
	const stream = [...(room.presence || []), ...(room.messages || [])]
		.sort((left, right) => Number(left.sequence || 0) - Number(right.sequence || 0));
	const addressed = stream.filter(message => isMine(message, recipient));
	const unread = addressed.filter(message =>
		Number(message.sequence || 0) > cursorBefore && message.fromAgent !== agentId
	).slice(0, bounded(input.limit, 100));
	const cursorAfter = unread.reduce(
		(maximum, message) => Math.max(maximum, Number(message.sequence || 0)),
		cursorBefore
	);
	if (input.acknowledge !== false && input.acknowledge !== "false") {
		runtime.messageCursor = cursorAfter;
		runtime.acknowledgedMessageIds = [
			...runtime.acknowledgedMessageIds,
			...unread.map(message => message.id)
		].slice(-200);
	}
	return {
		agentId,
		spawnGroupId: recipient.spawnGroupId || null,
		roomId: room.id,
		cursorBefore,
		cursorAfter: runtime.messageCursor,
		unreadCount: unread.length,
		messages: unread,
		recent: addressed.slice(-20),
		peers: Object.values(room.agents)
			.filter(agent => agent.agentId !== agentId)
			.map(peerView),
		interrupts: (room.interrupts || [])
			.filter(interrupt => interrupt.status === "blocking" && isMine(interrupt, recipient))
			.slice(-20),
		claims: (room.claims || []).filter(claim =>
			claim.agentId === agentId && claim.status === "active"),
		mustCallNext: requiredNext(mission, unread, env)
	};
}

function requiredNext(mission, unread, env) {
	const response = unread.find(message => message.requiresResponse === true);
	if (response) {
		return {
			action: "missionRoomMessage",
			missionId: mission.id,
			toAgent: response.fromAgent,
			kind: "answer",
			references: [response.id]
		};
	}
	return env.RoomInterrupts.mustCallNext(mission, env);
}

function isMine(message, recipient) {
	const agent = typeof recipient === "string"
		? { agentId: recipient, spawnGroupId: "" }
		: recipient || {};
	if (message.toSpawnGroup) {
		return message.toSpawnGroup === agent.spawnGroupId || message.fromAgent === agent.agentId;
	}
	return mine(message.toAgent, agent.agentId) || message.fromAgent === agent.agentId;
}

function mine(target, agentId) {
	return !target || target === "all" || target === agentId || target === "any_agent";
}

function peerView(agent) {
	return {
		agentId: agent.agentId,
		name: agent.name,
		role: agent.role,
		status: agent.status,
		spawnGroupId: agent.spawnGroupId || null,
		generation: Number(agent.generation || 1),
		parentAgentId: agent.parentAgentId || null,
		predecessorAgentId: agent.predecessorAgentId || null,
		lastSeenAt: agent.lastSeenAt,
		currentClaim: agent.currentClaim || null
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1, Math.min(200, Math.floor(number))) : fallback;
}

module.exports = { inbox, isMine, mine, peerView, requiredNext };
