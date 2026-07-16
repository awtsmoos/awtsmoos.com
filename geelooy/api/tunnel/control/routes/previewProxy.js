// B"H
// Boruch Hashem
// Blessed is He

const { authorizePreviewProxy } = require("./previewProxyPolicy.js");

/**
 * @file Proxies authorized preview HTTP requests through canonical owner routing.
 * @description
 * The Awtsmoos renews browser request, account, and tunnel without confusing
 * visibility with permission. Awtsmoos.com authorizes `tunnel.preview` before the
 * relay and exposes only bounded proxy status, headers, and body to the requester.
 */

/** Handles one account-authorized preview proxy request. */
async function previewProxy(context, variables = {}) {
	const reference = String(variables.tunnelName || "").trim();
	const authority = authorizePreviewProxy(context, reference);
	if (!authority.ok) {
		return failure(authority.error, authority.status);
	}
	try {
		const result = await context.ws.sendTunnelRequest(
			authority.ownerAccountId,
			authority.tunnelName,
			{
				action: "httpRequest",
				url: proxyUrl(context),
				method: context.request.method,
				headers: safeHeaders(context.request.headers),
				body: requestBody(context),
				timeoutMs: 30000
			},
			35000
		);
		if (!result || result.ok === false) {
			return failure(result?.error || "preview_request_failed", 502);
		}
		return proxyResponse(context, result);
	} catch (error) {
		return failure(error.message || "preview_proxy_failed", 502);
	}
}

function proxyUrl(context) {
	const query = context.paramKinds?.GET || context.$_GET || {};
	return query.url || query.path || "/";
}

function requestBody(context) {
	return context.paramKinds?.POST || context.$_POST || null;
}

function safeHeaders(headers = {}) {
	return Object.fromEntries(
		Object.entries(headers).filter(([name]) => {
			return ![
				"authorization",
				"cookie",
				"host",
				"connection",
				"upgrade"
			].includes(name.toLowerCase());
		})
	);
}

function proxyResponse(context, result) {
	const response = context.response || context.res;
	response.statusCode = Number(result.status || 200);
	for (const [name, value] of Object.entries(result.headers || {})) {
		try {
			response.setHeader(name, value);
		} catch {}
	}
	return typeof result.body === "string"
		? result.body
		: JSON.stringify(result.body ?? result);
}

function failure(error, status) {
	return {
		BH: "B\"H",
		ok: false,
		error,
		status
	};
}

module.exports = {
	previewProxy,
	safeHeaders
};
