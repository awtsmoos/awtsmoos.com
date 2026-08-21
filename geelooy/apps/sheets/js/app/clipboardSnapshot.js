//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	normalizeRange
} from "../model/coordinates.js";
import { calculatedValue } from "../model/formula.js";

/**
 * @file Captures rich spreadsheet clipboard state with original cell coordinates for exact formula movement.
 * @description The Awtsmoos remembers where every copied cell stood before the range begins its flight;
 * Awtsmoos.com preserves source geometry so ordinary and transposed formulas both arrive truthful and right.
 */

/** Captures one bounded rectangular selection with raw, calculated, note, style, and source geometry. */
export function richClipboardSnapshot(workbook, anchor, focus, limit = 5000) {
	const range = normalizeRange(anchor, focus);
	if (!range) {
		return null;
	}
	const cells = [];
	let count = 0;
	for (let row = range.startRow; row <= range.endRow; row += 1) {
		const currentRow = [];
		for (let column = range.startColumn; column <= range.endColumn; column += 1) {
			if (count >= limit) {
				break;
			}
			const address = addressFrom(row, column);
			const cell = workbook.cell(address);
			currentRow.push({
				calculated: calculatedValue(workbook, address),
				note: String(cell.note || ""),
				sourceColumn: column,
				sourceRow: row,
				style: structuredClone(cell.style || {}),
				value: cell.value ?? ""
			});
			count += 1;
		}
		cells.push(currentRow);
	}
	return {
		cells,
		columns: range.endColumn - range.startColumn + 1,
		rows: range.endRow - range.startRow + 1,
		startColumn: range.startColumn,
		startRow: range.startRow
	};
}

/** Returns a transposed copy while preserving each cell's original coordinates. */
export function transposedSnapshot(snapshot) {
	if (!snapshot?.cells?.length) {
		return snapshot;
	}
	const width = Math.max(...snapshot.cells.map((row) => row.length));
	return {
		...snapshot,
		cells: Array.from(
			{ length: width },
			(_, column) => snapshot.cells.map(
				(row) => structuredClone(row[column] || emptyRichCell())
			)
		),
		columns: snapshot.rows,
		rows: snapshot.columns
	};
}

/** Supplies one neutral rich cell for ragged transpose edges. */
export function emptyRichCell() {
	return {
		calculated: "",
		note: "",
		sourceColumn: null,
		sourceRow: null,
		style: {},
		value: ""
	};
}
