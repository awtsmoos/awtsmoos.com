// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Enriches served OpenAPI with universal OAuth and transport guidance.
 * @description
 * The Awtsmoos keeps public doors steady while Awtsmoos.com teaches every agent the
 * real preview, publication, recovery, and large-GET paths instead of accidental giant URIs.
 */
const AGENT_TITLE = "Awtsmoos Tunnel Control Universal Agent API";
const AUTHORIZATION_URL = "https://awtsmoos.com/api/oauth/authorize";
const OPERATION_CATALOG_URL = "https://awtsmoos.com/api/tunnel/control/agent-manifest";
const TRANSFER_URL = "https://awtsmoos.com/api/tunnel/control/transfer/get/{routeReference}";

const AGENT_PREFIX = [
	"Any compatible external AI client may use this Tunnel Control schema.",
	"Use operation=publishWebsite for ordinary Virtual OS static publication and trust only the returned publication.canonicalUrl.",
	"Use previewCreate, previewFolder, or previewPage for real persisted previews and open the returned viewUrl.",
	"Use nativeAgentRestart, nativeGenerationStatus, and nativeGenerationReplace for explicit native recovery when available.",
	`Large bodies are GET-only: never place multi-megabyte content in writes64, actions64, params64, or content64. Stage them through ${TRANSFER_URL} with create/write/commit, then use bulkWriteTransfers for transactional batches.`,
	"Keep each raw GET transfer fragment at or below 4096 bytes and verify chunk plus final SHA-256.",
	`Discover curated operation names and examples at ${OPERATION_CATALOG_URL}.`,
	"The recommended public OAuth client is client_id=external-agent with no client secret.",
	"Prefer authorization code + PKCE S256 when callback handoff is possible.",
	"Headless clients may use OAuth Device Authorization at https://awtsmoos.com/api/oauth/device-authorization.",
	"After OAuth, call /api/tunnel/control/my-device and route by immutable routeReference or tunnelId."
].join(" ");

function enrichYaml(yaml) {
	return String(yaml || "")
		.replace(/^  title:.*$/m, `  title: ${AGENT_TITLE}`)
		.replace(
			/^  description: (.*)$/m,
			(_whole, current) => [
				`  description: ${AGENT_PREFIX} ${current}`,
				`  x-awtsmoos-operation-catalog-url: ${OPERATION_CATALOG_URL}`,
				`  x-awtsmoos-get-transfer-url: ${TRANSFER_URL}`
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
	TRANSFER_URL,
	enrichYaml
};
