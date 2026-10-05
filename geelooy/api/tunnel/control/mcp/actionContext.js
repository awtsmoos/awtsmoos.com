// B"H
"use strict";

/** Isolate child API parameters and response metadata from the MCP envelope. */
function actionContext($i, payload = {}) {
	const child = Object.create($i);
	const response = { statusCode: 200, setHeader() {} };
	child.response = response;
	child.res = response;
	child.$_GET = {};
	child.$_QUERY = {};
	child.$_POST = payload;
	child.paramKinds = { GET: {}, POST: payload };
	child.request = { ...$i.request, method: "POST", body: payload, post: payload };
	child.body = payload;
	return child;
}

async function invokeRoute($i, payload, handler, variables) {
	const child = actionContext($i, payload);
	const raw = await handler(child, variables);
	const result = typeof raw === "string" ? JSON.parse(raw) : raw;
	if (!result || child.response.statusCode >= 400 || result.ok === false || result.error) {
		const reason = result?.error || "action_failed";
		const detail = typeof result?.message === "string" ? result.message : typeof result?.details === "string" ? result.details : "";
		const error = new Error(("Awtsmoos " + (payload?.action || "API action") + " failed: " + reason + " (HTTP " + child.response.statusCode + ")" + (detail ? ": " + detail : "")).slice(0, 1000));
		error.data = { ...result, httpStatus: child.response.statusCode, requestedAction: payload?.action || "" };
		throw error;
	}
	return result;
}

module.exports = { actionContext, invokeRoute };
