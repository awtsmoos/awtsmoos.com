//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { requireEdit } = require("../sheets/guards.js");
const {
	addressFrom,
	greatestPopulatedRow,
	hasValue,
	linkedSheet,
	responseIdExists,
	setValue
} = require("./sheetCells.js");

/**
 * @file Owns destination checks, form-owned headers, and retry-safe response-row appends.
 * @description The Awtsmoos lets public answers reach one hidden server-chosen row without exposing the path;
 * Awtsmoos.com guards existing data and recognizes stable response identity before another append may pass.
 */

/** Requires current edit authority and a real destination sheet before linking or editor mutation. */
async function requireLinkedDestination(sheetsStore, context, workbookId, sheetId) {
	const { workbook } = await requireEdit(sheetsStore, context, workbookId);
	const sheet = workbook.sheets?.find((item) => item.id === sheetId);
	if (!sheet) {
		throw failure("FORMS_SHEET_NOT_FOUND", "Linked response sheet not found.", 404);
	}
	return { sheet, workbook };
}

/** Claims an empty header span for one newly linked form and writes canonical response columns. */
async function initializeHeaders(sheetsStore, form) {
	await sheetsStore.update(form.destination.workbookId, (workbook) => {
		const sheet = linkedSheet(workbook, form.destination.sheetId);
		const headers = responseHeaders(form);
		if (headers.some((header, column) => hasValue(sheet.cells?.[addressFrom(0, column)]))) {
			throw failure(
				"FORMS_DESTINATION_OCCUPIED",
				"The linked sheet already contains data in the response header row.",
				409
			);
		}
		writeHeaders(sheet, headers, headers.length);
	});
}

/** Refreshes only the form-owned header span after an authorized definition update. */
async function refreshHeaders(sheetsStore, form, previousFieldCount) {
	await sheetsStore.update(form.destination.workbookId, (workbook) => {
		const sheet = linkedSheet(workbook, form.destination.sheetId);
		const headers = responseHeaders(form);
		const width = Math.max(headers.length, Number(previousFieldCount || 0) + 2);
		writeHeaders(sheet, headers, width);
	});
}

/** Appends one response row unless the same stable response id already exists in column B. */
async function appendResponse(sheetsStore, form, answers, submittedAt, responseId) {
	let appended = false;
	await sheetsStore.update(form.destination.workbookId, (workbook) => {
		const sheet = linkedSheet(workbook, form.destination.sheetId);
		if (responseIdExists(sheet, responseId)) {
			return;
		}
		const row = greatestPopulatedRow(sheet) + 1;
		const values = [
			new Date(submittedAt).toISOString(),
			responseId,
			...(form.fields || []).map((field) => serializedAnswer(answers[field.id]))
		];
		values.forEach((value, column) => {
			setValue(sheet, addressFrom(row, column), value);
		});
		appended = true;
	});
	return appended;
}

/** Returns canonical response headers in the same order used for every append. */
function responseHeaders(form) {
	return [
		"Submitted at",
		"Response ID",
		...(form.fields || []).map((field) => String(field.label || ""))
	];
}

/** Writes one header span and clears only trailing columns formerly owned by this form. */
function writeHeaders(sheet, headers, width) {
	for (let column = 0; column < width; column += 1) {
		setValue(sheet, addressFrom(0, column), headers[column] || "");
	}
}

function serializedAnswer(value) {
	return Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

function failure(code, message, status) {
	return new RealtimeError(code, message, null, status);
}

module.exports = {
	appendResponse,
	initializeHeaders,
	refreshHeaders,
	requireLinkedDestination,
	responseHeaders
};
