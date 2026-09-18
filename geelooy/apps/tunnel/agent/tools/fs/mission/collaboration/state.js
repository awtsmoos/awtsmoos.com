//B"H // Boruch Hashem // Blessed is He

const RoomAgents = require("../roomAgents.js");
const RoomState = require("../roomState/base.js");
const { event } = require("../core.js");

/**
 * @file Makes the Mission Room roster the single agent-identity authority.
 * @description The Awtsmoos gives every messenger one durable name. Legacy collaboration ledgers
 * remain compatible, but Awtsmoos.com stores identity, generation, lease, and liveness only in
 * `mission.room.agents`, so room and sub-agent actions can never drift into separate rosters.
 */
function ensure(mission, input = {}) {
	const room = RoomState.ensure(mission, input);
	const previousAgents = mission.collaboration?.agents;
	mission.collaboration ||= create(room, mission.id);
	const collaboration = mission.collaboration;
	for (const key of ledgers()) collaboration[key] ||= [];
	collaboration.settings ||= defaults();
	if (collaboration.settings.blockOnUserMessage === undefined) collaboration.settings.blockOnUserMessage = true;
	collaboration.settings.allowContinuePhrases ||= defaults().allowContinuePhrases;
	migrate(mission, previousAgents, room);
	collaboration.agents = room.agents;
	collaboration.roomId = room.id;
	collaboration.missionId = mission.id;
	collaboration.projectRoot = RoomState.text(input.projectRoot || input.root || room.projectRoot || collaboration.projectRoot);
	if (collaboration.projectRoot) room.projectRoot = collaboration.projectRoot;
	collaboration.updatedAt = RoomState.now();
	return collaboration;
}

function create(room, missionId) {
	return {
		id: room.id, roomId: room.id, missionId, projectRoot: room.projectRoot,
		createdAt: RoomState.now(), updatedAt: RoomState.now(), agents: room.agents,
		messages: [], userMessages: [], delegations: [], claims: [], heartbeats: [], audits: [], invitePrompts: [],
		settings: defaults()
	};
}

function migrate(mission, previousAgents, room) {
	if (!previousAgents || previousAgents === room.agents) return;
	for (const prior of Object.values(previousAgents)) {
		const id = prior?.agentId || prior?.logicalAgentId || prior?.name;
		if (!id || room.agents[id]) continue;
		join(mission, { ...prior, agentId: id, agentName: prior.name || id, generation: prior.generation || 1 });
	}
}

function join(mission, input = {}) {
	const agent = RoomAgents.join(mission, input, { RoomState, event });
	agent.currentClaimIds ||= [];
	agent.currentDelegationIds ||= [];
	return agent;
}

function publicAgent(agent = {}) {
	return {
		agentId: agent.agentId, logicalAgentId: agent.logicalAgentId,
		agentSessionId: agent.agentSessionId, processKey: agent.processKey,
		generation: agent.generation || 1, name: agent.name, role: agent.role,
		capabilities: agent.capabilities || [], status: agent.status || "active",
		joinedAt: agent.joinedAt, lastSeenAt: agent.lastSeenAt, lease: agent.lease || null,
		currentClaimIds: agent.currentClaimIds || [], currentDelegationIds: agent.currentDelegationIds || []
	};
}

function status(mission) {
	const collaboration = ensure(mission);
	const agents = Object.values(mission.room.agents)
		.map(publicAgent).sort((left, right) => left.agentId.localeCompare(right.agentId));
	return {
		projectId: collaboration.id, roomId: mission.room.id, missionId: mission.id,
		projectRoot: mission.room.projectRoot, agents,
		messages: collaboration.messages.slice(-50), userMessages: collaboration.userMessages.slice(-50),
		openUserMessages: openUserMessages(collaboration),
		openDelegations: collaboration.delegations.filter(item => !["done", "blocked", "cancelled"].includes(item.status)),
		activeClaims: collaboration.claims.filter(item => item.status === "active"),
		latestAudit: collaboration.audits.at(-1) || null, settings: collaboration.settings
	};
}

function openUserMessages(collaboration) {
	return collaboration.userMessages.filter(item => item.requiresResponse && item.status === "open" && !item.allowContinue);
}

function defaults() {
	return { blockOnUserMessage: true, allowContinuePhrases: ["continue", "go on", "proceed", "keep going", "resume"] };
}

function ledgers() {
	return ["messages", "userMessages", "delegations", "claims", "heartbeats", "audits", "invitePrompts"];
}

module.exports = { defaults, ensure, join, openUserMessages, publicAgent, status };
