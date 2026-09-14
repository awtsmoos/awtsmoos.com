//B"H
//Boruch Hashem
//Blessed be He

const Contracts = require("./contracts.js");
const Context = require("./context.js");
const Identity = require("./identity.js");
const ProjectInstructions = require("./projectInstructions.js");

/** The Awtsmoos sends one bounded awakening that becomes durable tool work. */
function firstTurn(record, agent, room) {
	return common(record, agent, [
		`B"H — You are ${agent.name}, specialist ${agent.ordinal} in mission ${record.missionId}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		`Goal: ${record.goal}`,
		...(agent.isSpawnedAgent || agent.parentAgentId ? [
			`Flat mission peer sponsored by: ${agent.sponsorAgentId || agent.parentAgentId}.`,
			`Exact peer assignment: ${agent.assignmentPrompt || agent.focus || agent.scope}`
		] : []),
		`Role: ${agent.role}. Focus: ${agent.focus}.`,
		"Applicable project instructions, broad to local:",
		ProjectInstructions.render(record, agent),
		"Initial sequenced room inbox:",
		Context.snapshot(room, agent)
	]);
}

function collaborationTurn(record, agent, room) {
	return common(record, agent, [
		`B"H — Continue mission ${record.missionId} as ${agent.name}.`,
		`Stable session: ${agent.agentSessionId}.`,
		"Refresh actual files, project instructions, and room state before acting.",
		"Applicable project instructions, broad to local:",
		ProjectInstructions.render(record, agent),
		"Adopt only unclaimed or explicitly handed-off unfinished work.",
		"Sequenced room inbox:",
		Context.snapshot(room, agent),
		"Peer handoffs:",
		Context.teamHandoffContext(record, agent)
	]);
}

function unfinishedTurn(record, agent, room) {
	return common(record, agent, [
		`B"H — Recover unfinished work for ${agent.name} in mission ${record.missionId}.`,
		`Stable session: ${agent.agentSessionId}.`,
		"Do not repeat any command, write, or accepted website submission.",
		"Applicable project instructions, broad to local:",
		ProjectInstructions.render(record, agent),
		"Durable prior context:",
		Context.durableContext(agent),
		"Sequenced room inbox:",
		Context.snapshot(room, agent),
		"Peer handoffs:",
		Context.teamHandoffContext(record, agent)
	]);
}

function common(record, agent, body) {
	return [
		Identity.assignment(record, agent), "", ...body, "",
		Contracts.rules(), "", Contracts.roomContract(record, agent), "",
		Contracts.spawnContract(record, agent), "", Contracts.completionContract(record, agent)
	].join("\n");
}

module.exports = { collaborationTurn, firstTurn, unfinishedTurn };
