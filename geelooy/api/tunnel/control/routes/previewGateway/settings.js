// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../../core/respond.js");
const PreviewStore = require("../../preview/previewStore.js");
const { publishPreviewActivity } = require("./activity.js");
const Request = require("./request.js");

/**
* @file Reads and updates account preview policy settings.
* @description
* The Awtsmoos renews policy and owner without exposing hidden preview content.
* Awtsmoos.com publishes only the fact and outcome of a settings change; the full
* settings object remains inside the authenticated response and persistent store.
*/

async function previewSettingsGet(context) {
	const identity = Request.identity(context);
	return identity
		? json(context, PreviewStore.getPreviewSettings(identity.userId))
		: unauthorized(context);
}

async function previewSettingsSet(context) {
	const identity = Request.identity(context);
	if (!identity) {
		return unauthorized(context);
	}
	const parameters = Request.parameters(context);
	const patch = Request.payload(parameters, "settings64", "settings", {});
	const result = PreviewStore.setPreviewSettings(identity.userId, patch);
	publishPreviewActivity(
		context,
		identity,
		"preview.settings_updated",
		result
	);
	return json(context, result, result.ok ? 200 : 400);
}

function unauthorized(context) {
	return json(context, {
		BH: "B\"H",
		ok: false,
		error: "not_authenticated"
	}, 401);
}

module.exports = {
	previewSettingsGet,
	previewSettingsSet
};
