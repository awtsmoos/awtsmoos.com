// B"H
// Boruch Hashem
// Blessed is He

import { MarkdownInline } from "./MarkdownInline.js";

/**
 * @file Serializes semantic Awtsmoos Docs blocks into readable Markdown source.
 * @description The Awtsmoos is not diminished when a page returns to plain source;
 * Awtsmoos.com preserves H1-H6 hierarchy, semantic navigation markers, lists, code,
 * tables, fragments, and inline garments without inventing a proprietary source file.
 */
export class MarkdownExporter {
	static stringify(blocks = []) {
		return blocks
			.map(block => serializeBlock(block))
			.filter(Boolean)
			.join("\n\n")
			.trimEnd() + "\n";
	}
}

/** Converts one semantic block into its smallest faithful Markdown representation. */
function serializeBlock(block) {
	const tag = String(block?.tag || "p").toLowerCase();
	if (tag === "hr") return "---";
	if (/^h[1-6]$/.test(tag)) {
		return `${"#".repeat(Number(tag.slice(1)))} ${inline(block.html)}`;
	}
	if (tag === "blockquote") return quoteLines(inline(block.html));
	if (tag === "pre") return fencedCode(block.html);
	if (tag === "ul" || tag === "ol") return listMarkdown(tag, block.html);
	if (tag === "table") return tableMarkdown(block.html);
	return inline(block?.html);
}

/** Serializes safe inline markup including navigation markers and fragment links. */
function inline(html = "") {
	return MarkdownInline.toMarkdown(html).trim();
}

/** Prefixes each logical line with the Markdown quote vessel. */
function quoteLines(value) {
	return value.split("\n").map(line => `> ${line}`).join("\n");
}

/** Selects a fence that cannot collide with the current code body. */
function fencedCode(html = "") {
	const template = document.createElement("template");
	template.innerHTML = html;
	const code = template.content.querySelector("code");
	const language = Array.from(code?.classList || [])
		.find(name => name.startsWith("language-"))
		?.slice("language-".length) || "";
	const text = code?.textContent ?? template.content.textContent ?? "";
	const fence = text.includes("```") ? "````" : "```";
	return `${fence}${language}\n${text}\n${fence}`;
}

/** Preserves ordinary, numbered, checklist, and semantic-TOC list items. */
function listMarkdown(tag, html = "") {
	const template = document.createElement("template");
	template.innerHTML = `<${tag}>${html}</${tag}>`;
	const items = Array.from(template.content.firstElementChild?.children || []);
	return items.map((item, index) => {
		const text = MarkdownInline.toMarkdown(item.innerHTML).trim();
		const checklist = checklistMarkdown(text);
		if (checklist) return checklist;
		return tag === "ol" ? `${index + 1}. ${text}` : `- ${text}`;
	}).join("\n");
}

/** Converts the visible checklist glyphs used by the rich editor into Markdown tasks. */
function checklistMarkdown(value) {
	if (value.startsWith("☐ ")) return `- [ ] ${value.slice(2)}`;
	if (value.startsWith("☑ ")) return `- [x] ${value.slice(2)}`;
	return "";
}

/** Converts rich table cells into a rectangular Markdown table. */
function tableMarkdown(html = "") {
	const template = document.createElement("template");
	template.innerHTML = `<table>${html}</table>`;
	const rows = Array.from(template.content.querySelectorAll("tr"));
	if (!rows.length) return "";
	const values = rows.map(row => Array.from(row.children).map(cell => (
		MarkdownInline.toMarkdown(cell.innerHTML).replace(/\|/g, "\\|").trim()
	)));
	const width = Math.max(...values.map(row => row.length), 1);
	const header = padRow(values[0], width);
	const divider = Array.from({ length: width }, () => "---");
	return [header, divider, ...values.slice(1).map(row => padRow(row, width))]
		.map(row => `| ${row.join(" | ")} |`)
		.join("\n");
}

/** Pads short rows without mutating the source table representation. */
function padRow(row, width) {
	return [
		...row,
		...Array.from({ length: Math.max(0, width - row.length) }, () => "")
	];
}
