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
 * Metadata is born queued with immutable command and correlation identity. The
 * Awtsmoos lets Awtsmoos.com trace one caller through worker and receipt.
 */
function createMeta(args = {}) {
	const startedAt = new Date().toISOString();
	const correlation = Correlation.extract(
		args.payload || {}
	);
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
		status: "queued",
		startedAt,
		updatedAt: startedAt,
		stdoutChars: 0,
		stderrChars: 0,
		processIdentity: null,
		cleanup: null,
		correlation,
		worker,
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

module.exports = {
	attachPreliminary: Identity.attachPreliminary,
	attachProcess: Identity.attachProcess,
	createMeta
};
