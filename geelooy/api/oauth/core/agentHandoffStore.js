// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Policy = require("./agentHandoffPolicy.js");
const KEY = Symbol.for("awtsmoos.oauth.agentHandoffStore.v1");
const root = globalThis[KEY] || (globalThis[KEY] = { byId: new Map(), byState: new Map() });

/**
 * @file Short-lived automatic callback relay for external AI agents.
 * @description The Awtsmoos joins one browser consent to one waiting AI vessel. Awtsmoos.com
 * reveals the relay proof only at creation; later status calls must already possess that proof.
 */
function create(input = {}, now = Date.now()) {
	cleanup(now);
	if (root.byId.size >= Policy.HANDOFF_MAX_RECORDS) throw new Error("handoff_capacity_reached");
	const id = token("awt_handoff_", Policy.HANDOFF_ID_BYTES);
	const proof = token("awt_proof_", Policy.HANDOFF_PROOF_BYTES);
	const state = token("awt_state_", Policy.STATE_BYTES);
	const record = {
		id, proof, state, status: "pending", createdAt: now,
		expiresAt: now + Policy.HANDOFF_TTL_MS,
		clientId: String(input.clientId || "external-agent"),
		scope: Policy.bounded(input.scope, Policy.MAX_SCOPE_LENGTH, "scope"),
		codeChallenge: Policy.bounded(input.codeChallenge, Policy.MAX_CHALLENGE_LENGTH, "code_challenge"),
		codeChallengeMethod: "S256",
		result: null
	};
	root.byId.set(id, record);
	root.byState.set(state, id);
	return { ...publicRecord(record), handoffProof: proof };
}

function completeByState(state, result = {}, now = Date.now()) {
	cleanup(now);
	const id = root.byState.get(String(state || ""));
	const record = id ? root.byId.get(id) : null;
	if (!record || expired(record, now)) return { ok: false, delivered: false };
	record.status = result.error ? "error" : "complete";
	record.result = { code: String(result.code || ""), error: String(result.error || ""), state: record.state };
	record.completedAt = now;
	return { ok: true, delivered: true, handoffId: record.id };
}

function status(id, proof, now = Date.now()) {
	cleanup(now);
	const record = root.byId.get(String(id || ""));
	if (!record || expired(record, now)) return { ok: false, error: "handoff_not_found" };
	if (!safeEqual(record.proof, proof)) return { ok: false, error: "handoff_unauthorized" };
	return { ok: true, ...publicRecord(record), result: record.result ? { ...record.result } : null };
}
function acknowledge(id, proof) {
	const current = status(id, proof);
	if (!current.ok) return current;
	remove(String(id));
	return { ok: true, acknowledged: true };
}
function cleanup(now = Date.now()) { for (const record of root.byId.values()) if (expired(record, now)) remove(record.id); }
function remove(id) { const record = root.byId.get(id); if (record) root.byState.delete(record.state); root.byId.delete(id); }
function expired(record, now) { return Number(record.expiresAt || 0) <= now; }
function token(prefix, bytes) { return prefix + crypto.randomBytes(bytes).toString("base64url"); }
function safeEqual(expected, actual) {
	const a = Buffer.from(String(expected || "")); const b = Buffer.from(String(actual || ""));
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function publicRecord(record) {
	return { handoffId: record.id, state: record.state, status: record.status,
		expiresAt: record.expiresAt, clientId: record.clientId, scope: record.scope };
}
module.exports = { acknowledge, cleanup, completeByState, create, status };
