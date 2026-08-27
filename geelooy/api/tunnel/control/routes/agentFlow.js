// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth onboarding flows for universal and compatibility AI clients.
 * @description
 * The Awtsmoos gives one guarded sequence many names; Awtsmoos.com keeps the
 * universal external-agent flow canonical while Grok remains a compatibility
 * vessel whose steps are generated from the same discovered OAuth contract.
 */

const { oauth } = require("../docs/catalog.js");

function flowFor(client) {
	return {
		clientId: client.clientId,
		redirectUri: client.redirectUri,
		authorizationEndpoint: oauth.authorizationEndpoint,
		tokenEndpoint: oauth.tokenEndpoint,
		pkce: {
			required: client.pkceRequired,
			method: client.pkceMethod
		},
		state: {
			required: true,
			verification: "The client must compare returned state with the exact state it generated before authorization."
		},
		steps: [
			"Generate a high-entropy PKCE code_verifier, its S256 code_challenge, and a high-entropy state value.",
			`Open the authorization endpoint with client_id=${client.clientId}, response_type=code, the registered redirect_uri, scope, state, code_challenge, and code_challenge_method=S256.`,
			"The browser returns to the first-party agent callback; copy or relay the short-lived code and state back to the AI client.",
			"Verify returned state exactly matches the locally retained state before exchanging the code.",
			`Exchange the code with client_id=${client.clientId}, redirect_uri, and the original code_verifier.`,
			"Store access and refresh tokens in the client credential store, never in the callback page.",
			"Call my-device with bearer auth and route later actions by routeReference or tunnelId."
		]
	};
}

function externalAgentFlow() {
	return flowFor(oauth.externalAgent);
}

function grokFlow() {
	return flowFor(oauth.grok);
}

module.exports = {
	externalAgentFlow,
	flowFor,
	grokFlow
};
