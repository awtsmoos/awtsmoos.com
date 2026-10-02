//B"H
//Boruch Hashem
//Blessed is He

const PreviewStore = require("../../../preview/previewStore.js");
const ActionResult = require("./actionResult.js");
const Fields = require("./requestFields.js");
const { PREVIEW_ACTIONS } = require("./previewActions.js");

/**
 * @module HostedPreviewDispatcher
 * @description
 * The Awtsmoos turns owned Virtual OS source into a real persistent /view doorway;
 * Awtsmoos.com reuses the canonical PreviewStore so hosted previews are not diagnostic shadows.
 */
async function dispatchHostedPreview($i, userId, payload = {}) {
	const action = String(payload.action || PREVIEW_ACTIONS.CREATE);
	try {
		if (action === PREVIEW_ACTIONS.LIST) {
			return ActionResult.success(action, {
				previews: PreviewStore.listPreviews(userId)
			});
		}
		if (action === PREVIEW_ACTIONS.REVOKE) {
			return ActionResult.success(action, PreviewStore.revokePreview(
				userId,
				Fields.field(payload, "previewId", Fields.field(payload, "id", ""))
			));
		}
		const input = previewInput(action, payload);
		const result = PreviewStore.createPreview(userId, input);
		return result?.ok === false
			? { ...result, action, vessel: "hosted-virtual-os" }
			: ActionResult.success(action, result);
	} catch (error) {
		return ActionResult.failure(error, action);
	}
}

function previewInput(action, payload) {
	const kind = kindFor(action, Fields.field(payload, "kind", ""));
	const path = Fields.field(payload, "path", Fields.field(payload, "p", ""));
	return {
		kind,
		path,
		html: Fields.field(payload, "html", Fields.field(payload, "content", "")),
		css: Fields.field(payload, "css", ""),
		data: Fields.field(payload, "data", null),
		title: Fields.field(payload, "previewTitle", Fields.field(payload, "title", path || "Awtsmoos Preview")),
		visibility: Fields.field(payload, "previewVisibility", Fields.field(payload, "visibility", "private")),
		ttlSeconds: Fields.numberField(
			payload,
			"previewTtlSeconds",
			Fields.numberField(payload, "ttlSeconds", 3600)
		),
		tunnelName: "awtsmoos-virtual-os",
		targetVessel: "awtsmoos-virtual-os",
		createdBy: "user",
		allowFolderBrowse: true,
		allowSearch: true,
		allowRaw: true
	};
}

function kindFor(action, requested) {
	if (action === PREVIEW_ACTIONS.FOLDER) return "folder";
	if (action === PREVIEW_ACTIONS.PAGE) return "page";
	if (action === PREVIEW_ACTIONS.FILE) return "file";
	return requested || "file";
}

module.exports = {
	dispatchHostedPreview,
	previewInput
};
