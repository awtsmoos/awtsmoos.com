//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { Dispatch, Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Restores accepted website turns from durable exactly-once testimony.
 * @description
 * The Awtsmoos never lets retry intent outrank an accepted POST. Mission state is
 * rebuilt from either its own progress receipt or the permanent global queue journal.
 */

/** Returns a normalized ISO acceptance instant, or null when testimony is absent. */
function acceptedAt(value) {
	if (value === null || value === undefined || value === "") return null;
	const numeric = Number(value);
	const date = Number.isFinite(numeric) ? new Date(numeric) : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Restores one agent to dispatched state without performing browser work. */
function preserve(id, agentId, round, receipt = {}, source = "durable_receipt") {
	const instant = acceptedAt(receipt.acceptedAt);
	if (!instant) return false;
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		if (!target) return current;
		target.round = Math.max(Number(target.round || 0), Number(round || 0));
		target.status = "dispatched";
		target.error = null;
		target.pendingRound = null;
		target.submissionAcceptedAt = instant;
		target.lastUpdate = "Accepted website turn restored from durable exactly-once evidence; no resubmission occurred.";
		target.lastOutcome = Dispatch.receipt({
			...receipt,
			acceptedAt: instant,
			tabCloseVerified: receipt.tabCloseVerified === true || Boolean(receipt.closedAt),
			tabClosedAt: receipt.tabClosedAt || acceptedAt(receipt.closedAt)
		});
		current.events.push(event("accepted_turn_recovered", {
			agentId,
			round,
			acceptedAt: instant,
			source
		}));
		return current;
	});
	return true;
}

/** Preserves mission-local accepted progress before prepareRunTurn can clear it. */
function existing(id, agentId, round) {
	const record = Store.read(id);
	const agent = record?.agents.find(item => item.id === agentId);
	if (!agent?.submissionAcceptedAt) return false;
	if (agent.round > Number(round || 0)) return true;
	return preserve(id, agentId, round, {
		...agent.lastOutcome,
		acceptedAt: agent.submissionAcceptedAt,
		tabCloseVerified: agent.lastOutcome?.tabCloseVerified === true,
		tabClosedAt: agent.lastOutcome?.tabClosedAt
	}, "mission_progress");
}

/** Converts the permanent queue's already-accepted error into dispatch recovery. */
function fromError(id, agentId, round, error) {
	const receipt = error?.acceptedReceipt || null;
	if (error?.code !== "website_turn_already_accepted" || !receipt?.acceptedAt) {
		return false;
	}
	return preserve(id, agentId, round, receipt, "global_accepted_journal");
}

module.exports = {
	acceptedAt,
	existing,
	fromError,
	preserve
};
