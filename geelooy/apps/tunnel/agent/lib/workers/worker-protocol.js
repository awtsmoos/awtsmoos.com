// B"H
const PROTOCOL_VERSION = 'awtsmoos-worker-v1';

/** B"H — Command workers carry family identity beside ordinary worker identity. */
function commandWorker(args = {}) {
	return compact({
		protocol: PROTOCOL_VERSION,
		workerId: args.workerId,
		jobId: args.jobId,
		kind: 'subprocess',
		state: args.state || 'running',
		pid: args.pid,
		processGroupId: args.processGroupId,
		birthToken: args.birthToken,
		platform: args.platform,
		isolation: args.isolation || 'process-group-stdio-stream-files',
		timeoutMs: args.timeoutMs,
		startedAt: args.startedAt,
		heartbeatAt: args.heartbeatAt || args.startedAt,
		finishedAt: args.finishedAt,
		exitCode: args.exitCode,
		signal: args.signal,
		detached: args.detached === true,
		cancelable: args.cancelable !== false
	});
}

function processWorker(args = {}) {
	return compact({
		protocol: PROTOCOL_VERSION,
		workerId: args.workerId,
		kind: args.kind || 'worker_process',
		state: args.state || 'running',
		pid: args.pid,
		isolation: args.isolation || 'child_process_ipc',
		startedAt: args.startedAt,
		heartbeatAt: args.heartbeatAt || args.startedAt,
		finishedAt: args.finishedAt,
		exitCode: args.exitCode,
		signal: args.signal,
		cancelable: args.cancelable !== false
	});
}

function compact(value) {
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== '')
	);
}

module.exports = {
	PROTOCOL_VERSION,
	commandWorker,
	processWorker
};
