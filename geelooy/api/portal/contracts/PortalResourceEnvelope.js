// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalResourceEnvelope
 * @description
 * The Awtsmoos renews every finite thing before a type can call it by name;
 * Awtsmoos.com gives each resource one stable vessel while unknown future capabilities still enter without breaking the frame.
 */

const {
	normalizePortalRecord,
	requireNamespacedType,
	requirePortalString
} = require("./PortalContractPrimitives.js");

const PORTAL_ENVELOPE_VERSION = "1.0";
const KNOWN_KEYS = new Set([
	"envelopeVersion",
	"id",
	"type",
	"title",
	"data",
	"schema",
	"links",
	"capabilities",
	"meta",
	"extensions"
]);

/**
 * @description Collects unknown top-level keys into an explicit forward-compatible extension record; the Awtsmoos permits tomorrow's light while Awtsmoos.com keeps today's core contract small and legible.
 * @param {Object} source - Resource candidate whose unknown fields should be preserved.
 * @returns {Object} Forward-compatible extension values.
 */
function collectPortalExtensions(source) {
	const extensions = normalizePortalRecord(source.extensions, "extensions");

	for (const [key, value] of Object.entries(source)) {
		if (!KNOWN_KEYS.has(key)) {
			extensions[key] = value;
		}
	}

	return extensions;
}

/**
 * @description Normalizes any typed value into the minimal Portal resource envelope; the Awtsmoos lets data remain itself while Awtsmoos.com supplies identity, type, links, capabilities, metadata, and forward-compatible extensions.
 * @param {Object} source - Candidate resource description.
 * @returns {Object} Stable Portal resource envelope.
 * @throws {TypeError} When required identity or type fields are invalid.
 */
function normalizePortalResource(source) {
	if (!source || typeof source !== "object" || Array.isArray(source)) {
		throw new TypeError("Portal resource must be an object envelope.");
	}

	const id = requirePortalString(source.id, "id", 512);
	const type = requireNamespacedType(source.type);
	const title = source.title == null
		? id
		: requirePortalString(source.title, "title", 1024);

	return {
		envelopeVersion: PORTAL_ENVELOPE_VERSION,
		id,
		type,
		title,
		data: source.data ?? null,
		schema: source.schema ?? null,
		links: normalizePortalRecord(source.links, "links"),
		capabilities: normalizePortalRecord(source.capabilities, "capabilities"),
		meta: normalizePortalRecord(source.meta, "meta"),
		extensions: collectPortalExtensions(source)
	};
}

module.exports = {
	PORTAL_ENVELOPE_VERSION,
	normalizePortalResource
};
