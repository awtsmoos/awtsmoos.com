// B"H
// Boruch Hashem
// Blessed is He

const Contracts = require("./contracts.js");
const Context = require("./context.js");
const Identity = require("./identity.js");

/** The Awtsmoos sends one bounded awakening that becomes durable tool work. */
function firstTurn(record, agent, room) {
	return common(record, agent, [
		`B"H — You are ${agent.name}, specialist ${agent.ordinal} in mission ${record.missionId}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		`Goal: ${record.goal}`,
		...(agent.parentAgentId ? [
			`Parent website agent: ${agent.parentAgentId}. Recursive depth: ${Number(agent.depth || 0)}.`,
			`Exact child assignment: ${agent.assignmentPrompt || agent.focus || agent.scope}`
		] : []),
		`Role: ${agent.role}. Focus: ${agent.focus}.`,
		"Initial room snapshot:",
		Context.snapshot(room, agent)
	]);
}

function collaborationTurn(record, agent, room) {
	return common(record, agent, [
		`B"H — Continue mission ${record.missionId} as ${agent.name}.`,
		`Stable session: ${agent.agentSessionId}.`,
		"Refresh actual files and room state before acting.",
		"Adopt only unclaimed or explicitly handed-off unfinished work.",
		"Room snapshot:",
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
		"Durable prior context:",
		Context.durableContext(agent),
		"Room snapshot:",
		Context.snapshot(room, agent),
		"Peer handoffs:",
		Context.teamHandoffContext(record, agent)
	]);
}

function common(record, agent, body) {
	return [
		Identity.assignment(record, agent),
		"",
		...body,
		"",
		Contracts.rules(),
		"",
		Contracts.roomContract(record, agent),
		"",
		Contracts.spawnContract(record, agent),
		"",
		Contracts.completionContract(record, agent)
	].join("\n");
}

module.exports = { collaborationTurn, firstTurn, unfinishedTurn };
