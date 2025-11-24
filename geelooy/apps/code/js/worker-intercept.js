// B"H
// FILE: js/worker-intercept.js

export default /*js*/`
(function() {
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;

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
            Atomics.store(controlView, 4, 0); // No error
            Atomics.store(controlView, 0, 1);
            Atomics.notify(controlView, 0);
            await new Promise(resolve => { workerContext.ackResolver = resolve; });
            workerContext.ackResolver = null;
            offset += chunkLen;
        }
    }

    // --- NEW: Robust Error Signaling Function ---
    function signalErrorToWorker(workerContext) {
        console.error('[INTERCEPTOR] Signaling error to worker.');
        const controlView = new Int32Array(workerContext.controlSAB);
        Atomics.store(controlView, 4, 1); // Set the error code
        Atomics.store(controlView, 3, 1); // Mark as last chunk
        Atomics.store(controlView, 0, 1);
        Atomics.notify(controlView, 0);
    }
    
    window.addEventListener('message', async (event) => {
        const { type, id } = event.data;

        if (type === 'worker-script-response' && pendingWorkers.has(id)) {
            const { proxy, options, controlSAB, dataSAB } = pendingWorkers.get(id);
            pendingWorkers.delete(id);

            // This handles if the TOP-LEVEL worker script doesn't exist.
            if (event.data.error) {
                console.error(\`[INTERCEPTOR] Failed to load initial worker script: \${event.data.error}\`);
                if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                return;
            }

            const realWorker = new OriginalWorker(event.data.blobUrl, options);
            const workerContext = { controlSAB, dataSAB, ackResolver: null };
            activeWorkers.set(realWorker, workerContext);
            realWorker.addEventListener('terminate', () => activeWorkers.delete(realWorker));
            
            realWorker.onmessage = (workerEvent) => {
                const msg = workerEvent.data;
                if (!msg) return;

                if (msg.type === 'import-scripts-request') {
                    const parentRequestId = parentRequestIdCounter++;
                    pendingParentRequests.set(parentRequestId, realWorker); // Store the worker to reply to
                    window.parent.postMessage({ type: 'fetch-script-content', path: msg.path, basePath: msg.basePath, id: parentRequestId }, '*');
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
            const realWorker = pendingParentRequests.get(id);
            const workerContext = activeWorkers.get(realWorker);
            pendingParentRequests.delete(id);

            if (!workerContext) return; // Worker was terminated

            if (event.data.error) {
                // This handles if an IMPORTED script doesn't exist.
                signalErrorToWorker(workerContext);
            } else {
                const controlView = new Int32Array(workerContext.controlSAB);
                const dataBytes = new Uint8Array(workerContext.dataSAB);
                const encoder = new TextEncoder();
                const nameBytes = encoder.encode(event.data.path || ''); // Path might not be available on error
                const scriptBytes = encoder.encode(event.data.content);
                
                // Use a self-invoking async function to handle the sequential sending
                (async () => {
                    try {
                        await sendChunks(nameBytes, true, controlView, dataBytes, workerContext);
                        await sendChunks(scriptBytes, false, controlView, dataBytes, workerContext);
                    } catch (e) {
                         console.error('[INTERCEPTOR] Error during chunk sending:', e);
                    }
                })();
            }
        }
    });

    window.Worker = function(path, options) {
        if (/^(?:[a-z]+:|blob:)/.test(path)) {
            return new OriginalWorker(path, options);
        }
        const requestId = parentRequestIdCounter++;
        const controlSAB = new SharedArrayBuffer(CONTROL_INT32_COUNT * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        const proxyWorker = {
            _realWorker: null, _messageQueue: [], _onmessage: null, _onerror: null,
            _connect: function(real) { this._realWorker = real; if (this._onerror) real.onerror = this._onerror; this._messageQueue.forEach(msg => real.postMessage(...msg)); this._messageQueue = []; },
            postMessage: function(...args) { if (this._realWorker) this._realWorker.postMessage(...args); else this._messageQueue.push(args); },
            terminate: function() { if (this._realWorker) this._realWorker.terminate(); },
            get onmessage() { return this._onmessage; }, set onmessage(handler) { this._onmessage = handler; },
            get onerror() { return this._onerror; }, set onerror(handler) { this._onerror = handler; if(this._realWorker) this._realWorker.onerror = handler; }
        };
        pendingWorkers.set(requestId, { proxy: proxyWorker, options, controlSAB, dataSAB });
        window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
        return proxyWorker;
    };
})();
`;