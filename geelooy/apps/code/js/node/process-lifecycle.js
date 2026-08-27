// B"H

const MAX_LOG_LINES = 2000;
const MAX_HISTORY = 500;

export function processRecord(pid, entryItem, tabId, worker, objectUrl, buffers, options = {}) {
	return {
		pid,
		tabId,
		worker,
		objectUrl,
		rootItem: { ...entryItem, path: "/", name: "Root", kind: "directory" },
		entryPath: entryItem.path,
		controlView: new Int32Array(buffers.controlSAB),
		dataSAB: buffers.dataSAB,
		serverMap: {},
		ack: null,
		logs: [],
		capture: null,
		silentTerminal: Boolean(options.silentTerminal),
		owner: options.owner || options.agentSessionId || `tab:${tabId}`,
		agentSessionId: options.agentSessionId || null,
		logicalAgentId: options.logicalAgentId || null,
		startup: Boolean(options.startup),
		singletonKey: options.singletonKey || null,
		status: "starting",
		startedAt: new Date().toISOString(),
		stoppedAt: null
	};
}

export function appendLog(process, text) {
	process.logs.push(String(text ?? ""));
	if (process.logs.length > MAX_LOG_LINES) process.logs.splice(0, process.logs.length - MAX_LOG_LINES);
}

export function publicRecord(process) {
	return {
		pid: process.pid,
		tabId: process.tabId,
		entryPath: process.entryPath,
		owner: process.owner,
		agentSessionId: process.agentSessionId,
		logicalAgentId: process.logicalAgentId,
		startup: process.startup,
		singletonKey: process.singletonKey,
		status: process.status,
		startedAt: process.startedAt,
		stoppedAt: process.stoppedAt,
		logs: [...process.logs]
	};
}

/**
 * B"H — Completion closes every door the worker opened. Ports, sockets, pending
 * requests, blob URLs, and the worker itself return to nothing before its bounded
 * history record remains for inspection.
 */
export function cleanup(state, process, outcome = {}) {
	if (!process || process.status === "stopped") return publicRecord(process);
	process.status = outcome.status || "stopped";
	process.stoppedAt = new Date().toISOString();
	for (const [port, server] of state.servers.entries()) {
		if (server.pid === process.pid) state.servers.delete(port);
	}
	for (const [id, connection] of state.wsConnections.entries()) {
		if (connection.pid === process.pid) state.wsConnections.delete(id);
	}
	for (const [id, pending] of state.pendingHttpReqs.entries()) {
		if (pending.pid !== process.pid) continue;
		clearTimeout(pending.timer);
		pending.reject(new Error(`node_process_stopped:${process.pid}`));
		state.pendingHttpReqs.delete(id);
	}
	try { process.worker?.terminate?.(); } catch {}
	try { if (process.objectUrl) URL.revokeObjectURL(process.objectUrl); } catch {}
	state.processes.delete(process.pid);
	const record = { ...publicRecord(process), ...outcome };
	state.history.set(process.pid, record);
	while (state.history.size > (state.maxHistory || MAX_HISTORY)) state.history.delete(state.history.keys().next().value);
	return record;
}

export { MAX_HISTORY, MAX_LOG_LINES };
