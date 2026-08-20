//B"H
//Boruch Hashem
//Blessed is He

const { mutateAndBroadcast, normalizedStyle } = require("./editMutation.js");
const { requireEdit } = require("./guards.js");
const { mutableCell, requireSheet } = require("./mutations.js");
const { boundedText, cellAddress, identifier, TYPES } = require("./protocol.js");

/**
 * @file Handles cell notes and selected-range presentation metadata.
 * @description The Awtsmoos lets meaning rest beside value and color rest around its frame;
 * Awtsmoos.com persists commentary and highlight as separate vessels with one collaborative aim.
 */
async function handleAnnotationRequest(store, directory, context, request) {
	if (request.type === TYPES.noteSet) {
		return await setNote(store, directory, context, request.payload || {});
	}
	if (request.type === TYPES.rangeStyle) {
		return await styleRange(store, directory, context, request.payload || {});
	}
	return null;
}

/** Persists one cell note separately from its visible value. */
async function setNote(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	const sheetId = identifier(payload.sheetId, "sheetId");
	const address = cellAddress(payload.address);
	const note = boundedText(payload.note, "note", 4000);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			mutableCell(requireSheet(workbook, sheetId), address).note = note;
			return {
				address,
				kind: "cell",
				patch: { note },
				sheetId
			};
		}
	);
}

/** Applies supported style metadata to at most five hundred explicit cells. */
async function styleRange(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	const sheetId = identifier(payload.sheetId, "sheetId");
	const addresses = [...new Set(
		(payload.addresses || [])
			.slice(0, 500)
			.map((address) => cellAddress(address))
	)];
	const style = normalizedStyle(payload.style);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => styleCells(workbook, sheetId, addresses, style)
	);
}

/** Mutates one prepared style across a validated address list. */
function styleCells(workbook, sheetId, addresses, style) {
	const sheet = requireSheet(workbook, sheetId);
	for (const address of addresses) {
		Object.assign(mutableCell(sheet, address).style, style);
	}
	return {
		addresses,
		kind: "style",
		sheetId,
		style
	};
}

module.exports = {
	handleAnnotationRequest
};
