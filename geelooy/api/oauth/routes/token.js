// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared OAuth token endpoint for callback, refresh, and device grants.
 * @description
 * The Awtsmoos gives one token authority after different forms of consent;
 * Awtsmoos.com dispatches each grant through its own guard, then signs every
 * successful user/client/scope vessel through the same access-token builder.
 */

const AccessToken = require("../core/accessToken.js");
const { getClient } = require("../core/clients.js");
const { DEVICE_GRANT_TYPE } = require("../core/devicePolicy.js");
const { secretString } = require("../core/serverSecret.js");
const {
	debugRequestShape,
	getBody,
	getTokenRequest
} = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");
const DeviceGrant = require("./deviceGrant.js");
const Entry = require("./tokenEntries.js");
const Grant = require("./tokenGrants.js");

function tokenResponse($i, client, entry, refreshToken) {
	const built = AccessToken.buildTokenBody(
		client,
		entry,
		secretString($i),
		refreshToken
	);
	return json($i, built.body);
}

async function missingCode($i, request) {
	const body = await getBody($i);
	return json($i, {
		BH: "B\"H",
		error: "missing_code",
		received: {
			has_client_id: Boolean(request.client_id),
			has_redirect_uri: Boolean(request.redirect_uri),
			grant_type: request.grant_type
		},
		request_shape: debugRequestShape($i, body)
	}, 400);
}

function grantContext($i, request, client) {
	return {
		$i,
		request,
		client,
		json,
		missingCode,
		tokenResponse
	};
}

async function token($i) {
	const request = await getTokenRequest($i);
	const client = getClient(request.client_id || "chatgpt");
	if (!client) {
		return json($i, { BH: "B\"H", error: "invalid_client" }, 401);
	}
	if (!client.secretAllowed(request.client_secret)) {
		return json($i, { BH: "B\"H", error: "invalid_client_secret" }, 401);
	}
	const context = grantContext($i, request, client);
	if (request.grant_type === "authorization_code") {
		return Grant.authorizationCodeGrant(context);
	}
	if (request.grant_type === "refresh_token") {
		return Grant.refreshGrant(context);
	}
	if (request.grant_type === DEVICE_GRANT_TYPE) {
		return DeviceGrant.deviceCodeGrant(context);
	}
	return json($i, {
		BH: "B\"H",
		error: "unsupported_grant_type",
		grant_type: request.grant_type
	}, 400);
}

module.exports = {
	authCodeToken($i, request, client) {
		return Grant.authorizationCodeGrant(grantContext($i, request, client));
	},
	deviceCodeToken($i, request, client) {
		return DeviceGrant.deviceCodeGrant(grantContext($i, request, client));
	},
	refreshTokenEntry: Entry.refreshTokenEntry,
	token
};
