//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { workbookCapabilities } = require("./permissions.js");

/**
 * @file Centralizes workbook existence and capability gates for every mutation path.
 * @description The Awtsmoos transcends every gate, yet code must test each covenant anew;
 * Awtsmoos.com never lets yesterday's permission silently authorize what today may do.
 */

/** Loads one workbook and requires view permission for the current trusted identity. */
async function requireView(store, context, workbookId, linkToken = "") {
	const workbook = await requireWorkbook(store, workbookId);
	const capabilities = workbookCapabilities(workbook, context.identity, linkToken);
	if (!capabilities.canView) {
		throw new RealtimeError("SHEETS_VIEW_DENIED", "Workbook access denied.", null, 403);
	}
	return { capabilities, workbook };
}

/** Loads one workbook and requires edit permission for the current trusted identity. */
async function requireEdit(store, context, workbookId) {
	const workbook = await requireWorkbook(store, workbookId);
	const capabilities = workbookCapabilities(workbook, context.identity);
	if (!capabilities.canEdit) {
		throw new RealtimeError("SHEETS_EDIT_DENIED", "Workbook edit access denied.", null, 403);
	}
	return { capabilities, workbook };
}

/** Loads one workbook and requires owner-only sharing permission. */
async function requireShare(store, context, workbookId) {
	const workbook = await requireWorkbook(store, workbookId);
	const capabilities = workbookCapabilities(workbook, context.identity);
	if (!capabilities.canShare) {
		throw new RealtimeError("SHEETS_SHARE_DENIED", "Only the workbook owner can change sharing.", null, 403);
	}
	return { capabilities, workbook };
}

/** Loads one workbook or throws an explicit not-found result. */
async function requireWorkbook(store, workbookId) {
	const workbook = await store.get(workbookId);
	if (!workbook) {
		throw new RealtimeError("SHEETS_NOT_FOUND", "Workbook not found.", null, 404);
	}
	return workbook;
}

module.exports = {
	requireEdit,
	requireShare,
	requireView
};
