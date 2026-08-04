// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Dispatch
} = Context.shared;
const status = Context.reference("status");
const needsContinuation = Context.reference("needsContinuation");

/**
 * @file Reveals the resumable stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function resumable(record) {
	if (record.cancelRequested || record.status === "complete") return false;
	const unsafe = record.agents.some(agent =>
		agent.status === "submitting" && agent.submissionAcceptedAt
	);
	if (unsafe) return false;
	if (["queued", "waiting_for_login"].includes(record.status)) return true;
	if (record.status === "running") {
		return record.agents.some(agent => !Dispatch.isTerminalForBrowser(agent));
	}
	if (record.status !== "needs_attention") return false;
	return record.agents.some(agent => {
		if (agent.status === "waiting_for_login") return true;
		if (agent.status === "submitting") return !agent.submissionAcceptedAt;
		if (agent.status === "awaiting_recovery") return Boolean(agent.conversationKey);
		if (["failed", "claim_conflict"].includes(agent.status)) return false;
		if (agent.round < record.plan.collaborationRounds) return true;
		return needsContinuation(agent) &&
			agent.continuationTurns < record.plan.maxContinuationTurns;
	});
}

Context.register("resumable", resumable);
module.exports = resumable;
