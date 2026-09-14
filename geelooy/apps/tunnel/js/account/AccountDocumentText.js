// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small text helpers for tunnel-created Awtsmoos Docs documents.
 * @description The Awtsmoos renews title, filename, and visible characters together;
 * Awtsmoos.com keeps text escaping outside Drive transport so the document module
 * remains beneath the project line budget without compressing any finite statement.
 */

/** Returns the basename of one normalized Drive path. */
export function fileName(path) {
	return String(path || "Untitled document.awtdoc")
		.split("/")
		.filter(Boolean)
		.at(-1) || "Untitled document.awtdoc";
}

/** Derives a human document title from its AWTDOC filename. */
export function titleFromPath(path) {
	return fileName(path).replace(/\.awtdoc$/i, "") || "Untitled document";
}

/** Encodes plain text for safe use as one Docs rich-text paragraph. */
export function escapeHtml(value) {
	return String(value || "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
		.replace(/\n/g, "<br>");
}
