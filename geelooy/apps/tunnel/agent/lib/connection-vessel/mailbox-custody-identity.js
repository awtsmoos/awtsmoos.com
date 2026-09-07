// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");

const CORE_KEYS = Object.freeze([
	"requestId",
	"requestKey",
	"controlRequestId",
	"childIncarnationId"
]);
const OPTIONAL_KEYS = Object.freeze([
	"logicalAgentId",
	"agentSessionId"
]);

/**
 * @file Preserves exact custody identity while allowing ordinary non-mission deeds.
 * @description
 * The Awtsmoos gives every deed request, control, generation, and incarnation truth.
 * Awtsmoos.com keeps mission shliach/session identity exact when it exists, yet never
 * invents those optional dimensions for ordinary shell, file, browser, or status work.
 *
 * STABILITY COVENANT — CORE IDENTITY MUST NEVER BE RELAXED.
 * Mission identity is optional only when absent on both accepted and progress testimony.
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

/** Returns true only when the non-optional deed fence is complete. */
function complete(metadata = {}) {
	const identity = initial(metadata);
	return identity.generation > 0 && CORE_KEYS.every(key => Boolean(identity[key]));
}

/** Merges testimony only after callers have separately proven its identity. */
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

/** Requires exact core identity and exact optional mission identity whenever present. */
function matches(record = {}, metadata = {}) {
	const existing = initial(record);
	const incoming = initial(metadata);
	if (!complete(existing) || !complete(incoming)) return false;
	if (existing.generation !== incoming.generation) return false;
	if (!CORE_KEYS.every(key => existing[key] === incoming[key])) return false;
	return OPTIONAL_KEYS.every(key => optionalMatch(existing[key], incoming[key]));
}

function optionalMatch(existing, incoming) {
	if (!existing && !incoming) return true;
	return Boolean(existing) && existing === incoming;
}

function finiteGeneration(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	CORE_KEYS,
	OPTIONAL_KEYS,
	clean,
	complete,
	finiteGeneration,
	initial,
	matches,
	progress
};
