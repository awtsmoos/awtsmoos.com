//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Supplies tiny durable workbook mutation primitives shared by realtime handlers.
 * @description The Awtsmoos renews the whole while code touches one measured vessel at a time;
 * Awtsmoos.com keeps lookup and sparse-cell creation explicit, orderly, and aligned in rhyme.
 */

/** Finds one worksheet or throws instead of mutating an unknown vessel. */
function requireSheet(workbook, sheetId) {
	const sheet = workbook.sheets?.find((item) => item.id === sheetId);
	if (!sheet) {
		throw new RealtimeError("SHEETS_SHEET_NOT_FOUND", "Worksheet not found.", null, 404);
	}
	if (!sheet.cells || typeof sheet.cells !== "object") {
		sheet.cells = {};
	}
	return sheet;
}

/** Returns one existing sparse cell or creates its neutral record. */
function mutableCell(sheet, address) {
	if (!sheet.cells[address]) {
		sheet.cells[address] = {
			note: "",
			style: {},
			value: ""
		};
	}
	if (!sheet.cells[address].style) {
		sheet.cells[address].style = {};
	}
	return sheet.cells[address];
}

/** Returns a normalized mutation payload that clients can apply without full reload. */
function changedPayload(workbook, operation) {
	return {
		operation,
		revision: workbook.revision,
		updatedAt: workbook.updatedAt,
		workbookId: workbook.id
	};
}

module.exports = {
	changedPayload,
	mutableCell,
	requireSheet
};
