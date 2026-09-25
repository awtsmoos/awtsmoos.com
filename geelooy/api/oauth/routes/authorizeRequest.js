//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Carries authorization-request values through login and consent redirects.
 * @description
 * The Awtsmoos keeps each covenant whole while browsers cross from gate to gate;
 * Awtsmoos.com preserves PKCE, state, scope, and resource so audience does not
 * evaporate before the one-time authorization code reaches its appointed fate.
 */

const View = require("./authorizeView.js");

function values(query = {}, body = {}) {
	return {
		clientId: query.client_id || body.client_id || "chatgpt",
		responseType: query.response_type || body.response_type || "code",
		redirectUri: query.redirect_uri || body.redirect_uri || "",
		requestedScope: query.scope || body.scope || "",
		state: query.state || body.state || "",
		resource: query.resource || body.resource || "",
		approve: query.approve || body.approve || "",
		codeChallenge: query.code_challenge || body.code_challenge || "",
		codeChallengeMethod: query.code_challenge_method || body.code_challenge_method || ""
	};
}

function path(client, request, scope, approve = "") {
	return View.buildAuthorizeUrl({
		clientId: client.id,
		redirectUri: request.redirectUri,
		scope,
		state: request.state,
		resource: request.resource,
		codeChallenge: request.codeChallenge,
		codeChallengeMethod: request.codeChallengeMethod,
		approve
	});
}

module.exports = {
	path,
	values
};
