//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Compatibility garments around the universal Awtsmoos agent covenant.
 * @description
 * The Awtsmoos is beyond provider names while each host still has a vessel;
 * Awtsmoos.com keeps those differences narrow so the universal path stays level.
 */

const { oauth } = require("../docs/catalog.js");
const { ROOM_BEHAVIOR } = require("../core/accountRoom/protocol.js");

/** Identifies the legacy hosted action surface that needs distinct OAuth guidance. */
function callerKind($i) {
	const userAgent = String($i?.request?.headers?.["user-agent"] || "");
	return /chatgpt|openai/i.test(userAgent) ? "chatgpt" : "generic-agent";
}

/** Preserves the complete hosted ChatGPT Action OAuth linking covenant. */
function chatgptBehavior() {
	return [
		"You are a ChatGPT GPT Action. Use client_id=chatgpt, not external-agent.",
		"Do NOT attempt the agent-handoff/PKCE flow; a GPT Action cannot generate PKCE, poll statusUrl, or store tokens itself.",
		"Credentials live in OpenAI's Action Authentication (OAuth) panel for this GPT: Authorization URL https://awtsmoos.com/api/oauth/authorize, Token URL https://awtsmoos.com/api/oauth/token, Client ID chatgpt, no client secret required, no PKCE required, scope: profile tunnel.read tunnel.write tunnel.command tunnel.browser tunnel.mission tunnel.room.",
		"If calls return not_authenticated, the GPT's OAuth is not linked yet; the user links it once from the sign-in prompt OpenAI presents, signing in to awtsmoos.com as the account that owns the tunnel.",
		"After OAuth, call /api/tunnel/control/my-device. When the account owns more than one live tunnel, select explicitly with the tunnelId or routeReference query parameter instead of relying on automatic selection.",
		"On retryable tunnel_not_alive, call my-device again and follow retryPolicy/recoveringRoutes instead of declaring death.",
		"Never ask the human to paste a bearer token or API key into the chat; OpenAI attaches the stored OAuth credential automatically once linked.",
		...ROOM_BEHAVIOR
	];
}

/** Returns the stable hosted ChatGPT OAuth configuration without any secret. */
function chatgptFlow() {
	return {
		clientId: oauth.chatgpt.clientId,
		authorizationUrl: oauth.authorizationEndpoint,
		tokenUrl: oauth.tokenEndpoint,
		redirectUri: oauth.chatgpt.redirectUri,
		requiresClientSecret: oauth.chatgpt.requiresClientSecret,
		pkceRequired: oauth.chatgpt.pkceRequired,
		defaultScope: oauth.chatgpt.defaultScope,
		tokenStorage: "Held by OpenAI after the user links this GPT's Action OAuth once; ChatGPT attaches the bearer credential automatically on every call."
	};
}

module.exports = {
	callerKind,
	chatgptBehavior,
	chatgptFlow
};
