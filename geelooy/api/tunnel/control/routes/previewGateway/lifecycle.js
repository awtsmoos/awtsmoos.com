// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../../core/respond.js");
const PreviewStore = require("../../preview/previewStore.js");
const { publishPreviewActivity } = require("./activity.js");
const Request = require("./request.js");

/**
* @file Handles authenticated preview creation, listing, update, and revocation.
* @description
* The Awtsmoos renews preview and owner without confusing content with testimony.
* Awtsmoos.com keeps source payloads inside the preview store while the account
* stream receives only bounded lifecycle identifiers, metadata, and outcomes.
*/

async function previewCreate(context) {
	const identity = Request.identity(context);
	if (!identity) {
		return unauthorized(context);
	}
	const parameters = Request.parameters(context);
	const result = PreviewStore.createPreview(identity.userId, {
		title: parameters.title,
		description: parameters.description,
		kind: parameters.kind,
		visibility: parameters.visibility,
		content: Request.payload(parameters, "content64", "content", {}),
		ttlMs: Number(parameters.ttlMs || 0) || undefined
	});
	publishPreviewActivity(context, identity, "preview.created", result);
	return json(context, result, result.ok ? 201 : 400);
}

async function previewList(context) {
	const identity = Request.identity(context);
	return identity
		? json(context, PreviewStore.listPreviews(identity.userId))
		: unauthorized(context);
}

async function previewRevoke(context) {
	const identity = Request.identity(context);
	if (!identity) {
		return unauthorized(context);
	}
	const parameters = Request.parameters(context);
	const result = PreviewStore.revokePreview(
		identity.userId,
		parameters.previewId || parameters.id
	);
	publishPreviewActivity(context, identity, "preview.revoked", result, {
		previewId: parameters.previewId || parameters.id
	});
	return json(context, result, result.ok ? 200 : 404);
}

async function previewUpdate(context) {
	const identity = Request.identity(context);
	if (!identity) {
		return unauthorized(context);
	}
	const parameters = Request.parameters(context);
	const result = PreviewStore.updatePreview(
		identity.userId,
		parameters.previewId || parameters.id,
		Request.payload(parameters, "patch64", "patch", {})
	);
	publishPreviewActivity(context, identity, "preview.updated", result, {
		previewId: parameters.previewId || parameters.id
	});
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
	previewCreate,
	previewList,
	previewRevoke,
	previewUpdate
};
