//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/** Explicit public exposure needs a separate MCP tool and conspicuous approval. */
const MUTATION = {
	readOnlyHint: false,
	destructiveHint: true,
	idempotentHint: false,
	openWorldHint: true
};

const tools = Object.freeze([
	{
		name: "awtsmoos_artifact_publish",
		description: "Publish exactly one named, owner-authorized tunnel file as a temporary public URL. The URL grants access to anyone possessing it. Requires tunnel.admin and explicit user approval.",
		annotations: MUTATION,
		inputSchema: {
			type: "object",
			properties: {
				routeReference: { type: "string", minLength: 1, description: "Exact immutable device routeReference from discovery." },
				path: { type: "string", minLength: 1, description: "Exact authorized source-file path inside the device project root." },
				ttlSeconds: { type: "integer", minimum: 30, maximum: 3600, default: 600 },
				allowDownload: { type: "boolean", default: true },
				confirmPublicSharing: { type: "boolean", description: "True only after the user explicitly chooses to make this exact file accessible to link holders." }
			},
			required: ["routeReference", "path", "confirmPublicSharing"],
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_artifact_revoke",
		description: "Revoke a temporary public artifact URL. Requires the original owner and tunnel.admin.",
		annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
		inputSchema: {
			type: "object",
			properties: {
				artifactId: { type: "string", pattern: "^[0-9a-f]{64}$" }
			},
			required: ["artifactId"],
			additionalProperties: false
		}
	}
]);

module.exports = { tools };
