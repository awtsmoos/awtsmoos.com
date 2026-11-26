//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Enriches OpenAPI with universal direct-agent and remote MCP metadata.
 * @description
 * The Awtsmoos lets description and extension each become a faithful key;
 * Awtsmoos.com keeps long guidance modular while machine fields stay easy to see.
 */

const McpDiscovery = require("../mcp/discoveryContract.js");
const Description = require("./openApiAgentDescription.js");

const AGENT_TITLE = "Awtsmoos Tunnel Control Universal Agent API";
const AUTHORIZATION_URL = "https://awtsmoos.com/api/oauth/authorize";
const AGENT_PREFIX = Description.agentPrefix();

/** Escapes one YAML double-quoted scalar without changing its meaning. */
function yamlDoubleQuoted(text) {
	return '"' + String(text)
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t") + '"';
}

/** Removes one YAML double-quote wrapper from an existing description. */
function unquoteOnce(value) {
	const text = String(value || "").trim();
	if (!text.startsWith('"') || !text.endsWith('"') || text.length < 2) {
		return text;
	}
	return text.slice(1, -1)
		.replace(/\\"/g, '"')
		.replace(/\\\\/g, "\\");
}

/** Returns explicit remote MCP and retained direct-agent extension fields. */
function extensionLines() {
	const mcp = McpDiscovery.contract();
	return [
		`  x-awtsmoos-operation-catalog-url: ${Description.OPERATION_CATALOG_URL}`,
		"  x-awtsmoos-api-catalog-url: https://awtsmoos.com/api/tunnel/control/apis",
		"  x-awtsmoos-rebbe-api-url: https://awtsmoos.com/api/rebbe",
		`  x-awtsmoos-get-transfer-url: ${Description.TRANSFER_URL}`,
		`  x-awtsmoos-external-client-websocket-url: ${Description.WS_URL}`,
		"  x-awtsmoos-external-client-websocket-binary-opcode: 2",
		"  x-awtsmoos-external-client-preferred-chunk-bytes: 1048576",
		"  x-awtsmoos-external-client-required-scopes: tunnel.read tunnel.write",
		`  x-awtsmoos-mcp-url: ${mcp.endpoint}`,
		`  x-awtsmoos-mcp-transport: ${mcp.transport}`,
		"  x-awtsmoos-mcp-http-method: POST",
		`  x-awtsmoos-mcp-protected-resource-metadata: ${mcp.authorization.protectedResourceMetadata}`,
		`  x-awtsmoos-oauth-authorization-server-metadata: ${mcp.authorization.authorizationServerMetadata}`
	];
}

/** Preserves checked-in OpenAPI paths while enriching only metadata. */
function enrichYaml(yaml) {
	return String(yaml || "")
		.replace(/^  title:.*$/m, `  title: ${AGENT_TITLE}`)
		.replace(/^  description: (.*)$/m, (_whole, current) => [
			`  description: ${yamlDoubleQuoted(`${AGENT_PREFIX} ${unquoteOnce(current)}`)}`,
			...extensionLines()
		].join("\n"))
		.replace(
			/^          authorizationUrl:.*$/m,
			`          authorizationUrl: ${AUTHORIZATION_URL}`
		);
}

module.exports = {
	AGENT_PREFIX,
	AGENT_TITLE,
	AUTHORIZATION_URL,
	OPERATION_CATALOG_URL: Description.OPERATION_CATALOG_URL,
	TRANSFER_URL: Description.TRANSFER_URL,
	WS_URL: Description.WS_URL,
	enrichYaml
};
