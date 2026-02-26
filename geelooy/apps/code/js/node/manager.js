
// B"H
/**
 * @file manager.js
 * @brief The Master of the Golems.
 * 
 * CHAPTER 1: THE BREATH AND THE BRIDGE
 * 
 * The Architect realized that a true server must live beyond the blink of an eye. 
 * If the user switches tabs, the server must not die. Thus, the Manager was forged 
 * to hold the Workers in its firm grasp, anchoring them to the main thread.
 * 
 * Furthermore, the Awtsmoos commanded: "The 'require' statement knows no time. 
 * It demands the file instantly." To fulfill this impossible law in a browser, 
 * the Architect wove the 'Bridge of Instantaneous Truth' using SharedArrayBuffer 
 * and Atomics. The Worker pauses its universe, the Manager reads the disk, and 
 * places the essence in the Buffer, awakening the Worker. Time is transcended.
 */

import { FileSystemProvider } from '../fs-provider.js';
import { Terminal } from '../terminal/index.js';
import { NodeWorkerSource } from './worker-source.js';
import { State } from '../state.js';

export const NodeManager = {
    processes: new Map(),
    servers: new Map(), // port -> pid
    pendingHttpReqs: new Map(),
    nextPid: 1000,

    async spawn(entryItem, tabId) {
        const pid = this.nextPid++;
        console.log(`[NodeManager] B"H - Spawning Golem PID: ${pid}`);

        const CHUNK_SIZE = 65536;
        const controlSAB = new SharedArrayBuffer(5 * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        
        const blob = new Blob([NodeWorkerSource], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const processInfo = {
            pid,
            tabId,
            worker,
            rootItem: { ...entryItem, path: '/', name: 'Root', kind: 'directory' },
            controlView: new Int32Array(controlSAB),
            dataSAB,
            serverMap: {}, // internal serverId -> port
            ack: null
        };

        this.processes.set(pid, processInfo);

        worker.onmessage = (e) => this._handleWorkerMessage(pid, e);
        worker.onerror = (err) => {
            Terminal.printToTab(tabId, `[PID ${pid} FATAL] ${err.message}`, 'cmd-error');
        };

        // B"H - Read the entry file
        try {
            const content = await FileSystemProvider.read(entryItem);
            const code = (content instanceof Blob) ? await content.text() : String(content);

            worker.postMessage({
                type: 'init-golem',
                controlSAB,
                dataSAB,
                code,
                path: entryItem.path
            });

            Terminal.printToTab(tabId, `[Node] Process ${pid} started.`, 'cmd-success');
        } catch(e) {
            Terminal.printToTab(tabId, `[Node] Failed to load entry: ${e.message}`, 'cmd-error');
        }

        return pid;
    },

    async _handleWorkerMessage(pid, e) {
        const process = this.processes.get(pid);
        if (!process) return;

        const { type } = e.data;

        if (type === 'stdout') {
            Terminal.printToTab(process.tabId, e.data.text);
        } 
        else if (type === 'sync-read') {
            await this._handleSyncRead(process, e.data.path);
        }
        else if (type === 'ack') {
            if (process.ack) process.ack();
        }
        else if (type === 'http-listen') {
            const { port, serverId } = e.data;
            this.servers.set(String(port), pid);
            process.serverMap[port] = serverId;
            Terminal.printToTab(process.tabId, `[Node] Server listening on port ${port}`, 'cmd-info');
        }
        else if (type === 'http-outbound') {
            const { reqId, status, headers, data } = e.data;
            const resolver = this.pendingHttpReqs.get(reqId);
            if (resolver) {
                resolver({ status, headers, data });
                this.pendingHttpReqs.delete(reqId);
            }
        }
    },

    async _handleSyncRead(process, path) {
        try {
            // Absolute path resolution relative to workspace root
            let absPath = path.startsWith('/') ? path : '/' + path;
            const item = { ...process.rootItem, path: absPath, kind: 'file' };
            
            const content = await FileSystemProvider.read(item);
            const text = (content instanceof Blob) ? await content.text() : String(content);
            const bytes = new TextEncoder().encode(text);
            
            let offset = 0;
            while(offset < bytes.length) {
                const chunk = bytes.subarray(offset, offset + 65536);
                new Uint8Array(process.dataSAB).set(chunk);
                Atomics.store(process.controlView, 1, chunk.length);
                Atomics.store(process.controlView, 2, (offset + chunk.length >= bytes.length) ? 1 : 0);
                Atomics.store(process.controlView, 4, 0); // OK
                Atomics.store(process.controlView, 0, 1);
                Atomics.notify(process.controlView, 0);
                
                await new Promise(r => { process.ack = r; });
                process.ack = null;
                offset += chunk.length;
            }
        } catch(err) {
            Atomics.store(process.controlView, 4, 1); // ERROR
            Atomics.store(process.controlView, 0, 1);
            Atomics.notify(process.controlView, 0);
        }
    },

    routeHttpRequest(port, req) {
        return new Promise((resolve, reject) => {
            const pid = this.servers.get(String(port));
            if (!pid) return reject(new Error(`ECONNREFUSED: No Node server on port ${port}`));
            
            const process = this.processes.get(pid);
            if (!process) return reject(new Error("Process died"));

            const reqId = Math.random().toString(36).substr(2);
            this.pendingHttpReqs.set(reqId, resolve);
            
            process.worker.postMessage({
                type: 'http-inbound',
                reqId,
                serverId: process.serverMap[port],
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body
            });
        });
    }
};
