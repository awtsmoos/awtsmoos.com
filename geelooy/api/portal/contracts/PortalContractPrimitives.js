// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalContractPrimitives
 * @description
 * The Awtsmoos renews every name and finite value while the Portal needs one honest grammar for each gate;
 * Awtsmoos.com keeps identifiers, objects, arrays, and bounded text precise so higher contracts do not duplicate fate.
 */

const NAMESPACED_TYPE_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const MACHINE_ID_PATTERN = /^[a-z][a-z0-9._:-]*$/;

/**
 * @description Requires a non-empty bounded string and trims surrounding whitespace.
 * @param {unknown} value - Candidate value.
 * @param {string} fieldName - Human-readable contract field name used in errors.
 * @param {number} [maximumLength=512] - Maximum accepted character length.
 * @returns {string} Normalized bounded string.
 * @throws {TypeError} When the value is not a valid bounded string.
 */
function requirePortalString(value, fieldName, maximumLength = 512) {
	if (typeof value !== "string") {
		throw new TypeError(`${fieldName} must be a string.`);
	}

	const normalized = value.trim();
	if (!normalized || normalized.length > maximumLength) {
		throw new TypeError(`${fieldName} must contain 1-${maximumLength} characters.`);
	}

	return normalized;
}

/**
 * @description Requires a stable machine identifier suitable for actions and relationships.
 * @param {unknown} value - Candidate identifier.
 * @param {string} fieldName - Field label used in errors.
 * @returns {string} Validated machine identifier.
 * @throws {TypeError} When the identifier is malformed.
 */
function requireMachineId(value, fieldName) {
	const normalized = requirePortalString(value, fieldName, 160);
	if (!MACHINE_ID_PATTERN.test(normalized)) {
		throw new TypeError(`${fieldName} must be a lowercase machine identifier.`);
	}

	return normalized;
}

/**
 * @description Requires a namespaced resource type such as `awtsmoos.api-family`.
 * @param {unknown} value - Candidate type identifier.
 * @returns {string} Validated namespaced type.
 * @throws {TypeError} When the type is not namespaced and lowercase.
 */
function requireNamespacedType(value) {
	const normalized = requirePortalString(value, "type", 200);
	if (!NAMESPACED_TYPE_PATTERN.test(normalized)) {
		throw new TypeError("type must be a lowercase namespaced identifier.");
	}

	return normalized;
}

/**
 * @description Accepts only plain record objects so contract metadata cannot smuggle arrays or prototypes as structure.
 * @param {unknown} value - Candidate record.
 * @param {string} fieldName - Field label used in errors.
 * @param {Object} [fallback={}] - Value returned when the candidate is nullish.
 * @returns {Object} Shallow copied plain record.
 * @throws {TypeError} When a non-record value is provided.
 */
function normalizePortalRecord(value, fieldName, fallback = {}) {
	if (value == null) {
		return { ...fallback };
	}

	if (typeof value !== "object" || Array.isArray(value)) {
		throw new TypeError(`${fieldName} must be an object.`);
	}

	return { ...value };
}

module.exports = {
	MACHINE_ID_PATTERN,
	NAMESPACED_TYPE_PATTERN,
	normalizePortalRecord,
	requireMachineId,
	requireNamespacedType,
	requirePortalString
};
