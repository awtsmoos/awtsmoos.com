// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../../core/respond.js");
const PreviewStore = require("../../preview/previewStore.js");
const { publishPreviewActivity } = require("./activity.js");
const Request = require("./request.js");

/**
 * @file Performs authenticated preview creation, listing, update, and revocation.
 * @description
 * The Awtsmoos binds every public doorway to a durable owner record. These routes
 * mutate the persistent preview store directly and publish only redacted testimony.
 */
async function previewCreate(context) {
	const identity = Request.identity(context);
	if (!identity) return unauthorized(context);
	const parameters = Request.parameters(context);
	const content = Request.payload(parameters, "content64", "content", {});
	const result = PreviewStore.createPreview(identity.userId, {
		...parameters,
		...objectContent(content),
		ttlSeconds: ttlSeconds(parameters)
	});
	publishPreviewActivity(context, identity, "preview.created", result);
	return json(context, result, result.ok ? 201 : 400);
}

async function previewList(context) {
	const identity = Request.identity(context);
	return identity
		? json(context, { ok: true, previews: PreviewStore.listPreviews(identity.userId) })
		: unauthorized(context);
}

async function previewRevoke(context) {
	const identity = Request.identity(context);
	if (!identity) return unauthorized(context);
	const parameters = Request.parameters(context);
	const previewId = parameters.previewId || parameters.id;
	const result = PreviewStore.revokePreview(identity.userId, previewId);
	publishPreviewActivity(context, identity, "preview.revoked", result, { previewId });
	return json(context, result, result.ok ? 200 : 404);
}

async function previewUpdate(context) {
	const identity = Request.identity(context);
	if (!identity) return unauthorized(context);
	const parameters = Request.parameters(context);
	const previewId = parameters.previewId || parameters.id;
	const patch = Request.payload(parameters, "patch64", "patch", {});
	const result = PreviewStore.updatePreview(identity.userId, previewId, patch);
	publishPreviewActivity(context, identity, "preview.updated", result, { previewId });
	return json(context, result, result.ok ? 200 : 404);
}

function objectContent(content) {
	return content && typeof content === "object" && !Buffer.isBuffer(content)
		? content
		: { content };
}

function ttlSeconds(parameters) {
	if (Number(parameters.ttlSeconds) > 0) return Number(parameters.ttlSeconds);
	if (Number(parameters.ttlMs) > 0) return Math.ceil(Number(parameters.ttlMs) / 1000);
	return undefined;
}

function unauthorized(context) {
	return json(context, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
}

module.exports = {
	previewCreate,
	previewList,
	previewRevoke,
	previewUpdate
};
