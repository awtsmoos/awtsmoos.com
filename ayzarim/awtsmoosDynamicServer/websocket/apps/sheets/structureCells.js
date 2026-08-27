//B"H
//Boruch Hashem
//Blessed is He

const {
	addressFrom,
	parseAddress,
	shiftedCoordinate
} = require("./structureCoordinates.js");
const {
	translateStructuralFormula
} = require("./structureReferences.js");

/**
 * @file Moves authoritative sparse cells and structural metadata during row and column edits.
 * @description The Awtsmoos renews every address while value, note, and style keep measured light;
 * Awtsmoos.com lets the server move structure itself so no client can counterfeit the resulting sight.
 */

/** Returns a new sparse cell map after one row/column insert or delete. */
function shiftedCells(cells = {}, operation = {}) {
	const shifted = {};
	for (const [address, cell] of Object.entries(cells || {})) {
		const target = shiftedAddress(address, operation);
		if (!target) {
			continue;
		}
		const next = clone(cell || {});
		if (typeof next.value === "string" && next.value.startsWith("=")) {
			next.value = translateStructuralFormula(
				next.value,
				operation
			);
		}
		shifted[target] = next;
	}
	return shifted;
}

/** Returns a new sparse row/column metadata map after insert or delete. */
function shiftedMetadata(metadata = {}, operation = {}) {
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
		shifted[target] = clone(value);
	}
	return shifted;
}

/** Moves one ordinary cell address along the edited structural axis. */
function shiftedAddress(address, operation = {}) {
	const parsed = parseAddress(address);
	if (!parsed) {
		return null;
	}
	const axis = operation.axis === "column" ? "column" : "row";
	const target = shiftedCoordinate(parsed[axis], operation);
	if (target === null) {
		return null;
	}
	const row = axis === "row" ? target : parsed.row;
	const column = axis === "column" ? target : parsed.column;
	return addressFrom(row, column);
}

/** Deep-clones JSON-shaped persisted workbook fragments. */
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	shiftedCells,
	shiftedMetadata
};
