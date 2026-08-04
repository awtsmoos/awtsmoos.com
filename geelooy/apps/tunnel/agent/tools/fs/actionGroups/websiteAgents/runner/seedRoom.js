// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	M,
	C,
	Store
} = Context.shared;
const start = Context.reference("start");
const run = Context.reference("run");
const progress = Context.reference("progress");
const status = Context.reference("status");
const message = Context.reference("message");
const heartbeat = Context.reference("heartbeat");

/**
 * @file Reveals the seedRoom stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
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
		M.roomJoin(mission, {
			agentId: agent.id,
			name: agent.name,
			role: agent.role,
			capabilities: ["chatgpt-website", "shared-room", agent.focus]
		});
		C.join(mission, {
			agentId: agent.id,
			agentName: agent.name,
			role: agent.role,
			projectRoot: record.plan.projectRoot,
			capabilities: ["chatgpt-website", "shared-room", agent.focus]
		});
		const delegated = C.delegate(mission, {
			agentId: "lead",
			toAgent: agent.id,
			title: `${agent.role}: ${agent.scope}`,
			body: agent.focus,
			files: [agent.scope]
		});
		let claimed = null;
		if (agent.claimMode === "write" && !ownedScopes.has(agent.scope)) {
			ownedScopes.add(agent.scope);
			claimed = C.claim(mission, {
				agentId: agent.id,
				delegationId: delegated.delegation.id,
				title: `${agent.role} owns ${agent.scope}`,
				filesToTouch: [agent.scope]
			});
		}
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

Context.register("seedRoom", seedRoom);
module.exports = seedRoom;
