// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth onboarding discovery for interactive and headless external AI clients.
 * @description
 * The Awtsmoos is not confined to a callback receiver; Awtsmoos.com recommends
 * one universal client and reveals both PKCE browser handoff and device-code
 * consent so each AI may choose the mode its vessel can actually carry.
 */

const { getClient, listClients, publicClient } = require("../core/clients.js");
const { getUserId, publicUser } = require("../core/currentUser.js");
const { DEVICE_GRANT_TYPE } = require("../core/devicePolicy.js");
const { getQuery } = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");
const { fullUrlFor } = require("../tools/urls.js");

function authorizeParams(query, client) {
	return {
		client_id: client.id,
		response_type: "code",
		redirect_uri: query.redirect_uri || client.exampleRedirectUri,
		scope: query.scope || client.defaultScope,
		state: query.state || "",
		code_challenge: query.code_challenge || "",
		code_challenge_method: query.code_challenge_method || ""
	};
}

function authorizeUrl($i, query, client) {
	if (client.requirePkce && !query.code_challenge) {
		return null;
	}
	return fullUrlFor(
		$i,
		"/api/oauth/authorize",
		authorizeParams(query, client)
	);
}

function headlessMode($i, client) {
	return {
		supported: Boolean(client.deviceAuthorization),
		deviceAuthorizationEndpoint: fullUrlFor($i, "/api/oauth/device-authorization"),
		verificationUri: fullUrlFor($i, "/api/oauth/device"),
		tokenEndpoint: fullUrlFor($i, "/api/oauth/token"),
		grantType: DEVICE_GRANT_TYPE
	};
}

async function start($i) {
	const query = getQuery($i);
	const client = getClient(query.client_id || "external-agent");
	if (!client) {
		return json($i, {
			BH: "B\"H",
			ok: false,
			error: "invalid_client"
		}, 400);
	}
	const generatedAuthorizeUrl = authorizeUrl($i, query, client);
	return json($i, {
		BH: "B\"H",
		ok: true,
		message: generatedAuthorizeUrl
			? "Open loginUrl if needed, then open authorizeUrl."
			: "Use PKCE callback mode or headless device authorization for supported public-agent clients.",
		recommendedClientId: "external-agent",
		loggedIn: Boolean(getUserId($i)),
		user: publicUser($i),
		client: publicClient(client),
		clients: listClients(),
		loginUrl: fullUrlFor($i, "/login"),
		oauthMetadata: fullUrlFor($i, "/.well-known/oauth-authorization-server"),
		agentManifest: fullUrlFor($i, "/api/tunnel/control/agent-manifest"),
		authorizationEndpoint: fullUrlFor($i, "/api/oauth/authorize"),
		tokenEndpoint: fullUrlFor($i, "/api/oauth/token"),
		agentCallback: fullUrlFor($i, "/api/oauth/agent-callback"),
		headlessDevice: headlessMode($i, client),
		authorizeUrl: generatedAuthorizeUrl,
		authorizeParameters: {
			...authorizeParams(query, client),
			code_challenge: client.requirePkce ? "<S256_CODE_CHALLENGE>" : "",
			code_challenge_method: client.requirePkce ? "S256" : ""
		},
		tokenExchangeRequires: client.requirePkce
			? ["grant_type", "client_id", "code", "redirect_uri", "code_verifier"]
			: ["grant_type", "client_id", "code", "redirect_uri"]
	});
}

module.exports = {
	authorizeParams,
	authorizeUrl,
	headlessMode,
	start
};
