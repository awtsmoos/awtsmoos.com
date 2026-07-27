// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("../../../lib/workers/worker-protocol.js");
const Receipts = require("../../../lib/workers/worker-receipts.js");
const Correlation = require("../../../lib/runtime/correlation.js");
const Identity = require("./metaIdentity.js");
const LaunchLease = require("./launchLease.js");
const Paths = require("./paths.js");

/**
	* @file Creates queued command metadata with immutable request scope.
	* @description
	* The Awtsmoos stores root, cwd, caller action, and execution vessel before a
	* worker breathes. Awtsmoos.com can continue without mutable configuration.
	*/
function createMeta(args = {}) {
	const payload = args.payload || {};
	const queuedAt = new Date().toISOString();
	const deadlineAt = LaunchLease.deadline(queuedAt, args.timeoutMs);
	const correlation = Correlation.extract(payload);
	const requestAction = payload.requestAction || payload.action || "commandStart";
	const projectRoot = payload.projectRoot || payload.scopeRoot || args.config.root;
	const identity = {
		...correlation,
		projectRoot,
		cwd: args.cwd,
		requestAction,
		executionAction: "commandStart",
		actualAction: "commandStart"
	};
	const worker = Protocol.commandWorker({
		...identity,
		workerId: args.workerId,
		jobId: args.jobId,
		state: "queued",
		timeoutMs: args.timeoutMs,
		startedAt: queuedAt,
		cancelable: true
	});
	const receipt = Receipts.created({
		...args.ids,
		...identity,
		action: "commandStart"
	});
	return {
		schemaVersion: 3,
		revision: 0,
		jobId: args.jobId,
		workerId: args.workerId,
		receiptId: args.receiptId,
		command: args.command,
		cwd: args.cwd,
		projectRoot,
		shell: args.shell,
		timeoutMs: args.timeoutMs,
		queuedAt,
		deadlineAt,
		leaseExpiresAt: deadlineAt,
		status: "queued",
		startedAt: queuedAt,
		updatedAt: queuedAt,
		stdoutChars: 0,
		stderrChars: 0,
		processIdentity: null,
		cleanup: null,
		correlation,
		worker: { ...worker, deadlineAt, leaseExpiresAt: deadlineAt },
		receipt: { ...receipt, state: "queued", updatedAt: queuedAt },
		storage: {
			backend: "device-file",
			outsideProject: true,
			folder: Paths.jobDir(args.config, args.jobId)
		}
	};
}

module.exports = {
	attachPreliminary: Identity.attachPreliminary,
	attachProcess: Identity.attachProcess,
	createMeta,
	deadline: LaunchLease.deadline,
	markLaunched: LaunchLease.rebase
};
