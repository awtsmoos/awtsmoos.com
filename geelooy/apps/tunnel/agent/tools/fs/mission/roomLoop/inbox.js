// B"H
// Boruch Hashem
// Blessed is He

const Runtime = require("../roomRuntime.js");
const Recipients = require("../roomRecipients.js");
const Stream = require("./inboxStream.js");

/**
 * @file Delivers unread one/some/all/team speech per independent agent cursor.
 * @description
 * The Awtsmoos gives every shliach an independent place in one sequenced river.
 * Awtsmoos.com paginates durable speech separately from join-presence testimony, so
 * thousands of announcements can never bury a later human instruction behind them.
 */
function inbox(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const runtime = Runtime.ensureAgentRuntime(room, input, agentId);
	const recipient = room.agents?.[agentId] || {
		agentId,
		spawnGroupId: input.spawnGroupId || ""
	};
	const cursorBefore = Math.max(
		0,
		Number(input.afterSequence ?? runtime.messageCursor ?? 0)
	);
	const unread = Stream.unreadMessages(
		room,
		recipient,
		cursorBefore,
		agentId,
		bounded(input.limit, 100)
	);
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
		presence: Stream.recentPresence(room, recipient, agentId),
		recent: Stream.recentTimeline(room, recipient),
		peers: Object.values(room.agents)
			.filter(agent => agent.agentId !== agentId)
			.map(peerView),
		interrupts: env.RoomInterrupts.blocking(mission, recipient).slice(-20),
		claims: (room.claims || []).filter(claim =>
			claim.agentId === agentId && claim.status === "active"),
		mustCallNext: requiredNext(mission, unread, recipient, env)
	};
}

function requiredNext(mission, unread, recipient, env) {
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
	return env.RoomInterrupts.mustCallNext(mission, recipient);
}
function isMine(message, recipient) {
	return Recipients.visibleTo(message, recipient);
}

function mine(target, agentId) {
	return Recipients.mine(target, agentId);
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
