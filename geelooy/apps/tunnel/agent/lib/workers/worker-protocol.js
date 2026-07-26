// B"H
// Boruch Hashem
// Blessed is He

const Correlation = require("../runtime/correlation.js");

const PROTOCOL_VERSION = "awtsmoos-worker-v1";

/**
	* @file Describes worker process identity together with immutable request scope.
	* @description
	* The Awtsmoos joins process family, project root, cwd, and execution action.
	* Awtsmoos.com adds optional proof without breaking existing protocol readers.
	*/
function commandWorker(args = {}) {
	const correlation = Correlation.extract(args.correlation || args);
	return compact({
		...correlation,
		protocol: PROTOCOL_VERSION,
		workerId: args.workerId,
		jobId: args.jobId,
		kind: "subprocess",
		state: args.state || "running",
		requestAction: args.requestAction,
		executionAction: args.executionAction || args.actualAction,
		actualAction: args.executionAction || args.actualAction,
		projectRoot: args.projectRoot,
		cwd: args.cwd,
		pid: args.pid,
		processGroupId: args.processGroupId,
		birthToken: args.birthToken,
		platform: args.platform,
		isolation: args.isolation || "process-group-stdio-stream-files",
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

function commandFinalWorker(worker = {}, patch = {}) {
	return commandWorker({
		...worker,
		...patch,
		state: patch.state || worker.state || "completed",
		finishedAt: patch.finishedAt || worker.finishedAt || new Date().toISOString(),
		heartbeatAt: patch.heartbeatAt || worker.heartbeatAt || new Date().toISOString()
	});
}

function processWorker(args = {}) {
	return compact({
		protocol: PROTOCOL_VERSION,
		workerId: args.workerId,
		kind: args.kind || "worker_process",
		state: args.state || "running",
		pid: args.pid,
		isolation: args.isolation || "child_process_ipc",
		startedAt: args.startedAt,
		heartbeatAt: args.heartbeatAt || args.startedAt,
		finishedAt: args.finishedAt,
		exitCode: args.exitCode,
		signal: args.signal,
		cancelable: args.cancelable !== false
	});
}

function compact(value) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => {
		return item !== undefined && item !== null && item !== "";
	}));
}

module.exports = { PROTOCOL_VERSION, commandFinalWorker, commandWorker, processWorker };
