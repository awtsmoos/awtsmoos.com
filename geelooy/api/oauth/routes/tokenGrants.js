// B"H
// Boruch Hashem
// Blessed is He

const { takeCode } = require("../core/codeStore.js");
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
	const record = takeCode(request.code);
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
	if (record.redirectUri && request.redirect_uri &&
		record.redirectUri !== request.redirect_uri) {
		return json($i, {
			BH: "B\"H",
			error: "redirect_uri_mismatch",
			expected: record.redirectUri,
			got: request.redirect_uri
		}, 400);
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
