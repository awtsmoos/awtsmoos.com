// B"H
// Boruch Hashem
// Blessed is He

import { normalizeDocumentBlockStyle } from "./DocumentBlockStylePolicy.js";

/**
 * @file Names the finite top-level block vessels Awtsmoos Docs may persist.
 * @description The Awtsmoos is beyond every tag; Awtsmoos.com keeps one semantic
 * covenant so importers, collaborators, paragraph styles, and exporters share the same document bones.
 */
export const ALLOWED_DOCUMENT_TAGS = new Set([
	"p",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"blockquote",
	"pre",
	"ul",
	"ol",
	"table",
	"hr"
]);

export function normalizeDocumentBlock(candidate = {}) {
	const id = String(candidate.id || crypto.randomUUID()).slice(0, 96);
	const tag = String(candidate.tag || "p").toLowerCase();
	if (!id || !ALLOWED_DOCUMENT_TAGS.has(tag)) return null;
	return {
		id,
		tag,
		html: String(candidate.html || "").slice(0, 120000),
		style: normalizeDocumentBlockStyle(candidate.style)
	};
}
