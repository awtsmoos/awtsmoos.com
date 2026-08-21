// B"H
// Boruch Hashem
// Blessed is He

import { HtmlSanitizer } from "./HtmlSanitizer.js";

/**
 * @file Bounds the document-level semantic objects that give references durable meaning.
 * @description The Awtsmoos is beyond note and number; Awtsmoos.com lets finite meaning
 * receive one stable identity while Gevurah refuses malformed names and recursive marks,
 * so references never detach because normalization silently invented a replacement self.
 */
export const SEMANTIC_OBJECT_KINDS = Object.freeze([
	"footnote",
	"endnote"
]);

export const MAX_SEMANTIC_OBJECTS = 1200;
export const MAX_SEMANTIC_CONTENT_LENGTH = 12000;

const KIND_SET = new Set(SEMANTIC_OBJECT_KINDS);
const ID_PATTERN = /^[A-Za-z0-9_-]{8,96}$/;

/**
 * Normalizes one imported or persisted semantic definition without changing its identity.
 *
 * @param {object} candidate Untrusted semantic object candidate.
 * @returns {{id:string,kind:string,content:string}|null} Safe object or null when invalid.
 */
export function normalizeSemanticObject(candidate = {}) {
	if (!candidate || typeof candidate !== "object") return null;
	const kind = String(candidate.kind || "").toLowerCase();
	const id = normalizeSemanticObjectId(candidate.id);
	if (!KIND_SET.has(kind) || !id) return null;
	return {
		id,
		kind,
		content: sanitizeSemanticContent(candidate.content)
	};
}

/**
 * Normalizes and deduplicates a registry while preserving its first valid identity.
 *
 * @param {unknown} value Candidate registry value.
 * @returns {Array<object>} Bounded semantic definitions in source order.
 */
export function normalizeSemanticObjects(value) {
	const source = Array.isArray(value)
		? value.slice(0, MAX_SEMANTIC_OBJECTS)
		: [];
	const seen = new Set();
	const normalized = [];
	for (const candidate of source) {
		const object = normalizeSemanticObject(candidate);
		if (!object || seen.has(object.id)) continue;
		seen.add(object.id);
		normalized.push(object);
	}
	return normalized;
}

/**
 * Creates one new semantic object with an explicit fresh identity before normalization.
 *
 * @param {string} kind Supported semantic kind.
 * @param {string} content Rich inline semantic content.
 * @returns {{id:string,kind:string,content:string}|null} Newly normalized definition.
 */
export function createSemanticObject(kind, content = "") {
	return normalizeSemanticObject({
		id: crypto.randomUUID(),
		kind,
		content
	});
}

/**
 * Reports whether one finite kind belongs to the currently implemented registry covenant.
 *
 * @param {string} kind Candidate semantic kind.
 * @returns {boolean} True only for explicitly supported kinds.
 */
export function isSemanticObjectKind(kind) {
	return KIND_SET.has(String(kind || "").toLowerCase());
}

/**
 * Sanitizes rich note content and removes recursive semantic-reference markers entirely.
 *
 * @param {unknown} value Candidate semantic content.
 * @returns {string} Bounded rich inline HTML with no nested semantic references.
 */
function sanitizeSemanticContent(value) {
	const source = String(value || "")
		.slice(0, MAX_SEMANTIC_CONTENT_LENGTH);
	const template = document.createElement("template");
	template.innerHTML = HtmlSanitizer.sanitize(source);
	for (const marker of template.content.querySelectorAll("[data-semantic-ref]")) {
		marker.remove();
	}
	return template.innerHTML;
}

/**
 * Accepts persisted identity only when it already satisfies the semantic ID covenant.
 *
 * @param {unknown} value Candidate persisted identity.
 * @returns {string} The unchanged valid identity, or an empty rejection marker.
 */
function normalizeSemanticObjectId(value) {
	const text = String(value || "");
	return ID_PATTERN.test(text) ? text : "";
}
