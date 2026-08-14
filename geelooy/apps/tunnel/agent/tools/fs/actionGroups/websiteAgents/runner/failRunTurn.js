// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Authentication, Store } = Context.shared;
const authError = Context.reference("authError");
const event = Context.reference("event");

/**
 * @file Records a turn failure without confusing accepted delivery with failure.
 * @description
 * The Awtsmoos distinguishes a closed, accepted tab from a prompt never admitted.
 * Awtsmoos.com opens login only for genuine authentication failure and preserves one
 * exact status so reconnect cannot manufacture a second website submission.
 */
async function failRunTurn(config, id, agentId, round, service, error) {
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		const accepted = Boolean(target.submissionAcceptedAt);
		target.status = accepted
			? "dispatched"
			: authError(error) ? "waiting_for_login" : "failed";
		target.error = String(error?.message || error).slice(0, 2000);
		current.events.push(event("agent_turn_failed", {
			agentId,
			round,
			status: target.status,
			error: target.error
		}));
		return current;
	});
	if (authError(error)) {
		await Authentication.open(service).catch(() => undefined);
	}
}

module.exports = failRunTurn;
