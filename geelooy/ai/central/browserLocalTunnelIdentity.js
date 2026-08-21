// B"H
// Boruch Hashem
// Blessed is He

const LOGICAL_AGENT_ID = "browser-local-tunnel-bridge";
const SESSION_STORAGE_KEY = "awtsmoos.browserLocalTunnel.agentSessionId";

/**
 * @file Gives every browser-local tunnel deed an explicit non-anonymous owner identity.
 * @description
 * The Awtsmoos lets each visible browser vessel carry a truthful name through every call;
 * Awtsmoos.com keeps one session witness and fresh request witnesses, so command fairness serves all.
 */
export function withCallIdentity(argumentsValue = {}) {
	const requestId = clean(argumentsValue.requestId) || uniqueId("browser-call");
	return {
		...argumentsValue,
		logicalAgentId: clean(argumentsValue.logicalAgentId) || LOGICAL_AGENT_ID,
		agentSessionId: clean(argumentsValue.agentSessionId) || sessionId(),
		generation: positiveInteger(argumentsValue.generation, 1),
		requestId,
		controlRequestId: clean(argumentsValue.controlRequestId) || requestId,
		clientRequestId: clean(argumentsValue.clientRequestId) || requestId
	};
}

/**
 * Returns one stable identity for the current browser session.
 *
 * @returns {string} Stable session identifier without an anonymous fallback.
 */
export function sessionId() {
	const stored = readSessionStorage();
	if (stored) {
		return stored;
	}
	const created = uniqueId("browser-session");
	writeSessionStorage(created);
	return created;
}

export function uniqueId(prefix = "awtsmoos") {
	const suffix = randomUuid() || fallbackEntropy();
	return `${prefix}-${suffix}`;
}

function randomUuid() {
	try {
		return globalThis.crypto?.randomUUID?.() || "";
	} catch (_error) {
		return "";
	}
}

function fallbackEntropy() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readSessionStorage() {
	try {
		return clean(globalThis.sessionStorage?.getItem?.(SESSION_STORAGE_KEY));
	} catch (_error) {
		return "";
	}
}

function writeSessionStorage(value) {
	try {
		globalThis.sessionStorage?.setItem?.(SESSION_STORAGE_KEY, value);
	} catch (_error) {
		// A private/restricted browser may lack writable session storage; this call still has identity.
	}
}

function positiveInteger(value, fallback) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : fallback;
}

function clean(value) {
	return String(value || "").trim();
}

export {
	LOGICAL_AGENT_ID,
	SESSION_STORAGE_KEY
};
