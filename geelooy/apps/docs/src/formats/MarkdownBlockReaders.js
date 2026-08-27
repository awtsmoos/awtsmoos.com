// B"H
// Boruch Hashem
// Blessed is He

import { MarkdownInline } from "./MarkdownInline.js";
import { escapeHtml } from "./FormatEscapes.js";

/**
 * @file Reads compound Markdown blocks without burdening the top-level parser.
 * @description The Awtsmoos is simple beyond division; Awtsmoos.com divides parsing
 * responsibilities so tables, lists, fences, and paragraphs remain individually legible.
 */
export function readFence(lines, index) {
	const language = lines[index].slice(3).trim();
	const body = [];
	let cursor = index + 1;
	while (cursor < lines.length && !/^```/.test(lines[cursor])) {
		body.push(lines[cursor]);
		cursor += 1;
	}
	const languageClass = language
		? ` class="language-${escapeHtml(language)}"`
		: "";
	return {
		block: createBlock(
			"pre",
			`<code${languageClass}>${escapeHtml(body.join("\n"))}</code>`
		),
		nextIndex: Math.min(cursor + 1, lines.length)
	};
}

export function readList(lines, index, ordered) {
	const matcher = ordered
		? /^\s*\d+[.)]\s+(.+)$/
		: /^\s*[-+*]\s+(.+)$/;
	const items = [];
	let cursor = index;
	while (cursor < lines.length) {
		const match = matcher.exec(lines[cursor]);
		if (!match) break;
		items.push(`<li>${checklistHtml(match[1])}</li>`);
		cursor += 1;
	}
	return {
		block: createBlock(ordered ? "ol" : "ul", items.join("")),
		nextIndex: cursor
	};
}

export function readTable(lines, index) {
	const rows = [splitTableRow(lines[index])];
	let cursor = index + 2;
	while (cursor < lines.length && /\|/.test(lines[cursor]) && lines[cursor].trim()) {
		rows.push(splitTableRow(lines[cursor]));
		cursor += 1;
	}
	const html = rows.map((row, rowIndex) => {
		const cellTag = rowIndex === 0 ? "th" : "td";
		const cells = row
			.map(cell => `<${cellTag}>${MarkdownInline.toHtml(cell)}</${cellTag}>`)
			.join("");
		return `<tr>${cells}</tr>`;
	}).join("");
	return {
		block: createBlock("table", `<tbody>${html}</tbody>`),
		nextIndex: cursor
	};
}

export function readParagraph(lines, index, startsBlock) {
	const parts = [];
	let cursor = index;
	while (
		cursor < lines.length
		&& lines[cursor].trim()
		&& !startsBlock(lines, cursor)
	) {
		parts.push(lines[cursor].trim());
		cursor += 1;
	}
	if (!parts.length) {
		parts.push(lines[index].trim());
		cursor = index + 1;
	}
	return {
		block: createBlock("p", MarkdownInline.toHtml(parts.join(" "))),
		nextIndex: cursor
	};
}

export function createBlock(tag, html) {
	return {
		id: crypto.randomUUID(),
		tag,
		html
	};
}

function splitTableRow(line) {
	return line
		.trim()
		.replace(/^\||\|$/g, "")
		.split("|")
		.map(cell => cell.trim());
}

function checklistHtml(value) {
	const match = /^\[([ xX])\]\s*(.*)$/.exec(value);
	if (!match) return MarkdownInline.toHtml(value);
	const symbol = match[1].trim() ? "☑" : "☐";
	return `${symbol} ${MarkdownInline.toHtml(match[2])}`;
}
