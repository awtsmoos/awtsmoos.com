// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Teaches OpenAPI consumers the real external-agent raw WebSocket lane.
 * The Awtsmoos keeps an unencoded river of original bytes;
 * the fallback stays faithful but does not masquerade as the source.
 */
const AGENT_TITLE = "Awtsmoos Tunnel Control Universal Agent API";
const AUTHORIZATION_URL = "https://awtsmoos.com/api/oauth/authorize";
const OPERATION_CATALOG_URL = "https://awtsmoos.com/api/tunnel/control/agent-manifest";
const TRANSFER_URL = "https://awtsmoos.com/api/tunnel/control/transfer/get/{routeReference}";
const WS_URL = "wss://awtsmoos.com/api/tunnel/ws";

const AGENT_PREFIX = [
	"Any compatible external AI client may use this Tunnel Control schema.",
	"Prefer the external-agent raw WebSocket client data plane at " + WS_URL +
		" with the OAuth bearer in the HTTP Upgrade Authorization header. Do not register as a DEVICE.",
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
	"Discover OAuth at https://awtsmoos.com/.well-known/oauth-authorization-server. Use client_id=external-agent with no secret.",
	"Prefer authorization code + PKCE S256 when callback handoff is possible; headless clients can use device authorization.",
	"After OAuth, call /api/tunnel/control/my-device and route by immutable routeReference or tunnelId.",
	"SHARED AGENT ROOM — one room is shared by every agent on this account, from every provider. Join it first (awtsmoosAgentRoomJoin), read it regularly (awtsmoosAgentRoom), and post intent, warnings, blockers, and completions (awtsmoosAgentRoomMessage). The owner steers all agents from that room, and your tunnel actions appear in it automatically. The full protocol lives in the bootstrap response under sharedRoom."
].join(" ");

/** YAML double-quoted scalar: the combined description must stay one valid string. */
function yamlDoubleQuoted(text) {
	return '"' + String(text)
		.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
		.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t") + '"';
}

function unquoteOnce(value) {
	const text = String(value || "").trim();
	if (text.startsWith('"') && text.endsWith('"') && text.length >= 2) {
		return text.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
	}
	return text;
}

/** Preserve the checked-in OpenAPI paths while enriching transport metadata. */
function enrichYaml(yaml) {
	return String(yaml || "")
		.replace(/^  title:.*$/m, `  title: ${AGENT_TITLE}`)
		.replace(/^  description: (.*)$/m, (_whole, current) => [
			`  description: ${yamlDoubleQuoted(`${AGENT_PREFIX} ${unquoteOnce(current)}`)}`,
			`  x-awtsmoos-operation-catalog-url: ${OPERATION_CATALOG_URL}`,
			`  x-awtsmoos-get-transfer-url: ${TRANSFER_URL}`,
			`  x-awtsmoos-external-client-websocket-url: ${WS_URL}`,
			"  x-awtsmoos-external-client-websocket-binary-opcode: 2",
			"  x-awtsmoos-external-client-preferred-chunk-bytes: 1048576",
			"  x-awtsmoos-external-client-required-scopes: tunnel.read tunnel.write"
		].join("\n"))
		.replace(/^          authorizationUrl:.*$/m,
			`          authorizationUrl: ${AUTHORIZATION_URL}`);
}

module.exports = { AGENT_PREFIX, AGENT_TITLE, AUTHORIZATION_URL,
	OPERATION_CATALOG_URL, TRANSFER_URL, WS_URL, enrichYaml };
