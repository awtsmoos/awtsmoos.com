//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	parseAddress
} from "./coordinates.js";
import { translateStructuralFormula } from "../formula/structuralReferences.js";
import { shiftedCoordinate } from "../formula/structuralReferenceMath.js";

/**
 * @file Moves sparse cell vessels and sparse geometry metadata during structural worksheet edits.
 * @description The Awtsmoos renews every address while values, notes, and garments keep their light;
 * Awtsmoos.com moves structure atomically so inserted and deleted dimensions remain truthful and right.
 */

/** Returns a new sparse cell map after one row/column insert or delete. */
export function shiftedCells(cells = {}, operation = {}) {
	const shifted = {};
	for (const [address, cell] of Object.entries(cells || {})) {
		const target = shiftedAddress(address, operation);
		if (!target) {
			continue;
		}
		shifted[target] = shiftedCell(cell, operation);
	}
	return shifted;
}

/** Returns a new sparse metadata map after one structural insert or delete. */
export function shiftedMetadata(metadata = {}, operation = {}) {
	const shifted = {};
	for (const [key, value] of Object.entries(metadata || {})) {
		const coordinate = Number(key);
		if (!Number.isSafeInteger(coordinate) || coordinate < 0) {
			continue;
		}
		const target = shiftedCoordinate(coordinate, operation);
		if (target === null) {
			continue;
		}
		shifted[target] = structuredClone(value);
	}
	return shifted;
}

/** Moves one cell address along the edited structural axis. */
export function shiftedAddress(address, operation = {}) {
	const parsed = parseAddress(address);
	if (!parsed) {
		return null;
	}
	const axis = operation.axis === "column"
		? "column"
		: "row";
	const target = shiftedCoordinate(parsed[axis], operation);
	if (target === null) {
		return null;
	}
	const row = axis === "row"
		? target
		: parsed.row;
	const column = axis === "column"
		? target
		: parsed.column;
	return addressFrom(row, column);
}

/** Clones one sparse cell and rewrites its formula references for the same structural operation. */
function shiftedCell(cell = {}, operation = {}) {
	const next = structuredClone(cell || {});
	if (typeof next.value === "string" && next.value.startsWith("=")) {
		next.value = translateStructuralFormula(
			next.value,
			operation
		);
	}
	return next;
}
