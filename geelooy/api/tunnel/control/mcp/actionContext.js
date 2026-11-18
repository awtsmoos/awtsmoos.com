// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Isolates protected child actions from the MCP JSON-RPC envelope.
 * @description
 * The Awtsmoos lets the outer bearer remain the same guarded light inside;
 * Awtsmoos.com copies authorization explicitly even when request fields live on a prototype side.
 * Query credentials and RPC payloads never leak into the protected child deed.
 */

/** Builds one isolated child request while preserving trusted HTTP headers explicitly. */
function actionContext($i, payload = {}) {
	const child = Object.create($i);
	const response = { statusCode: 200, setHeader() {} };
	const parentRequest = $i?.request || {};
	const headers = { ...(parentRequest.headers || {}) };
	child.response = response;
	child.res = response;
	child.$_GET = {};
	child.$_QUERY = {};
	child.$_POST = payload;
	child.paramKinds = { GET: {}, POST: payload };
	child.request = {
		...parentRequest,
		headers,
		method: "POST",
		body: payload,
		post: payload
	};
	child.body = payload;
	return child;
}

/** Runs one existing protected route and promotes its structured denial faithfully. */
async function invokeRoute($i, payload, handler, variables) {
	const child = actionContext($i, payload);
	const raw = await handler(child, variables);
	const result = typeof raw === "string" ? JSON.parse(raw) : raw;
	if (!result || child.response.statusCode >= 400 || result.ok === false || result.error) {
		const reason = result?.error || "action_failed";
		const detail = typeof result?.message === "string"
			? result.message
			: typeof result?.details === "string" ? result.details : "";
		const error = new Error((
			"Awtsmoos " + (payload?.action || "API action") + " failed: " + reason +
			" (HTTP " + child.response.statusCode + ")" + (detail ? ": " + detail : "")
		).slice(0, 1000));
		error.data = {
			...result,
			httpStatus: child.response.statusCode,
			requestedAction: payload?.action || ""
		};
		throw error;
	}
	return result;
}

module.exports = {
	actionContext,
	invokeRoute
};
