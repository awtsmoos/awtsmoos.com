//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Speaks both handshake-era and 2026 stateless MCP over one Awtsmoos gate.
 * @description
 * The Awtsmoos is unchanged while protocol garments turn; Awtsmoos.com lets old
 * initialize and new server/discover each receive the vessel they discern.
 */

const DeviceTools = require("./deviceTools.js");
const FsTools = require("./fsTools.js");
const ToolCatalog = require("./toolCatalog.js");
const GenericTools = require("./genericTools.js");
const DiscoveryTools = require("./discoveryTools.js");
const Diagnostics = require("./diagnostics.js");
const ArtifactTools = require("./artifactTools.js");

const MODERN_VERSION = "2026-07-28";
const LEGACY_VERSION = "2025-11-25";
const SUPPORTED_VERSIONS = Object.freeze([MODERN_VERSION, LEGACY_VERSION, "2025-03-26"]);
const SERVER_INFO = Object.freeze({ name: "Awtsmoos Shliach", version: "1.0.0" });
const INSTRUCTIONS =
	"Use Awtsmoos direct access. Discover a live device first and route filesystem calls by its immutable routeReference.";

function modernRequest(message = {}) {
	return message.method === "server/discover" ||
		message.params?._meta?.["io.modelcontextprotocol/protocolVersion"] === MODERN_VERSION;
}

function stamp(result, modern) {
	if (!modern) return result;
	return {
		...result,
		resultType: result.resultType || "complete",
		_meta: {
			...(result._meta || {}),
			"io.modelcontextprotocol/serverInfo": SERVER_INFO
		}
	};
}

function discovery() {
	return stamp({
		supportedVersions: [...SUPPORTED_VERSIONS],
		capabilities: { tools: {} },
		instructions: INSTRUCTIONS,
		ttlMs: 300000,
		cacheScope: "private"
	}, true);
}

function initialize(message = {}) {
	const requested = message.params?.protocolVersion;
	const protocolVersion = SUPPORTED_VERSIONS.includes(requested)
		? requested
		: LEGACY_VERSION;
	return {
		protocolVersion,
		capabilities: { tools: {} },
		serverInfo: SERVER_INFO,
		instructions: INSTRUCTIONS
	};
}

async function callTool($i, identity, params = {}) {
	const args = params.arguments || {};
	const handlers = {
		awtsmoos_bootstrap: DiscoveryTools.awtsmoosBootstrap,
		awtsmoos_action_schema: DiscoveryTools.awtsmoosActionSchema,
		awtsmoos_discover_device: DeviceTools.discover,
		awtsmoos_tunnel_status: DeviceTools.status,
		awtsmoos_tunnel_doctor: Diagnostics.tunnelDoctor,
		awtsmoos_read_file: FsTools.readFile,
		awtsmoos_list_directory: FsTools.listDirectory,
		awtsmoos_tunnel_action: GenericTools.tunnelAction,
		awtsmoos_application_catalog: GenericTools.applicationCatalog,
		awtsmoos_application_call: GenericTools.applicationCall,
		awtsmoos_artifact_publish: ArtifactTools.publish,
		awtsmoos_artifact_revoke: ArtifactTools.revoke
	};
	const handler = handlers[params.name];
	if (!handler) throw new Error(`Unknown MCP tool: ${params.name || ""}`);
	const payload = await handler($i, identity, args);
	const content = [{ type: "text", text: JSON.stringify(payload, null, 2) }];
	// Standard MCP file resource link: the host may fetch actual binary bytes.
	// It is emitted only for explicit, consent-gated successful publication;
	// the URL is a short-lived bearer capability and is not a ChatGPT file ID.
	if (params.name === "awtsmoos_artifact_publish" && payload?.ok === true &&
		/^https:\/\/awtsmoos\.com\/api\/tunnel\/control\/artifact\/[a-f0-9]{64}\//.test(String(payload.url||"")) &&
		Number.isSafeInteger(payload.bytes) && payload.bytes>0) {
		const name = decodeURIComponent(new URL(payload.url).pathname.split("/").pop());
		content.push({ type: "resource_link", name, title: name,
			uri: payload.url, mimeType: payload.mimeType, size: payload.bytes,
			description: "Time-limited link-holder-accessible verified binary artifact. SHA-256: "+payload.sha256+
			". Download to the host and verify the complete file before claiming local attachment." });
	}
	return {
		content,
		structuredContent: payload,
		isError: Boolean(payload && typeof payload === "object" &&
			(payload.ok === false || payload.statusCode >= 400))
	};
}

async function dispatch($i, identity, message = {}) {
	const modern = modernRequest(message);
	if (message.method === "server/discover") return discovery();
	if (message.method === "initialize") return initialize(message);
	if (message.method === "ping") return stamp({}, modern);
	if (message.method === "tools/list") {
		return stamp({ tools: ToolCatalog.tools }, modern);
	}
	if (message.method === "tools/call") {
		return stamp(await callTool($i, identity, message.params), modern);
	}
	throw Object.assign(new Error(`Method not found: ${message.method || ""}`), { code: -32601 });
}

module.exports = {
	LEGACY_VERSION,
	MODERN_VERSION,
	dispatch,
	modernRequest
};
