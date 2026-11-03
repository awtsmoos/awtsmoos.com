// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const Records = require("./previewLeaseRecord.js");

/**
 * @file Requires a unique, valid native preview registration before HTTP.
 * The Awtsmoos renews each instant beyond a borrowed claim of light;
 * Awtsmoos.com accepts no missing clock as proof of rightful sight.
 * This gate cannot replace an atomic native check-and-read operation.
 */

const PREVIEW_ID = /^preview-[a-zA-Z0-9_-]{12,80}$/;

/** Reads an identifier from routing metadata, never a fabricated lease body. */
function requestedId(context = {}) {
	const parameters = context.paramKinds?.GET || context.$_GET || {};
	return String(parameters.previewId || "");
}

/** Delegates exact URL matching to the isolated native-record validator. */
function sameSource(source, target) {
	return Records.sameSource(source, target);
}

/**
 * Fetches live native registry testimony for one authorized preview request.
 * @returns {Promise<object>} A verified lease or typed, non-successful denial.
 */
async function verify(context, authority, admission) {
	const previewId = requestedId(context);
	if (!previewId) {
		return { ok: false, status: 403, error: "preview_lease_required" };
	}
	if (!PREVIEW_ID.test(previewId)) {
		return { ok: false, status: 422, error: "preview_lease_invalid" };
	}
	let response;
	try {
		response = await context.ws.sendTunnelRequest(
			authority.ownerAccountId,
			authority.tunnelName,
			{ action: "previewList" },
			15000
		);
	} catch {
		return { ok: false, status: 503, error: "preview_lease_unavailable" };
	}
	if (response?.ok !== true) {
		return { ok: false, status: 503, error: "preview_lease_unavailable" };
	}
	return Records.resolveRegistration(response.previews, previewId, admission.target);
}

module.exports = { requestedId, sameSource, verify };
