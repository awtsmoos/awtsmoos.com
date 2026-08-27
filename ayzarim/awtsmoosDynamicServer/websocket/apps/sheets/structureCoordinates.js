//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Holds server-side A1 coordinate arithmetic for authoritative structural workbook edits.
 * @description The Awtsmoos numbers row and column before sparse cells receive their measured light;
 * Awtsmoos.com keeps structural address movement server-owned, deterministic, and right.
 */

/** Parses one ordinary A1 address into zero-based row and column coordinates. */
function parseAddress(address) {
	const match = /^([A-Z]{1,3})([1-9][0-9]{0,4})$/.exec(
		String(address || "").toUpperCase()
	);
	if (!match) {
		return null;
	}
	return {
		column: columnNumber(match[1]),
		row: Number(match[2]) - 1
	};
}

/** Converts zero-based row and column coordinates back into A1 notation. */
function addressFrom(row, column) {
	if (!Number.isSafeInteger(row) || row < 0) {
		return null;
	}
	if (!Number.isSafeInteger(column) || column < 0) {
		return null;
	}
	const label = columnLabel(column);
	return label ? `${label}${row + 1}` : null;
}

/** Converts spreadsheet column letters into a zero-based number. */
function columnNumber(label) {
	let value = 0;
	for (const character of String(label || "")) {
		value = (value * 26) + character.charCodeAt(0) - 64;
	}
	return value - 1;
}

/** Converts a zero-based column number into spreadsheet letters. */
function columnLabel(column) {
	let value = Number(column) + 1;
	if (!Number.isSafeInteger(value) || value <= 0) {
		return "";
	}
	let label = "";
	while (value > 0) {
		const remainder = (value - 1) % 26;
		label = String.fromCharCode(65 + remainder) + label;
		value = Math.floor((value - 1) / 26);
	}
	return label;
}

/** Computes one scalar coordinate after insert/delete, or null when deletion consumes it. */
function shiftedCoordinate(coordinate, operation) {
	const index = Math.max(0, Number(operation.index) || 0);
	const count = Math.max(1, Number(operation.count) || 1);
	if (operation.mode === "insert") {
		return coordinate >= index
			? coordinate + count
			: coordinate;
	}
	if (coordinate < index) {
		return coordinate;
	}
	if (coordinate >= index + count) {
		return coordinate - count;
	}
	return null;
}

module.exports = {
	addressFrom,
	columnLabel,
	parseAddress,
	shiftedCoordinate
};
