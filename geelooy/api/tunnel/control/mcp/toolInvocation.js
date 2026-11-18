//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Resolves MCP handlers at call time and formats every guarded result.
 * @description
 * The Awtsmoos renews every function reference in the instant of the deed;
 * Awtsmoos.com keeps hot instrumentation, tests, and living adapters able to intercede.
 * Stable tool names remain fixed while their current module exports are read lazily,
 * preserving the runtime substitution semantics the former inline protocol already carried.
 */

const DeviceTools = require("./deviceTools.js");
const FsTools = require("./fsTools.js");
const GenericTools = require("./genericTools.js");
const DiscoveryTools = require("./discoveryTools.js");
const Diagnostics = require("./diagnostics.js");
const ArtifactTools = require("./artifactTools.js");
const DirectActionTools = require("./directActionTools.js");

const HANDLER_FACTORIES = Object.freeze({
	awtsmoos_bootstrap: () => DiscoveryTools.awtsmoosBootstrap,
	awtsmoos_action_schema: () => DiscoveryTools.awtsmoosActionSchema,
	awtsmoos_discover_device: () => DeviceTools.discover,
	awtsmoos_tunnel_status: () => DeviceTools.status,
	awtsmoos_tunnel_doctor: () => Diagnostics.tunnelDoctor,
	awtsmoos_read_file: () => FsTools.readFile,
	awtsmoos_list_directory: () => FsTools.listDirectory,
	awtsmoos_run_command: () => DirectActionTools.runCommand,
	awtsmoos_command_status: () => DirectActionTools.commandStatus,
	awtsmoos_command_output: () => DirectActionTools.commandOutput,
	awtsmoos_write_file: () => DirectActionTools.writeFile,
	awtsmoos_delete_file: () => DirectActionTools.deleteFile,
	awtsmoos_browser_action: () => DirectActionTools.browserAction,
	awtsmoos_tunnel_action: () => GenericTools.tunnelAction,
	awtsmoos_application_catalog: () => GenericTools.applicationCatalog,
	awtsmoos_application_call: () => GenericTools.applicationCall,
	awtsmoos_artifact_publish: () => ArtifactTools.publish,
	awtsmoos_artifact_revoke: () => ArtifactTools.revoke
});

function handlerFor(name) {
	const factory = HANDLER_FACTORIES[name];
	return factory ? factory() : null;
}

function deniedResult(error) {
	if (!error?.data || typeof error.data !== "object" || Array.isArray(error.data)) {
		return null;
	}
	if (error.data.ok !== false) return null;
	return {
		content: [{ type: "text", text: JSON.stringify(error.data, null, 2) }],
		structuredContent: error.data,
		isError: true
	};
}

function artifactLink(name, payload) {
	if (name !== "awtsmoos_artifact_publish" || payload?.ok !== true) return null;
	const url = String(payload.url || "");
	if (!/^https:\/\/awtsmoos\.com\/api\/tunnel\/control\/artifact\/[a-f0-9]{64}\//.test(url)) {
		return null;
	}
	if (!Number.isSafeInteger(payload.bytes) || payload.bytes <= 0) return null;
	const fileName = decodeURIComponent(new URL(url).pathname.split("/").pop());
	return {
		type: "resource_link",
		name: fileName,
		title: fileName,
		uri: url,
		mimeType: payload.mimeType,
		size: payload.bytes,
		description: "Time-limited verified artifact. SHA-256: " + payload.sha256
	};
}

function formatResult(name, payload) {
	const content = [{ type: "text", text: JSON.stringify(payload, null, 2) }];
	const link = artifactLink(name, payload);
	if (link) content.push(link);
	return {
		content,
		structuredContent: payload,
		isError: Boolean(payload && typeof payload === "object" &&
			(payload.ok === false || payload.statusCode >= 400))
	};
}

async function call($i, identity, params = {}) {
	const handler = handlerFor(params.name);
	if (!handler) throw new Error(`Unknown MCP tool: ${params.name || ""}`);
	try {
		return formatResult(
			params.name,
			await handler($i, identity, params.arguments || {})
		);
	} catch (error) {
		const denied = deniedResult(error);
		if (denied) return denied;
		throw error;
	}
}

module.exports = {
	HANDLER_FACTORIES,
	call,
	formatResult,
	handlerFor
};
