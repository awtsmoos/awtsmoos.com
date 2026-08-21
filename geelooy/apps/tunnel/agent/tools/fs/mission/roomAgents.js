// B"H
// Boruch Hashem
// Blessed is He

const InviteLedger = require("./roomInviteLedger.js");
const Runtime = require("./roomRuntime.js");

/**
 * @file Joins logical agents and fences an explicitly named predecessor generation.
 * @description
 * The Awtsmoos renews a messenger without letting yesterday's owner awaken beside
 * its successor. Awtsmoos.com preserves sibling lineage across reconnects, then marks
 * the predecessor superseded the instant a higher-generation successor joins the room.
 */
function join(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const existing = room.agents[agentId];
	const runtime = Runtime.ensureAgentRuntime(room, input, agentId);
	const agent = buildAgent(existing, runtime, input, env, agentId);
	if (existing?.status === "superseded" && agent.generation <= positive(existing.generation, 1)) {
		return { ...existing, joinRejected: true, reason: "superseded_generation_fenced" };
	}
	room.agents[agentId] = agent;
	fencePredecessor(room, agent, env);
	InviteLedger.accept(room, agentId, env.RoomState.now());
	if (!existing) announceJoin(room, agent, env);
	env.event(mission, "mission_room_agent_joined", `${agent.name} joined room`, {
		roomId: room.id,
		agentId,
		processKey: agent.processKey,
		spawnGroupId: agent.spawnGroupId || undefined,
		generation: agent.generation,
		predecessorAgentId: agent.predecessorAgentId || undefined,
		rejoined: Boolean(existing)
	});
	return agent;
}

function buildAgent(existing, runtime, input, env, agentId) {
	return {
		agentId,
		logicalAgentId: runtime.logicalAgentId,
		agentSessionId: runtime.agentSessionId,
		processKey: runtime.processKey,
		name: env.RoomState.text(input.agentName || input.name || existing?.name || agentId),
		role: env.RoomState.text(input.role || existing?.role || "collaborator"),
		capabilities: env.RoomState.list(input.capabilities || input.skills || existing?.capabilities),
		status: "active",
		joinedAt: existing?.joinedAt || env.RoomState.now(),
		lastSeenAt: env.RoomState.now(),
		lease: runtime.lease,
		currentClaim: runtime.currentClaim,
		queues: existing?.queues || Runtime.emptyQueues(),
		subMissionIds: existing?.subMissionIds || [],
		spawnGroupId: text(input.spawnGroupId || existing?.spawnGroupId),
		generation: positive(input.generation ?? existing?.generation, 1),
		parentAgentId: text(input.parentAgentId || existing?.parentAgentId),
		sponsorAgentId: text(input.sponsorAgentId || existing?.sponsorAgentId),
		predecessorAgentId: text(input.predecessorAgentId || existing?.predecessorAgentId)
	};
}

function fencePredecessor(room, successor, env) {
	const predecessorId = successor.predecessorAgentId;
	if (!predecessorId || predecessorId === successor.agentId) return null;
	const predecessor = room.agents[predecessorId];
	if (!predecessor) return null;
	const predecessorGeneration = positive(predecessor.generation, 1);
	if (successor.generation <= predecessorGeneration) return null;
	predecessor.status = "superseded";
	predecessor.lifecycle = "superseded";
	predecessor.supersededAt = env.RoomState.now();
	predecessor.supersededByAgentId = successor.agentId;
	predecessor.supersededByGeneration = successor.generation;
	return predecessor;
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
		spawnGroupId: agent.spawnGroupId || "",
		generation: agent.generation,
		requiresResponse: false,
		interrupts: false
	});
	room.presence = room.presence.slice(-1000);
}

function invite(mission, input, env) {
	return InviteLedger.invite(env.RoomState.ensure(mission, input), input, env);
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

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function text(value) {
	return String(value || "").trim().slice(0, 160);
}

module.exports = { announceJoin, buildAgent, discover, fencePredecessor, invite, join };
