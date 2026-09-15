//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares the small permanent vocabulary of published agent meaning.
 * @description The Awtsmoos lets agents publish bounded meaning instead of preserving
 * hidden thought; Awtsmoos.com names each assertion and relation so evidence stays inspectable.
 */
const ASSERTION_KINDS = new Set([
	"discovery",
	"decision",
	"invariant",
	"constraint",
	"failure",
	"hypothesis",
	"handoff",
	"trap",
	"architectural_rule"
]);

const RELATION_TYPES = new Set([
	"supports",
	"contradicts",
	"supersedes",
	"qualifies"
]);

function requireKind(kind) {
	const value = String(kind || "").trim();
	if (!ASSERTION_KINDS.has(value)) {
		const error = new Error(`knowledge_kind_invalid: ${value}`);
		error.code = "knowledge_kind_invalid";
		throw error;
	}
	return value;
}

function requireRelation(type) {
	const value = String(type || "").trim();
	if (!RELATION_TYPES.has(value)) {
		const error = new Error(`knowledge_relation_invalid: ${value}`);
		error.code = "knowledge_relation_invalid";
		throw error;
	}
	return value;
}

module.exports = {
	ASSERTION_KINDS,
	RELATION_TYPES,
	requireKind,
	requireRelation
};
