// B"H
// FILE: js/worker-intercept.js

export default /*js*/`
(function() {
    // A safeguard to ensure this script doesn't run twice.
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;

    console.log('[INTERCEPTOR] Initializing as the FOOLPROOF CHUNKING COORDINATOR.');

    const CHUNK_SIZE = 64 * 1024;
    const CONTROL_INT32_COUNT = 5;

    const OriginalWorker = window.Worker;
    const pendingWorkers = new Map();
    let parentRequestIdCounter = 0;
    const pendingParentRequests = new Map();

    // This Map stores the full context (SABs, ack resolver) for each live worker.
    const activeWorkers = new Map();

    // Utility to send data (name or content) to a worker in chunks.
    async function sendChunks(bytes, isNamePhase, controlView, dataBytes, workerContext) {
        console.log(\`[INTERCEPTOR] Coordinator starting to send \${isNamePhase ? 'NAME' : 'CONTENT'} chunks.\`);
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

            // Wait for the worker to send back an 'ack' message.
            await new Promise(resolve => { workerContext.ackResolver = resolve; });
            workerContext.ackResolver = null; // Clear resolver after use
            
            offset += chunkLen;
        }
    }
    
    // This is the central message listener for the iframe.
    window.addEventListener('message', async (event) => {
        const { type, id } = event.data;

        // --- Part 1: Handling responses FROM the main editor ---
        if (type === 'worker-script-response' && pendingWorkers.has(id)) {
            const { proxy, options, controlSAB, dataSAB } = pendingWorkers.get(id);
            pendingWorkers.delete(id);

            if (event.data.error) {
                console.error('[INTERCEPTOR] Editor failed to load worker script:', event.data.error);
                if (typeof proxy.onerror === 'function') {
                    proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                }
                return;
            }

            const realWorker = new OriginalWorker(event.data.blobUrl, options);
            
            // Store the full context for this live worker instance.
            activeWorkers.set(realWorker, { controlSAB, dataSAB, ackResolver: null });
            realWorker.addEventListener('terminate', () => activeWorkers.delete(realWorker));
            
            // This is the UNIFIED RELAY for all messages coming FROM the worker.
            realWorker.onmessage = async (workerEvent) => {
                const msg = workerEvent.data;
                if (!msg) return;

                const workerContext = activeWorkers.get(realWorker);
                if (!workerContext) return;

                if (msg.type === 'import-scripts-request') {
                    // --- THE COORDINATOR LOGIC ---
                    try {
                        const parentRequestId = parentRequestIdCounter++;
                        
                        console.log(\`[INTERCEPTOR] Worker wants '\${msg.path}'. Asking parent editor for content...\`);
                        // 1. Ask the parent for the script content (simple async request).
                        const contentPromise = new Promise((resolve, reject) => {
                            pendingParentRequests.set(parentRequestId, { resolve, reject });
                        });
                        window.parent.postMessage({ type: 'fetch-script-content', path: msg.path, basePath: msg.basePath, id: parentRequestId }, '*');

                        const content = await contentPromise;

                        // 2. We have the content. Now start the chunking protocol with the worker.
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
                        Atomics.store(controlView, 4, 1); // errorCode
                        Atomics.store(controlView, 3, 1); // isLastChunk
                        Atomics.store(controlView, 0, 1); // state
                        Atomics.notify(controlView, 0);
                    }

                } else if (msg.type === 'ack') {
                    // The worker has consumed a chunk. Resolve the pending promise in sendChunks.
                    if (workerContext.ackResolver) {
                        workerContext.ackResolver();
                    }
                } else if (typeof proxy._onmessage === 'function') {
                    // Pass any other messages on to the user's onmessage handler.
                    proxy._onmessage(workerEvent);
                }
            };
            
            proxy._connect(realWorker);
            realWorker.postMessage({ type: 'init-chunked-sync', controlSAB, dataSAB });
        }
        // This handles the script CONTENT response from the main editor.
        else if (type === 'script-content-response' && pendingParentRequests.has(id)) {
            const { resolve, reject } = pendingParentRequests.get(id);
            pendingParentRequests.delete(id);
            if (event.data.error) {
                reject(new Error(event.data.error));
            } else {
                resolve(event.data.content);
            }
        }
    });

    // --- FULL PROXY WORKER IMPLEMENTATION ---
    window.Worker = function(path, options) {
        if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
            return new OriginalWorker(path, options);
        }

        const requestId = parentRequestIdCounter++; // Use the same counter for uniqueness
        
        const controlSAB = new SharedArrayBuffer(CONTROL_INT32_COUNT * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        
        const proxyWorker = {
            _realWorker: null,
            _messageQueue: [],
            _onmessage: null,
            _onerror: null,

            _connect: function(real) {
                this._realWorker = real;
                // The unified onmessage handler is already set on the real worker.
                // We just need to set onerror and drain the message queue.
                if (this._onerror) {
                    this._realWorker.onerror = this._onerror;
                }
                this._messageQueue.forEach(msg => this._realWorker.postMessage(...msg));
                this._messageQueue = [];
            },

            postMessage: function(...args) {
                if (this._realWorker) {
                    this._realWorker.postMessage(...args);
                } else {
                    this._messageQueue.push(args);
                }
            },

            terminate: function() {
                if (this._realWorker) {
                    this._realWorker.terminate();
                }
            },

            get onmessage() {
                return this._onmessage;
            },
            set onmessage(handler) {
                this._onmessage = handler;
                // We don't set this on the real worker directly because our unified
                // handler needs to intercept messages first.
            },

            get onerror() {
                return this._onerror;
            },
            set onerror(handler) {
                this._onerror = handler;
                if (this._realWorker) {
                    this._realWorker.onerror = handler;
                }
            }
        };

        pendingWorkers.set(requestId, { proxy: proxyWorker, options, controlSAB, dataSAB });
        
        // Ask the main editor for the top-level worker script.
        window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
        
        return proxyWorker;
    };
})();
`;