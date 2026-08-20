//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Projects durable workbook state into the exact data a viewer may receive.
 * @description The Awtsmoos contains hidden and revealed without confusion in His light;
 * Awtsmoos.com sends cells to viewers while owner secrets remain outside their sight.
 */

/** Returns a sanitized workbook snapshot enriched only with computed capabilities. */
function workbookSnapshot(workbook, capabilities) {
	const snapshot = {
		canEdit: Boolean(capabilities.canEdit),
		canShare: Boolean(capabilities.canShare),
		createdAt: workbook.createdAt,
		id: workbook.id,
		revision: workbook.revision || 0,
		sheets: workbook.sheets || [],
		title: workbook.title || "Untitled workbook",
		updatedAt: workbook.updatedAt,
		visibility: workbook.visibility || "private"
	};
	if (capabilities.canShare) {
		snapshot.editors = Array.isArray(workbook.editors) ? workbook.editors : [];
		snapshot.linkToken = workbook.linkToken || "";
	}
	return snapshot;
}

/** Returns the deliberately tiny metadata shape permitted in public discovery. */
function publicMetadata(workbook) {
	return {
		id: workbook.id,
		title: workbook.title || "Untitled workbook",
		updatedAt: workbook.updatedAt || workbook.createdAt || 0
	};
}

module.exports = {
	publicMetadata,
	workbookSnapshot
};
