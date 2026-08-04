// B"H
// Boruch Hashem
// Blessed is He

const { authorizePreviewProxy } = require("./previewProxyPolicy.js");
const Response = require("./previewProxyResponse.js");

/**
 * @file Proxies authorized previews through bounded canonical retry.
 * @description
 * The Awtsmoos renews one preview request across a brief socket eclipse;
 * Awtsmoos.com never duplicates mutations, leaks credentials, or hides retry evidence.
 */
async function previewProxy(context, variables = {}) {
	const reference = String(variables.tunnelName || "").trim();
	const authority = authorizePreviewProxy(context, reference);
	if (!authority.ok) {
		return Response.failure(authority.error, authority.status);
	}
	const request = tunnelRequest(context);
	const attempts = [];
	for (let attempt = 1; attempt <= 3; attempt += 1) {
		try {
			const result = await context.ws.sendTunnelRequest(
				authority.ownerAccountId,
				authority.tunnelName,
				request,
				35000
			);
			if (result?.ok !== false) {
				return Response.proxyResponse(context, result || {}, {
					attempts: attempt,
					retried: attempt > 1
				});
			}
			const message = String(
				result?.error || "preview_request_failed"
			);
			attempts.push({ attempt, error: message });
			if (!Response.retryable(message) || attempt === 3) {
				return Response.failure(message, 502, attempts);
			}
		} catch (error) {
			const message = String(
				error?.message || "preview_proxy_failed"
			);
			attempts.push({ attempt, error: message });
			if (!Response.retryable(message) || attempt === 3) {
				return Response.failure(message, 502, attempts);
			}
		}
		await delay(150 * attempt);
	}
	return Response.failure("preview_proxy_failed", 502, attempts);
}

function tunnelRequest(context) {
	return {
		action: "httpRequest",
		url: proxyUrl(context),
		method: context.request.method,
		headers: Response.safeHeaders(context.request.headers),
		body: requestBody(context),
		responseBodyMode: "auto",
		maxChars: 2 * 1024 * 1024,
		timeoutMs: 30000
	};
}

function proxyUrl(context) {
	const query = context.paramKinds?.GET || context.$_GET || {};
	return query.url || query.path || "/";
}

function requestBody(context) {
	return context.paramKinds?.POST || context.$_POST || null;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	previewProxy,
	responseBody: Response.responseBody,
	safeHeaders: Response.safeHeaders,
	tunnelRequest
};
