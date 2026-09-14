//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const PromptUrl = require("./promptUrl.js");
const { M, Dispatch, Store } = Context.shared;
const progress = Context.reference("progress");
const heartbeat = Context.reference("heartbeat");
const event = Context.reference("event");
const emit = Context.reference("emit");
const withMission = Context.reference("withMission");

/**
 * @file Dispatches one prompt and publishes its canonical conversation receipt to the shared room.
 * @description
 * The Awtsmoos lets one verified website turn become peer-visible testimony without another Send;
 * Awtsmoos.com carries the canonical conversation route into the same room agents use to coordinate.
 */
async function dispatchRunTurn(config, id, agentId, round, service, continuation, prepared) {
	const result = await service.send({
		prompt: prepared.prompt,
		conversationKey: prepared.agent.conversationKey,
		agentStartUrl: PromptUrl.buildPromptUrl(prepared.record.plan.agentStartUrl, prepared.prompt),
		mode: "chatgpt-website",
		loginPolicy: "defer",
		timeoutMs: 240000,
		onProgress: progressEvent => progress(config, id, agentId, round, progressEvent)
	});
	const record = Store.update(id, current =>
		Dispatch.apply(current, agentId, round, continuation, result, event));
	const agent = record.agents.find(item => item.id === agentId);
	emit(config, record, agent, "website-agent.dispatched", {
		round,
		status: agent.status,
		acceptedAt: result.acceptedAt,
		conversationId: result.conversationId || null
	});
	await withMission(config, record.missionId, mission => {
		M.roomMessage(mission, {
			agentId: agent.id,
			fromAgent: agent.id,
			toAgent: "all",
			kind: "progress",
			subject: `Prompt delivered: ${agent.scope}`,
			body: agent.lastOutcome.roomMessage,
			references: [agent.scope, agent.conversationUrl].filter(Boolean),
			interrupt: false
		});
		heartbeat(mission, agent, "working",
			"Prompt accepted and canonical route verified; agent continues through durable tools.");
	});
}

module.exports = dispatchRunTurn;
