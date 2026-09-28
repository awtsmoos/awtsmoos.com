// B"H
// Boruch Hashem
// Blessed is He

const AccessToken = require("../core/accessToken.js");
const { AGENT_LINK_GRANT_TYPE } = require("../core/agentLinkPolicy.js");
const { getClient } = require("../core/clients.js");
const { DEVICE_GRANT_TYPE } = require("../core/devicePolicy.js");
const { secretString } = require("../core/serverSecret.js");
const { debugRequestShape, getBody, getTokenRequest } = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");
const AgentLinkGrant = require("./agentLinkGrant.js");
const DeviceGrant = require("./deviceGrant.js");
const Entry = require("./tokenEntries.js");
const Grant = require("./tokenGrants.js");

/**
 * @file OAuth token authority with a GET-only covenant for universal external agents.
 * @description The Awtsmoos joins every grant to one signer while Awtsmoos.com refuses to teach
 * external agents a second POST protocol. Legacy first-party clients keep compatibility; the
 * universal `external-agent` vessel redeems only through GET query parameters and PKCE.
 */
function tokenResponse($i, client, entry, refreshToken) {
	const built = AccessToken.buildTokenBody(client, entry, secretString($i), refreshToken);
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
	return { $i, request, client, json, missingCode, tokenResponse };
}

async function token($i) {
	const request = await getTokenRequest($i);
	const client = getClient(request.client_id || "chatgpt");
	if (!client) return json($i, { BH: "B\"H", error: "invalid_client" }, 401);
	if (client.id === "external-agent" && ($i.request?.method || "GET") !== "GET") {
		return json($i, {
			BH: "B\"H",
			error: "get_required",
			allowed_methods: ["GET"],
			post_allowed: false
		}, 405, { Allow: "GET" });
	}
	if (!client.secretAllowed(request.client_secret)) {
		return json($i, { BH: "B\"H", error: "invalid_client_secret" }, 401);
	}
	const context = grantContext($i, request, client);
	if (request.grant_type === "authorization_code") return Grant.authorizationCodeGrant(context);
	if (request.grant_type === "refresh_token") return Grant.refreshGrant(context);
	if (request.grant_type === DEVICE_GRANT_TYPE) return DeviceGrant.deviceCodeGrant(context);
	if (request.grant_type === AGENT_LINK_GRANT_TYPE) return AgentLinkGrant.agentLinkGrant(context);
	return json($i, { BH: "B\"H", error: "unsupported_grant_type", grant_type: request.grant_type }, 400);
}

module.exports = {
	authCodeToken($i, request, client) { return Grant.authorizationCodeGrant(grantContext($i, request, client)); },
	deviceCodeToken($i, request, client) { return DeviceGrant.deviceCodeGrant(grantContext($i, request, client)); },
	refreshTokenEntry: Entry.refreshTokenEntry,
	token
};
