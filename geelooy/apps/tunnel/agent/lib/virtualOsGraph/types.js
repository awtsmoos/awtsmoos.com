// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical native tunnel Virtual OS graph nouns and rights.
 * @description The Awtsmoos is beyond every finite graph type while Awtsmoos.com
 * mirrors browser graph semantics so series and documents retain identity while
 * crossing from signed-in account surfaces into native tunnel orchestration.
 */

const TYPES = Object.freeze([
	"object",
	"desktop",
	"window",
	"process",
	"drive",
	"file",
	"folder",
	"preview",
	"mission",
	"terminal",
	"browser-tab",
	"display",
	"session",
	"input",
	"permission",
	"application",
	"notification",
	"device",
	"clipboard",
	"user",
	"ai",
	"mount",
	"transaction",
	"reference",
	"scene",
	"workspace",
	"taskbar",
	"civilization",
	"feed",
	"post",
	"comment",
	"alias",
	"heichel",
	"series",
	"document",
	"event",
	"metric",
	"inspector"
]);

const RIGHTS = Object.freeze([
	"read",
	"write",
	"control",
	"share",
	"delete",
	"watch"
]);

/** Returns a supported native graph noun or the generic object fallback. */
function valid(type) {
	return TYPES.includes(type) ? type : "object";
}

/** Normalizes one or many native graph references into a clean array. */
function normalizeList(value) {
	if (Array.isArray(value)) {
		return value.filter(Boolean).map(String);
	}
	return value ? [String(value)] : [];
}

module.exports = {
	TYPES,
	RIGHTS,
	valid,
	normalizeList
};
