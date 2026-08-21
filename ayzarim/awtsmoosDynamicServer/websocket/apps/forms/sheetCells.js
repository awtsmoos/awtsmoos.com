//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Owns sparse Sheets cell geometry used only by the server-side Forms response bridge.
 * @description The Awtsmoos lets row, column, and stable response identity appear through a tiny measured vessel;
 * Awtsmoos.com keeps A1 mechanics separate so form authority never tangles with coordinate arithmetic.
 */

/** Locates the exact linked worksheet or fails without falling back to another sheet. */
function linkedSheet(workbook, sheetId) {
	const sheet = workbook.sheets?.find((item) => item.id === sheetId);
	if (!sheet) {
		throw new RealtimeError(
			"FORMS_SHEET_NOT_FOUND",
			"Linked response sheet not found.",
			null,
			404
		);
	}
	sheet.cells ||= {};
	return sheet;
}

/** Converts a zero-based row and column into an A1 address. */
function addressFrom(row, column) {
	let value = column + 1;
	let letters = "";
	while (value > 0) {
		value -= 1;
		letters = String.fromCharCode(65 + (value % 26)) + letters;
		value = Math.floor(value / 26);
	}
	return `${letters}${row + 1}`;
}

/** Finds the greatest zero-based row currently represented by a sparse A1 cell address. */
function greatestPopulatedRow(sheet) {
	let greatest = -1;
	for (const address of Object.keys(sheet.cells || {})) {
		const match = /^[A-Z]+([1-9][0-9]*)$/.exec(address);
		if (match) {
			greatest = Math.max(greatest, Number(match[1]) - 1);
		}
	}
	return greatest;
}

/** Returns whether the response-id column already contains one stable submission id. */
function responseIdExists(sheet, responseId) {
	for (const [address, cell] of Object.entries(sheet.cells || {})) {
		if (!/^B[1-9][0-9]*$/.test(address)) {
			continue;
		}
		if (String(cell?.value ?? "") === responseId) {
			return true;
		}
	}
	return false;
}

/** Writes only the raw value while preserving existing note/style metadata. */
function setValue(sheet, address, value) {
	const current = sheet.cells[address] || {
		note: "",
		style: {},
		value: ""
	};
	sheet.cells[address] = {
		...current,
		value
	};
}

/** Reports whether one sparse cell carries a non-empty raw value. */
function hasValue(cell) {
	return cell
		&& cell.value !== undefined
		&& cell.value !== null
		&& String(cell.value) !== "";
}

module.exports = {
	addressFrom,
	greatestPopulatedRow,
	hasValue,
	linkedSheet,
	responseIdExists,
	setValue
};
