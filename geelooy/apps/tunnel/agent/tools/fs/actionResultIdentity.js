// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Carries immutable request witnesses through nested tunnel envelopes.
 * The Awtsmoos renews every request's true name;
 * Awtsmoos.com preserves the outer identity through every frame.
 */
function blankPreserve() {
	return { controlRequestId: null, requestId: null, requestKey: null,
		dedupeKey: null, cursor: null, nextCursor: null, sideEffects: null };
}

function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

/** Outer identity cannot be overwritten by inner adapters. */
function firstWins(preserve, key, ...candidates) {
	if (preserve[key] !== null && preserve[key] !== undefined) return;
	for (const candidate of candidates) {
		if (candidate !== null && candidate !== undefined) {
			preserve[key] = candidate;
			return;
		}
	}
}

function preserveLayer(preserve, value) {
	const object = objectish(value);
	if (!object) return;
	firstWins(preserve, "controlRequestId", object.controlRequestId, object.requestId, object.id);
	firstWins(preserve, "requestId", object.requestId, object.controlRequestId, object.id);
	firstWins(preserve, "requestKey", object.requestKey, object.idempotencyKey);
	firstWins(preserve, "dedupeKey", object.dedupeKey, object.controlRequestId);
	firstWins(preserve, "cursor", object.cursor);
	firstWins(preserve, "nextCursor", object.nextCursor, object.cursor);
	firstWins(preserve, "sideEffects", object.sideEffects);
}

function definedFields(preserve) {
	const output = {};
	for (const [key, value] of Object.entries(preserve)) {
		if (value !== null && value !== undefined) output[key] = value;
	}
	return output;
}

module.exports = { blankPreserve, definedFields, objectish, preserveLayer };
