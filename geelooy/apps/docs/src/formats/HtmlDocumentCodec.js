// B"H
// Boruch Hashem
// Blessed is He

import { HtmlSanitizer } from "../model/HtmlSanitizer.js";
import { escapeHtml } from "./FormatEscapes.js";

/**
 * @file Moves Awtsmoos Docs between semantic blocks and standalone safe HTML.
 * @description The Awtsmoos gives meaning before markup; Awtsmoos.com exports a
 * self-contained page without script and imports only block vessels the editor understands.
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
		const body = (snapshot.blocks || [])
			.map(block => blockHtml(block))
			.join("\n");
		return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${title}</title>
	<style>${DOCUMENT_STYLE}</style>
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
	["P", "p"],
	["H1", "h1"],
	["H2", "h2"],
	["H3", "h3"],
	["BLOCKQUOTE", "blockquote"],
	["PRE", "pre"],
	["UL", "ul"],
	["OL", "ol"],
	["TABLE", "table"],
	["HR", "hr"]
]);

const DOCUMENT_STYLE = [
	"body{margin:0;background:#f5f7fb;color:#172033;font:17px/1.7 Georgia,serif}",
	".awtsmoos-document{box-sizing:border-box;max-width:816px;margin:32px auto;padding:72px 84px;background:white}",
	"h1,h2,h3{font-family:system-ui,sans-serif;line-height:1.25}",
	"table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ccd3df}",
	"blockquote{margin-left:0;padding-left:18px;border-left:3px solid #365cf5}",
	"pre{overflow:auto;padding:14px;background:#111827;color:#f8fafc}"
].join("");

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
		if (tag) {
			blocks.push(createBlock(tag, HtmlSanitizer.sanitize(node.innerHTML)));
			continue;
		}
		const text = node.textContent?.trim();
		if (text) blocks.push(createBlock("p", escapeHtml(text)));
	}
	return blocks;
}

function blockHtml(block = {}) {
	const tag = ALLOWED_BLOCKS.has(String(block.tag || "").toUpperCase())
		? String(block.tag).toLowerCase()
		: "p";
	if (tag === "hr") return "<hr>";
	return `<${tag}>${HtmlSanitizer.sanitize(block.html || "")}</${tag}>`;
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
