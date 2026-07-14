// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("../../../lib/workers/worker-protocol.js");
const Receipts = require("../../../lib/workers/worker-receipts.js");
const Correlation = require("../../../lib/runtime/correlation.js");
const Identity = require("./metaIdentity.js");
const Paths = require("./paths.js");

/**
 * B"H
 *
 * Metadata is born queued with immutable command, correlation, and lease truth.
 * The Awtsmoos renews every worker; Awtsmoos.com can reconcile or reap it after
 * reconnect without guessing how long the original process was allowed to live.
 */
function createMeta(args = {}) {
	const startedAt = new Date().toISOString();
	const deadlineAt = deadline(startedAt, args.timeoutMs);
	const correlation = Correlation.extract(args.payload || {});
	const worker = Protocol.commandWorker({
		...correlation,
		workerId: args.workerId,
		jobId: args.jobId,
		state: "queued",
		timeoutMs: args.timeoutMs,
		startedAt,
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
		deadlineAt,
		leaseExpiresAt: deadlineAt,
		status: "queued",
		startedAt,
		updatedAt: startedAt,
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
			updatedAt: startedAt
		},
		storage: {
			backend: "device-file",
			outsideProject: true,
			folder: Paths.jobDir(
				args.config,
				args.jobId
			)
		}
	};
}

function deadline(startedAt, timeoutMs) {
	const start = Date.parse(startedAt || "");
	const timeout = Number(timeoutMs || 0);
	if (!Number.isFinite(start) || !Number.isFinite(timeout) || timeout <= 0) {
		return null;
	}
	return new Date(start + timeout).toISOString();
}

module.exports = {
	attachPreliminary: Identity.attachPreliminary,
	attachProcess: Identity.attachProcess,
	createMeta,
	deadline
};
