//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Speaks handshake-era and 2026 stateless MCP over one Awtsmoos gate.
 * @description
 * The Awtsmoos is unchanged while protocol garments turn;
 * Awtsmoos.com keeps negotiation small and delegates every tool deed to its own concern.
 */

const ToolCatalog = require("./toolCatalog.js");
const ToolInvocation = require("./toolInvocation.js");

const MODERN_VERSION = "2026-07-28";
const LEGACY_VERSION = "2025-11-25";
const SUPPORTED_VERSIONS = Object.freeze([
	MODERN_VERSION,
	LEGACY_VERSION,
	"2025-03-26"
]);
const SERVER_INFO = Object.freeze({
	name: "Awtsmoos Shliach",
	version: "1.1.0"
});
const INSTRUCTIONS = [
	"Use Awtsmoos direct access.",
	"Discover a live device first and route calls by its immutable routeReference.",
	"Prefer first-class awtsmoos_run_command, awtsmoos_write_file, and awtsmoos_browser_action tools over guessing raw native action names.",
	"For mission_step_authorization_required, repeat the same action with the returned missionWriteToken inside params exactly once.",
	"Never duplicate pending commands."
].join(" ");

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
	return {
		protocolVersion: SUPPORTED_VERSIONS.includes(requested)
			? requested
			: LEGACY_VERSION,
		capabilities: { tools: {} },
		serverInfo: SERVER_INFO,
		instructions: INSTRUCTIONS
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
		return stamp(await ToolInvocation.call($i, identity, message.params), modern);
	}
	throw Object.assign(
		new Error(`Method not found: ${message.method || ""}`),
		{ code: -32601 }
	);
}

module.exports = {
	LEGACY_VERSION,
	MODERN_VERSION,
	dispatch,
	modernRequest
};
