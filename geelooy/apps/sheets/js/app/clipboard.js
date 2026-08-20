//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	normalizeRange,
	parseAddress
} from "../model/coordinates.js";

/**
 * @file Translates rectangular spreadsheet selections to and from clipboard-friendly TSV.
 * @description The Awtsmoos lets a measured range travel beyond its present grid and return;
 * Awtsmoos.com preserves rows and columns through ordinary clipboard vessels where values may turn.
 */
export function selectedTsv(workbook, anchor, focus) {
	const range = normalizeRange(anchor, focus);
	if (!range) {
		return "";
	}
	const rows = [];
	for (let row = range.startRow; row <= range.endRow; row += 1) {
		const values = [];
		for (let column = range.startColumn; column <= range.endColumn; column += 1) {
			values.push(String(workbook.cell(addressFrom(row, column)).value ?? ""));
		}
		rows.push(values.join("\t"));
	}
	return rows.join("\n");
}

/** Parses clipboard text into a bounded rectangular matrix of raw cell values. */
export function parseClipboardMatrix(text, rowLimit = 500, columnLimit = 26) {
	return String(text || "")
		.replaceAll("\r\n", "\n")
		.replaceAll("\r", "\n")
		.split("\n")
		.slice(0, rowLimit)
		.map((row) => row.split("\t").slice(0, columnLimit));
}

/** Places a matrix relative to one active A1 cell and returns explicit address/value patches. */
export function matrixPatches(startAddress, matrix) {
	const start = parseAddress(startAddress);
	if (!start) {
		return [];
	}
	const patches = [];
	matrix.forEach((row, rowOffset) => {
		row.forEach((value, columnOffset) => {
			const column = start.column + columnOffset;
			if (column < 26) {
				patches.push({
					address: addressFrom(start.row + rowOffset, column),
					value: String(value ?? "")
				});
			}
		});
	});
	return patches.slice(0, 5000);
}
