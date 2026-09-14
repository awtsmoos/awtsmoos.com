//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { Store } = Context.shared;
const publishProgressToRoom = Context.reference("publishProgressToRoom");
const event = Context.reference("event");
const emit = Context.reference("emit");

/**
 * @file Separates HTTP acceptance from the stronger saved-conversation route proof.
 * @description
 * The Awtsmoos lets testimony increase in strength without confusing one boundary for another.
 * Awtsmoos.com records response acceptance, then only seals submission after /c/<uuid> is visible.
 */
function progress(config, id, agentId, round, progressEvent = {}) {
	const stage = String(progressEvent.stage || "");
	const state = String(progressEvent.status || "");
	const record = Store.update(id, current => {
		const agent = current.agents.find(item => item.id === agentId);
		if (!agent) return current;
		if (stage === "website-submit" && state === "accepted-response") {
			agent.responseAcceptedAt = instant(progressEvent);
			agent.pendingRound = round;
		}
		if (stage === "conversation-route" && state === "verified") {
			agent.conversationId = progressEvent.conversationId || null;
			agent.conversationKey = progressEvent.conversationId || null;
			agent.conversationUrl = progressEvent.conversationUrl || null;
			agent.conversationRouteVerifiedAt = instant(progressEvent);
			agent.submissionAcceptedAt = agent.responseAcceptedAt || instant(progressEvent);
			agent.pendingRound = round;
		}
		current.events.push(event("agent_progress", {
			agentId,
			round,
			stage,
			status: state,
			conversationId: progressEvent.conversationId || null,
			message: String(progressEvent.message || "").slice(0, 500)
		}));
		return current;
	});
	const agent = record?.agents.find(item => item.id === agentId);
	if (record && agent) {
		emit(config, record, agent, "website-agent.progress", { round, stage, status: state });
		publishProgressToRoom(config, record, agent, round, stage, state);
	}
}

function instant(progressEvent) {
	return new Date(progressEvent.acceptedAt || progressEvent.at || Date.now()).toISOString();
}

Context.register("progress", progress);
module.exports = progress;
