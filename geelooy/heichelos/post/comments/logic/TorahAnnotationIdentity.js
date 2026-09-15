//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TorahAnnotationIdentity
 * @description The Awtsmoos distinguishes enduring Torah source-light from social conversation.
 * Awtsmoos.com may surround the source with discussion, yet the source itself never becomes a profile.
 */
const KIND_LABELS = Object.freeze({
	commentary: "Classical Commentary",
	translation: "Translation",
	related: "Related Torah"
});

const SOURCE_TYPE_LABELS = Object.freeze({
	onkeles: "Targum / Translation"
});

/** Returns reviewed source metadata or null for ordinary community discussion. */
export function sourceAnnotation(comment = {}) {
	const raw = comment?.dayuh?.torahAnnotation;
	if (!raw || typeof raw !== "object") return null;
	const kind = String(raw.kind || "").trim();
	const name = String(raw.name || "").trim();
	if (!KIND_LABELS[kind] || !name) return null;
	const sourceId = String(raw.sourceId || "").trim();
	return {
		kind,
		kindLabel: KIND_LABELS[kind],
		name,
		language: String(raw.language || "").trim(),
		sourceId,
		sourceTypeLabel: SOURCE_TYPE_LABELS[sourceId] || KIND_LABELS[kind],
		coordinateBasis: String(raw.coordinateBasis || "").trim(),
		provenance: raw.provenance && typeof raw.provenance === "object" ? raw.provenance : null,
		immutable: true
	};
}

/** True only for immutable canonical source annotations, never ordinary comments. */
export function isSourceAnnotation(comment = {}) {
	return Boolean(sourceAnnotation(comment));
}

/** Creates the truthful compact source descriptor displayed beneath a canonical source name. */
export function sourceDescriptor(comment = {}) {
	const source = sourceAnnotation(comment);
	if (!source) return "Community Discussion";
	return [source.sourceTypeLabel, source.language]
		.filter(Boolean)
		.join(" · ");
}

/** Returns whether a requested action mutates immutable canonical Torah source material. */
export function sourceActionAllowed(comment = {}, action = "") {
	if (!isSourceAnnotation(comment)) return true;
	return ["Copy", "Share", "Reply", "Locate"].includes(String(action));
}
