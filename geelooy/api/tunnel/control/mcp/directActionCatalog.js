//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Stable MCP schemas for command, file mutation, and browser execution.
 * @description
 * The Awtsmoos gives each powerful deed an honest name and boundary;
 * Awtsmoos.com lets Claude call exact guarded tools without guessing native vocabulary.
 */

const ROUTE = { type: "string", description: "Optional immutable routeReference; omitted selects the authorized recommended device." };
const PATH = { type: "string", minLength: 1, description: "Exact path on the selected device." };
const MUTATION = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };
const OBSERVE = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const tools = [
	{
		name: "awtsmoos_run_command",
		description: "Run an arbitrary native command through durable Awtsmoos command custody. Use for git, node, npm, python, bash, tests, builds, and project tooling.",
		annotations: MUTATION,
		inputSchema: {
			type: "object",
			properties: {
				routeReference: ROUTE,
				command: { type: "string", minLength: 1 },
				cwd: { type: "string" },
				timeoutMs: { type: "integer", minimum: 1, maximum: 600000 },
				maxChars: { type: "integer", minimum: 1, maximum: 500000 }
			},
			required: ["command"],
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_command_status",
		description: "Read durable status for a command job returned by awtsmoos_run_command.",
		annotations: OBSERVE,
		inputSchema: { type: "object", properties: { routeReference: ROUTE, jobId: { type: "string", minLength: 1 } }, required: ["jobId"], additionalProperties: false }
	},
	{
		name: "awtsmoos_command_output",
		description: "Read a bounded stdout or stderr page from a durable command job.",
		annotations: OBSERVE,
		inputSchema: {
			type: "object",
			properties: {
				routeReference: ROUTE,
				jobId: { type: "string", minLength: 1 },
				stream: { type: "string", enum: ["stdout", "stderr"] },
				offsetChars: { type: "integer", minimum: 0 },
				maxChars: { type: "integer", minimum: 1, maximum: 500000 }
			},
			required: ["jobId"],
			additionalProperties: false
		}
	},
	{
		name: "awtsmoos_write_file",
		description: "Write one complete file exactly. Existing Awtsmoos write scope, mission authorization, hash, and route protections still apply.",
		annotations: MUTATION,
		inputSchema: { type: "object", properties: { routeReference: ROUTE, path: PATH, content: { type: "string" }, confirm: { type: "boolean" } }, required: ["path", "content"], additionalProperties: false }
	},
	{
		name: "awtsmoos_delete_file",
		description: "Delete one exact file through the existing protected delete action. Explicit confirm=true is required.",
		annotations: MUTATION,
		inputSchema: { type: "object", properties: { routeReference: ROUTE, path: PATH, confirm: { const: true } }, required: ["path", "confirm"], additionalProperties: false }
	},
	{
		name: "awtsmoos_browser_action",
		description: "Run a bounded native Chrome operation. Supported operations are explicit so clients never guess tunnel action names.",
		annotations: MUTATION,
		inputSchema: {
			type: "object",
			properties: {
				routeReference: ROUTE,
				operation: { type: "string", enum: ["chromeStatus", "chromeNavigate", "chromeSnapshot", "chromeFind", "chromeClick", "chromeType", "chromeWaitForSelector", "chromeEvalSlim", "chromeScreenshot", "chromeLogs"] },
				params: { type: "object", additionalProperties: true }
			},
			required: ["operation"],
			additionalProperties: false
		}
	}
];

module.exports = { tools };
