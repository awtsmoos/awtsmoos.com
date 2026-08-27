// B"H
// Boruch Hashem
// Blessed is He

import { HtmlSanitizer } from "../model/HtmlSanitizer.js";
import { escapeHtml } from "./FormatEscapes.js";
import { projectedBlockHtml } from "./HtmlBlockProjection.js";
import { DOCUMENT_STYLE } from "./HtmlDocumentStyle.js";

/**
 * @file Moves Awtsmoos Docs between semantic blocks and standalone safe HTML.
 * @description The Awtsmoos gives meaning before markup; Awtsmoos.com exports H1-H6,
 * bookmarks, internal links, and TOCs as ordinary navigable HTML while importing only
 * the bounded block vessels and semantic markers the editor deliberately understands.
 */
export class HtmlDocumentCodec {
	static parse(html = "", source = {}) {
		const parsed = new DOMParser().parseFromString(String(html), "text/html");
		const blocks = collectBlocks(parsed.body);
		return {
			title: parsed.title || titleFromSource(source),
			blocks: blocks.length ? blocks : [createBlock("p", "")],
			comments: [],
			access: { mode: "private" },
			source: {
				format: "html",
				fileName: String(source.fileName || "Untitled.html")
			}
		};
	}

	static stringify(snapshot = {}) {
		const title = escapeHtml(snapshot.title || "Untitled document");
		const body = projectedBlockHtml(snapshot.blocks || []);
		return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${title}</title>
	<style>
${indent(DOCUMENT_STYLE, 2)}
	</style>
</head>
<body>
	<main class="awtsmoos-document">
${indent(body, 2)}
	</main>
</body>
</html>
`;
	}
}

const ALLOWED_BLOCKS = new Map([
	["P", "p"], ["H1", "h1"], ["H2", "h2"], ["H3", "h3"],
	["H4", "h4"], ["H5", "h5"], ["H6", "h6"],
	["BLOCKQUOTE", "blockquote"], ["PRE", "pre"], ["UL", "ul"],
	["OL", "ol"], ["TABLE", "table"], ["HR", "hr"]
]);

function collectBlocks(body) {
	const blocks = [];
	for (const node of Array.from(body.childNodes)) {
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent?.trim();
			if (text) blocks.push(createBlock("p", escapeHtml(text)));
			continue;
		}
		if (node.nodeType !== Node.ELEMENT_NODE) continue;
		const tag = ALLOWED_BLOCKS.get(node.tagName);
		if (tag) blocks.push(createBlock(tag, HtmlSanitizer.sanitize(node.innerHTML)));
		else if (node.textContent?.trim()) {
			blocks.push(createBlock("p", escapeHtml(node.textContent.trim())));
		}
	}
	return blocks;
}

function createBlock(tag, html) {
	return { id: crypto.randomUUID(), tag, html };
}

function titleFromSource(source) {
	return String(source.fileName || "Untitled")
		.replace(/\.html?$/i, "")
		.trim() || "Untitled document";
}

function indent(value, depth) {
	const prefix = "\t".repeat(depth);
	return String(value)
		.split("\n")
		.map(line => `${prefix}${line}`)
		.join("\n");
}
