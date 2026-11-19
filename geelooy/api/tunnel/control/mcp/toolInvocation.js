//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file toolInvocation.js
 * @description
 * The Awtsmoos resolves each Shliach doorway without confusing knowledge with command;
 * Awtsmoos.com keeps invocation small while result keilim preserve each guarded hand.
 */

const DeviceTools = require("./deviceTools.js");
const FsTools = require("./fsTools.js");
const GenericTools = require("./genericTools.js");
const DiscoveryTools = require("./discoveryTools.js");
const Diagnostics = require("./diagnostics.js");
const ArtifactTools = require("./artifactTools.js");
const DirectActionTools = require("./directActionTools.js");
const HttpRequestTool = require("./httpRequestTool.js");
const PublicReadTool = require("./publicReadTool.js");
const McpResultKeilim = require("./McpResultKeilim.js");

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
	awtsmoos_api_map: () => GenericTools.applicationMap,
	awtsmoos_application_catalog: () => GenericTools.applicationCatalog,
	awtsmoos_application_call: () => GenericTools.applicationCall,
	awtsmoos_https_request: () => HttpRequestTool.request,
	awtsmoos_public_query: () => PublicReadTool.request,
	awtsmoos_artifact_publish: () => ArtifactTools.publish,
	awtsmoos_artifact_revoke: () => ArtifactTools.revoke
});

/** Resolve one registered MCP tool handler by name. */
function handlerFor(name) {
	const factory = HANDLER_FACTORIES[name];
	return factory ? factory() : null;
}

/**
 * Invoke one registered MCP tool and preserve structured denial semantics.
 * @param {object} $i Dynamic-server request vessel.
 * @param {object} identity Authenticated identity context.
 * @param {object} params MCP call parameters.
 * @returns {Promise<object>} Canonical MCP result.
 */
async function call($i, identity, params = {}) {
	const handler = handlerFor(params.name);
	if (!handler) {
		throw new Error(`Unknown MCP tool: ${params.name || ""}`);
	}
	try {
		const payload = await handler($i, identity, params.arguments || {});
		return McpResultKeilim.formatResult(params.name, payload);
	} catch (error) {
		const denied = McpResultKeilim.deniedResult(error);
		if (denied) {
			return denied;
		}
		throw error;
	}
}

module.exports = {
	HANDLER_FACTORIES,
	call,
	formatResult: McpResultKeilim.formatResult.bind(McpResultKeilim),
	handlerFor
};
