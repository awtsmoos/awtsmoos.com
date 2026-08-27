// B"H
// Boruch Hashem
// Blessed is He

import { escapeAttribute, escapeHtml } from "../formats/FormatEscapes.js";
import { readHeadings } from "./SemanticNavigationIndex.js";

/**
 * @file Generates and refreshes semantic table-of-contents blocks from Awtsmoos headings.
 * @description The Awtsmoos is beyond first page and last; Awtsmoos.com lets a
 * document reveal its own map from H1 through H6, storing only a tiny semantic span
 * so collaboration, history, Markdown, and publication can regenerate the same tree.
 */
export function createTableOfContentsHtml(root, depth = 3) {
	const safeDepth = boundedDepth(depth);
	const headings = readHeadings(root)
		.filter(heading => heading.level <= safeDepth);
	if (!headings.length) return "";
	const marker = `<span data-chip-kind="toc" data-chip-value="${safeDepth}"></span>`;
	const title = `<li>${marker}<strong>Contents</strong></li>`;
	const links = headings.map(heading => (
		`<li>${indent(heading.level)}<a href="#${escapeAttribute(heading.target)}">${escapeHtml(heading.label)}</a></li>`
	));
	return [title, ...links].join("");
}

/** Rebuilds every recognized TOC block from the current document heading state. */
export function refreshTableOfContents(root) {
	let refreshed = 0;
	for (const marker of root?.querySelectorAll?.('[data-chip-kind="toc"]') || []) {
		const block = marker.closest("[data-block-id]");
		if (!block || block.tagName !== "UL") continue;
		const html = createTableOfContentsHtml(root, marker.dataset.chipValue);
		if (!html) continue;
		block.innerHTML = html;
		refreshed += 1;
	}
	return refreshed;
}

/** Bounds heading depth to the six semantic levels supported throughout Docs. */
function boundedDepth(value) {
	return Math.max(1, Math.min(6, Number(value) || 3));
}

/** Provides lightweight visual hierarchy without persisting unsafe style attributes. */
function indent(level) {
	return level > 1
		? "↳ ".repeat(Math.min(level - 1, 5))
		: "";
}
