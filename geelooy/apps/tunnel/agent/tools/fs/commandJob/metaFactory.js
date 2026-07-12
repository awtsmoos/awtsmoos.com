// B"H
const Protocol = require('../../../lib/workers/worker-protocol.js');
const Receipts = require('../../../lib/workers/worker-receipts.js');
const Correlation = require('../../../lib/runtime/correlation.js');
const Paths = require('./paths.js');

/** B"H — Metadata is born queued with immutable command and correlation identity. */
function createMeta(args = {}) {
	const startedAt = new Date().toISOString();
	const correlation = Correlation.extract(args.payload || {});
	const worker = Protocol.commandWorker({
		workerId: args.workerId,
		jobId: args.jobId,
		state: 'queued',
		timeoutMs: args.timeoutMs,
		startedAt,
		cancelable: true
	});
	const receipt = Receipts.created({
		...args.ids,
		action: 'commandStart',
		requestAction: args.payload.requestAction || args.payload.action || 'commandStart',
		actualAction: 'commandStart',
		correlation
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
		status: 'queued',
		startedAt,
		updatedAt: startedAt,
		stdoutChars: 0,
		stderrChars: 0,
		processIdentity: null,
		cleanup: null,
		correlation,
		worker,
		receipt: { ...receipt, state: 'queued', updatedAt: startedAt },
		storage: {
			backend: 'device-file',
			outsideProject: true,
			folder: Paths.jobDir(args.config, args.jobId)
		}
	};
}

function attachPreliminary(meta, processIdentity) {
	meta.processIdentity = structuredClone(processIdentity);
	meta.pid = processIdentity.pid;
	meta.processGroupId = processIdentity.processGroupId;
	meta.platform = processIdentity.platform;
	meta.status = 'spawning';
	meta.updatedAt = new Date().toISOString();
	meta.worker = Protocol.commandWorker({
		...(meta.worker || {}),
		state: 'spawning',
		pid: processIdentity.pid,
		processGroupId: processIdentity.processGroupId,
		platform: processIdentity.platform
	});
	meta.receipt = { ...(meta.receipt || {}), state: 'spawning', updatedAt: meta.updatedAt };
	return meta;
}

function attachProcess(meta, processIdentity, state = 'running') {
	meta.processIdentity = structuredClone(processIdentity);
	meta.pid = processIdentity.pid;
	meta.processGroupId = processIdentity.processGroupId;
	meta.birthToken = processIdentity.birthToken;
	meta.platform = processIdentity.platform;
	meta.status = state;
	meta.updatedAt = new Date().toISOString();
	meta.worker = Protocol.commandWorker({
		...(meta.worker || {}),
		state,
		pid: processIdentity.pid,
		processGroupId: processIdentity.processGroupId,
		birthToken: processIdentity.birthToken,
		platform: processIdentity.platform,
		timeoutMs: meta.timeoutMs,
		startedAt: meta.startedAt,
		heartbeatAt: meta.heartbeatAt || meta.startedAt,
		cancelable: true
	});
	meta.receipt = Receipts.running(meta.receipt, meta.worker);
	return meta;
}

module.exports = { attachPreliminary, attachProcess, createMeta };
