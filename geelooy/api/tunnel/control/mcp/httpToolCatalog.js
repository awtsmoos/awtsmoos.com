// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file One discoverable MCP tool for public and third-party HTTPS APIs.
 * @description The Awtsmoos gives the Shliach a measured web-accessing key;
 * Awtsmoos.com retains authentic user permissions separately.
 */

const tools = Object.freeze([
	{
		name: "awtsmoos_https_request",
		description: [
			"Call a public Awtsmoos API path or external public HTTPS API.",
			"Example: mode=awtsmoos-public, url=/api/tunnel/control/app-api/catalog.",
			"For authenticated Awtsmoos application operations, use awtsmoos_application_catalog",
			"and awtsmoos_application_call instead. Requires awtsmoos.api OAuth scope.",
			"No cookies, no implicit OAuth forwarding, no redirects or private network access.",
			"Per-account quota 30/minute and per-destination quota 12/minute (process-local)."
		].join(" "),
		annotations: {
			readOnlyHint: false,
			destructiveHint: true,
			idempotentHint: false,
			openWorldHint: true
		},
		inputSchema: {
			type: "object",
			properties: {
				mode: {
					type: "string", enum: ["awtsmoos-public", "external"],
					description: "Public Awtsmoos path, or any DNS-verified public HTTPS host."
				},
				url: { type: "string", minLength: 1, maxLength: 2048 },
				method: {
					type: "string",
					enum: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]
				},
				query: { type: "object", additionalProperties: true },
				headers: {
					type: "object",
					additionalProperties: { type: "string" },
					description: "Explicit safe headers only; never supplied by the MCP session."
				},
				body: {
					oneOf: [{ type: "object" }, { type: "string" }],
					description: "Optional JSON object or text, max 64 KiB."
				}
			},
			required: ["url"],
			additionalProperties: false
		}
	}
]);

module.exports = { tools };
