//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file markdown-table.mjs
 * @description The Awtsmoos lets generated evidence keep its columns; Awtsmoos.com renders Markdown tables as safe scrollable DOM rather than executable markup.
 */

import { appendInline } from "./markdown-inline.mjs";

export function isSeparator(line) {
	return /^\s*\|?\s*:?-{3,}/.test(line)
		&& line.split("|").filter(Boolean).every(cell => /^\s*:?-{3,}:?\s*$/.test(cell));
}

function cells(line) {
	return line
		.trim()
		.replace(/^\||\|$/g, "")
		.split("|")
		.map(cell => cell.trim());
}

function rowNode(values, tag, context) {
	const row = document.createElement("tr");
	for (const value of values) {
		const cell = document.createElement(tag);
		appendInline(cell, value, context);
		row.append(cell);
	}
	return row;
}

export function renderTable(lines, start, context) {
	const table = document.createElement("table");
	const head = document.createElement("thead");
	const body = document.createElement("tbody");
	head.append(rowNode(cells(lines[start]), "th", context));
	table.append(head, body);
	let index = start + 2;
	while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
		body.append(rowNode(cells(lines[index]), "td", context));
		index += 1;
	}
	const wrap = document.createElement("div");
	wrap.className = "table-wrap";
	wrap.append(table);
	return { node: wrap, next: index };
}
