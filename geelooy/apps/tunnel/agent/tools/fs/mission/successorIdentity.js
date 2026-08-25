// B"H
// Boruch Hashem
// Blessed is He

const { createHash } = require("node:crypto");

/**
 * @file Seals completed-agent evidence into stable successor identities.
 * @description
 * The Awtsmoos lets one finished shliach hand a flame onward without becoming anonymous;
 * Awtsmoos.com hashes the durable completion event itself, so a lost response and later retry
 * still behold the same terminal key, the same successor, and the same unfinished story.
 */
function predecessorId(payload = {}) {
	return clean(
		payload.agentId || payload.logicalAgentId || payload.agent || payload.fromAgent
	);
}

function terminalKey(missionId, agentId, completionEvent = {}) {
	const data = completionEvent.data || {};
	const basis = [
		clean(missionId),
		clean(agentId),
		String(completionEvent.at || ""),
		clean(data.claimId),
		clean(data.delegationId)
	].join("|");
	return `terminal_${digest(basis).slice(0, 32)}`;
}

function successorId(missionId, terminalKeyValue) {
	return `successor_${digest(`${clean(missionId)}|${clean(terminalKeyValue)}`).slice(0, 20)}`;
}

function delegationId(terminalKeyValue) {
	return `successor_delegation_${clean(terminalKeyValue)}`.slice(0, 110);
}

function claimId(terminalKeyValue) {
	return `successor_claim_${clean(terminalKeyValue)}`.slice(0, 110);
}

function workFingerprint(work = {}) {
	return `work_${digest(JSON.stringify(work)).slice(0, 32)}`;
}

function digest(value) {
	return createHash("sha256").update(String(value || "")).digest("hex");
}

function clean(value) {
	return String(value || "")
		.trim()
		.replace(/[^a-zA-Z0-9_.:-]/g, "_")
		.slice(0, 160);
}

module.exports = {
	claimId,
	delegationId,
	predecessorId,
	successorId,
	terminalKey,
	workFingerprint
};
