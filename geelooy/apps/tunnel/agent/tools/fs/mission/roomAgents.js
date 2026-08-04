// B"H
// Boruch Hashem
// Blessed is He

const Runtime = require("./roomRuntime.js");

/**
 * @file Joins agents to one room and publishes presence without inflating chat counts.
 * @description
 * The Awtsmoos gives every agent a stable runtime and visible entrance. Rejoins renew
 * leases silently; first joins append one sequenced presence record that inboxes can
 * read, while legacy message counts continue to measure actual peer conversation.
 */
function join(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const existing = room.agents[agentId];
	const runtime = Runtime.ensureAgentRuntime(room, input, agentId);
	const agent = {
		agentId,
		logicalAgentId: runtime.logicalAgentId,
		agentSessionId: runtime.agentSessionId,
		processKey: runtime.processKey,
		name: env.RoomState.text(input.agentName || input.name || agentId),
		role: env.RoomState.text(input.role || "collaborator"),
		capabilities: env.RoomState.list(input.capabilities || input.skills),
		status: "active",
		joinedAt: existing?.joinedAt || env.RoomState.now(),
		lastSeenAt: env.RoomState.now(),
		lease: runtime.lease,
		currentClaim: runtime.currentClaim,
		queues: Runtime.emptyQueues(),
		subMissionIds: existing?.subMissionIds || []
	};
	room.agents[agentId] = agent;
	if (!existing) announceJoin(room, agent, env);
	env.event(mission, "mission_room_agent_joined", `${agent.name} joined room`, {
		roomId: room.id,
		agentId,
		processKey: agent.processKey,
		rejoined: Boolean(existing)
	});
	return agent;
}

function announceJoin(room, agent, env) {
	room.presence ||= [];
	room.messageSequence = Math.max(0, Number(room.messageSequence || 0)) + 1;
	room.presence.push({
		id: env.RoomState.id("room_presence"),
		sequence: room.messageSequence,
		at: env.RoomState.now(),
		fromAgent: agent.agentId,
		toAgent: "all",
		kind: "presence",
		subject: `${agent.name} joined`,
		body: `${agent.name} joined as ${agent.role}. Coordinate through room inbox and messages.`,
		requiresResponse: false,
		interrupts: false
	});
	room.presence = room.presence.slice(-1000);
}

function invite(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const invite = {
		id: env.RoomState.id("room_invite"),
		at: env.RoomState.now(),
		toAgent: env.RoomState.text(input.toAgent || input.to || "agent"),
		role: env.RoomState.text(input.role || "collaborator"),
		capabilities: env.RoomState.list(input.capabilities),
		message: env.RoomState.text(input.message || `Join room ${room.id}`),
		status: "open"
	};
	room.invites.push(invite);
	return invite;
}

function discover(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const discovery = {
		id: env.RoomState.id("room_discovery"),
		at: env.RoomState.now(),
		projectRoot: room.projectRoot,
		suggestedAgents: [
			{ agentId: "architect", role: "Architecture splitter" },
			{ agentId: "tester", role: "Verification keeper" },
			{ agentId: "implementer", role: "Implementation worker" },
			{ agentId: "scheduler", role: "Continuation scheduler" }
		],
		note: env.RoomState.text(input.note || "Scheduler-backed agent split discovered")
	};
	room.discoveries.push(discovery);
	return discovery;
}

module.exports = { announceJoin, discover, invite, join };
