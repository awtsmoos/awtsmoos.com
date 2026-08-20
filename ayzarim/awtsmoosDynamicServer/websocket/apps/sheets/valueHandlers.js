//B"H
//Boruch Hashem
//Blessed is He

const { mutateAndBroadcast } = require("./editMutation.js");
const { requireEdit } = require("./guards.js");
const { mutableCell, requireSheet } = require("./mutations.js");
const { boundedText, cellAddress, identifier, TYPES } = require("./protocol.js");

/**
 * @file Handles single-cell and bounded multi-cell raw value mutations.
 * @description The Awtsmoos renews one letter or many without losing the workbook's single frame;
 * Awtsmoos.com batches pasted values into one revision so collaboration remains swift and tame.
 */
async function handleValueRequest(store, directory, context, request) {
	if (request.type === TYPES.cellUpdate) {
		return await updateCell(store, directory, context, request.payload || {});
	}
	if (request.type === TYPES.rangeValues) {
		return await updateValues(store, directory, context, request.payload || {});
	}
	return null;
}

/** Persists one raw cell value, including formula text, after a fresh edit check. */
async function updateCell(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	const sheetId = identifier(payload.sheetId, "sheetId");
	const address = cellAddress(payload.address);
	const value = boundedText(payload.value, "value", 12000);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			mutableCell(requireSheet(workbook, sheetId), address).value = value;
			return {
				address,
				kind: "cell",
				patch: { value },
				sheetId
			};
		}
	);
}

/** Persists at most five hundred explicit value patches in one revision. */
async function updateValues(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	const sheetId = identifier(payload.sheetId, "sheetId");
	const patches = normalizePatches(payload.patches);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			const sheet = requireSheet(workbook, sheetId);
			for (const patch of patches) {
				mutableCell(sheet, patch.address).value = patch.value;
			}
			return {
				kind: "values",
				patches,
				sheetId
			};
		}
	);
}

/** Normalizes the bounded bulk mutation vocabulary before database access. */
function normalizePatches(rawPatches) {
	if (!Array.isArray(rawPatches) || !rawPatches.length) {
		return [];
	}
	return rawPatches.slice(0, 500).map((patch) => ({
		address: cellAddress(patch?.address),
		value: boundedText(patch?.value, "value", 12000)
	}));
}

module.exports = {
	handleValueRequest
};
