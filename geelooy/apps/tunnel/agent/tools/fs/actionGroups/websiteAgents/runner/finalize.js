// B"H
// Boruch Hashem
// Blessed is He

const ContinuationRequests = require("../../../mission/roomContinuationRequests.js");
const Context = require("./context.js");
const { Dispatch, Store } = Context.shared;
const event = Context.reference("event");
const scheduleWake = Context.reference("scheduleWake");
const withMission = Context.reference("withMission");

/**
 * @file Finalizes website-agent state and settles continuity for completed work.
 * @description
 * The Awtsmoos lets an unfinished deed ask for another shliach, yet completion closes
 * that doorway. Awtsmoos.com fulfills each completed agent's pre-step continuation
 * request so a later recovery tick cannot resurrect work whose own agent finished it.
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
		current.status = waiting
			? "waiting_for_login"
			: ambiguous || failed || unfinished
				? "needs_attention"
				: "complete";
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

	await settleCompletedContinuations(config, record);
	if (record.status === "waiting_for_login") {
		scheduleWake(config, id, record.plan.authPollMs);
	}
	return record;
}

/**
 * Fulfills only the continuation requests whose own agents have verified completion.
 * @param {object} config Tunnel configuration.
 * @param {object} record Durable website mission record.
 * @returns {Promise<void>} Completion after mission persistence.
 */
async function settleCompletedContinuations(config, record) {
	const completed = record.agents.filter(agent =>
		agent.status === "complete" && agent.lastOutcome?.complete && agent.continuationRequestId
	);
	if (!completed.length) {
		return;
	}
	await withMission(config, record.missionId, mission => {
		for (const agent of completed) {
			ContinuationRequests.fulfill(
				mission,
				agent.continuationRequestId,
				"agent_verified_complete"
			);
		}
		return mission;
	});
}

Context.register("finalize", finalize);
module.exports = finalize;
