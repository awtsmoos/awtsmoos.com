// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const status = Context.reference("status");

/**
 * @file Reveals the needsContinuation stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function needsContinuation(agent) {
	if (["dispatched", "awaiting_recovery", "failed", "waiting_for_login", "claim_conflict"].includes(agent.status)) {
		return false;
	}
	return agent.roomDirty || !agent.lastOutcome?.complete || agent.status !== "complete";
}

Context.register("needsContinuation", needsContinuation);
module.exports = needsContinuation;
