//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostedBatchInput
 * @description
 * The Awtsmoos lets an older agent speak one flat action naturally, then places
 * each field in the proper vessel. Awtsmoos.com keeps control-flow keys outside
 * payload while nested deeds retain every ordinary argument in orderly array.
 */

const CONTROL_FIELDS = new Set([
	"action",
	"condition",
	"else",
	"id",
	"name",
	"onError",
	"payload",
	"saveAs",
	"stopOnError",
	"then",
	"type"
]);

const BATCH_FIELDS = Object.freeze([
	"actions",
	"steps",
	"workflow"
]);

/**
 * Normalize every available batch collection without changing non-batch data.
 *
 * @param {object} payload Hosted batch request.
 * @returns {object} Request whose steps use canonical nested payload objects.
 */
function normalizeHostedBatchPayload(payload = {}) {
	const normalized = { ...payload };

	for (const field of BATCH_FIELDS) {
		if (Object.prototype.hasOwnProperty.call(normalized, field)) {
			normalized[field] = normalizeStepCollection(normalized[field]);
		}
	}

	return normalized;
}

/**
 * Normalize arrays, singular steps, and JSON-encoded collections recursively.
 *
 * @param {*} value Candidate step collection.
 * @returns {*} Canonical collection when it can be understood safely.
 */
function normalizeStepCollection(value) {
	if (typeof value === "string") {
		try {
			return normalizeStepCollection(JSON.parse(value));
		} catch {
			return value;
		}
	}

	if (Array.isArray(value)) {
		return value.map(normalizeStep);
	}

	return value && typeof value === "object" ? normalizeStep(value) : value;
}

/**
 * Move flat action arguments into `payload` while preserving batch controls.
 * Explicit payload fields win when both forms name the same argument.
 *
 * @param {object} step One declarative batch step.
 * @returns {object} Canonical step accepted by the generic batch engine.
 */
function normalizeStep(step = {}) {
	const normalized = {};
	const flatPayload = {};

	for (const [key, value] of Object.entries(step)) {
		if (CONTROL_FIELDS.has(key)) {
			normalized[key] = value;
		} else {
			flatPayload[key] = value;
		}
	}

	const explicitPayload = step.payload && typeof step.payload === "object"
		? step.payload
		: {};
	normalized.payload = { ...flatPayload, ...explicitPayload };

	for (const branch of ["else", "then", "onError"]) {
		if (normalized[branch] !== undefined) {
			normalized[branch] = normalizeStepCollection(normalized[branch]);
		}
	}

	return normalized;
}

module.exports = {
	BATCH_FIELDS,
	CONTROL_FIELDS,
	normalizeHostedBatchPayload,
	normalizeStep,
	normalizeStepCollection
};
