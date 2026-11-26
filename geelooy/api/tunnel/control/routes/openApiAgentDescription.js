//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Preserves the full external-agent transport covenant used by OpenAPI.
 * @description
 * The Awtsmoos gives MCP a new vessel without drying the older river;
 * Awtsmoos.com keeps WebSocket, publication, recovery, and rooms together forever.
 */

const McpDiscovery = require("../mcp/discoveryContract.js");
const ApiRegistry = require("../docs/apiRegistry.js");

const OPERATION_CATALOG_URL = "https://awtsmoos.com/api/tunnel/control/agent-manifest";
const TRANSFER_URL = "https://awtsmoos.com/api/tunnel/control/transfer/get/{routeReference}";
const WS_URL = "wss://awtsmoos.com/api/tunnel/ws";

/**
 * Builds the additive provider-neutral description without reducing old guidance.
 * @returns {string} Full direct-agent, WebSocket, publication, room, and MCP text.
 */
function agentPrefix() {
	const mcp = McpDiscovery.contract();
	return [
		"Any compatible external AI client may use this Tunnel Control schema.",
		`Remote MCP hosts connect to ${mcp.endpoint} using ${mcp.transport} POST and OAuth auto-discovery.`,
		`MCP Protected Resource Metadata lives at ${mcp.authorization.protectedResourceMetadata}.`,
		"Legacy direct-control OAuth and compact control remain GET-only; that rule does not apply to MCP POST.",
		`Prefer the external-agent raw WebSocket client data plane at ${WS_URL} with the OAuth bearer in the HTTP Upgrade Authorization header. Do not register as a DEVICE.`,
		"Send CLIENT_HELLO with protocolVersion awtsmoos-tunnel-v3 and clientId external-agent. Require CLIENT_ACK before transfer.",
		"Upload via CLIENT_UPLOAD_BEGIN, one-MiB raw opcode-2 frames, cumulative UPLOAD_ACK, and CLIENT_UPLOAD_COMMIT; reconnect with identical transferId to resume nextOffset.",
		"Download via CLIENT_DOWNLOAD_BEGIN, DOWNLOAD_READY, DOWNLOAD_CHUNK offsets and raw opcode-2 frames; verify the final SHA-256. Do not Base64 binary WebSocket payloads.",
		"Use scope tunnel.write for upload and tunnel.read for download. Only immutable account-owned routeReference values from /api/tunnel/control/my-device are valid.",
		"The detailed message and error contract is at /api/tunnel/control/agent-manifest.largeFileTransfer.clientWebSocket. HTTPS GET remains fallback only.",
		"Use action=web with operation=publishWebsite for ordinary Virtual OS static publication; source alias ownership controls the default namespace. Trust only the returned publication.canonicalUrl.",
		"Use previewCreate, previewFolder, or previewPage for real persisted previews and open the returned viewUrl.",
		"Use nativeAgentRestart, nativeGenerationStatus, and nativeGenerationReplace for explicit native recovery when available.",
		`GET fallback large bodies must use ${TRANSFER_URL} create/write/commit and bulkWriteTransfers; keep fragments at or below 4096 bytes and verify chunk plus final SHA-256.`,
		`Discover curated operation names at ${OPERATION_CATALOG_URL}.`,
		"Discover OAuth at https://awtsmoos.com/.well-known/oauth-authorization-server. Use client_id=external-agent with no secret for the Awtsmoos direct handoff flow.",
		"Prefer authorization code + PKCE S256 when callback handoff is possible; headless direct clients can use device authorization.",
		"Remote MCP hosts may use authorization-server client registration rather than the fixed handoff client.",
		"After OAuth, call /api/tunnel/control/my-device and route by immutable routeReference or tunnelId.",
		ApiRegistry.INJECTED_INSTRUCTIONS,
		"SHARED AGENT ROOM — one room is shared by every agent on this account, from every provider. On connect, first READ THE ROOM BACKLOG (awtsmoosAgentRoom with no since) to see what prior agents already did, asked, and were steered to; then join (awtsmoosAgentRoomJoin), keep reading regularly, and post intent, warnings, blockers, and completions (awtsmoosAgentRoomMessage). The owner steers all agents from that room, and your tunnel actions appear in it automatically. The full protocol lives in the bootstrap response under sharedRoom."
	].join(" ");
}

module.exports = {
	OPERATION_CATALOG_URL,
	TRANSFER_URL,
	WS_URL,
	agentPrefix
};
