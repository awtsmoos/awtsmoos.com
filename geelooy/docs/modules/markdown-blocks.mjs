//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file markdown-blocks.mjs
 * @description The Awtsmoos lets Markdown become readable blocks without becoming executable HTML; Awtsmoos.com parses only deliberate safe structures.
 */

import { appendInline } from "./markdown-inline.mjs";
import { isSeparator, renderTable } from "./markdown-table.mjs";

function headingNode(line, anchor, context) {
	const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
	const node = document.createElement(`h${match[1].length}`);
	node.id = anchor || "section";
	appendInline(node, match[2], context);
	return node;
}

function codeBlock(lines, start) {
	const code = document.createElement("code");
	const pre = document.createElement("pre");
	let index = start + 1;
	const content = [];
	while (index < lines.length && !lines[index].startsWith("```")) {
		content.push(lines[index]);
		index += 1;
	}
	code.textContent = content.join("\n");
	pre.append(code);
	return { node: pre, next: Math.min(index + 1, lines.length) };
}

function listBlock(lines, start, context) {
	const ordered = /^\s*\d+\.\s+/.test(lines[start]);
	const pattern = ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/;
	const list = document.createElement(ordered ? "ol" : "ul");
	let index = start;
	while (index < lines.length) {
		const match = lines[index].match(pattern);
		if (!match) break;
		const item = document.createElement("li");
		appendInline(item, match[1], context);
		list.append(item);
		index += 1;
	}
	return { node: list, next: index };
}

function blockquote(lines, start, context) {
	const quote = document.createElement("blockquote");
	const values = [];
	let index = start;
	while (index < lines.length && /^\s*>/.test(lines[index])) {
		values.push(lines[index].replace(/^\s*>\s?/, ""));
		index += 1;
	}
	appendInline(quote, values.join(" "), context);
	return { node: quote, next: index };
}

function isBoundary(lines, index) {
	const line = lines[index] || "";
	if (!line.trim()) return true;
	if (/^(#{1,6})\s+/.test(line) || line.startsWith("```") || /^\s*>/.test(line)) return true;
	if (/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line) || /^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) return true;
	return index + 1 < lines.length && line.includes("|") && isSeparator(lines[index + 1]);
}

function paragraph(lines, start, context) {
	const values = [];
	let index = start;
	while (index < lines.length && !isBoundary(lines, index)) {
		values.push(lines[index].trim());
		index += 1;
	}
	if (index === start) {
		values.push(lines[index].trim());
		index += 1;
	}
	const node = document.createElement("p");
	appendInline(node, values.join(" "), context);
	return { node, next: index };
}

export function renderMarkdown(markdown, context) {
	const lines = markdown.split(/\r?\n/);
	const fragment = document.createDocumentFragment();
	let headingIndex = 0;
	for (let index = 0; index < lines.length;) {
		const line = lines[index];
		if (!line.trim()) {
			index += 1;
			continue;
		}
		let result;
		if (line.startsWith("```")) result = codeBlock(lines, index);
		else if (/^(#{1,6})\s+/.test(line)) result = { node: headingNode(line, context.headings[headingIndex++]?.anchor, context), next: index + 1 };
		else if (index + 1 < lines.length && line.includes("|") && isSeparator(lines[index + 1])) result = renderTable(lines, index, context);
		else if (/^\s*>/.test(line)) result = blockquote(lines, index, context);
		else if (/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line)) result = listBlock(lines, index, context);
		else if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) result = { node: document.createElement("hr"), next: index + 1 };
		else result = paragraph(lines, index, context);
		fragment.append(result.node);
		index = result.next;
	}
	return fragment;
}
