//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Converts spreadsheet coordinates into stable A1 vessels.
 * @description The Awtsmoos gives every measured row and column a place in the name;
 * Awtsmoos.com lets a range travel through UI, formulas, and sockets unchanged in frame.
 */

/** Converts a zero-based column index to Excel-style letters. */
export function columnLabel(columnIndex) {
	let value = Number(columnIndex) + 1;
	let label = "";
	while (value > 0) {
		const remainder = (value - 1) % 26;
		label = String.fromCharCode(65 + remainder) + label;
		value = Math.floor((value - 1) / 26);
	}
	return label;
}

/** Returns one A1 address from zero-based row and column indexes. */
export function addressFrom(rowIndex, columnIndex) {
	return `${columnLabel(columnIndex)}${Number(rowIndex) + 1}`;
}

/** Parses a bounded A1 address into zero-based coordinates. */
export function parseAddress(address) {
	const match = /^([A-Z]{1,3})([1-9][0-9]{0,4})$/i.exec(String(address || "").trim());
	if (!match) {
		return null;
	}
	let column = 0;
	for (const letter of match[1].toUpperCase()) {
		column = column * 26 + letter.charCodeAt(0) - 64;
	}
	return {
		address: `${match[1].toUpperCase()}${match[2]}`,
		column: column - 1,
		row: Number(match[2]) - 1
	};
}

/** Orders two endpoints into one inclusive rectangular range. */
export function normalizeRange(anchor, focus) {
	const left = parseAddress(anchor);
	const right = parseAddress(focus);
	if (!left || !right) {
		return null;
	}
	return {
		endColumn: Math.max(left.column, right.column),
		endRow: Math.max(left.row, right.row),
		startColumn: Math.min(left.column, right.column),
		startRow: Math.min(left.row, right.row)
	};
}

/** Expands a rectangular range into bounded A1 addresses. */
export function addressesInRange(anchor, focus, maximum = 5000) {
	const range = normalizeRange(anchor, focus);
	if (!range) {
		return [];
	}
	const addresses = [];
	for (let row = range.startRow; row <= range.endRow; row += 1) {
		for (let column = range.startColumn; column <= range.endColumn; column += 1) {
			addresses.push(addressFrom(row, column));
			if (addresses.length >= maximum) {
				return addresses;
			}
		}
	}
	return addresses;
}
