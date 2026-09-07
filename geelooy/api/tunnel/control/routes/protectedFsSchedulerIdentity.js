// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Restores scheduler identity at the authenticated Tunnel Control boundary.
 * @description
 * The Awtsmoos knows the caller before the deed enters fair scheduling. Awtsmoos.com
 * preserves explicit agent labels while deriving absent labels only from authenticated
 * account testimony, and gives every ordinary deed one exact request identity.
 */
function attach(payload = {}, identity = {}, tunnelName = "auto") {
	const result = { ...payload };
	const controlRequestId = clean(result.controlRequestId) || requestId("ctl");
	const clientRequestId = clean(result.clientRequestId) ||
		clean(result.requestId) || requestId("client");
	const nonce = clean(result.nonce) || requestId("nonce");
	result.controlRequestId = controlRequestId;
	result.clientRequestId = clientRequestId;
	result.nonce = nonce;
	result.requestId = clean(result.requestId) || controlRequestId || clientRequestId || nonce;
	result.logicalAgentId = clean(result.logicalAgentId || result.agentClientId) ||
		logicalAgentId(identity, result);
	result.agentSessionId = clean(result.agentSessionId) ||
		agentSessionId(identity, result, tunnelName);
	result.generation = positive(result.generation, 1);
	if (result.action !== "retryAction" && !result.originalControlRequestId) {
		result.originalControlRequestId = controlRequestId;
	}
	return result;
}

function logicalAgentId(identity = {}, payload = {}) {
	return [
		"agent",
		identity.userId || identity.accountId || "anonymous",
		conversation(payload)
	].map(slug).join(":");
}

function agentSessionId(identity = {}, payload = {}, tunnelName = "auto") {
	return [
		"session",
		identity.userId || identity.accountId || "anonymous",
		tunnelName || "auto",
		conversation(payload)
	].map(slug).join(":");
}

function conversation(payload = {}) {
	return payload.conversationId || payload.conversationName || "default";
}

function requestId(prefix) {
	return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(8).toString("hex")}`;
}

function slug(value) {
	return String(value || "").toLowerCase()
		.replace(/[^a-z0-9._:-]+/g, "-")
		.replace(/^-+|-+$/g, "") || "x";
}

function clean(value) {
	return value === undefined || value === null ? "" : String(value).trim();
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
}

module.exports = {
	agentSessionId,
	attach,
	logicalAgentId,
	requestId,
	slug
};
