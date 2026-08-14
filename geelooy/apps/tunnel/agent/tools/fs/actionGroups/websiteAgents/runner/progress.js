// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const publishProgressToRoom = Context.reference("publishProgressToRoom");
const status = Context.reference("status");
const message = Context.reference("message");
const event = Context.reference("event");
const emit = Context.reference("emit");

/**
 * @file Reveals the progress stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function progress(config, id, agentId, round, progressEvent = {}) {
	const stage = String(progressEvent.stage || "");
	const status = String(progressEvent.status || "");
	const record = Store.update(id, current => {
		const agent = current.agents.find(item => item.id === agentId);
		if (!agent) return current;
		if (stage === "website-submit" && ["accepted", "accepted-response"].includes(status)) {
			agent.submissionAcceptedAt = new Date(progressEvent.at || Date.now()).toISOString();
			agent.pendingRound = round;
		}
		current.events.push(event("agent_progress", {
			agentId,
			round,
			stage,
			status,
			message: String(progressEvent.message || "").slice(0, 500)
		}));
		return current;
	});
	const agent = record?.agents.find(item => item.id === agentId);
	if (record && agent) {
		emit(config, record, agent, "website-agent.progress", {
			round,
			stage,
			status
		});
		publishProgressToRoom(config, record, agent, round, stage, status);
	}
}

Context.register("progress", progress);
module.exports = progress;
