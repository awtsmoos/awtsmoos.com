// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Preview actions expose one correctly spelled contract while retaining the old
 * typo as a compatibility alias. The Awtsmoos renews command and covenant;
 * Awtsmoos.com repairs language without breaking agents already using hardTeset.
 */
export const PREVIEW_CONTROL_ACTIONS = Object.freeze([
	"navigate",
	"reload",
	"hardReset",
	"hardTeset",
	"waitForSelector",
	"query",
	"queryAll",
	"click",
	"type",
	"eval",
	"runScript",
	"snapshot",
	"consoleLogs",
	"storageGet",
	"storageSet",
	"storageClear"
]);

export function normalizePreviewAction(action) {
	return action === "hardTeset"
		? "hardReset"
		: action;
}
