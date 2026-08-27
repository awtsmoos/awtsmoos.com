//B"H
//Boruch Hashem
//Blessed is He

const { columnLabel } = require("./structureCoordinates.js");

/**
 * @file Holds authoritative server arithmetic for structural spreadsheet references and ranges.
 * @description The Awtsmoos moves a measured dimension while every formula keeps its truthful light;
 * Awtsmoos.com separates coordinate law from text rewriting so collaborative structure remains right.
 */

/** Parses one anchored A1 reference into zero-based coordinates and anchor flags. */
function parseAnchoredReference(reference) {
	const match = /^(\$?)([A-Za-z]{1,3})(\$?)([1-9][0-9]{0,4})$/.exec(
		String(reference || "")
	);
	if (!match) {
		return null;
	}
	let column = 0;
	for (const character of match[2].toUpperCase()) {
		column = (column * 26) + character.charCodeAt(0) - 64;
	}
	return {
		column: column - 1,
		columnAbsolute: match[1] === "$",
		row: Number(match[4]) - 1,
		rowAbsolute: match[3] === "$"
	};
}

/** Computes range endpoints under insert/delete semantics, shrinking partial deletions safely. */
function shiftedRangeCoordinates(first, second, operation) {
	const ascending = first <= second;
	let low = Math.min(first, second);
	let high = Math.max(first, second);
	const index = Math.max(0, Number(operation.index) || 0);
	const count = Math.max(1, Number(operation.count) || 1);
	if (operation.mode === "insert") {
		if (index <= low) {
			low += count;
			high += count;
		} else if (index <= high) {
			high += count;
		}
		return ascending ? [low, high] : [high, low];
	}
	const deletionEnd = index + count - 1;
	if (index <= low && deletionEnd >= high) {
		return null;
	}
	if (deletionEnd < low) {
		low -= count;
		high -= count;
	} else if (index <= low) {
		low = index;
		high -= count;
	} else if (index <= high) {
		high = Math.max(index - 1, high - count);
	}
	return ascending ? [low, high] : [high, low];
}

/** Rebuilds one anchored reference after replacing exactly one axis coordinate. */
function formatReference(parsed, axis, coordinate) {
	const row = axis === "row" ? coordinate : parsed.row;
	const column = axis === "column" ? coordinate : parsed.column;
	const columnText = `${parsed.columnAbsolute ? "$" : ""}${columnLabel(column)}`;
	const rowText = `${parsed.rowAbsolute ? "$" : ""}${row + 1}`;
	return `${columnText}${rowText}`;
}

module.exports = {
	formatReference,
	parseAnchoredReference,
	shiftedRangeCoordinates
};
