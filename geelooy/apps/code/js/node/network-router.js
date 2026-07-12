// B"H

const HTTP_TIMEOUT_MS = 15000;

export const NodeNetworkRouter = {
	onListen(state, process, data) {
		const port = String(data.port);
		const existing = state.servers.get(port);
		if (existing && existing.pid !== process.pid) throw new Error(`node_port_in_use:${port}`);
		state.servers.set(port, {
			pid: process.pid,
			serverId: data.serverId,
			protocol: data.protocol || "net",
			owner: process.owner,
			startedAt: new Date().toISOString()
		});
		return `[Node] Server listening on port ${port}`;
	},

	routeHttp(state, port, request = {}) {
		return new Promise((resolve, reject) => {
			const server = state.servers.get(String(port));
			if (!server) return reject(new Error(`Connection Refused on port ${port}`));
			const process = state.processes.get(server.pid);
			if (!process) return reject(new Error(`node_server_process_missing:${server.pid}`));
			const requestId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
			const timeoutMs = Number(request.timeoutMs || HTTP_TIMEOUT_MS);
			const timer = setTimeout(() => {
				state.pendingHttpReqs.delete(requestId);
				reject(new Error(`node_http_timeout:${timeoutMs}`));
			}, timeoutMs);
			state.pendingHttpReqs.set(requestId, { resolve, reject, timer, pid: process.pid });
			process.worker.postMessage({
				type: "http-inbound",
				serverId: server.serverId,
				reqId: requestId,
				method: request.method || "GET",
				url: request.url || "/",
				headers: request.headers || {},
				body: request.body || ""
			});
		});
	},

	onHttpOutbound(state, data) {
		const pending = state.pendingHttpReqs.get(data.reqId);
		if (!pending) return false;
		clearTimeout(pending.timer);
		state.pendingHttpReqs.delete(data.reqId);
		pending.resolve({ status: data.status || 200, headers: data.headers || {}, data: data.data ?? "" });
		return true;
	},

	routeWsOpen(state, port, request = {}) {
		const server = state.servers.get(String(port));
		if (!server) throw new Error(`Connection Refused on port ${port}`);
		const process = state.processes.get(server.pid);
		if (!process) throw new Error(`node_server_process_missing:${server.pid}`);
		const id = request.id || crypto.randomUUID?.() || Math.random().toString(36).slice(2);
		state.wsConnections.set(id, { ...request, pid: server.pid, serverId: server.serverId });
		process.worker.postMessage({ type: "ws-inbound", serverId: server.serverId, id, url: request.url || "/", headers: request.headers || {} });
		return { ok: true, id };
	},

	routeWsData(state, id, data) {
		const connection = state.wsConnections.get(id);
		if (!connection) return { ok: false, error: "ws_not_found", id };
		state.processes.get(connection.pid)?.worker.postMessage({ type: "ws-client-data", id, data });
		return { ok: true, id };
	},

	routeWsClose(state, id) {
		const connection = state.wsConnections.get(id);
		if (!connection) return { ok: false, error: "ws_not_found", id };
		state.processes.get(connection.pid)?.worker.postMessage({ type: "ws-client-close", id });
		state.wsConnections.delete(id);
		return { ok: true, id };
	}
};

export { HTTP_TIMEOUT_MS };
