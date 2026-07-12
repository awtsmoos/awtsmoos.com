// B"H
const ResponseV8 = require('../../../lib/runtime/response-v8.js');
const Paths = require('./paths.js');
const Policy = require('./policy.js');

/** B"H — Command responses preserve identity, queue state, control payloads, and paging. */
function start(jobId, args = {}) {
	const meta = args.meta || {};
	return ResponseV8.compactTrust({
		ok: true,
		action: meta.receipt?.requestAction || 'commandStart',
		requestAction: meta.receipt?.requestAction || 'commandStart',
		actualAction: 'commandStart',
		actionMismatch: (meta.receipt?.requestAction || 'commandStart') !== 'commandStart',
		status: meta.status || 'running',
		queued: meta.status === 'queued',
		running: ['spawning', 'running', 'detached_running'].includes(meta.status),
		jobId,
		workerId: meta.workerId,
		receiptId: meta.receiptId,
		pid: meta.processIdentity?.pid || meta.pid || null,
		processGroupId: meta.processIdentity?.processGroupId || meta.processGroupId || null,
		birthToken: meta.processIdentity?.birthToken || meta.birthToken || '',
		processIdentity: meta.processIdentity || null,
		worker: meta.worker,
		receipt: meta.receipt,
		storage: args.storage || meta.storage,
		queue: meta.queue || null,
		idempotencyKey: meta.idempotencyKey || undefined,
		statusPayload: { action: 'commandStatus', jobId },
		waitPayload: { action: 'commandWait', jobId },
		stdoutPagePayload: { action: 'commandJobOutputPage', jobId, stream: 'stdout' },
		stderrPagePayload: { action: 'commandJobOutputPage', jobId, stream: 'stderr' },
		responseProtocol: 'awtsmoos-worker-v1'
	});
}

function status(jobId, meta = {}, payload = {}) {
	const action = String(payload.requestAction || payload.action || 'commandStatus');
	return ResponseV8.compactTrust({
		...meta,
		ok: true,
		action,
		requestAction: action,
		actualAction: action,
		jobId,
		workerId: meta.workerId,
		receiptId: meta.receiptId,
		queued: meta.status === 'queued',
		running: ['spawning', 'running', 'detached_running', 'cancelling'].includes(meta.status),
		done: Policy.TERMINAL.has(meta.status),
		statusPayload: { action: 'commandStatus', jobId },
		waitPayload: { action: 'commandWait', jobId },
		stdoutPagePayload: { action: 'commandJobOutputPage', jobId, stream: 'stdout' },
		stderrPagePayload: { action: 'commandJobOutputPage', jobId, stream: 'stderr' },
		responseProtocol: 'awtsmoos-worker-v1'
	});
}

async function page(config, jobId, stream, payload = {}) {
	const text = await Paths.readText(config, jobId, `${stream}.txt`);
	const offsetChars = Math.max(0, Math.floor(Number(payload.offsetChars || 0)));
	const maxChars = Policy.boundedPageChars(payload.maxChars);
	const content = text.slice(offsetChars, offsetChars + maxChars);
	const nextOffsetChars = offsetChars + content.length;
	return ResponseV8.compactTrust({
		ok: true,
		action: String(payload.requestAction || payload.action || 'commandJobOutputPage'),
		jobId,
		stream,
		content,
		offsetChars,
		returnedChars: content.length,
		totalChars: text.length,
		hasNextPage: nextOffsetChars < text.length,
		nextOffsetChars,
		nextPagePayload: nextOffsetChars < text.length
			? { action: 'commandJobOutputPage', jobId, stream, offsetChars: nextOffsetChars, maxChars }
			: undefined
	});
}

module.exports = { page, start, status };
