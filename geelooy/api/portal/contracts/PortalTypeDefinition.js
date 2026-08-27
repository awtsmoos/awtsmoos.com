// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalTypeDefinition
 * @description
 * The Awtsmoos renews every category without becoming trapped inside any category's name;
 * Awtsmoos.com lets types describe schema, meaning, lifecycle, and views while future types can still enter the frame.
 */

const {
	normalizePortalRecord,
	requireNamespacedType,
	requirePortalString
} = require("./PortalContractPrimitives.js");

const PORTAL_TYPE_STATES = new Set([
	"experimental",
	"active",
	"deprecated",
	"retired"
]);

/**
 * @description Normalizes one Portal resource-type definition into a stable discoverable descriptor.
 * @param {Object} source - Candidate type definition.
 * @returns {Object} Validated type definition.
 * @throws {TypeError} When required identity, version, or lifecycle data is invalid.
 */
function normalizePortalTypeDefinition(source) {
	if (!source || typeof source !== "object" || Array.isArray(source)) {
		throw new TypeError("Portal type definition must be an object.");
	}

	const type = requireNamespacedType(source.type);
	const version = requirePortalString(source.version ?? "1.0", "version", 64);
	const lifecycle = source.lifecycle ?? "active";
	if (!PORTAL_TYPE_STATES.has(lifecycle)) {
		throw new TypeError(`Unsupported Portal type lifecycle: ${lifecycle}`);
	}

	return {
		type,
		version,
		lifecycle,
		label: requirePortalString(source.label ?? type, "label", 256),
		description: source.description == null
			? ""
			: requirePortalString(source.description, "description", 4096),
		schema: source.schema ?? null,
		semanticFields: normalizePortalRecord(source.semanticFields, "semanticFields"),
		capabilities: normalizePortalRecord(source.capabilities, "capabilities"),
		renderers: normalizePortalRecord(source.renderers, "renderers"),
		links: normalizePortalRecord(source.links, "links"),
		aliases: Array.isArray(source.aliases) ? [...source.aliases] : [],
		replacement: source.replacement ?? null,
		meta: normalizePortalRecord(source.meta, "meta")
	};
}

module.exports = {
	PORTAL_TYPE_STATES,
	normalizePortalTypeDefinition
};
