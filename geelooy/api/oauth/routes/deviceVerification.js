// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human approval controller for Awtsmoos.com OAuth device authorization.
 * @description
 * The Awtsmoos lets the human bind a short visible sign to an authenticated
 * identity; Awtsmoos.com rate-limits wrong signs, preserves login, and records
 * explicit approval or denial without ever revealing the daemon's machine code.
 */

const { getClient } = require("../core/clients.js");
const Codes = require("../core/deviceCodes.js");
const DeviceStore = require("../core/deviceStore.js");
const Limiter = require("../core/deviceVerifyLimiter.js");
const { getUserId } = require("../core/currentUser.js");
const { getBody, getQuery } = require("../tools/requestData.js");
const { html, redirect } = require("../tools/respond.js");
const View = require("./deviceView.js");

const SECURITY_HEADERS = Object.freeze({
	"Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
	"Referrer-Policy": "no-referrer",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY"
});

function page($i, body, status = 200, headers = {}) {
	return html($i, body, status, {
		...SECURITY_HEADERS,
		...headers
	});
}

function invalidPage($i, userCode, rate) {
	const message = rate
		? "Too many invalid code attempts. Try again later."
		: "That device code is invalid or expired.";
	return page(
		$i,
		View.entryPage({ userCode, message, error: true }),
		rate ? 429 : 400,
		rate ? { "Retry-After": String(rate.retryAfter) } : {}
	);
}

async function deviceVerification($i) {
	const query = getQuery($i);
	const body = await getBody($i);
	const rawCode = body.user_code || query.user_code || "";
	const userCode = Codes.formatUserCode(rawCode);
	if (!userCode) {
		return page($i, View.entryPage());
	}
	const limiterStatus = Limiter.status($i);
	if (!limiterStatus.allowed) {
		return invalidPage($i, userCode, limiterStatus);
	}
	const record = DeviceStore.readByUserCode(userCode);
	if (!record) {
		const failed = Limiter.recordFailure($i);
		return invalidPage($i, userCode, failed.allowed ? null : failed);
	}
	const client = getClient(record.clientId);
	if (!client || !client.deviceAuthorization) {
		return invalidPage($i, userCode, null);
	}
	Limiter.clearFailures($i);
	if (record.status === "approved") {
		return page($i, View.resultPage(true));
	}
	if (record.status === "denied") {
		return page($i, View.resultPage(false));
	}
	const userId = getUserId($i);
	if (!userId) {
		return redirect($i, View.loginUrl($i, userCode));
	}
	if ($i.request?.method === "POST") {
		const decision = String(body.decision || "").toLowerCase();
		if (decision === "approve") {
			DeviceStore.approveUserCode(userCode, userId);
			return page($i, View.resultPage(true));
		}
		if (decision === "deny") {
			DeviceStore.denyUserCode(userCode, userId);
			return page($i, View.resultPage(false));
		}
	}
	return page($i, View.reviewPage({
		client,
		scope: record.scope,
		userCode,
		userId
	}));
}

module.exports = {
	SECURITY_HEADERS,
	deviceVerification,
	invalidPage,
	page
};
