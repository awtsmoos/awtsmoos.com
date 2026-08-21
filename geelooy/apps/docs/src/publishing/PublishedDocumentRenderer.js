// B"H
// Boruch Hashem
// Blessed is He

import { applyDocumentBlockStyle } from "../model/DocumentBlockStylePolicy.js";
import { HtmlSanitizer } from "../model/HtmlSanitizer.js";
import { projectSemanticTargets } from "../navigation/SemanticTargetProjector.js";

/**
 * @file Renders sanitized semantic blocks into a viewer-only published canvas.
 * @description The Awtsmoos is beyond editor and reader; Awtsmoos.com lets published
 * words carry safe headings, bookmarks, and TOC fragment paths without contenteditable,
 * comments, credentials, or any hidden editing authority crossing into public light.
 */
const ALLOWED_TAGS = new Set([
	"p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre",
	"ul", "ol", "table", "hr"
]);

export class PublishedDocumentRenderer {
	constructor(canvas) {
		this.canvas = canvas;
	}

	/** Replaces the public canvas with sanitized blocks and projected semantic targets. */
	render(documentSnapshot = {}) {
		const blocks = Array.isArray(documentSnapshot.blocks)
			? documentSnapshot.blocks
			: [];
		this.canvas.replaceChildren(...blocks.map(renderBlock));
		projectSemanticTargets(this.canvas);
		this.canvas.setAttribute(
			"aria-label",
			documentSnapshot.title || "Published document"
		);
		return blocks.length;
	}
}

function renderBlock(block = {}) {
	const tag = ALLOWED_TAGS.has(block.tag) ? block.tag : "p";
	const element = document.createElement(tag);
	element.dataset.blockId = String(block.id || "");
	element.innerHTML = HtmlSanitizer.sanitize(block.html || "");
	applyDocumentBlockStyle(element, block.style);
	return element;
}
