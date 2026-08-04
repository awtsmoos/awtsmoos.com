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

/**
 * @file Reveals the recoverAcceptedTurns stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function recoverAcceptedTurns(config, id) {
	const record = Store.read(id);
	if (!record) return;
	const accepted = record.agents.filter(agent =>
		agent.status === "awaiting_recovery" ||
		(agent.status === "submitting" && agent.submissionAcceptedAt)
	);
	for (const agent of accepted) {
		Store.update(id, current => {
			const target = current.agents.find(item => item.id === agent.id);
			if (!target) return current;
			target.status = "dispatched";
			target.error = null;
			target.pendingRound = null;
			target.lastUpdate = "Accepted prompt preserved without response recovery or resubmission.";
			target.lastOutcome = Dispatch.receipt({ acceptedAt: target.submissionAcceptedAt });
			current.events.push(event("accepted_turn_preserved_as_dispatch", {
				agentId: target.id,
				acceptedAt: target.submissionAcceptedAt
			}));
			return current;
		});
	}
}

Context.register("recoverAcceptedTurns", recoverAcceptedTurns);
module.exports = recoverAcceptedTurns;
