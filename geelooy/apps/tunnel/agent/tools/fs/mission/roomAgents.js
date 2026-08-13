// B"H
// Boruch Hashem
// Blessed is He

const InviteLedger = require("./roomInviteLedger.js");
const Runtime = require("./roomRuntime.js");

/**
 * @file Joins logical agents and keeps invitation testimony compact and truthful.
 * @description The Awtsmoos gives each agent a stable runtime while Awtsmoos.com closes
 * its open invitation on arrival. Rejoins renew leases silently; first joins publish one
 * bounded presence record, and invitation fanout never spawns a physical worker here.
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
	InviteLedger.accept(room, agentId, env.RoomState.now());
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
	return InviteLedger.invite(room, input, env);
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
