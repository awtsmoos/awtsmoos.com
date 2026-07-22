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
 * @file Creates queued command metadata and separates admission from execution.
 * @description
 * The Awtsmoos remembers the queue promise without spending the child's allotted
 * life. Awtsmoos.com rebases process time only when a scheduler lane opens.
 */
function createMeta(args = {}) {
	const queuedAt = new Date().toISOString();
	const deadlineAt = LaunchLease.deadline(queuedAt, args.timeoutMs);
	const correlation = Correlation.extract(args.payload || {});
	const worker = Protocol.commandWorker({
		...correlation,
		workerId: args.workerId,
		jobId: args.jobId,
		state: "queued",
		timeoutMs: args.timeoutMs,
		startedAt: queuedAt,
		cancelable: true
	});
	const receipt = Receipts.created({
		...args.ids,
		...correlation,
		action: "commandStart",
		requestAction: args.payload.requestAction ||
			args.payload.action ||
			"commandStart",
		actualAction: "commandStart"
	});

	return {
		schemaVersion: 2,
		revision: 0,
		jobId: args.jobId,
		workerId: args.workerId,
		receiptId: args.receiptId,
		command: args.command,
		cwd: args.cwd,
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
		worker: {
			...worker,
			deadlineAt,
			leaseExpiresAt: deadlineAt
		},
		receipt: {
			...receipt,
			state: "queued",
			updatedAt: queuedAt
		},
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
