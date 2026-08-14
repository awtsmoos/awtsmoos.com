// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./promptIdentity.js");
const Room = require("./promptRoom.js");
const Rules = require("./promptRules.js");

/**
 * @file Composes first, collaboration, and recovery prompts from focused modules.
 * @description
 * The Awtsmoos speaks one bounded assignment through each website turn.
 * Awtsmoos.com places immutable identity and scope before the work, then preserves
 * room memory, recursive limits, and exact continuation after the owned tab closes.
 */
function firstTurn(record, agent, room) {
	return compose(record, agent, [
		`B"H — You are ${agent.name}, specialist ${agent.ordinal} in mission ${record.missionId}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		`Goal: ${record.goal}`,
		`Website vessel: ${record.plan.customGptName || "ChatGPT custom GPT"}.`,
		...parentAssignment(agent),
		`Your role: ${agent.role}. Focus: ${agent.focus}.`,
		"At the start, state your concrete plan and file claim in MESSAGE TO ROOM.",
		"Shared room inbox:",
		Room.snapshot(room, agent)
	]);
}

function collaborationTurn(record, agent, room) {
	return compose(record, agent, [
		`B"H — Continue mission ${record.missionId} as ${agent.name}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		"Read every new room item, answer relevant peers, preserve unfinished work, and verify completion.",
		"Adopt one unclaimed or explicitly handed-off item when your own claim is complete.",
		"New shared room inbox:",
		Room.snapshot(room, agent),
		"Durable team handoffs:",
		Room.teamHandoffContext(record, agent)
	]);
}

function unfinishedTurn(record, agent, room) {
	const continuity = agent.conversationKey
		? "Continue the exact existing conversation and finish its recorded NEXT work."
		: "Inspect durable state, identify all unfinished scoped work, and finish it.";
	return compose(record, agent, [
		`B"H — Recovery/continuation turn for ${agent.name} in mission ${record.missionId}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		continuity,
		`Goal: ${record.goal}`,
		"Durable prior context:",
		Room.durableContext(agent),
		"Do not repeat a completed write, command, or accepted website submission.",
		"Shared room inbox:",
		Room.snapshot(room, agent),
		"Durable team handoffs:",
		Room.teamHandoffContext(record, agent)
	]);
}

function compose(record, agent, body) {
	return [
		Identity.assignmentBlock(record, agent),
		"",
		...body,
		"",
		Rules.fanOutInstruction(record),
		"",
		Rules.rules(),
		"",
		Rules.responseContract()
	].join("\n");
}

function parentAssignment(agent) {
	return agent.parentAgentId ? [
		`Parent website agent: ${agent.parentAgentId}. Recursive depth: ${Number(agent.depth || 0)}.`,
		`Exact child assignment: ${agent.assignmentPrompt || agent.focus || agent.scope}`
	] : [];
}

module.exports = {
	collaborationTurn,
	durableContext: Room.durableContext,
	fanOutInstruction: Rules.fanOutInstruction,
	firstTurn,
	snapshot: Room.snapshot,
	teamHandoffContext: Room.teamHandoffContext,
	unfinishedTurn
};
