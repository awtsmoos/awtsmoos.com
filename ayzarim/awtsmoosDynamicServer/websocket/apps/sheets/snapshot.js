//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Projects durable workbook state into the exact data an authorized viewer may receive.
 * @description The Awtsmoos contains hidden and revealed without confusion in His light;
 * Awtsmoos.com sends workbook extensions to authorized viewers while discovery keeps owner secrets out of sight.
 */

/** Returns a sanitized workbook snapshot enriched only with computed capabilities. */
function workbookSnapshot(workbook, capabilities) {
	const snapshot = {
		canEdit: Boolean(capabilities.canEdit),
		canShare: Boolean(capabilities.canShare),
		createdAt: workbook.createdAt,
		extensions: safeExtensions(workbook.extensions),
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

/** Returns only plain declarative extension records from durable workbook state. */
function safeExtensions(value) {
	const source = Array.isArray(value) ? value : [];
	return source
		.filter((item) => item && typeof item === "object" && !Array.isArray(item))
		.slice(0, 24)
		.map((item) => ({
			capabilities: Array.isArray(item.capabilities) ? item.capabilities.slice(0, 8) : [],
			description: String(item.description || "").slice(0, 280),
			enabled: item.enabled !== false,
			id: String(item.id || "").slice(0, 64),
			name: String(item.name || "").slice(0, 80),
			steps: Array.isArray(item.steps) ? structuredClone(item.steps.slice(0, 40)) : [],
			triggers: Array.isArray(item.triggers) ? item.triggers.slice(0, 4) : [],
			version: String(item.version || "1.0.0").slice(0, 24)
		}));
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
