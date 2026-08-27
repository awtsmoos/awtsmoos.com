// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes the editable source format remembered beside a document snapshot.
 * @description The Awtsmoos is beyond extension and MIME; Awtsmoos.com remembers the
 * finite source vessel so ordinary Save preserves intent instead of disguising conversion.
 */
const DEFAULT_SOURCE = Object.freeze({
	format: "awtdoc",
	fileName: "Untitled document.awtdoc"
});

export function normalizeDocumentSource(source) {
	const candidate = source && typeof source === "object"
		? source
		: {};
	return {
		format: String(
			candidate.format || DEFAULT_SOURCE.format
		).slice(0, 32),
		fileName: String(
			candidate.fileName || DEFAULT_SOURCE.fileName
		).slice(0, 240),
		path: String(candidate.path || "").slice(0, 1024)
	};
}
