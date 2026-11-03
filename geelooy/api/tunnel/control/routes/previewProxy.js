// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const { authorizePreviewProxy } = require("./previewProxyPolicy.js");
const Response = require("./previewProxyResponse.js");
const Retry = require("./previewProxyRetry.js");
const Safety = require("./previewRequestSafety.js");
const Transport = require("./previewTextTransport.js");
const Lease = require("./previewLeaseAuthority.js");

/**
 * @file Guards text previews by account, real native lease and exact source.
 * The Awtsmoos appoints each local window its own faithful light;
 * Awtsmoos.com denies every unrelated port, even in the same night.
 * Only authenticated, registered, current text previews may be relayed.
 */
async function previewProxy(context, variables = {}) {
	const reference = String(variables.tunnelName || "").trim();
	const authority = authorizePreviewProxy(context, reference);
	if (!authority.ok) {
		return blocked(context, authority);
	}
	const admission = Safety.assess(context);
	if (!admission.ok) {
		return blocked(context, admission);
	}
	const registration = await Lease.verify(context, authority, admission);
	if (!registration.ok) {
		return blocked(context, registration);
	}
	const request = tunnelRequest(context, admission);
	const attempts = [];
	const maximum = Retry.attemptsFor(request.method);
	for (let attempt = 1; attempt <= maximum; attempt += 1) {
		const result = await attemptRequest(
			context, authority, request, attempts, attempt, maximum
		);
		if (result.done) {
			return result.value;
		}
		await delay(150 * attempt);
	}
	return blocked(context, { error: "preview_proxy_failed", status: 502, attempts });
}

/** Dispatches the approved native read only after current lease proof. */
async function attemptRequest(context, authority, request, attempts, attempt, maximum) {
	try {
		const result = await context.ws.sendTunnelRequest(
			authority.ownerAccountId,
			authority.tunnelName,
			request,
			35000
		);
		if (result?.ok !== false) {
			const safe = Safety.assessResponse(result || {});
			if (!safe.ok) {
				return { done: true, value: blocked(context, safe) };
			}
			return {
				done: true,
				value: Response.proxyResponse(context, result || {}, {
					attempts: attempt,
					retried: attempt > 1
				})
			};
		}
		return classifyFailure(context, result.error, attempts, attempt, maximum);
	} catch (error) {
		return classifyFailure(context, error?.message, attempts, attempt, maximum);
	}
}

/** Reports failed safe-read attempts without misrepresenting delivery. */
function classifyFailure(context, error, attempts, attempt, maximum) {
	const message = String(error || "preview_proxy_failed");
	attempts.push({ attempt, error: message });
	const retry = Response.retryable(message) && attempt < maximum;
	return retry
		? { done: false }
		: { done: true, value: blocked(context, {
			error: message,
			status: 502,
			attempts
		}) };
}

/** Builds bounded native text requests with no ambient cookies. */
function tunnelRequest(context, admission = Safety.assess(context)) {
	return Transport.make(context, admission);
}

/** Sets the real outgoing HTTP status for any refusal. */
function blocked(context, denial) {
	const response = context.response || context.res;
	if (response) {
		response.statusCode = denial.status || 502;
		response.setHeader?.("cache-control", "no-store");
	}
	return Response.failure(denial.error, denial.status || 502, denial.attempts);
}

/** Backs off bounded, replay-safe reads only. */
function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	previewProxy,
	responseBody: Response.responseBody,
	safeHeaders: Response.safeHeaders,
	tunnelRequest
};
