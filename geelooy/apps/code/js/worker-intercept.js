// B"H
// FILE: js/worker-intercept.js

export default /*js*/`
(function() {
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;

    console.log('[INTERCEPTOR] Initializing chunked protocol worker override.');

    const CHUNK_SIZE = 64 * 1024; // 64 KiB
    const CONTROL_INT32_COUNT = 5; // state, chunkLen, isNamePhase, isLastChunk, errorCode

    const OriginalWorker = window.Worker;
    const pendingWorkers = new Map();
    let requestIdCounter = 0;
    // This now tracks the SABs and the ACK promise resolver for each worker.
    const activeWorkers = new Map();

    // This is the central message listener for the iframe.
    window.addEventListener('message', (event) => {
        const { type, id } = event.data;

        // A worker script has been fetched and is ready to be instantiated.
        if (type === 'worker-script-response' && pendingWorkers.has(id)) {
            const { proxy, options, controlSAB, dataSAB } = pendingWorkers.get(id);
            pendingWorkers.delete(id);

            if (event.data.error) {
                if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                return;
            }

            const realWorker = new OriginalWorker(event.data.blobUrl, options);
            
            // Store the worker's context, including a placeholder for the ACK resolver.
            activeWorkers.set(realWorker, { controlSAB, dataSAB, ackResolver: null });
            realWorker.addEventListener('terminate', () => activeWorkers.delete(realWorker));
            
            // This is the UNIFIED RELAY for all messages coming FROM the worker.
            realWorker.onmessage = (workerEvent) => {
                const msg = workerEvent.data;
                if (!msg) return;

                const workerContext = activeWorkers.get(realWorker);

                if (msg.type === 'import-scripts-request') {
                    // Forward the request to the main editor, attaching the SABs.
                    msg.controlSAB = workerContext.controlSAB;
                    msg.dataSAB = workerContext.dataSAB;
                    window.parent.postMessage(msg, '*');
                } else if (msg.type === 'ack') {
                    // The worker has consumed a chunk. Resolve the main thread's wait promise.
                    if (workerContext && workerContext.ackResolver) {
                        workerContext.ackResolver();
                        workerContext.ackResolver = null;
                    }
                } else if (typeof proxy._onmessage === 'function') {
                    // Pass any other messages to the user's onmessage handler.
                    proxy._onmessage(workerEvent);
                }
            };
            
            proxy._connect(realWorker);
            // Initialize the worker with its dedicated buffers.
            realWorker.postMessage({ type: 'init-chunked-sync', controlSAB, dataSAB });
        }
    });

    window.Worker = function(path, options) {
        if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
            return new OriginalWorker(path, options);
        }

        const requestId = requestIdCounter++;
        // Create the two SABs required by the protocol for this worker instance.
        const controlSAB = new SharedArrayBuffer(CONTROL_INT32_COUNT * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        
        const proxyWorker = { /* ... proxy logic from previous examples ... */ };

        pendingWorkers.set(requestId, { proxy: proxyWorker, options, controlSAB, dataSAB });
        window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
        return proxyWorker;
    };
})();
`;