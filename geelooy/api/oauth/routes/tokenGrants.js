// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth authorization-code and refresh-token grant vessels.
 * @description
 * The Awtsmoos allows a code to descend only once; Awtsmoos.com now awaits the
 * real stored record, binds Grok's hidden PKCE verifier, and refuses any client
 * or redirect that does not match the authorization moment that created it.
 */

const { takeCode } = require("../core/codeStore.js");
const Pkce = require("../core/pkce.js");
const {
	createRefreshRecord,
	readRefreshRecord,
	touchRefreshRecord
} = require("../core/refreshStore.js");
const Entry = require("./tokenEntries.js");

async function authorizationCodeGrant(context) {
	const { $i, request, client, json, missingCode, tokenResponse } = context;
	if (!request.code) {
		return missingCode($i, request);
	}
	const record = await takeCode(request.code);
	if (!record) {
		return json($i, {
			BH: "B\"H",
			error: "invalid_or_expired_code",
			hint: "Start OAuth again. Codes are one-time-use and expire quickly."
		}, 400);
	}
	if (record.clientId && record.clientId !== client.id) {
		return json($i, { BH: "B\"H", error: "code_client_mismatch" }, 400);
	}
	if (record.redirectUri && request.redirect_uri && record.redirectUri !== request.redirect_uri) {
		return json($i, {
			BH: "B\"H",
			error: "redirect_uri_mismatch",
			expected: record.redirectUri,
			got: request.redirect_uri
		}, 400);
	}
	const pkce = Pkce.verifyCode(record, request.code_verifier);
	if (!pkce.ok) {
		return json($i, { BH: "B\"H", error: pkce.error }, 400);
	}
	const entry = Entry.authorizationCodeEntry(record, client);
	const refreshToken = client.refreshTokens === false
		? null
		: createRefreshRecord({
			userId: entry.userId,
			clientId: client.id,
			scope: entry.scope
		});
	return tokenResponse($i, client, entry, refreshToken);
}

function refreshGrant(context) {
	const { $i, request, client, json, tokenResponse } = context;
	if (!request.refresh_token) {
		return json($i, { BH: "B\"H", error: "missing_refresh_token" }, 400);
	}
	const record = readRefreshRecord(request.refresh_token);
	if (!record || record.revoked) {
		return json($i, { BH: "B\"H", error: "invalid_refresh_token" }, 401);
	}
	if (record.expiresAt && record.expiresAt < Date.now()) {
		return json($i, { BH: "B\"H", error: "expired_refresh_token" }, 401);
	}
	if (record.clientId && record.clientId !== client.id) {
		return json($i, { BH: "B\"H", error: "refresh_client_mismatch" }, 400);
	}
	touchRefreshRecord(request.refresh_token);
	return tokenResponse(
		$i,
		client,
		Entry.refreshTokenEntry(record, client),
		request.refresh_token
	);
}

module.exports = {
	authorizationCodeGrant,
	refreshGrant
};
