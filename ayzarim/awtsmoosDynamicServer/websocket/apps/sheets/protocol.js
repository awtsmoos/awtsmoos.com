//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Defines the bounded realtime vocabulary of Awtsmoos Sheets.
 * @description The Awtsmoos gives every collaborative act a measured name and shore;
 * Awtsmoos.com rejects shapeless payloads so shared editing may remain clear and secure.
 */
const APPLICATION_ID = "sheets";
const VERSION = 1;
const ADDRESS_PATTERN = /^[A-Z]{1,3}[1-9][0-9]{0,4}$/;

const TYPES = Object.freeze({
	create: "sheets.document.create",
	open: "sheets.document.open",
	listPublic: "sheets.document.listPublic",
	cellUpdate: "sheets.cell.update",
	rangeValues: "sheets.range.values",
	rangeStyle: "sheets.range.style",
	noteSet: "sheets.note.set",
	sheetAdd: "sheets.sheet.add",
	sheetRename: "sheets.sheet.rename",
	presenceSelect: "sheets.presence.select",
	shareUpdate: "sheets.share.update",
	shareInvite: "sheets.share.invite",
	titleUpdate: "sheets.title.update"
});

const EVENTS = Object.freeze({
	documentChanged: "sheets.document.changed",
	presenceChanged: "sheets.presence.changed",
	shareChanged: "sheets.share.changed"
});

/** Returns a trimmed string or throws one application-safe realtime error. */
function boundedText(value, field, maximum, allowEmpty = true) {
	const text = String(value ?? "");
	if ((!allowEmpty && !text.trim()) || text.length > maximum) {
		throw new RealtimeError(
			"SHEETS_INVALID_INPUT",
			`${field} is invalid.`,
			{ field },
			400
		);
	}
	return text;
}

/** Validates and normalizes an A1 address. */
function cellAddress(value) {
	const address = String(value || "").trim().toUpperCase();
	if (!ADDRESS_PATTERN.test(address)) {
		throw new RealtimeError(
			"SHEETS_INVALID_CELL",
			"Cell address is invalid.",
			null,
			400
		);
	}
	return address;
}

/** Validates one opaque identifier used for workbook and worksheet routing. */
function identifier(value, field = "id") {
	const id = String(value || "").trim();
	if (!/^[A-Za-z0-9_-]{8,128}$/.test(id)) {
		throw new RealtimeError(
			"SHEETS_INVALID_ID",
			`${field} is invalid.`,
			{ field },
			400
		);
	}
	return id;
}

module.exports = {
	APPLICATION_ID,
	EVENTS,
	TYPES,
	VERSION,
	boundedText,
	cellAddress,
	identifier
};
