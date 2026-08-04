// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const status = Context.reference("status");
const event = Context.reference("event");

/**
 * @file Reveals the reconcileOrphanedTurns stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function reconcileOrphanedTurns(id) {
	return Store.update(id, record => {
		for (const agent of record.agents) {
			if (agent.status !== "submitting") continue;
			if (agent.submissionAcceptedAt) {
				agent.status = "dispatched";
				agent.error = null;
				record.events.push(event("orphaned_accepted_turn_preserved", {
					agentId: agent.id,
					pendingRound: agent.pendingRound,
					hasPrivateContinuation: Boolean(agent.conversationKey)
				}));
				continue;
			}
			agent.status = "queued";
			agent.pendingRound = null;
			agent.error = null;
			record.events.push(event("orphaned_pre_submit_turn_requeued", {
				agentId: agent.id
			}));
		}
		return record;
	});
}

Context.register("reconcileOrphanedTurns", reconcileOrphanedTurns);
module.exports = reconcileOrphanedTurns;
