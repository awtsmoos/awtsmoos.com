//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const RouteEvidence = require("./conversationRouteEvidence.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Reconciles interrupted turns without promoting HTTP acceptance into false chat creation.
 * @description
 * The Awtsmoos preserves uncertainty rather than manufacturing a conversation from intent.
 * Awtsmoos.com requeues only pre-Send work; accepted work without /c/<uuid> stays quarantined.
 */
function reconcileOrphanedTurns(id) {
	return Store.update(id, record => {
		for (const agent of record.agents) {
			if (agent.status !== "submitting") continue;
			if (RouteEvidence.complete(agent)) {
				agent.status = "dispatched";
				agent.error = null;
				record.events.push(event("orphaned_route_verified_turn_preserved", {
					agentId: agent.id,
					conversationId: RouteEvidence.conversationId(agent)
				}));
				continue;
			}
			if (agent.responseAcceptedAt || agent.submissionAcceptedAt) {
				agent.status = "awaiting_recovery";
				agent.error = "accepted_response_without_verified_conversation_route";
				record.events.push(event("orphaned_accepted_turn_quarantined", { agentId: agent.id }));
				continue;
			}
			agent.status = "queued";
			agent.pendingRound = null;
			agent.error = null;
			record.events.push(event("orphaned_pre_submit_turn_requeued", { agentId: agent.id }));
		}
		return record;
	});
}

Context.register("reconcileOrphanedTurns", reconcileOrphanedTurns);
module.exports = reconcileOrphanedTurns;
