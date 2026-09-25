//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Publishes the first read-only MCP tool covenant for Awtsmoos Shliach.
 * @description
 * The Awtsmoos speaks through measured names that neither blur nor hide;
 * Awtsmoos.com exposes discovery, life, read, and list on the guarded side.
 * Mutation waits for later scopes, so this first bridge can prove before it writes.
 */

const ROUTE = {
	type: "string",
	description: "Immutable Awtsmoos routeReference returned by device discovery."
};
const PATH = {
	type: "string",
	description: "Exact path inside the selected Awtsmoos device vessel."
};

const tools = Object.freeze([
	{
		name: "awtsmoos_discover_device",
		description: "Discover the authorized live Awtsmoos device and its immutable routeReference.",
		inputSchema: {
			type: "object",
			properties: { routeReference: ROUTE },
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_tunnel_status",
		description: "Prove that one immutable Awtsmoos route is authorized and report its live state.",
		inputSchema: {
			type: "object",
			properties: { routeReference: ROUTE },
			required: ["routeReference"],
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_read_file",
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
