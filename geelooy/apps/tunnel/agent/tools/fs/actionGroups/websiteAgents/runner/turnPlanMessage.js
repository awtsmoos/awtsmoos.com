// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	state
} = Context.shared;

/**
 * @file Reveals the turnPlanMessage stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function turnPlanMessage(agent, round, continuation) {
	if (continuation) {
		return [
			`PLAN: verify current state, preserve completed work, and resume ${agent.scope}.`,
			`PROGRESS: starting continuation turn ${round}.`,
			`HANDOFF: prior NEXT is ${agent.lastOutcome?.next || "inspect durable room context and locate unfinished work"}.`,
			"COMPLETION: pending focused verification."
		].join("\n");
	}
	return [
		`PLAN: inspect ${agent.scope}; execute ${agent.focus}; verify bounded evidence.`,
		`PROGRESS: starting website turn ${round}.`,
		"HANDOFF: files, evidence, remaining work, and helper results will be published to this room.",
		"COMPLETION: pending verification."
	].join("\n");
}

Context.register("turnPlanMessage", turnPlanMessage);
module.exports = turnPlanMessage;
