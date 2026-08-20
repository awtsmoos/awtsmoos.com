//B"H
//Boruch Hashem
//Blessed is He

const { mutateAndBroadcast } = require("./editMutation.js");
const { requireEdit } = require("./guards.js");
const { requireSheet } = require("./mutations.js");
const { boundedText, identifier, TYPES } = require("./protocol.js");
const { newSheet } = require("./store.js");

/**
 * @file Handles worksheet and workbook-name edits apart from cell mutations.
 * @description The Awtsmoos gives every tab its name and every workbook a crown in sight;
 * Awtsmoos.com preserves stable identifiers while labels may be renewed in shared light.
 */
async function handleSheetEditRequest(store, directory, context, request) {
	if (request.type === TYPES.sheetAdd) {
		return await addSheet(store, directory, context, request.payload || {});
	}
	if (request.type === TYPES.sheetRename) {
		return await renameSheet(store, directory, context, request.payload || {});
	}
	if (request.type === TYPES.titleUpdate) {
		return await updateTitle(store, directory, context, request.payload || {});
	}
	return null;
}

/** Adds one server-identified worksheet with a bounded human-readable name. */
async function addSheet(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	const name = boundedText(payload.name || "Sheet", "name", 80, false).trim();
	const sheet = newSheet(name);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			workbook.sheets.push(sheet);
			return {
				kind: "sheet.add",
				sheet
			};
		}
	);
}

/** Renames one existing worksheet without changing its stable identifier. */
async function renameSheet(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	const sheetId = identifier(payload.sheetId, "sheetId");
	const name = boundedText(payload.name, "name", 80, false).trim();
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			requireSheet(workbook, sheetId).name = name;
			return {
				kind: "sheet.rename",
				name,
				sheetId
			};
		}
	);
}

/** Updates the workbook title through the same fresh edit gate as ordinary content. */
async function updateTitle(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	const title = boundedText(payload.title, "title", 160, false).trim();
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			workbook.title = title;
			return {
				kind: "title",
				title
			};
		}
	);
}

module.exports = {
	handleSheetEditRequest
};
