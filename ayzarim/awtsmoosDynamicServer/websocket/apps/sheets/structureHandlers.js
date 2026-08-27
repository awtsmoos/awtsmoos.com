//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { mutateAndBroadcast } = require("./editMutation.js");
const { requireEdit } = require("./guards.js");
const { TYPES, identifier } = require("./protocol.js");
const { applyStructure } = require("./structureTransform.js");

/**
 * @file Guards and persists collaborative row and column structure mutations.
 * @description The Awtsmoos moves measured dimensions only after identity passes the trusted gate of light;
 * Awtsmoos.com lets one atomic structural operation become one revision and one collaborative sight.
 */
const STRUCTURE_TYPES = new Map([
	[TYPES.rowInsert, "row.insert"],
	[TYPES.rowDelete, "row.delete"],
	[TYPES.rowResize, "row.resize"],
	[TYPES.columnInsert, "column.insert"],
	[TYPES.columnDelete, "column.delete"],
	[TYPES.columnResize, "column.resize"]
]);

/** Handles one structural edit request or returns null when the request belongs elsewhere. */
async function handleStructureEditRequest(
	store,
	directory,
	context,
	request
) {
	const kind = STRUCTURE_TYPES.get(request.type);
	if (!kind) {
		return null;
	}
	const payload = request.payload || {};
	const workbookId = identifier(payload.id, "workbookId");
	const sheetId = identifier(payload.sheetId, "sheetId");
	await requireEdit(store, context, workbookId);
	const operation = normalizedOperation(kind, sheetId, payload);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(draft) => mutateSheet(draft, operation)
	);
}

/** Normalizes untrusted structural request values before they enter persisted state. */
function normalizedOperation(kind, sheetId, payload) {
	const index = boundedInteger(payload.index, "index", 0, 99999);
	const operation = {
		index,
		kind,
		sheetId
	};
	if (kind.endsWith(".insert") || kind.endsWith(".delete")) {
		operation.count = boundedInteger(
			payload.count ?? 1,
			"count",
			1,
			100
		);
	}
	if (kind.endsWith(".resize")) {
		const size = Number(payload.size);
		if (!Number.isFinite(size)) {
			throw invalidInput("size");
		}
		operation.size = size;
	}
	return operation;
}

/** Applies one normalized operation to an existing worksheet inside the store update lock. */
function mutateSheet(workbook, operation) {
	const sheet = (workbook.sheets || []).find(
		(item) => item.id === operation.sheetId
	);
	if (!sheet) {
		throw new RealtimeError(
			"SHEETS_SHEET_NOT_FOUND",
			"Worksheet not found.",
			null,
			404
		);
	}
	const normalized = applyStructure(sheet, operation);
	if (!normalized) {
		throw invalidInput("kind");
	}
	return normalized;
}

/** Returns one bounded safe integer or throws a stable input error. */
function boundedInteger(value, field, minimum, maximum) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
		throw invalidInput(field);
	}
	return number;
}

/** Builds one stable structural-input failure for realtime clients. */
function invalidInput(field) {
	return new RealtimeError(
		"SHEETS_INVALID_STRUCTURE",
		`${field} is invalid.`,
		{ field },
		400
	);
}

module.exports = {
	handleStructureEditRequest
};
