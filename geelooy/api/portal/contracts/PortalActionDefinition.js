// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalActionDefinition
 * @description
 * The Awtsmoos gives every possible movement a boundary before it becomes deed;
 * Awtsmoos.com describes actions with schemas, confirmation, idempotency, and execution truth so capability never outruns need.
 */

const {
	normalizePortalRecord,
	requireMachineId,
	requirePortalString
} = require("./PortalContractPrimitives.js");

const CONFIRMATION_LEVELS = new Set(["none", "confirm", "typed", "irreversible"]);
const EXECUTION_MODES = new Set(["sync", "job"]);
const IDEMPOTENCY_MODES = new Set(["safe", "keyed", "unsafe"]);

/**
 * @description Normalizes one advertised Portal action without granting permission to invoke it.
 * @param {Object} source - Candidate action descriptor.
 * @returns {Object} Stable action definition for clients and registries.
 * @throws {TypeError} When identifiers or execution semantics are invalid.
 */
function normalizePortalActionDefinition(source) {
	if (!source || typeof source !== "object" || Array.isArray(source)) {
		throw new TypeError("Portal action definition must be an object.");
	}

	const confirmation = source.confirmation ?? "none";
	const execution = source.execution ?? "sync";
	const idempotency = source.idempotency ?? "unsafe";

	if (!CONFIRMATION_LEVELS.has(confirmation)) {
		throw new TypeError(`Unsupported confirmation mode: ${confirmation}`);
	}
	if (!EXECUTION_MODES.has(execution)) {
		throw new TypeError(`Unsupported action execution mode: ${execution}`);
	}
	if (!IDEMPOTENCY_MODES.has(idempotency)) {
		throw new TypeError(`Unsupported action idempotency mode: ${idempotency}`);
	}

	return {
		id: requireMachineId(source.id, "action id"),
		label: requirePortalString(source.label ?? source.id, "action label", 256),
		description: source.description == null
			? ""
			: requirePortalString(source.description, "action description", 4096),
		inputSchema: source.inputSchema ?? null,
		outputTypes: Array.isArray(source.outputTypes) ? [...source.outputTypes] : [],
		available: source.available !== false,
		confirmation,
		execution,
		idempotency,
		retryable: source.retryable === true,
		revisionRequired: source.revisionRequired === true,
		previewSupported: source.previewSupported === true,
		links: normalizePortalRecord(source.links, "action links"),
		meta: normalizePortalRecord(source.meta, "action meta")
	};
}

module.exports = {
	CONFIRMATION_LEVELS,
	EXECUTION_MODES,
	IDEMPOTENCY_MODES,
	normalizePortalActionDefinition
};
