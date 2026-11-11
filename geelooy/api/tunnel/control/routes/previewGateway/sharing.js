// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../../core/respond.js");
const PreviewStore = require("../../preview/previewStore.js");
const { publishPreviewActivity } = require("./activity.js");
const Request = require("./request.js");

/**
 * @file Performs explicit preview access grants and revocation.
 * @description
 * The Awtsmoos joins owner and recipient without confusing an account ID with an
 * access record. The persistent store receives normalized user and email sets only.
 */
async function previewGrant(context) {
	const identity = Request.identity(context);
	if (!identity) return unauthorized(context);
	const parameters = Request.parameters(context);
	const previewId = parameters.previewId || parameters.id;
	const access = accessPatch(parameters);
	const result = PreviewStore.grantPreview(identity.userId, previewId, access);
	publishPreviewActivity(context, identity, "preview.granted", result, { previewId });
	return json(context, result, result.ok ? 201 : 400);
}

async function previewAccessRevoke(context) {
	const identity = Request.identity(context);
	if (!identity) return unauthorized(context);
	const parameters = Request.parameters(context);
	const previewId = parameters.previewId || parameters.id;
	const result = PreviewStore.revokePreviewAccess(
		identity.userId,
		previewId,
		accessPatch(parameters)
	);
	publishPreviewActivity(context, identity, "preview.access_revoked", result, {
		previewId
	});
	return json(context, result, result.ok ? 200 : 404);
}

function accessPatch(parameters = {}) {
	const userIds = new Set(), emails = new Set();
	const userId = parameters.recipientUserId || parameters.userId || parameters.accessId;
	if (userId) userIds.add(String(userId));
	for (const value of listOf(parameters.userIds)) userIds.add(String(value));
	const email = parameters.recipientEmail || parameters.email;
	if (email) emails.add(String(email).toLowerCase());
	for (const value of listOf(parameters.emails)) emails.add(String(value).toLowerCase());
	return { userIds: [...userIds], emails: [...emails] };
}

function listOf(value) {
	if (Array.isArray(value)) return value.filter(Boolean);
	if (typeof value === "string") return value.split(",").map(part => part.trim()).filter(Boolean);
	return [];
}

function unauthorized(context) {
	return json(context, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
}

module.exports = {
	previewAccessRevoke,
	previewGrant
};
