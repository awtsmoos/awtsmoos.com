
// B"H
/**
 * @file manager.js
 * @brief Manages the execution, lifecycle, and I/O streams of the Golem (Node Worker).
 * 
 * THE MASTER OF PROCESSES:
 * The Node Manager stands above the workers, watching their births and deaths.
 * When the worker calls for physical files synchronously, it routes the call
 * to the SyncIpcHandler to freeze the worker and fetch the Truth from the Awtsmoos' 
 * continuous creation of the filesystem.
 */

import { FileSystemProvider } from '../fs-provider.js';
import { Terminal } from '../terminal/index.js';
import { NodeWorkerSource } from './worker-source.js';
import { NodeCoreModules } from './core-modules/index.js';
import { SyncIpcHandler } from './sync-ipc.js';

export const NodeManager = {
    processes: new Map(),
    servers: new Map(),
    pendingHttpReqs: new Map(),
    wsConnections: new Map(), 
    nextPid: 1000,

    /**
     * B"H
     * Manifests a new node process from a root JS file.
     * @param {Object} entryItem - The entry point script.
     * @param {string|number} tabId - The terminal tab identity.
     * @returns {Promise<number>} The Process ID.
     */
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

    /**
     * B"H
     * Directs incoming messages from the worker to their appropriate handlers.
     */
    async _handleWorkerMessage(pid, e) {
        const process = this.processes.get(pid);
        if (!process) return;
        const d = e.data;

        if (d.type === 'stdout') {
            Terminal.printToTab(process.tabId, d.text);
        } else if (d.type.startsWith('sync-')) {
            await SyncIpcHandler.handleOp(process, d);
        } else if (d.type === 'ack') {
            if (process.ack) process.ack();
        } else if (d.type === 'net-listen') {
            this.servers.set(d.port, { pid, serverId: d.serverId });
            Terminal.printToTab(process.tabId, `[Node] Server listening on port ${d.port}`, 'cmd-info');
        }
    },
    
    /**
     * B"H
     * Plumbs HTTP requests coming from the outside network into the worker server.
     */
    async routeHttpRequest(port, req) {
        return new Promise((resolve, reject) => {
            const srv = this.servers.get(port);
            if (!srv) return reject(new Error(`Connection Refused on port ${port}`));
            
            const reqId = Math.random().toString(36).substr(2);
            this.pendingHttpReqs.set(reqId, { resolve, reject });
            
            const process = this.processes.get(srv.pid);
            process.worker.postMessage({ type: 'http-inbound', serverId: srv.serverId, reqId, method: req.method, url: req.url, headers: req.headers });
        });
    }
};
