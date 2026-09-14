//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TorahAnnotationIdentity
 * @description
 * Distinguishes immutable canonical Torah sources from ordinary social comments.
 * Source identity comes only from migration-authored `dayuh.torahAnnotation` metadata.
 */
const KINDS = Object.freeze({
	commentary: "Commentary",
	translation: "Translation",
	related: "Related Torah"
});

/** Returns reviewed source metadata or null for ordinary user discussion. */
export function sourceAnnotation(comment = {}) {
	const raw = comment?.dayuh?.torahAnnotation;
	if (!raw || typeof raw !== "object") return null;
	const kind = String(raw.kind || "").trim();
	const name = String(raw.name || "").trim();
	if (!KINDS[kind] || !name) return null;
	return {
		kind,
		kindLabel: KINDS[kind],
		name,
		language: String(raw.language || "").trim(),
		sourceId: String(raw.sourceId || "").trim(),
		coordinateBasis: String(raw.coordinateBasis || "").trim()
	};
}

/** True only for immutable canonical source annotations, never ordinary comments. */
export function isSourceAnnotation(comment = {}) {
	return Boolean(sourceAnnotation(comment));
}
