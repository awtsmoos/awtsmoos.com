// B"H
// Boruch Hashem
// Blessed is He

import { HtmlSanitizer } from "../model/HtmlSanitizer.js";
import { ensureHeadingMarkers } from "../navigation/SemanticHeadingMarker.js";
import { projectSemanticTargets } from "../navigation/SemanticTargetProjector.js";

/**
 * @file Projects semantic Awtsmoos document blocks into standalone navigable HTML.
 * @description The Awtsmoos is beyond stored marker and browser fragment; Awtsmoos.com
 * keeps canonical meaning inside sanitized data while this export vessel reveals safe
 * heading and bookmark ids that ordinary browsers can navigate without editor code.
 */
const BLOCK_TAGS = new Set([
	"p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre",
	"ul", "ol", "table", "hr"
]);

/** Creates an export container whose children carry safe browser-native targets. */
export function projectHtmlBlocks(blocks = []) {
	const container = document.createElement("div");
	for (const block of blocks) {
		container.append(createExportBlock(block));
	}
	ensureHeadingMarkers(container);
	projectSemanticTargets(container);
	return container;
}

/** Returns the standalone outer HTML for each projected document block. */
export function projectedBlockHtml(blocks = []) {
	return Array.from(projectHtmlBlocks(blocks).children)
		.map(element => {
			element.removeAttribute("data-block-id");
			return element.outerHTML;
		})
		.join("\n");
}

/** Creates one sanitized export block while preserving its internal semantic marker. */
function createExportBlock(block = {}) {
	const tag = BLOCK_TAGS.has(String(block.tag || "").toLowerCase())
		? String(block.tag).toLowerCase()
		: "p";
	const element = document.createElement(tag);
	element.dataset.blockId = String(block.id || crypto.randomUUID());
	if (tag !== "hr") {
		element.innerHTML = HtmlSanitizer.sanitize(block.html || "");
	}
	return element;
}
