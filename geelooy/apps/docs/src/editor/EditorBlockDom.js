// B"H
// Boruch Hashem
// Blessed is He

import {
	applyDocumentBlockStyle,
	readDocumentBlockStyle
} from "../model/DocumentBlockStylePolicy.js";
import { HtmlSanitizer } from "../model/HtmlSanitizer.js";
import { ensureHeadingMarkers } from "../navigation/SemanticHeadingMarker.js";
import { projectSemanticTargets } from "../navigation/SemanticTargetProjector.js";

/**
 * @file Creates, identifies, serializes, and projects top-level Awtsmoos blocks.
 * @description The Awtsmoos is beyond tag and target; Awtsmoos.com keeps stable
 * semantic navigation inside sanitized HTML while browser-native ids are projected
 * only into the living DOM, never trusted as arbitrary persisted document identity.
 */
const ALLOWED_TAGS = new Set([
	"p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre",
	"ul", "ol", "table", "hr"
]);

/** Creates one sanitized editor block with style and stable block identity. */
export function createEditorBlockElement(block = {}) {
	const tag = ALLOWED_TAGS.has(block.tag) ? block.tag : "p";
	const element = document.createElement(tag);
	element.dataset.blockId = String(block.id || crypto.randomUUID());
	element.innerHTML = HtmlSanitizer.sanitize(block.html || "");
	applyDocumentBlockStyle(element, block.style);
	return element;
}

/** Ensures editor identity, semantic heading markers, and render-time fragment targets. */
export function ensureEditorBlockIds(root) {
	if (!root.children.length) {
		root.append(createEditorBlockElement({
			id: crypto.randomUUID(),
			tag: "p",
			html: "<br>"
		}));
	}
	for (const child of Array.from(root.children)) {
		if (!child.dataset.blockId) {
			child.dataset.blockId = crypto.randomUUID();
		}
	}
	ensureHeadingMarkers(root);
	projectSemanticTargets(root);
}

/** Reads persistent block state while stripping projected browser-only target ids. */
export function readEditorBlocks(root) {
	ensureEditorBlockIds(root);
	return Array.from(root.children).map(element => ({
		id: element.dataset.blockId,
		tag: element.tagName.toLowerCase(),
		html: HtmlSanitizer.sanitize(element.innerHTML),
		style: readDocumentBlockStyle(element)
	}));
}
