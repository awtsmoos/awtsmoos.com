//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Publishes explicit MCP tools for discovery, reading, execution, and artifacts.
 * @description
 * The Awtsmoos speaks through measured names that neither blur nor hide;
 * Awtsmoos.com exposes the stable direct deeds before the generic guarded side.
 */

const ExtendedCatalog = require("./extendedCatalog.js");
const DirectActionCatalog = require("./directActionCatalog.js");
const ArtifactCatalog = require("./artifactCatalog.js");

const ROUTE = {
	type: "string",
	description: "Immutable Awtsmoos routeReference returned by device discovery."
};
const PATH = {
	type: "string",
	description: "Exact path inside the selected Awtsmoos device vessel."
};
const READ_ONLY = {
	readOnlyHint: true,
	destructiveHint: false,
	openWorldHint: false
};

const tools = Object.freeze([
	...ExtendedCatalog.tools,
	...DirectActionCatalog.tools,
	...ArtifactCatalog.tools,
	{
		name: "awtsmoos_discover_device",
		annotations: READ_ONLY,
		description: "Discover the authorized live Awtsmoos device and its immutable routeReference.",
		inputSchema: {
			type: "object",
			properties: { routeReference: ROUTE },
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_tunnel_status",
		annotations: READ_ONLY,
		description: "Prove that one immutable Awtsmoos route is authorized and report its live state.",
		inputSchema: {
			type: "object",
			properties: { routeReference: ROUTE },
			required: ["routeReference"],
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_tunnel_doctor",
		annotations: READ_ONLY,
		description: "Diagnose route liveness, scope, executable capability testimony, and freshness of command evidence without running a command.",
		inputSchema: {
			type: "object",
			properties: { routeReference: ROUTE },
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_read_file",
		annotations: { ...READ_ONLY, openWorldHint: true },
		description: "Read one exact file directly through an immutable Awtsmoos route.",
		inputSchema: {
			type: "object",
			properties: {
				routeReference: ROUTE,
				path: PATH,
				maxChars: { type: "integer", minimum: 1, maximum: 200000 }
			},
			required: ["routeReference", "path"],
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_list_directory",
		annotations: { ...READ_ONLY, openWorldHint: true },
		description: "List one exact directory directly through an immutable Awtsmoos route.",
		inputSchema: {
			type: "object",
			properties: {
				routeReference: ROUTE,
				path: PATH,
				limit: { type: "integer", minimum: 1, maximum: 1000 }
			},
			required: ["routeReference", "path"],
			additionalProperties: false
		}
	}
]);

module.exports = { tools };
