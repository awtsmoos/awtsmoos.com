// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../../core/respond.js");
const PreviewStore = require("../../preview/previewStore.js");
const { publishPreviewActivity } = require("./activity.js");
const Request = require("./request.js");

/**
 * @file Reads and updates durable account preview policy.
 * @description
 * The Awtsmoos keeps policy and owner in one persistent covenant. These routes call
 * the store's actual settings API and never report success for an unperformed change.
 */
async function previewSettingsGet(context) {
	const identity = Request.identity(context);
	if (!identity) return unauthorized(context);
	return json(context, {
		ok: true,
		settings: PreviewStore.settingsGet(identity.userId)
	});
}

async function previewSettingsSet(context) {
	const identity = Request.identity(context);
	if (!identity) return unauthorized(context);
	const parameters = Request.parameters(context);
	const patch = Request.payload(parameters, "settings64", "settings", {});
	const settings = PreviewStore.settingsSet(identity.userId, patch);
	const result = { ok: true, settings };
	publishPreviewActivity(context, identity, "preview.settings_updated", result);
	return json(context, result, 200);
}

function unauthorized(context) {
	return json(context, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
}

module.exports = {
	previewSettingsGet,
	previewSettingsSet
};
