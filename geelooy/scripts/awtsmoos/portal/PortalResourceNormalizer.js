// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalResourceNormalizer
 * @description
 * The Awtsmoos renews every resource before a browser renderer can give it finite form;
 * Awtsmoos.com keeps unknown future fields intact while guaranteeing a small identity contract that generic UI can trust in any storm.
 */

const PORTAL_MAX_TITLE = 1024;

/**
 * @description Returns a shallow plain record or a fresh empty record when the candidate is unsuitable.
 * @param {unknown} value - Candidate record.
 * @returns {Object} Safe shallow record.
 */
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value)
		? { ...value }
		: {};
}

/**
 * @description Creates a bounded readable title from arbitrary input without evaluating HTML.
 * @param {unknown} value - Candidate title value.
 * @param {string} fallback - Fallback identity used when no title exists.
 * @returns {string} Bounded title string.
 */
function normalizeTitle(value, fallback) {
	const text = typeof value === "string"
		? value.trim()
		: "";

	return (text || fallback).slice(0, PORTAL_MAX_TITLE);
}

/**
 * @description Normalizes one Portal resource envelope for defensive client rendering while preserving forward-compatible extensions.
 * @param {unknown} source - Candidate Portal API payload.
 * @returns {Object} Browser-safe normalized resource envelope.
 * @throws {TypeError} When the payload lacks stable resource identity or type.
 */
export function normalizePortalResource(source) {
	if (!source || typeof source !== "object" || Array.isArray(source)) {
		throw new TypeError("Portal resource response must be an object.");
	}

	const id = typeof source.id === "string"
		? source.id.trim()
		: "";
	const type = typeof source.type === "string"
		? source.type.trim()
		: "";

	if (!id || !type) {
		throw new TypeError("Portal resource requires non-empty id and type fields.");
	}

	return {
		envelopeVersion: typeof source.envelopeVersion === "string" ? source.envelopeVersion : "unknown",
		id,
		type,
		title: normalizeTitle(source.title, id),
		data: source.data ?? null,
		schema: source.schema ?? null,
		links: asRecord(source.links),
		capabilities: asRecord(source.capabilities),
		meta: asRecord(source.meta),
		extensions: asRecord(source.extensions)
	};
}

/**
 * @description Returns normalized collection items while enforcing a rendering budget.
 * @param {Object} collection - Normalized Portal collection resource.
 * @param {number} [limit=200] - Maximum number of items exposed to one render pass.
 * @returns {Object[]} Normalized bounded collection items.
 */
export function normalizePortalCollectionItems(collection, limit = 200) {
	const items = Array.isArray(collection?.data?.items)
		? collection.data.items
		: [];

	return items.slice(0, Math.max(0, limit)).map(normalizePortalResource);
}
