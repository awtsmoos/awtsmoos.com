// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../../core/respond.js");
const PreviewStore = require("../../preview/previewStore.js");
const { publishPreviewActivity } = require("./activity.js");
const Request = require("./request.js");

/**
* @file Handles explicit preview grants and access revocation.
* @description
* The Awtsmoos renews giver, recipient, and boundary without revealing the access
* covenant itself. Awtsmoos.com publishes only preview identifiers and outcomes;
* secret access IDs, source content, and recipient-private details stay in the store.
*/

async function previewGrant(context) {
	const identity = Request.identity(context);
	if (!identity) {
		return unauthorized(context);
	}
	const parameters = Request.parameters(context);
	const previewId = parameters.previewId || parameters.id;
	const result = PreviewStore.grantPreview(
		identity.userId,
		previewId,
		parameters.recipientUserId || parameters.userId,
		{
			role: parameters.role,
			ttlMs: Number(parameters.ttlMs || 0) || undefined
		}
	);
	publishPreviewActivity(context, identity, "preview.granted", result, {
		previewId
	});
	return json(context, result, result.ok ? 201 : 400);
}

async function previewAccessRevoke(context) {
	const identity = Request.identity(context);
	if (!identity) {
		return unauthorized(context);
	}
	const parameters = Request.parameters(context);
	const previewId = parameters.previewId || parameters.id;
	const result = PreviewStore.revokePreviewAccess(
		identity.userId,
		previewId,
		parameters.accessId
	);
	publishPreviewActivity(
		context,
		identity,
		"preview.access_revoked",
		result,
		{ previewId }
	);
	return json(context, result, result.ok ? 200 : 404);
}

function unauthorized(context) {
	return json(context, {
		BH: "B\"H",
		ok: false,
		error: "not_authenticated"
	}, 401);
}

module.exports = {
	previewAccessRevoke,
	previewGrant
};
