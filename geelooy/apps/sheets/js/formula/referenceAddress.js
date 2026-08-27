//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	parseAddress
} from "../model/coordinates.js";

/**
 * @file Interprets absolute and relative A1 reference anchors for evaluation and copy translation.
 * @description The Awtsmoos lets rows and columns move while anchored letters remain fixed in light;
 * Awtsmoos.com preserves each `$` covenant so copied formulas shift only the axes that are right.
 */

/** Parses one `$A$1`-style reference into address coordinates plus anchor flags. */
export function parseAnchoredReference(reference) {
	const match = /^(\$?)([A-Za-z]{1,3})(\$?)([1-9][0-9]{0,4})$/.exec(
		String(reference || "")
	);
	if (!match) return null;
	const plain = `${match[2]}${match[4]}`.toUpperCase();
	const parsed = parseAddress(plain);
	if (!parsed) return null;
	return {
		column: parsed.column,
		columnAbsolute: match[1] === "$",
		row: parsed.row,
		rowAbsolute: match[3] === "$"
	};
}

/** Removes `$` anchors for workbook lookup while preserving the same cell identity. */
export function plainReference(reference) {
	const parsed = parseAnchoredReference(reference);
	return parsed ? addressFrom(parsed.row, parsed.column) : null;
}

/** Shifts only relative axes and returns an anchored A1 reference or `#REF!`. */
export function shiftReference(reference, rowDelta, columnDelta) {
	const parsed = parseAnchoredReference(reference);
	if (!parsed) return "#REF!";
	const row = parsed.rowAbsolute ? parsed.row : parsed.row + rowDelta;
	const column = parsed.columnAbsolute
		? parsed.column
		: parsed.column + columnDelta;
	const address = addressFrom(row, column);
	if (!address) return "#REF!";
	const letters = /^([A-Z]+)([0-9]+)$/.exec(address);
	if (!letters) return "#REF!";
	return `${parsed.columnAbsolute ? "$" : ""}${letters[1]}`
		+ `${parsed.rowAbsolute ? "$" : ""}${letters[2]}`;
}

/** Translates all A1 references outside quoted strings by one source-to-target offset. */
export function translateFormulaReferences(formula, rowDelta, columnDelta) {
	const source = String(formula || "");
	if (!source.startsWith("=")) return source;
	let output = "";
	let index = 0;
	let quoted = false;
	while (index < source.length) {
		if (source[index] === '"') {
			if (quoted && source[index + 1] === '"') {
				output += '""';
				index += 2;
				continue;
			}
			quoted = !quoted;
			output += source[index];
			index += 1;
			continue;
		}
		const match = quoted ? null : referenceAt(source, index);
		if (!match) {
			output += source[index];
			index += 1;
			continue;
		}
		output += shiftReference(match[0], rowDelta, columnDelta);
		index += match[0].length;
	}
	return output;
}

/** Matches a standalone reference at one source position without consuming identifier text. */
function referenceAt(source, index) {
	const before = source[index - 1] || "";
	if (/[A-Za-z0-9_.]/.test(before)) return null;
	return /^\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,4}(?![A-Za-z0-9_.])/.exec(
		source.slice(index)
	);
}
