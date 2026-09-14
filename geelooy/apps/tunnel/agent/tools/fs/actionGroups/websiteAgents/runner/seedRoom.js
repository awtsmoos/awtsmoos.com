//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { M, C, Store } = Context.shared;

/**
 * @file Seeds one sequenced Mission Room while retaining only legacy identity/claim compatibility.
 * @description
 * The Awtsmoos gathers every Shliach into one speaking river; Awtsmoos.com keeps old IDs only
 * where older spawn code still needs them, while assignment, liveness, claims, and speech stay visible.
 */
async function seedRoom(config, mission, record) {
	M.roomCreate(mission, {
		roomName: `Website Agent Mission ${record.id}`,
		projectRoot: record.plan.projectRoot
	});
	joinLead(mission, record.plan.projectRoot);
	const ownedScopes = new Set();
	for (const agent of record.agents) {
		joinWebsiteAgent(mission, record, agent);
		const delegated = legacyDelegation(mission, agent);
		const legacyClaim = legacyScopeClaim(mission, agent, delegated, ownedScopes);
		const roomClaim = modernScopeClaim(mission, agent);
		publishAssignment(mission, agent);
		Store.update(record.id, current => {
			const target = current.agents.find(item => item.id === agent.id);
			if (target) {
				target.delegationId = delegated.delegation.id;
				target.claimId = legacyClaim?.claim?.id || null;
				target.roomClaimId = roomClaim?.id || null;
			}
			return current;
		});
	}
	M.roomMessage(mission, {
		agentId: "lead", fromAgent: "lead", toAgent: "all", kind: "mission-start",
		subject: "Begin scoped work",
		body: "Inspect first, read your inbox before each turn, coordinate claims, publish progress, delegate independent work, and verify completion.",
		interrupt: false
	});
	await M.save(config, mission);
}

function joinLead(mission, projectRoot) {
	const identity = { agentId: "lead", name: "Lead Agent", role: "lead",
		capabilities: ["repository", "tunnel", "verification", "coordination"] };
	M.roomJoin(mission, identity);
	M.roomHeartbeat(mission, { agentId: "lead", status: "working",
		currentAction: "Coordinate local implementation and website agents." });
	C.join(mission, { ...identity, agentName: "Lead Agent", projectRoot });
}

function joinWebsiteAgent(mission, record, agent) {
	const identity = { agentId: agent.id, name: agent.name, role: agent.role,
		spawnGroupId: agent.spawnGroupId, generation: agent.generation,
		parentAgentId: agent.parentAgentId, sponsorAgentId: agent.sponsorAgentId,
		predecessorAgentId: agent.predecessorAgentId,
		capabilities: ["chatgpt-website", "shared-room", agent.focus] };
	M.roomJoin(mission, identity);
	C.join(mission, { ...identity, agentName: agent.name, projectRoot: record.plan.projectRoot });
}

function legacyDelegation(mission, agent) {
	return C.delegate(mission, { agentId: "lead", toAgent: agent.id,
		title: `${agent.role}: ${agent.scope}`, body: agent.focus, files: [agent.scope] });
}

function legacyScopeClaim(mission, agent, delegated, ownedScopes) {
	if (agent.claimMode !== "write" || ownedScopes.has(agent.scope)) return null;
	ownedScopes.add(agent.scope);
	return C.claim(mission, { agentId: agent.id, delegationId: delegated.delegation.id,
		title: `${agent.role} owns ${agent.scope}`, filesToTouch: [agent.scope] });
}

function modernScopeClaim(mission, agent) {
	if (agent.claimMode !== "write") return null;
	return M.roomClaimTask(mission, { agentId: agent.id,
		taskId: `website_scope_${agent.id}`, claimId: `website_room_claim_${agent.id}`,
		title: `${agent.role} owns ${agent.scope}`, files: [agent.scope], generation: agent.generation });
}

function publishAssignment(mission, agent) {
	return M.roomMessage(mission, { agentId: "lead", fromAgent: "lead", toAgent: agent.id,
		kind: "delegation", subject: `${agent.role}: ${agent.scope}`,
		body: `${agent.focus}\nIf independent specialist work is useful, spawn/delegate it and report the child lineage back to this room.`,
		references: [agent.scope], requiresResponse: true, interrupt: true });
}

Context.register("seedRoom", seedRoom);
module.exports = seedRoom;
