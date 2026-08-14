// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Dispatch,
	Store
} = Context.shared;
const status = Context.reference("status");
const event = Context.reference("event");
const scheduleWake = Context.reference("scheduleWake");

/**
 * @file Reveals the finalize stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function finalize(config, id) {
	const record = Store.update(id, current => {
		if (Dispatch.hasWorkingAgents(current)) {
			current.status = "running";
			current.phase = "agents_working";
			current.finishedAt = null;
			current.lead.status = "working_locally";
			current.events.push(event("mission_agents_working", {
				dispatchedAgents: current.agents.filter(agent => agent.status === "dispatched").length
			}));
			return current;
		}
		const waiting = current.agents.some(agent => agent.status === "waiting_for_login");
		const ambiguous = current.agents.some(agent => agent.status === "awaiting_recovery");
		const failed = current.agents.some(agent =>
			["failed", "claim_conflict"].includes(agent.status)
		);
		const unfinished = current.agents.some(agent =>
			agent.status !== "complete" || agent.roomDirty || !agent.lastOutcome?.complete
		);
		current.status = waiting ? "waiting_for_login" :
			ambiguous || failed || unfinished ? "needs_attention" : "complete";
		current.phase = current.status === "complete" ? "finished" : "unfinished_work";
		current.finishedAt = current.status === "complete" ? new Date().toISOString() : null;
		current.lead.status = current.status === "complete"
			? "coordination_complete"
			: "working_locally";
		current.events.push(event("mission_finished", {
			status: current.status,
			completedAgents: current.agents.filter(agent => agent.status === "complete").length,
			unfinishedAgents: current.agents.filter(agent => agent.status !== "complete").length
		}));
		return current;
	});
	if (record.status === "waiting_for_login") {
		scheduleWake(config, id, record.plan.authPollMs);
	}
	return record;
}

Context.register("finalize", finalize);
module.exports = finalize;
