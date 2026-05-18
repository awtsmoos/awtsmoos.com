// B"H
/**
 * B"H
 * Browser Node network router.
 * Small helper moved out of the manager so the virtual machine stays modular.
 */

export const NodeNetworkRouter = {
    onListen(state, process, d) {
        state.servers.set(String(d.port), {
            pid: process.pid,
            serverId: d.serverId,
            protocol: 'net'
        });
        return `[Node] Server listening on port ${d.port}`;
    },

    routeHttp(state, port, req) {
        return new Promise((resolve, reject) => {
            const srv = state.servers.get(String(port));
            if (!srv) return reject(new Error(`Connection Refused on port ${port}`));

            const reqId = Math.random().toString(36).slice(2);
            state.pendingHttpReqs.entries ? state.pendingHttpReqs.set(reqId, { resolve, reject }) : null;
            state.pendingHttpReqs.set(reqId, { resolve, reject });

            const process = state.processes.get(srv.pid);
            process.worker.postMessage({
                type: 'http-inbound',
                serverId: srv.serverId,
                reqId,
                method: req.method || 'GET',
                url: req.url || '/',
                headers: req.headers || {},
                body: req.body || ''
            });
        });
    },

    onHttpOutbound(state, d) {
        const pending = state.pendingHttpReqs.get(d.reqId);
        if (!pending) return false;
        state.pendingHttpReqs.delete(d.reqId);
        pending.resolve({ status: d.status || 200, headers: d.headers || {}, data: d.data ?? '' });
        return true;
    },

    routeWsOpen(state, port, req) {
        const srv = state.servers.get(String(port));
        if (!srv) throw new Error(`Connection Refused on port ${port}`);

        const id = req.id || Math.random().toString(36).slice(2);
        state.wsConnections.set(id, { ...req, pid: srv.pid, serverId: srv.serverId });

        const process = state.processes.get(srv.pid);
        process.worker.postMessage({ type: 'ws-inbound', serverId: srv.serverId, id, url: req.url || '/', headers: req.headers || {} });
        return { ok: true, id };
    },

    routeWsData(state, id, data) {
        const conn = state.wsConnections.get(id);
        if (!conn) return { ok: false, error: 'ws_not_found', id };
        const process = state.processes.get(conn.pid);
        process?.worker.postMessage({ type: 'ws-client-data', id, data });
        return { ok: true, id };
    },

    routeWsClose(state, id) {
        const conn = state.wsConnections.get(id);
        if (!conn) return { ok: false, error: 'ws_not_found', id };
        const process = state.processes.get(conn.pid);
        process.worker.postMessage({ type: 'ws-client-close', id });
        state.wsConnections.delete(id);
        return { ok: true, id };
    }
};
