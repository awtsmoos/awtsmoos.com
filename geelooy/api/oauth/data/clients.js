// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth client registry for Awtsmoos.com.
 * @description
 * The Awtsmoos is beyond every provider name. Awtsmoos.com therefore keeps one
 * universal public-agent covenant beneath compatibility garments for Grok and
 * ChatGPT, so future AI clients need capability rather than a new registry edit.
 */

const {
	AGENT_ALLOWED_SCOPES,
	AGENT_DEFAULT_SCOPES,
	AGENT_REQUIRED_SCOPES,
	PUBLIC_AGENT_ACCESS_TOKEN_SECONDS,
	makePublicAgentClient
} = require("./publicAgentPolicy.js");
const { scopeString } = require("../../tunnel/shared/scopeCatalog.js");

const chatgpt = {
	id: "chatgpt",
	name: "ChatGPT Awtsmoos Action",
	clientSecret: "",
	autoApprove: false,
	accessTokenSeconds: PUBLIC_AGENT_ACCESS_TOKEN_SECONDS,
	refreshTokens: true,
	requirePkce: false,
	requiredScopes: AGENT_REQUIRED_SCOPES,
	defaultScope: scopeString(AGENT_DEFAULT_SCOPES),
	scopes: AGENT_ALLOWED_SCOPES,
	exampleRedirectUri: "https://chat.openai.com/aip/g-c1e9f8d96dd9a40a3411f119a2dc856502f4aaec/oauth/callback",
	redirectUris: [
		"https://chat.openai.com/aip/g-*/oauth/callback",
		"https://chatgpt.com/aip/g-*/oauth/callback",
		"https://chat.openai.com/aip/gpts/oauth/callback",
		"https://chatgpt.com/aip/gpts/oauth/callback",
		"https://awtsmoos.com/api/oauth/callback-test"
	]
};

const oauthClients = Object.freeze({
	"external-agent": makePublicAgentClient({
		id: "external-agent",
		name: "Universal External AI Agent"
	}),
	grok: makePublicAgentClient({
		id: "grok",
		name: "Grok Tunnel Client"
	}),
	chatgpt
});

module.exports = {
	AGENT_ALLOWED_SCOPES,
	AGENT_DEFAULT_SCOPES,
	AGENT_REQUIRED_SCOPES,
	oauthClients
};
