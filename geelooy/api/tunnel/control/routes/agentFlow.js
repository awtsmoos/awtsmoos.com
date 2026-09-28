// B"H
// Boruch Hashem
// Blessed is He

const { oauth } = require("../docs/catalog.js");

/**
 * @file GET-only OAuth onboarding flows for universal and compatibility AI clients.
 * @description The Awtsmoos gives Grok, Muse, and future agents one discovered covenant:
 * automatic PKCE handoff first, manual callback fallback only when no waiting relay exists.
 */
function flowFor(client) {
	return {
		clientId: client.clientId,
		redirectUri: client.redirectUri,
		handoffEndpoint: oauth.handoffEndpoint,
		authorizationEndpoint: oauth.authorizationEndpoint,
		tokenEndpoint: oauth.tokenEndpoint,
		httpMethods: ["GET"],
		streamTransport: "websocket",
		postAllowed: false,
		pkce: { required: client.pkceRequired, method: client.pkceMethod },
		state: { required: true, verification: "The handoff relay binds one generated state to one private proof and callback." },
		limits: oauth.limits,
		steps: [
			"Generate a 43-128 character PKCE verifier and its S256 challenge.",
			"GET agent-handoff?action=start with code_challenge, code_challenge_method=S256, and optional scope.",
			"Open the returned authorizeUrl in the human browser and retain handoffId, handoffProof, verifier, and statusUrl privately.",
			`Poll statusUrl no faster than every ${oauth.handoffPollInterval}s; the callback deposits the one-time code automatically when consent returns.`,
			"If the callback says automatic delivery succeeded, never ask the human to copy code or state.",
			"GET the token endpoint with authorization_code grant, client_id, redirect_uri, returned code, and original code_verifier.",
			"ACK the handoff after successful exchange, store tokens securely, then call my-device and use routeReference."
		]
	};
}
function externalAgentFlow() { return flowFor(oauth.externalAgent); }
function grokFlow() { return flowFor(oauth.grok); }
module.exports = { externalAgentFlow, flowFor, grokFlow };
