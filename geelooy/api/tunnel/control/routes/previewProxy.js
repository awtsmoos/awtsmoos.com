// B"H
// Boruch Hashem
// Blessed is He

const { authorizePreviewProxy } = require("./previewProxyPolicy.js");
const Response = require("./previewProxyResponse.js");
const Retry = require("./previewProxyRetry.js");

/**
 * @file Proxies authorized local servers without duplicating uncertain mutations.
 * @description
 * The Awtsmoos binds method, body, route, and receipt as one deed. Awtsmoos.com
 * retries only idempotent reads and preserves exact response bytes for media, ranges,
 * APIs, downloads, and ordinary pages.
 */
async function previewProxy(context, variables = {}) {
	const reference = String(variables.tunnelName || "").trim();
	const authority = authorizePreviewProxy(context, reference);
	if (!authority.ok) return Response.failure(authority.error, authority.status);
	const request = tunnelRequest(context);
	const attempts = [];
	const maximum = Retry.attemptsFor(request.method);
	for (let attempt = 1; attempt <= maximum; attempt += 1) {
		const result = await attemptRequest(context, authority, request, attempts, attempt);
		if (result.done) {
			return result.value;
		}
		await delay(150 * attempt);
	}
	return Response.failure("preview_proxy_failed", 502, attempts);
}

async function attemptRequest(context, authority, request, attempts, attempt) {
	try {
		const result = await context.ws.sendTunnelRequest(
			authority.ownerAccountId,
			authority.tunnelName,
			request,
			35000
		);
		if (result?.ok !== false) {
			return {
				done: true,
				value: Response.proxyResponse(context, result || {}, {
					attempts: attempt,
					retried: attempt > 1
				})
			};
		}
		return classifyFailure(result.error, attempts, attempt, request.method);
	} catch (error) {
		return classifyFailure(error?.message, attempts, attempt, request.method);
	}
}

function classifyFailure(error, attempts, attempt, requestMethod) {
	const message = String(error || "preview_proxy_failed");
	attempts.push({ attempt, error: message });
	const retry = Retry.mayRetry(requestMethod) && Response.retryable(message) && attempt < 3;
	return retry
		? { done: false }
		: { done: true, value: Response.failure(message, 502, attempts) };
}

function tunnelRequest(context) {
	const method = Retry.method(context.request?.method);
	return {
		action: "httpRequest",
		url: proxyUrl(context),
		method,
		headers: Response.safeHeaders(context.request?.headers),
		body: requestBody(context),
		responseBodyMode: "base64",
		maxChars: 16 * 1024 * 1024,
		timeoutMs: 30000
	};
}

function proxyUrl(context) {
	const query = context.paramKinds?.GET || context.$_GET || {};
	return query.url || query.path || "/";
}

function requestBody(context) {
	if (context.request?.rawBody !== undefined) return context.request.rawBody;
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
