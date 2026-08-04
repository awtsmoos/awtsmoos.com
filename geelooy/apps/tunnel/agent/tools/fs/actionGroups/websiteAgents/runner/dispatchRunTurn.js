// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { C, Dispatch, Store } = Context.shared;
const progress = Context.reference("progress");
const heartbeat = Context.reference("heartbeat");
const event = Context.reference("event");
const emit = Context.reference("emit");
const withMission = Context.reference("withMission");

/**
 * @file Dispatches one prompt and records the verified-close receipt.
 * @description
 * The Awtsmoos enters one final GPT route, verifies accepted delivery, and withdraws
 * the browser vessel at once. Awtsmoos.com records only durable evidence, never an
 * awaited conversational answer or hidden continuation key.
 */
async function dispatchRunTurn(
	config,
	id,
	agentId,
	round,
	service,
	continuation,
	prepared
) {
	const result = await service.send({
		prompt: prepared.prompt,
		conversationKey: prepared.agent.conversationKey,
		agentStartUrl: prepared.record.plan.agentStartUrl,
		mode: "chatgpt-website",
		loginPolicy: "defer",
		timeoutMs: 240000,
		onProgress: progressEvent =>
			progress(config, id, agentId, round, progressEvent)
	});
	const record = Store.update(id, current =>
		Dispatch.apply(current, agentId, round, continuation, result, event));
	const agent = record.agents.find(item => item.id === agentId);
	emit(config, record, agent, "website-agent.dispatched", {
		round,
		status: agent.status,
		acceptedAt: result.acceptedAt
	});
	await withMission(config, record.missionId, mission => {
		C.message(mission, {
			agentId: agent.id,
			agentName: agent.name,
			role: agent.role,
			toAgent: "all",
			kind: "website-agent-dispatched",
			subject: "Prompt delivered: " + agent.scope,
			body: agent.lastOutcome.roomMessage,
			references: [agent.scope]
		});
		heartbeat(
			mission,
			agent,
			"working",
			"Prompt accepted and tab closed; agent continues through durable tools."
		);
	});
}

module.exports = dispatchRunTurn;
