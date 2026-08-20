// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Enriches served OpenAPI with universal callback and headless OAuth metadata.
 * @description
 * The Awtsmoos is not a provider switch statement or one browser shape;
 * Awtsmoos.com presents PKCE callback and OAuth device authorization beside one
 * universal client, while all successful paths converge on the same action schema.
 */

const AGENT_TITLE = "Awtsmoos Tunnel Control Universal Agent API";
const AUTHORIZATION_URL = "https://awtsmoos.com/api/oauth/authorize";
const AGENT_PREFIX = [
	"Any compatible external AI client may use this Tunnel Control schema.",
	"The recommended public OAuth client is client_id=external-agent with no client secret.",
	"Prefer authorization code + PKCE S256 when callback handoff is possible.",
	"Headless clients may use OAuth Device Authorization at https://awtsmoos.com/api/oauth/device-authorization and human verification at https://awtsmoos.com/api/oauth/device.",
	"Discover OAuth at https://awtsmoos.com/.well-known/oauth-authorization-server and tunnel onboarding at https://awtsmoos.com/api/tunnel/control/agent-manifest.",
	"Grok and ChatGPT remain compatibility clients.",
	"After either OAuth mode, call /api/tunnel/control/my-device and route by immutable routeReference or tunnelId."
].join(" ");

function enrichYaml(yaml) {
	return String(yaml || "")
		.replace(
			/^  title:.*$/m,
			`  title: ${AGENT_TITLE}`
		)
		.replace(
			/^  description: (.*)$/m,
			(_whole, current) => `  description: ${AGENT_PREFIX} ${current}`
		)
		.replace(
			/^          authorizationUrl:.*$/m,
			`          authorizationUrl: ${AUTHORIZATION_URL}`
		);
}

module.exports = {
	AGENT_PREFIX,
	AGENT_TITLE,
	AUTHORIZATION_URL,
	enrichYaml
};
