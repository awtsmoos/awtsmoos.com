// B"H
// Boruch Hashem
// Blessed is He

const {
	CHATGPT_ALLOWED_TUNNEL_SCOPES,
	CHATGPT_DEFAULT_TUNNEL_SCOPES,
	TUNNEL_SCOPE,
	scopeString,
	withProfile
} = require("../../tunnel/shared/scopeCatalog.js");

const CHATGPT_REQUIRED_SCOPES = Object.freeze([
	TUNNEL_SCOPE.MISSION,
	TUNNEL_SCOPE.ROOM
]);

const CHATGPT_DEFAULT_SCOPES = withProfile(
	CHATGPT_DEFAULT_TUNNEL_SCOPES
);

const oauthClients = Object.freeze({
	chatgpt: {
		id: "chatgpt",
		name: "ChatGPT Awtsmoos Action",
		clientSecret: "",
		secret: "",
		autoApprove: false,
		accessTokenSeconds: 30 * 24 * 60 * 60,
		refreshTokens: true,
		requiredScopes: CHATGPT_REQUIRED_SCOPES,
		defaultScope: scopeString(CHATGPT_DEFAULT_SCOPES),
		scopes: withProfile(CHATGPT_ALLOWED_TUNNEL_SCOPES),
		exampleRedirectUri: "https://chat.openai.com/aip/g-c1e9f8d96dd9a40a3411f119a2dc856502f4aaec/oauth/callback",
		redirectUris: [
			"https://chat.openai.com/aip/g-*/oauth/callback",
			"https://chatgpt.com/aip/g-*/oauth/callback",
			"https://chat.openai.com/aip/gpts/oauth/callback",
			"https://chatgpt.com/aip/gpts/oauth/callback",
			"https://awtsmoos.com/api/oauth/callback-test"
		]
	}
});

module.exports = {
	CHATGPT_DEFAULT_SCOPES,
	CHATGPT_REQUIRED_SCOPES,
	oauthClients
};
