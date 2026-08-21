//B"H
//Boruch Hashem
//Blessed is He

import { addressFrom, parseAddress } from "../model/coordinates.js";
import { translateFormulaReferences } from "../formula/referenceAddress.js";
import { emptyRichCell, transposedSnapshot } from "./clipboardSnapshot.js";

/**
 * @file Converts rich clipboard state into field-aware paste-special patches with exact cell translation.
 * @description The Awtsmoos remembers each source coordinate while value, formula, note, and garment move in light;
 * Awtsmoos.com translates every formula from its own origin so ordinary and transposed paste both remain right.
 */

/** Creates bounded target patches for one paste mode plus transpose and blank handling. */
export function richPasteCells(startAddress, snapshot, options = {}) {
	const start = parseAddress(startAddress);
	if (!start || !snapshot?.cells) {
		return [];
	}
	const source = options.transpose ? transposedSnapshot(snapshot) : snapshot;
	const result = [];
	for (let row = 0; row < source.cells.length; row += 1) {
		for (let column = 0; column < source.cells[row].length; column += 1) {
			const sourceCell = source.cells[row][column] || emptyRichCell();
			if (options.skipBlanks && sourceCell.value === "") {
				continue;
			}
			const address = addressFrom(start.row + row, start.column + column);
			const patch = address
				? pastePatch(address, sourceCell, source, options.mode || "all")
				: null;
			if (patch) {
				result.push(patch);
			}
			if (result.length >= 5000) {
				return result;
			}
		}
	}
	return result;
}

/** Builds only the fields owned by one paste mode. */
function pastePatch(address, cell, snapshot, mode) {
	if (mode === "values") {
		return { address, value: cell.calculated ?? "" };
	}
	if (mode === "formulas") {
		return formulaPatch(address, cell, snapshot);
	}
	if (mode === "formatting") {
		return { address, style: structuredClone(cell.style || {}) };
	}
	if (mode === "notes") {
		return { address, note: cell.note };
	}
	return {
		address,
		note: cell.note,
		style: structuredClone(cell.style || {}),
		value: translatedRawValue(address, cell, snapshot)
	};
}

/** Returns a translated formula patch or null when the source is a constant. */
function formulaPatch(address, cell, snapshot) {
	if (typeof cell.value !== "string" || !cell.value.startsWith("=")) {
		return null;
	}
	return {
		address,
		value: translateCellFormula(address, cell, snapshot, cell.value)
	};
}

/** Translates copied formulas from the individual source cell to its exact target cell. */
function translatedRawValue(address, cell, snapshot) {
	if (typeof cell.value !== "string" || !cell.value.startsWith("=")) {
		return cell.value ?? "";
	}
	return translateCellFormula(address, cell, snapshot, cell.value);
}

/** Computes one source-to-target delta with backward-compatible range-origin fallback. */
function translateCellFormula(address, cell, snapshot, formula) {
	const target = parseAddress(address);
	const sourceRow = Number.isSafeInteger(cell.sourceRow)
		? cell.sourceRow
		: snapshot.startRow;
	const sourceColumn = Number.isSafeInteger(cell.sourceColumn)
		? cell.sourceColumn
		: snapshot.startColumn;
	return translateFormulaReferences(
		formula,
		target.row - sourceRow,
		target.column - sourceColumn
	);
}
