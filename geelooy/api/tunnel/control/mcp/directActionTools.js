//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Stable first-class MCP tools for the most important native Awtsmoos deeds.
 * @description
 * The Awtsmoos gives each command and file its truthful gate;
 * Awtsmoos.com maps stable MCP names onto the existing protected action state.
 * No authority is created here: GenericTools still enforces account, scope,
 * manifest, mission, routing, receipt, and replay law for every invoked deed.
 */

const GenericTools = require("./genericTools.js");

const BROWSER_ACTIONS = Object.freeze(new Set([
	"chromeStatus",
	"chromeNavigate",
	"chromeSnapshot",
	"chromeFind",
	"chromeClick",
	"chromeType",
	"chromeWaitForSelector",
	"chromeEvalSlim",
	"chromeScreenshot",
	"chromeLogs"
]));

function compact(values = {}) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined)
	);
}

async function runCommand($i, identity, args = {}) {
	if (typeof args.command !== "string" || !args.command.trim()) {
		throw new Error("command is required.");
	}
	return GenericTools.tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: "commandRun",
		params: compact({
			command: args.command,
			cwd: args.cwd,
			timeoutMs: args.timeoutMs,
			maxChars: args.maxChars
		})
	});
}

async function commandStatus($i, identity, args = {}) {
	if (!args.jobId) throw new Error("jobId is required.");
	return GenericTools.tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: "commandJobStatus",
		params: { jobId: args.jobId }
	});
}

async function commandOutput($i, identity, args = {}) {
	if (!args.jobId) throw new Error("jobId is required.");
	return GenericTools.tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: "commandJobOutputPage",
		params: compact({
			jobId: args.jobId,
			stream: args.stream || "stdout",
			offsetChars: args.offsetChars,
			maxChars: args.maxChars
		})
	});
}

async function writeFile($i, identity, args = {}) {
	if (!args.path || typeof args.content !== "string") {
		throw new Error("path and string content are required.");
	}
	return GenericTools.tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: "write",
		params: compact({ p: args.path, content: args.content, confirm: args.confirm })
	});
}

async function deleteFile($i, identity, args = {}) {
	if (!args.path) throw new Error("path is required.");
	return GenericTools.tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: "deleteFile",
		params: { p: args.path, confirm: args.confirm === true }
	});
}

async function browserAction($i, identity, args = {}) {
	if (!BROWSER_ACTIONS.has(args.operation)) {
		throw new Error("Unsupported browser operation.");
	}
	return GenericTools.tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: args.operation,
		params: args.params || {}
	});
}

module.exports = {
	BROWSER_ACTIONS,
	browserAction,
	commandOutput,
	commandStatus,
	deleteFile,
	runCommand,
	writeFile
};
