// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Enriches served OpenAPI with universal OAuth and compact-operation discovery metadata.
 * @description
 * The Awtsmoos keeps fourteen public doors steady while the manifest names high-value inward deeds;
 * Awtsmoos.com points every compatible AI to one operation catalog instead of relying on secret inherited needs.
 */

const AGENT_TITLE = "Awtsmoos Tunnel Control Universal Agent API";
const AUTHORIZATION_URL = "https://awtsmoos.com/api/oauth/authorize";
const OPERATION_CATALOG_URL = "https://awtsmoos.com/api/tunnel/control/agent-manifest";
const AGENT_PREFIX = [
	"Any compatible external AI client may use this Tunnel Control schema.",
	"The public action field is a compact capability such as files, browser, command, or web; pass the exact inward deed in operation.",
	`Discover curated operation names, required fields, and examples at ${OPERATION_CATALOG_URL}.`,
	"For website publication use action=web with operation=publishWebsite; source alias ownership controls the default namespace.",
	"The recommended public OAuth client is client_id=external-agent with no client secret.",
	"Prefer authorization code + PKCE S256 when callback handoff is possible.",
	"Headless clients may use OAuth Device Authorization at https://awtsmoos.com/api/oauth/device-authorization and human verification at https://awtsmoos.com/api/oauth/device.",
	"After OAuth, call /api/tunnel/control/my-device and route by immutable routeReference or tunnelId."
].join(" ");

function enrichYaml(yaml) {
	return String(yaml || "")
		.replace(
			/^  title:.*$/m,
			`  title: ${AGENT_TITLE}`
		)
		.replace(
			/^  description: (.*)$/m,
			(_whole, current) => [
				`  description: ${AGENT_PREFIX} ${current}`,
				`  x-awtsmoos-operation-catalog-url: ${OPERATION_CATALOG_URL}`
			].join("\n")
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
	OPERATION_CATALOG_URL,
	enrichYaml
};
