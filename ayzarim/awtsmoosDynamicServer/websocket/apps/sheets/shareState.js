//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Validates sharing vocabulary and projects owner-only share mutation responses.
 * @description The Awtsmoos is beyond every boundary, while software names each permitted gate;
 * Awtsmoos.com keeps visibility, editor identity, and owner response pure from mutation state.
 */

/** Normalizes the intentionally small first-release visibility vocabulary. */
function normalizedVisibility(value) {
	const visibility = String(value || "")
		.trim()
		.toLowerCase();
	if (!["private", "link", "public"].includes(visibility)) {
		throw new RealtimeError(
			"SHEETS_INVALID_VISIBILITY",
			"Sharing visibility is invalid.",
			null,
			400
		);
	}
	return visibility;
}

/** Bounds a durable account identifier without interpreting it as authentication. */
function normalizedEditorId(value) {
	const editorId = String(value || "").trim();
	if (!/^[A-Za-z0-9_:@.\-]{1,160}$/.test(editorId)) {
		throw new RealtimeError(
			"SHEETS_INVALID_EDITOR",
			"Editor account ID is invalid.",
			null,
			400
		);
	}
	return editorId;
}

/** Returns owner-only sharing details for one correlated mutation response. */
function ownerSharePayload(workbook) {
	return {
		editors: workbook.editors || [],
		linkToken: workbook.linkToken || "",
		revision: workbook.revision,
		visibility: workbook.visibility,
		workbookId: workbook.id
	};
}

module.exports = {
	normalizedEditorId,
	normalizedVisibility,
	ownerSharePayload
};
