//B"H
//Boruch Hashem
//Blessed is He
"use strict";

const OBJECT = { type: "object", additionalProperties: true };
const MUTATION = {
	readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true
};

/** Existing guarded API capabilities exposed as MCP tools, without new authority. */
const tools = [
	{
		name: "awtsmoos_bootstrap",
		description: "Read current server onboarding, live workflow guidance and mission-planning contract.",
		annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
		inputSchema: { type: "object", properties: {}, additionalProperties: false }
	},
	{
		name: "awtsmoos_action_schema",
		description: "Discover current device-side parameters and retry contract for any action before calling it.",
		annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
		inputSchema: {
			type: "object", properties: {
				routeReference: { type: "string" }, targetAction: { type: "string", minLength: 1 }
			}, required: ["targetAction"], additionalProperties: false
		}
	},
	{
		name: "awtsmoos_tunnel_action",
		description: "Run an existing protected tunnel action: read/write files, commands, browser, transfer, jobs, or previews. Existing scopes and device permissions apply. Discover a device first; never replay uncertain mutations.",
		annotations: MUTATION,
		inputSchema: {
			type: "object",
			properties: {
				routeReference: { type: "string", description: "Immutable discovery reference; omitted selects the authorized recommended device." },
				action: { type: "string", minLength: 1 },
				params: OBJECT
			},
			required: ["action"], additionalProperties: false
		}
	},
	{
		name: "awtsmoos_application_catalog",
		description: "Discover current application API operation IDs, required parameters, and authorization.",
		annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
		inputSchema: { type: "object", properties: {}, additionalProperties: false }
	},
	{
		name: "awtsmoos_application_call",
		description: "Call a cataloged application operation with the caller's identity. Requires awtsmoos.api; writes require application ownership checks.",
		annotations: MUTATION,
		inputSchema: {
			type: "object",
			properties: {
				operation: { type: "string", minLength: 1 },
				params: OBJECT, query: OBJECT, body: OBJECT
			},
			required: ["operation"], additionalProperties: false
		}
	}
];

module.exports = { tools };
