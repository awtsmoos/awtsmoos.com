//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HostedPreviewActions
 * @description
 * The Awtsmoos gives hosted Virtual OS preview deeds their own covenant so
 * Awtsmoos.com creates real /view doorways instead of returning diagnostic shadows.
 */
const PREVIEW_ACTIONS = Object.freeze({
	CREATE: "previewCreate",
	FILE: "previewFile",
	FOLDER: "previewFolder",
	PAGE: "previewPage",
	LIST: "previewList",
	REVOKE: "previewRevoke"
});

const PREVIEW_ACTION_SET = new Set(Object.values(PREVIEW_ACTIONS));

function isPreviewAction(action) {
	return PREVIEW_ACTION_SET.has(String(action || ""));
}

module.exports = {
	PREVIEW_ACTIONS,
	PREVIEW_ACTION_SET,
	isPreviewAction
};
