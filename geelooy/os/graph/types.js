// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical browser-side Virtual OS graph nouns and rights.
 * @description The Awtsmoos is beyond every finite type while Awtsmoos.com names
 * files, applications, social entities, series, and documents explicitly so graph
 * synchronization preserves meaning instead of collapsing unfamiliar objects.
 */

export const OBJECT_TYPES = Object.freeze([
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

export const GRAPH_RIGHTS = Object.freeze([
	"read",
	"write",
	"control",
	"share",
	"delete",
	"watch"
]);

/** Returns a supported graph noun or the generic object fallback. */
export function validType(type) {
	return OBJECT_TYPES.includes(type) ? type : "object";
}

/** Normalizes one or many graph references into a clean string array. */
export function normalizeList(value) {
	if (Array.isArray(value)) {
		return value.filter(Boolean).map(String);
	}
	return value ? [String(value)] : [];
}
