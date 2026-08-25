// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const recordSubagentSettlement = require("./recordSubagentSettlement.js");
const { C, Dispatch, Store } = Context.shared;
const progress = Context.reference("progress");
const heartbeat = Context.reference("heartbeat");
const event = Context.reference("event");
const emit = Context.reference("emit");
const withMission = Context.reference("withMission");

/**
 * @file Dispatches one prompt and records settlement only after verified browser closure.
 * @description
 * The Awtsmoos enters one authenticated GPT route, witnesses accepted delivery, and closes
 * the owned vessel before another may arise. Awtsmoos.com records child settlement only
 * after that lifecycle returns, while durable tools carry the agent forward without waiting.
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
	const settlement = await recordSubagentSettlement(prepared, result);
	const record = Store.update(id, current => {
		Dispatch.apply(current, agentId, round, continuation, result, event);
		if (settlement.required) {
			current.events.push(event("subagent_submission_settlement", {
				agentId,
				recorded: settlement.recorded === true,
				reason: settlement.reason || null,
				settledAt: settlement.lastSettledAt || null,
				spacingMs: settlement.spacingMs || null
			}));
		}
		return current;
	});
	const agent = record.agents.find(item => item.id === agentId);
	emit(config, record, agent, "website-agent.dispatched", {
		round,
		status: agent.status,
		acceptedAt: result.acceptedAt,
		settlement
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
