// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");

/**
 * @file Preserves and compares exact identity dimensions for one durable custody deed.
 * @description
 * The Awtsmoos renews the world without exchanging one deed for another. Awtsmoos.com
 * likewise refuses progress whose request, control, session, generation, or incarnation
 * differs from the record that originally entered custody.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Never merge identity before validating it. Old-child or wrong-generation progress must
 * fail closed. Regression: mailboxCustodyIdentity.test.cjs and connectionCustodyProgressIpc.test.cjs.
 */
function initial(metadata = {}) {
	return {
		requestId: clean(metadata.requestId),
		requestKey: clean(metadata.requestKey),
		logicalAgentId: clean(metadata.logicalAgentId),
		agentSessionId: clean(metadata.agentSessionId),
		controlRequestId: clean(metadata.controlRequestId),
		generation: finiteGeneration(metadata.generation),
		childIncarnationId: Incarnation.clean(metadata.childIncarnationId)
	};
}

function progress(record = {}, metadata = {}) {
	const existing = initial(record);
	const incoming = initial(metadata);
	return {
		requestId: incoming.requestId || existing.requestId,
		requestKey: incoming.requestKey || existing.requestKey,
		logicalAgentId: incoming.logicalAgentId || existing.logicalAgentId,
		agentSessionId: incoming.agentSessionId || existing.agentSessionId,
		controlRequestId: incoming.controlRequestId || existing.controlRequestId,
		generation: incoming.generation || existing.generation,
		childIncarnationId: incoming.childIncarnationId || existing.childIncarnationId
	};
}

function matches(record = {}, metadata = {}) {
	const existing = initial(record);
	const incoming = initial(metadata);
	const keys = [
		"requestId",
		"requestKey",
		"logicalAgentId",
		"agentSessionId",
		"controlRequestId",
		"childIncarnationId"
	];
	if (existing.generation <= 0 || existing.generation !== incoming.generation) return false;
	return keys.every(key => Boolean(existing[key]) && existing[key] === incoming[key]);
}

function finiteGeneration(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = { clean, finiteGeneration, initial, matches, progress };
