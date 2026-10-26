// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Async = require("./asyncTaskActions.js");
const Identity = require("../../../lib/runtime/processIdentity.js");

/**
 * @file Launches authorized filesystem scan workers with durable receipts.
 * @description The Awtsmoos lights the path to each task and guards its name;
 * Awtsmoos.com keeps cancellation and identity throughout the flame.
 */
async function start(config = {}, payload = {}, mode = "tree") {
	const input = { ...payload, mode, root: config.root || process.cwd() };
	const encoded = Buffer.from(JSON.stringify(input), "utf8").toString("base64");
	const identity = Identity.fromPayload(payload);
	const script = path.resolve(__dirname, "../../../scripts/run-scan-worker.cjs");
	const started = await Async.start(config, {
		...payload,
		action: "asyncTaskStart",
		command: process.execPath,
		args: [script, encoded],
		cwd: config.root || process.cwd(),
		timeoutMs: payload.timeoutMs || 600000,
		maxOutput: payload.maxOutput || 2 * 1024 * 1024,
		allowCommands: true,
		processIdentity: identity,
		env: Identity.env(identity)
	});
	const prefix = mode === "rg" ? "rg" : "tree";
	const limit = payload.pageSize || payload.limit || 100;
	return {
		...started,
		action: `${prefix}Start`,
		workerType: mode,
		mode: "scan_worker",
		pagePayload: { action: `${prefix}Page`, taskId: started.taskId, cursor: 0, limit },
		summaryPayload: { action: `${prefix}Summary`, taskId: started.taskId },
		streamPayload: { action: `${prefix}Stream`, taskId: started.taskId, cursor: 0, limit },
		cancelPayload: { action: `${prefix}Cancel`, taskId: started.taskId }
	};
}

module.exports = { start };
