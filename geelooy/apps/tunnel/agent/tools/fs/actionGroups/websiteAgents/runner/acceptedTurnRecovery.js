//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const RouteEvidence = require("./conversationRouteEvidence.js");
const { Dispatch, Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Restores only turns with durable testimony of a real upstream ChatGPT conversation.
 * @description
 * The Awtsmoos never lets retry intent outrank accepted testimony, yet a local relay key is not a chat.
 * Awtsmoos.com restores only /c/<uuid> evidence and quarantines accepted responses lacking that route.
 */
function acceptedAt(value) {
	if (value === null || value === undefined || value === "") return null;
	const numeric = Number(value);
	const date = Number.isFinite(numeric) ? new Date(numeric) : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function preserve(id, agentId, round, receipt = {}, source = "durable_receipt") {
	const instant = acceptedAt(receipt.acceptedAt);
	const conversationId = RouteEvidence.validConversationId(receipt.conversationId);
	if (!instant || !conversationId) return false;
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		if (!target) return current;
		target.round = Math.max(Number(target.round || 0), Number(round || 0));
		target.status = "dispatched";
		target.error = null;
		target.pendingRound = null;
		target.responseAcceptedAt = instant;
		target.submissionAcceptedAt = instant;
		target.conversationId = conversationId;
		target.conversationKey = conversationId;
		target.conversationUrl = `https://chatgpt.com/c/${conversationId}`;
		target.conversationRouteVerifiedAt = instant;
		target.lastUpdate = "Accepted website turn restored from canonical /c/<uuid> evidence; no resubmission occurred.";
		target.lastOutcome = Dispatch.receipt({ ...receipt, acceptedAt: instant, conversationId });
		current.events.push(event("accepted_turn_recovered", { agentId, round, acceptedAt: instant, conversationId, source }));
		return current;
	});
	return true;
}

function quarantine(id, agentId, round, error) {
	if (error?.submissionAccepted !== true) return false;
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		if (!target) return current;
		target.status = "awaiting_recovery";
		target.pendingRound = round;
		target.responseAcceptedAt = acceptedAt(error.acceptedAt) || target.responseAcceptedAt;
		target.error = String(error.code || error.message || "accepted_response_without_verified_conversation_route").slice(0, 2000);
		current.events.push(event("accepted_response_quarantined", { agentId, round, error: target.error }));
		return current;
	});
	return true;
}

function existing(id, agentId, round) {
	const record = Store.read(id);
	const agent = record?.agents.find(item => item.id === agentId);
	if (!RouteEvidence.complete(agent)) return false;
	if (agent.round > Number(round || 0)) return true;
	return preserve(id, agentId, round, {
		...agent.lastOutcome,
		acceptedAt: agent.submissionAcceptedAt,
		conversationId: RouteEvidence.conversationId(agent)
	}, "mission_progress");
}

function fromError(id, agentId, round, error) {
	const receipt = error?.acceptedReceipt || null;
	if (error?.code === "website_turn_already_accepted" && receipt?.acceptedAt) {
		return preserve(id, agentId, round, receipt, "global_accepted_journal");
	}
	return quarantine(id, agentId, round, error);
}

module.exports = { acceptedAt, existing, fromError, preserve, quarantine };
