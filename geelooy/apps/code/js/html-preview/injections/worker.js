
// B"H
/**
 * @file worker.js
 * @brief The Interceptor of Background Souls (Web Workers).
 */

import { importScriptsHack } from '../worker-hacks.js';

export const WorkerInterceptor = `
    // B"H - Safeguarding against literal closing tags ending the injected script
    const hackStr = ${JSON.stringify(importScriptsHack).replace(/<\//g, '<\\/')};
    const OrigWorker = window.Worker;
    const activeWorkers = new Map();
    let reqId = 0;
    const CHUNK_SIZE = 64 * 1024;

    async function sendChunks(bytes, isNamePhase, controlView, dataBytes, workerContext) {
        const total = bytes.length;
        let offset = 0;
        while (offset < total) {
            const chunkLen = Math.min(total - offset, CHUNK_SIZE);
            dataBytes.set(bytes.subarray(offset, offset + chunkLen), 0);
            Atomics.store(controlView, 1, chunkLen);
            Atomics.store(controlView, 2, isNamePhase ? 1 : 0);
            Atomics.store(controlView, 3, ((offset + chunkLen) >= total) ? 1 : 0);
            Atomics.store(controlView, 4, 0); 
            Atomics.store(controlView, 0, 1);
            Atomics.notify(controlView, 0);
            await new Promise(r => { workerContext.ackResolver = r; });
            workerContext.ackResolver = null;
            offset += chunkLen;
        }
    }

    window.addEventListener('message', e => {
        const d = e.data;
        if (!d || d.source !== 'parent') return;

        if (d.type === 'worker-script-response') {
            const workerContext = activeWorkers.get(d.id);
            if (!workerContext) return;
            if (d.error) {
                if (workerContext.proxy.onerror) workerContext.proxy.onerror(new ErrorEvent('error', { message: d.error }));
                return;
            }

            const finalCode = hackStr + "\\n" + d.content;
            const blobUrl = URL.createObjectURL(new Blob([finalCode], { type: 'application/javascript' }));
            
            const realWorker = new OrigWorker(blobUrl, workerContext.options);
            workerContext.realWorker = realWorker;

            realWorker.addEventListener('message', we => {
                const m = we.data;
                if (!m) return;
                if (m.type === 'import-scripts-request') {
                    window.parent.postMessage({ source: 'html-preview-bridge', type: 'fetch-script-content', path: m.path, id: d.id, referrer: window._AWTSMOOS_REF, workspaceId: window._AWTSMOOS_WID }, '*');
                } else if (m.type === 'ack') {
                    if (workerContext.ackResolver) workerContext.ackResolver();
                } else if (workerContext.proxy.onmessage) {
                    workerContext.proxy.onmessage(we);
                }
            });

            realWorker.addEventListener('error', err => {
                if (workerContext.proxy.onerror) workerContext.proxy.onerror(err);
            });

            workerContext.proxy._connect(realWorker);
            realWorker.postMessage({ type: 'init-chunked-sync', controlSAB: workerContext.controlSAB, dataSAB: workerContext.dataSAB });
        } 
        else if (d.type === 'script-content-response') {
            const workerContext = activeWorkers.get(d.id);
            if (!workerContext) return;

            if (d.error) {
                const controlView = new Int32Array(workerContext.controlSAB);
                Atomics.store(controlView, 4, 1);
                Atomics.store(controlView, 3, 1);
                Atomics.store(controlView, 0, 1);
                Atomics.notify(controlView, 0);
            } else {
                const controlView = new Int32Array(workerContext.controlSAB);
                const dataBytes = new Uint8Array(workerContext.dataSAB);
                const enc = new TextEncoder();
                const nameBytes = enc.encode(d.path || '');
                const scriptBytes = enc.encode(d.content || '');

                (async () => {
                    try {
                        await sendChunks(nameBytes, true, controlView, dataBytes, workerContext);
                        await sendChunks(scriptBytes, false, controlView, dataBytes, workerContext);
                    } catch(err) { console.error('[Simulation] Chunk err:', err); }
                })();
            }
        }
    });

    window.Worker = function(path, options) {
        if (path.startsWith('blob:') || path.startsWith('http')) return new OrigWorker(path, options);

        const absPath = window._resolvePath ? window._resolvePath(path) : path;

        const id = 'w_' + reqId++;
        const controlSAB = new SharedArrayBuffer(5 * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        
        const proxy = {
            _real: null, _queue:[], onmessage: null, onerror: null,
            _connect(r) { this._real = r; this._queue.forEach(m => r.postMessage(...m)); this._queue =[]; },
            postMessage(...args) { if (this._real) this._real.postMessage(...args); else this._queue.push(args); },
            terminate() { if (this._real) this._real.terminate(); }
        };

        activeWorkers.set(id, { proxy, options, controlSAB, dataSAB });
        window.parent.postMessage({ source: 'html-preview-bridge', type: 'fetch-worker-script', path: absPath, id, referrer: window._AWTSMOOS_REF, workspaceId: window._AWTSMOOS_WID }, '*');
        
        return proxy;
    };
`;
