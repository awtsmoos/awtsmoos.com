// B"H
// FILE: js/worker-intercept.js

export default /*js*/`
(function() {
    // A safeguard to ensure this script doesn't run twice.
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;

    console.log('[INTERCEPTOR] Initializing as the FINAL, INTELLIGENT CHUNKING COORDINATOR.');

    const CHUNK_SIZE = 64 * 1024;
    const CONTROL_INT32_COUNT = 5;

    const OriginalWorker = window.Worker;
    const pendingWorkers = new Map();
    let parentRequestIdCounter = 0;
    const pendingParentRequests = new Map();
    const activeWorkers = new Map();

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
            await new Promise(resolve => { workerContext.ackResolver = resolve; });
            workerContext.ackResolver = null;
            offset += chunkLen;
        }
    }
    
    window.addEventListener('message', async (event) => {
        const { type, id } = event.data;

        if (type === 'worker-script-response' && pendingWorkers.has(id)) {
            const { proxy, options, controlSAB, dataSAB } = pendingWorkers.get(id);
            pendingWorkers.delete(id);

            if (event.data.error) {
                if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                return;
            }

            const realWorker = new OriginalWorker(event.data.blobUrl, options);
            activeWorkers.set(realWorker, { controlSAB, dataSAB, ackResolver: null });
            realWorker.addEventListener('terminate', () => activeWorkers.delete(realWorker));
            
            realWorker.onmessage = async (workerEvent) => {
                const msg = workerEvent.data;
                if (!msg) return;

                const workerContext = activeWorkers.get(realWorker);
                if (!workerContext) return;

                if (msg.type === 'import-scripts-request') {
                    try {
                        const parentRequestId = parentRequestIdCounter++;
                        const contentPromise = new Promise((resolve, reject) => {
                            pendingParentRequests.set(parentRequestId, { resolve, reject });
                        });
                        window.parent.postMessage({ type: 'fetch-script-content', path: msg.path, basePath: msg.basePath, id: parentRequestId }, '*');
                        const content = await contentPromise;
                        const controlView = new Int32Array(workerContext.controlSAB);
                        const dataBytes = new Uint8Array(workerContext.dataSAB);
                        const encoder = new TextEncoder();
                        const nameBytes = encoder.encode(msg.path);
                        const scriptBytes = encoder.encode(content);
                        await sendChunks(nameBytes, true, controlView, dataBytes, workerContext);
                        await sendChunks(scriptBytes, false, controlView, dataBytes, workerContext);
                    } catch (err) {
                        console.error(\`[INTERCEPTOR] Error during coordination for \${msg.path}:\`, err);
                        const controlView = new Int32Array(workerContext.controlSAB);
                        Atomics.store(controlView, 4, 1);
                        Atomics.store(controlView, 3, 1);
                        Atomics.store(controlView, 0, 1);
                        Atomics.notify(controlView, 0);
                    }
                } else if (msg.type === 'ack') {
                    if (workerContext.ackResolver) workerContext.ackResolver();
                } else if (typeof proxy._onmessage === 'function') {
                    proxy._onmessage(workerEvent);
                }
            };
            
            proxy._connect(realWorker);
            realWorker.postMessage({ type: 'init-chunked-sync', controlSAB, dataSAB });
        }
        else if (type === 'script-content-response' && pendingParentRequests.has(id)) {
            const { resolve, reject } = pendingParentRequests.get(id);
            pendingParentRequests.delete(id);
            if (event.data.error) reject(new Error(event.data.error));
            else resolve(event.data.content);
        }
    });

    window.Worker = function(path, options) {
        // --- THE ABSOLUTE FIX ---
        // If the path is already a blob URL or any other absolute URL, DO NOT INTERCEPT IT.
        // Let the browser's native Worker constructor handle it directly. This prevents
        // the "404 Not Found" error for blobs created by other scripts.
        if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
            console.log(\`[INTERCEPTOR] Passing through non-relative path: \${path}\`);
            return new OriginalWorker(path, options);
        }

        const requestId = parentRequestIdCounter++;
        const controlSAB = new SharedArrayBuffer(CONTROL_INT32_COUNT * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        
        const proxyWorker = {
            _realWorker: null, _messageQueue: [], _onmessage: null, _onerror: null,
            _connect: function(real) {
                this._realWorker = real;
                if (this._onerror) real.onerror = this._onerror;
                this._messageQueue.forEach(msg => real.postMessage(...msg));
                this._messageQueue = [];
            },
            postMessage: function(...args) {
                if (this._realWorker) this._realWorker.postMessage(...args);
                else this._messageQueue.push(args);
            },
            terminate: function() { if (this._realWorker) this._realWorker.terminate(); },
            get onmessage() { return this._onmessage; },
            set onmessage(handler) { this._onmessage = handler; },
            get onerror() { return this._onerror; },
            set onerror(handler) { this._onerror = handler; if(this._realWorker) this._realWorker.onerror = handler; }
        };

        pendingWorkers.set(requestId, { proxy: proxyWorker, options, controlSAB, dataSAB });
        window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
        return proxyWorker;
    };
})();
`;