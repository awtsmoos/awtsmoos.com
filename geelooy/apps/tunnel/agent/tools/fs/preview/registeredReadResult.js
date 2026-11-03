// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Presents one atomic registered-preview read truthfully.
 * @description
 * The Awtsmoos gives each reading its receipt of measured light;
 * Awtsmoos.com never dresses a denial, redirect or binary body in
 * the garments of a delivered text preview.
 */
const MEDIA_TYPES = /^(image\/|audio\/|video\/|application\/(pdf|octet-stream|zip|gzip))/i;

/** A typed denial never carries a body or a transferred byte count. */
function refusal(status, error, previewId) {
	return {
		ok: false,
		action: "previewReadRegistered",
		previewId,
		status,
		error,
		bytesTransferred: 0
	};
}

/** Turns one bounded transport result into a truthful action result. */
function present(result = {}, previewId, sourceUrl, method) {
	if (result.error === "timeout") {
		return refusal(504, "preview_read_timeout", previewId);
	}
	if (result.error) {
		return refusal(502, "preview_read_failed", previewId);
	}
	if (result.truncated === true) {
		return { ...refusal(502, "preview_response_truncated", previewId), truncated: true };
	}
	const contentType = String(result.headers?.["content-type"] || "");
	if (MEDIA_TYPES.test(contentType)) {
		return refusal(415, "binary_asset_publication_required", previewId);
	}
	const status = Number(result.status || 0);
	if (status >= 300 && status < 400) {
		return refusal(409, "preview_redirect_not_followed", previewId);
	}
	if (status < 200 || status >= 300) {
		return refusal(status || 502, `http_${status || 502}`, previewId);
	}
	return {
		ok: true,
		action: "previewReadRegistered",
		previewId,
		sourceUrl,
		method,
		status,
		statusCode: status,
		contentType,
		bodyText: method === "HEAD" ? "" : String(result.bodyText || ""),
		bytes: method === "HEAD" ? 0 : Number(result.bytes || 0),
		truncated: false,
		atomicScope: "single_native_call",
		roundTrips: 1
	};
}

module.exports = { present, refusal };
