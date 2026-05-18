// B\"H
/**
 * @file manager.js
 * @brief Manages browser Node virtual machine workers.
 */

import { FileSystemProvider } from '../fs-provider.js';
import { Terminal } from '../terminal/index.js';
import { NodeWorkerSource } from './worker-source.js';
import { NodeCoreModules } from './core-modules/index.js';
import { SyncIpcHandler } from './sync-ipc.js';
import { NodeNetworkRouter } from './network-router.js';

export const NodeManager = {
    processes: new Map(),
    servers: new Map(),
    pendingHttpReqs: new Map(),
    wsConnections: new Map(),
    nextPid: 1000,

    async spawn(entryItem, tabId, options = {}) {
        const pid = this.nextPid++;
        const controlSAB = new SharedArrayBuffer(20);
        const dataSAB = new SharedArrayBuffer(65536);
        const workerCode = NodeWorkerSource(NodeCoreModules);
        const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(workerBlob));

        const processInfo = {
            pid,
            tabId,
            worker,
            rootItem: { ...entryItem, path: '/', name: 'Root', kind: 'directory' },
            controlView: new Int32Array(controlSAB),
            dataSAB,
            serverMap: {},
            ack: null,
            logs: [],
            capture: null,
            silentTerminal: !!options.silentTerminal
        };

        this.processes.set(pid, processInfo);
        worker.onmessage = e => this._handleWorkerMessage(pid, e);

        try {
            const content = await FileSystemProvider.read(entryItem);
            const source = content instanceof Blob ? await content.text() : String(content);
            worker.postMessage({
                type: 'init-golem',
                controlSAB,
                dataSAB,
                code: source,
                path: entryItem.path
            });
            this._print(processInfo, `[Node] Golem ${pid} awakened.`, 'cmd-success');
        } catch (e) {
            this._print(processInfo, `[Node] Failed to load: ${e.message}`, 'cmd-error');
            this._finalizeCapture(processInfo, {
                status: 'load-error',
                code: 1,
                error: e.message
            });
        }

        return pid;
    },

    async _handleWorkerMessage(pid, e) {
        const process = this.processes.get(pid);
        if (!process) return;

        const d = e.data || {};
        const handlers = {
            stdout: () => {
                process.logs.push(d.text);
                this._print(process, d.text);
            },
            ack: () => process.ack?.(),
            'net-listen': () => {
                this._print(process, NodeNetworkRouter.onListen(this, process, d), 'cmd-info');
            },
            'http-outbound': () => NodeNetworkRouter.onHttpOutbound(this, d),
            'ws-server-send': () => this._postWs(d.id, 'ws-message', { data: d.data }),
            'ws-server-close': () => {
                this._postWs(d.id, 'ws-close');
                this.wsConnections.delete(d.id);
            },
            'process-complete': () => this._finishWorker(process, d, 'complete'),
            'process-exit': () => this._finishWorker(process, d, 'exit')
        };

        if (d.type?.startsWith('sync-')) {
            await SyncIpcHandler.handleOp(process, d);
            return;
        }

        handlers[d.type]?.();
    },

    _finishWorker(process, d, status) {
        this._finalizeCapture(process, {
            status,
            code: d.code ?? 0,
            error: d.error || null
        });
    },

    _print(process, text, cls) {
        if (!process?.silentTerminal) Terminal.printToTab(process.tabId, text, cls);
    },

    _postWs(id, type, extra = {}) {
        const conn = this.wsConnections.get(id);
        conn?.sourceWindow?.postMessage({ source: 'parent', type, id, ...extra }, '*');
    },

    _finalizeCapture(process, meta) {
        if (!process?.capture) return;
        clearTimeout(process.capture.timer);
        const resolve = process.capture.resolve;
        process.capture = null;
        resolve({ pid: process.pid, ...meta, logs: [...process.logs] });
    },

    async executeForReport(entryItem, tabId, timeoutMs = 10000) {
        const pid = await this.spawn(entryItem, tabId, { silentTerminal: true });
        const process = this.processes.get(pid);
        if (!process) return `[Node Simulator] Failed to start ${entryItem.path}`;

        const outcome = await new Promise(resolve => {
            process.capture = {
                resolve,
                timer: setTimeout(() => {
                    process.capture = null;
                    resolve({
                        pid,
                        status: 'timeout',
                        code: null,
                        error: `Timed out after ${timeoutMs}ms`,
                        logs: [...process.logs]
                    });
                }, timeoutMs)
            };
        });

        return [
            `B\"H - NODE SIMULATION REPORT FOR ${entryItem.path}`,
            `Status: ${outcome.status}`,
            outcome.code !== null ? `Exit Code: ${outcome.code}` : null,
            outcome.error ? `Error: ${outcome.error}` : null,
            '',
            'Console Output:',
            outcome.logs.length > 0 ? outcome.logs.join('\n') : 'No console output.'
        ].filter(Boolean).join('\n');
    },

    routeHttpRequest(port, req) {
        return NodeNetworkRouter.routeHttp(this, port, req);
    },

    routeWsRequest(port, req) {
        return NodeNetworkRouter.routeWsOpen(this, port, req);
    },

    routeWsData(id, data) {
        return NodeNetworkRouter.routeWsData(this, id, data);
    },

    routeWsClose(id) {
        return NodeNetworkRouter.routeWsClose(this, id);
    }
};
