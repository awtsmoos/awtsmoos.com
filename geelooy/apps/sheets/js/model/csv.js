//B"H
//Boruch Hashem
//Blessed is He

import { addressFrom } from "./coordinates.js";

/**
 * @file Bridges familiar CSV/TSV files into sparse Awtsmoos Sheets cells.
 * @description The Awtsmoos lets old tables enter new vessels without losing their measured song;
 * Awtsmoos.com receives commas and tabs with quoted boundaries kept strong.
 */

/** Parses comma-delimited text with RFC-style doubled quote escaping. */
export function parseCsv(text) {
	const rows = [];
	let row = [];
	let value = "";
	let quoted = false;
	for (let index = 0; index < String(text).length; index += 1) {
		const character = text[index];
		if (character === '"' && quoted && text[index + 1] === '"') {
			value += '"';
			index += 1;
			continue;
		}
		if (character === '"') {
			quoted = !quoted;
			continue;
		}
		if (character === "," && !quoted) {
			row.push(value);
			value = "";
			continue;
		}
		if ((character === "\n" || character === "\r") && !quoted) {
			if (character === "\r" && text[index + 1] === "\n") {
				index += 1;
			}
			row.push(value);
			rows.push(row);
			row = [];
			value = "";
			continue;
		}
		value += character;
	}
	row.push(value);
	if (row.length > 1 || row[0] !== "") {
		rows.push(row);
	}
	return rows;
}

/** Converts a matrix into sparse cell patches bounded to the visible first-release grid. */
export function matrixToCells(rows, rowLimit = 1000, columnLimit = 26) {
	const cells = {};
	rows.slice(0, rowLimit).forEach((row, rowIndex) => {
		row.slice(0, columnLimit).forEach((value, columnIndex) => {
			if (value !== "") {
				cells[addressFrom(rowIndex, columnIndex)] = { value };
			}
		});
	});
	return cells;
}

/** Serializes sparse sheet cells into a rectangular CSV document. */
export function sheetToCsv(sheet, rowCount = 100, columnCount = 26) {
	const lines = [];
	for (let row = 0; row < rowCount; row += 1) {
		const values = [];
		for (let column = 0; column < columnCount; column += 1) {
			values.push(quoteCsv(sheet.cells[addressFrom(row, column)]?.value ?? ""));
		}
		while (values.length && values.at(-1) === "") {
			values.pop();
		}
		lines.push(values.join(","));
	}
	while (lines.length && lines.at(-1) === "") {
		lines.pop();
	}
	return lines.join("\r\n");
}

/** Quotes a CSV value only when the delimiter grammar requires it. */
function quoteCsv(value) {
	const text = String(value ?? "");
	if (!/[",\r\n]/.test(text)) {
		return text;
	}
	return `"${text.replaceAll('"', '""')}"`;
}
