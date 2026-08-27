// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { M, C, Store } = Context.shared;

/**
 * @file Seeds website-agent room membership, delegation, and durable lineage.
 * @description
 * The Awtsmoos gathers many shluchim into one room while Awtsmoos.com remembers
 * sponsor, sibling group, predecessor, and generation beside each claim. The browser
 * is only a temporary doorway; room identity survives long after that tab closes away.
 */
async function seedRoom(config, mission, record) {
	M.roomCreate(mission, {
		roomName: `Website Agent Mission ${record.id}`,
		projectRoot: record.plan.projectRoot
	});
	C.join(mission, {
		agentId: "lead",
		agentName: "Lead Agent",
		role: "lead",
		projectRoot: record.plan.projectRoot,
		capabilities: ["repository", "tunnel", "verification", "coordination"]
	});
	C.heartbeat(mission, {
		agentId: "lead",
		status: "working_locally",
		currentAction: "Continue local implementation while website agents authenticate and run."
	});
	const ownedScopes = new Set();
	for (const agent of record.agents) {
		joinWebsiteAgent(mission, record, agent);
		const delegated = delegateAgent(mission, agent);
		const claimed = claimScope(mission, agent, delegated, ownedScopes);
		Store.update(record.id, current => {
			const target = current.agents.find(item => item.id === agent.id);
			target.delegationId = delegated.delegation.id;
			target.claimId = claimed?.claim?.id || null;
			return current;
		});
	}
	C.message(mission, {
		agentId: "lead",
		toAgent: "all",
		kind: "mission-start",
		subject: "Begin scoped work",
		body: "Inspect first, publish plans and progress, coordinate continuously, teach peers, preserve unfinished work, and verify before completion."
	});
	await M.save(config, mission);
}

function joinWebsiteAgent(mission, record, agent) {
	const identity = {
		agentId: agent.id,
		name: agent.name,
		role: agent.role,
		spawnGroupId: agent.spawnGroupId,
		generation: agent.generation,
		parentAgentId: agent.parentAgentId,
		sponsorAgentId: agent.sponsorAgentId,
		predecessorAgentId: agent.predecessorAgentId
	};
	M.roomJoin(mission, {
		...identity,
		capabilities: ["chatgpt-website", "shared-room", agent.focus]
	});
	C.join(mission, {
		...identity,
		agentName: agent.name,
		projectRoot: record.plan.projectRoot,
		capabilities: ["chatgpt-website", "shared-room", agent.focus]
	});
}

function delegateAgent(mission, agent) {
	return C.delegate(mission, {
		agentId: "lead",
		toAgent: agent.id,
		title: `${agent.role}: ${agent.scope}`,
		body: agent.focus,
		files: [agent.scope]
	});
}

function claimScope(mission, agent, delegated, ownedScopes) {
	if (agent.claimMode !== "write" || ownedScopes.has(agent.scope)) return null;
	ownedScopes.add(agent.scope);
	return C.claim(mission, {
		agentId: agent.id,
		delegationId: delegated.delegation.id,
		title: `${agent.role} owns ${agent.scope}`,
		filesToTouch: [agent.scope]
	});
}

Context.register("seedRoom", seedRoom);
module.exports = seedRoom;
