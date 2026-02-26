
// B"H
// FILE: js/node/manager.js

import { FileSystemProvider } from '../fs-provider.js';
import { Terminal } from '../terminal/index.js';
import { NodeWorkerSource } from './worker-source.js';
import { NodeCoreModules } from './core-modules/index.js';
import { State } from '../state.js';
import { VirtualNetwork } from '../network/index.js'; // B"H

export const NodeManager = {
    processes: new Map(),
    servers: new Map(),
    pendingHttpReqs: new Map(),
    wsConnections: new Map(), 
    nextPid: 1000,

    async spawn(entryItem, tabId) {
        const pid = this.nextPid++;
        
        const CHUNK_SIZE = 65536;
        const controlSAB = new SharedArrayBuffer(5 * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        
        const finalWorkerCode = NodeWorkerSource(NodeCoreModules);
        const blob = new Blob([finalWorkerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const processInfo = {
            pid, tabId, worker,
            rootItem: { ...entryItem, path: '/', name: 'Root', kind: 'directory' },
            controlView: new Int32Array(controlSAB), dataSAB, serverMap: {}, ack: null
        };

        this.processes.set(pid, processInfo);
        worker.onmessage = (e) => this._handleWorkerMessage(pid, e);

        try {
            const content = await FileSystemProvider.read(entryItem);
            const code = (content instanceof Blob) ? await content.text() : String(content);

            worker.postMessage({ type: 'init-golem', controlSAB, dataSAB, code, path: entryItem.path });
            Terminal.printToTab(tabId, `[Node] Golem ${pid} awakened.`, 'cmd-success');
        } catch(e) {
            Terminal.printToTab(tabId, `[Node] Failed to load: ${e.message}`, 'cmd-error');
        }
        return pid;
    },

    async _handleWorkerMessage(pid, e) {
        const process = this.processes.get(pid);
        if (!process) return;
        const d = e.data;

        if (d.type === 'stdout') Terminal.printToTab(process.tabId, d.text);
        else if (d.type === 'sync-read') await this._handleSyncRead(process, d.path);
        else if (d.type === 'ack') { if (process.ack) process.ack(); }
        else if (d.type === 'net-listen') {
            this.servers.set(String(d.port), pid);
            process.serverMap[d.port] = d.serverId;
            Terminal.printToTab(process.tabId, `[Node] Listening on :${d.port}`, 'cmd-info');
        }
        else if (d.type === 'http-outbound') {
            const resolver = this.pendingHttpReqs.get(d.reqId);
            if (resolver) { resolver(d); this.pendingHttpReqs.delete(d.reqId); }
        }
        // B"H - Node Golem acting as a Client requesting an external or local URL
        else if (d.type === 'http-client-request') {
            VirtualNetwork.request(d.url, d.options).then(res => {
                process.worker.postMessage({ type: 'http-client-response', reqId: d.reqId, data: res.data, status: res.status, headers: res.headers });
            }).catch(err => {
                process.worker.postMessage({ type: 'http-client-error', reqId: d.reqId, error: err.message });
            });
        }
        else if (d.type === 'ws-server-open' || d.type === 'ws-server-send' || d.type === 'ws-server-close') {
            const conn = this.wsConnections.get(d.id);
            if (conn) {
                const msgType = d.type.replace('-server-send', '-server-message');
                conn.sourceWindow.postMessage({ source: 'parent', type: msgType, wsId: d.id, data: d.data }, '*');
            }
        }
    },

    routeHttpRequest(port, req) {
        return new Promise((resolve, reject) => {
            const pid = this.servers.get(String(port));
            if (!pid) return reject(new Error(`ECONNREFUSED :${port}`));
            const p = this.processes.get(pid);
            const reqId = Math.random().toString(36).substr(2);
            this.pendingHttpReqs.set(reqId, resolve);
            p.worker.postMessage({ type: 'http-inbound', reqId, serverId: p.serverMap[port], method: req.method, url: req.url, headers: req.headers });
        });
    },

    routeWsRequest(port, req) {
        const pid = this.servers.get(String(port));
        if (!pid) return;
        const p = this.processes.get(pid);
        this.wsConnections.set(req.id, { pid, sourceWindow: req.sourceWindow });
        p.worker.postMessage({ type: 'ws-inbound-connect', id: req.id, serverId: p.serverMap[port], url: req.url, headers: { 'upgrade': 'websocket', 'sec-websocket-key': req.id } });
    },

    routeWsData(id, data) {
        const conn = this.wsConnections.get(id);
        if (conn) this.processes.get(conn.pid).worker.postMessage({ type: 'ws-inbound-data', id, data });
    },

    routeWsClose(id) {
        const conn = this.wsConnections.get(id);
        if (conn) { this.processes.get(conn.pid).worker.postMessage({ type: 'ws-inbound-close', id }); this.wsConnections.delete(id); }
    },

    async _handleSyncRead(process, path) {
        try {
            let absPath = path.startsWith('/') ? path : '/' + path;
            const content = await FileSystemProvider.read({ ...process.rootItem, path: absPath, kind: 'file' });
            const bytes = new TextEncoder().encode((content instanceof Blob) ? await content.text() : String(content));
            let offset = 0;
            while(offset < bytes.length) {
                const chunk = bytes.subarray(offset, offset + 65536);
                new Uint8Array(process.dataSAB).set(chunk);
                Atomics.store(process.controlView, 1, chunk.length);
                Atomics.store(process.controlView, 2, (offset + chunk.length >= bytes.length) ? 1 : 0);
                Atomics.store(process.controlView, 4, 0); 
                Atomics.store(process.controlView, 0, 1);
                Atomics.notify(process.controlView, 0);
                await new Promise(r => { process.ack = r; });
                process.ack = null;
                offset += chunk.length;
            }
        } catch(err) {
            Atomics.store(process.controlView, 4, 1);
            Atomics.store(process.controlView, 0, 1);
            Atomics.notify(process.controlView, 0);
        }
    }
};
