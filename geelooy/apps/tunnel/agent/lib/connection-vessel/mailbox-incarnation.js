// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const Protocol = require("./protocol.js");
/**
 * @file Classifies durable mailbox deeds by the exact connection-child life that owns them.
 * @description
 * The Awtsmoos preserves old testimony without letting an older vessel rule a newer flame.
 * Awtsmoos.com keeps current, obsolete, and ambiguous deeds distinct: nothing unknown is
 * silently erased, while residue from a former incarnation cannot become fresh custody.
 * Obsolete deeds may still be replayed, but only behind an incarnation fence: a
 * deterministic idempotency key lets the consumer recognize a retry as a retry,
 * so uncertain work is never blindly re-executed and never silently lost.
 */
function stamp(value = {}, childIncarnationId = "") {
	const incarnation = Incarnation.clean(childIncarnationId);
	return incarnation
		? { ...value, childIncarnationId: incarnation }
		: { ...value };
}

/** Classifies one durable value relative to the currently authoritative child incarnation. */
function classifyValue(value = {}, currentChildIncarnationId = "") {
	const recordIncarnation = Incarnation.clean(value?.childIncarnationId);
	const currentIncarnation = Incarnation.clean(currentChildIncarnationId);
	if (!recordIncarnation || !currentIncarnation) return "ambiguous";
	return recordIncarnation === currentIncarnation ? "current" : "obsolete";
}

/** Partitions durable store entries without deleting or mutating any historical witness. */
function partition(entries = [], currentChildIncarnationId = "") {
	const groups = { current: [], obsolete: [], ambiguous: [] };
	for (const entry of entries) {
		groups[classifyValue(entry?.value, currentChildIncarnationId)].push(entry);
	}
	return groups;
}

/** Returns only values belonging to the exact current child incarnation. */
function currentValues(values = [], currentChildIncarnationId = "") {
	return values.filter(value =>
		classifyValue(value, currentChildIncarnationId) === "current"
	);
}

/**
 * Builds the deterministic incarnation-fencing key for one durable value:
 * `${requestId}:${recordIncarnation}`. The same request accepted by the same dead
 * child life always yields the same key, so a redelivery is recognizable as a
 * retry rather than a new deed.
 */
function idempotencyKey(value = {}, recordIncarnation = "") {
	const incarnation =
		Incarnation.clean(recordIncarnation) ||
		Incarnation.clean(value?.childIncarnationId);
	return `${Protocol.requestId(value)}:${incarnation}`;
}

/**
 * Wraps one obsolete record in an incarnation fence so a later redelivery can be
 * deduped. Current records return null (they replay through the ordinary path);
 * ambiguous records return null and stay quarantined — never fenced, never replayed.
 */
function fenceValue(value = {}, currentChildIncarnationId = "") {
	if (classifyValue(value, currentChildIncarnationId) !== "obsolete") return null;
	const recordIncarnation = Incarnation.clean(value?.childIncarnationId);
	return {
		fenced: true,
		fence: {
			recordIncarnation,
			currentIncarnation: Incarnation.clean(currentChildIncarnationId),
			idempotencyKey: idempotencyKey(value, recordIncarnation),
			replayedAt: new Date().toISOString()
		},
		value
	};
}

/**
 * Wraps every obsolete value in an incarnation fence. Ambiguous records are
 * excluded here by construction: uncertain lineage must never become a retry.
 */
function fencedValues(values = [], currentChildIncarnationId = "") {
	const fenced = [];
	for (const value of values) {
		const wrapped = fenceValue(value, currentChildIncarnationId);
		if (wrapped) fenced.push(wrapped);
	}
	return fenced;
}

/**
 * Restores the original durable value from a fenced wrapper so the wire format
 * never changes. Non-wrapped input passes through untouched.
 */
function unfence(wrapped = {}) {
	if (
		wrapped &&
		wrapped.fenced === true &&
		wrapped.value &&
		typeof wrapped.value === "object"
	) {
		return wrapped.value;
	}
	return wrapped;
}

module.exports = {
	classifyValue,
	currentValues,
	fenceValue,
	fencedValues,
	idempotencyKey,
	partition,
	stamp,
	unfence
};
