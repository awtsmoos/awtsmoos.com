//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const RouteEvidence = require("./conversationRouteEvidence.js");
const { Dispatch, Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Restores only accepted turns whose real ChatGPT account route was already verified.
 * @description
 * The Awtsmoos does not let a 200 response masquerade as a saved thread after restart.
 * Awtsmoos.com preserves route-less acceptance as recovery debt and never silently resubmits it.
 */
async function recoverAcceptedTurns(config, id) {
	const record = Store.read(id);
	if (!record) return;
	for (const agent of record.agents.filter(item => item.status === "awaiting_recovery" || item.status === "submitting")) {
		Store.update(id, current => {
			const target = current.agents.find(item => item.id === agent.id);
			if (!target) return current;
			if (!RouteEvidence.complete(target)) {
				target.status = "awaiting_recovery";
				target.error = "accepted_response_without_verified_conversation_route";
				return current;
			}
			target.status = "dispatched";
			target.error = null;
			target.pendingRound = null;
			target.lastUpdate = "Accepted prompt restored from verified ChatGPT /c/<uuid> testimony.";
			target.lastOutcome = Dispatch.receipt({
				acceptedAt: target.submissionAcceptedAt,
				conversationId: RouteEvidence.conversationId(target),
				conversationUrl: target.conversationUrl
			});
			current.events.push(event("route_verified_turn_restored", {
				agentId: target.id,
				conversationId: RouteEvidence.conversationId(target)
			}));
			return current;
		});
	}
}

Context.register("recoverAcceptedTurns", recoverAcceptedTurns);
module.exports = recoverAcceptedTurns;
