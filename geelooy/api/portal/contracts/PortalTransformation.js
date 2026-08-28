// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalTransformation
 * @description
 * The Awtsmoos renews possibility before transformation becomes form;
 * Awtsmoos.com describes accepted types, outputs, determinism, side effects, execution, and fanout so generation remains immense without becoming storm.
 */

const {
	normalizePortalRecord,
	requireMachineId
} = require("./PortalContractPrimitives.js");
const {
	PORTAL_CONTRACT_LIMITS,
	clampPortalInteger
} = require("./PortalContractLimits.js");

const SIDE_EFFECT_CLASSES = new Set(["none", "read", "write", "external"]);
const TRANSFORMATION_EXECUTION_MODES = new Set(["sync", "job"]);

/**
 * @description Normalizes one transformation capability without providing an execution backend.
 * @param {Object} source - Candidate transformation descriptor.
 * @returns {Object} Stable transformation definition.
 * @throws {TypeError} When identifiers or execution semantics are invalid.
 */
function normalizePortalTransformation(source) {
	const transformation = normalizePortalRecord(source, "transformation");
	const sideEffectClass = transformation.sideEffectClass ?? "none";
	const execution = transformation.execution ?? "job";

	if (!SIDE_EFFECT_CLASSES.has(sideEffectClass)) {
		throw new TypeError(`Unsupported transformation side effect class: ${sideEffectClass}`);
	}
	if (!TRANSFORMATION_EXECUTION_MODES.has(execution)) {
		throw new TypeError(`Unsupported transformation execution mode: ${execution}`);
	}

	return {
		id: requireMachineId(transformation.id, "transformation id"),
		accepts: Array.isArray(transformation.accepts) ? transformation.accepts.slice(0, 64) : [],
		outputs: Array.isArray(transformation.outputs) ? transformation.outputs.slice(0, 64) : [],
		configSchema: transformation.configSchema ?? null,
		deterministic: transformation.deterministic === true,
		sideEffectClass,
		execution,
		fanoutMax: clampPortalInteger(
			transformation.fanoutMax,
			1,
			PORTAL_CONTRACT_LIMITS.maxTransformationFanout,
			1
		),
		permission: transformation.permission ?? null,
		cost: normalizePortalRecord(transformation.cost, "transformation cost"),
		links: normalizePortalRecord(transformation.links, "transformation links"),
		meta: normalizePortalRecord(transformation.meta, "transformation meta")
	};
}

module.exports = {
	SIDE_EFFECT_CLASSES,
	TRANSFORMATION_EXECUTION_MODES,
	normalizePortalTransformation
};
