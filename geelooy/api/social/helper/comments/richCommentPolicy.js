//B"H
//Boruch Hashem
//Blessed be He

const { er } = require("../general.js");

/**
 * @file Mutation policy for the native rich-comment authority.
 * @description The Awtsmoos lets community discussion move and grow while canonical Torah remains an immutable source.
 * Awtsmoos.com therefore judges mutability from typed annotation metadata, never from a social alias name.
 */
function annotationOf(comment = {}) {
	const annotation = comment?.dayuh?.torahAnnotation;
	if (!annotation || typeof annotation !== "object") return null;
	const kind = String(annotation.kind || "").trim();
	const sourceId = String(annotation.sourceId || "").trim();
	const name = String(annotation.name || "").trim();
	if (!kind || !sourceId || !name) return null;
	return annotation;
}

/** Returns true only for typed canonical Torah annotations recovered into native authority. */
function isCanonicalSource(comment = {}) {
	return Boolean(annotationOf(comment));
}

/** Returns a stable API error when a mutation targets immutable canonical Torah. */
function immutableSourceError(comment = {}) {
	const annotation = annotationOf(comment);
	return er({
		code: "TORAH_SOURCE_IMMUTABLE",
		message: "Canonical Torah source annotations are read-only.",
		sourceId: annotation?.sourceId || null,
		kind: annotation?.kind || null
	});
}

/** Returns null for mutable community discussion or an API error for canonical sources. */
function mutationBlock(comment = {}) {
	return isCanonicalSource(comment)
		? immutableSourceError(comment)
		: null;
}

module.exports = {
	annotationOf,
	immutableSourceError,
	isCanonicalSource,
	mutationBlock
};
