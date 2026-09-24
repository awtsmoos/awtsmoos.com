// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Mints and carries the ingress trace ID for one action lifecycle.
 * @description
 * The trace ID is minted once at ingress and written back onto the request
 * payload, so every action-stream event for that request — received, queued,
 * started, completed, error — carries the same identifier. A caller-supplied
 * traceId/correlationId is always respected; the mint only fills the gap.
 */

const ALIASES = ["traceId", "trace_id", "correlationId", "correlation_id"];

/** Reads an existing trace identifier from a payload without mutating it. */
function readTraceId(payload) {
	if (!payload || typeof payload !== "object") return "";
	for (const key of ALIASES) {
		const value = payload[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return "";
}

/** Cryptographically random trace ID; never collides across processes. */
function mintTraceId() {
	if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `trace-${Date.now().toString(36)}-${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Ensures a payload carries a trace ID. The existing one wins; a fresh one is
 * minted and written back exactly once. Returns the effective trace ID.
 */
function ensureTraceId(payload) {
	const existing = readTraceId(payload);
	if (existing) return existing;
	const minted = mintTraceId();
	if (payload && typeof payload === "object" && !Array.isArray(payload)) {
		try {
			payload.traceId = minted;
		} catch {
			// Frozen payload: the caller still gets the minted ID to carry itself.
		}
	}
	return minted;
}

module.exports = {
	ALIASES,
	ensureTraceId,
	mintTraceId,
	readTraceId
};
