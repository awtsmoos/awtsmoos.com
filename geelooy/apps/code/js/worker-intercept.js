// B"H
// FILE: js/worker-intercept.js

export default /*js*/`
(function() {
    // A safeguard to ensure this script doesn't run twice.
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;

    console.log('[INTERCEPTOR] Initializing worker override.');
    const OriginalWorker = window.Worker;
    const pendingWorkers = new Map();
    let requestIdCounter = 0;
    // This Map is critical. It associates a live worker instance with its unique signal buffer.
    const activeWorkers = new Map();

    // This listener handles all communication between the main editor and the workers.
    window.addEventListener('message', (event) => {
        const { type, id } = event.data;

        // Part 1: A worker script has been fetched and is ready to be created.
        if (type === 'worker-script-response' && pendingWorkers.has(id)) {
            const { proxy, options, signalSAB } = pendingWorkers.get(id);
            pendingWorkers.delete(id);

            if (event.data.error) {
                console.error('[INTERCEPTOR] Editor failed to load worker script:', event.data.error);
                // Propagate the error to the worker's onerror handler.
                if (typeof proxy.onerror === 'function') {
                    proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                }
                return;
            }

            const realWorker = new OriginalWorker(event.data.blobUrl, options);
            
            // Associate the live worker with its signal buffer. This is crucial for relaying requests.
            activeWorkers.set(realWorker, signalSAB);
            realWorker.addEventListener('terminate', () => {
                console.log('[INTERCEPTOR] A worker was terminated.');
                activeWorkers.delete(realWorker);
            });
            
            // Part 2: RELAY messages FROM the worker TO the main editor window.
            realWorker.addEventListener('message', (workerEvent) => {
                // If this is a request for a script, we must attach the signal buffer
                // so the editor knows which worker to notify when it's done.
                if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                    const signalForThisWorker = activeWorkers.get(realWorker);
                    if (signalForThisWorker) {
                        workerEvent.data.signalSAB = signalForThisWorker;
                        window.parent.postMessage(workerEvent.data, '*');
                    } else {
                        console.error("[INTERCEPTOR] Critical: Could not find signalSAB for an active worker!");
                    }
                } else {
                    // For any other message, you might want to just let the worker's onmessage handle it.
                    // This is handled by the proxy's _connect method.
                }
            });
            
            // Connect the proxy to the real worker, delivering any queued messages.
            proxy._connect(realWorker);
            // Send the worker its unique signal buffer so it knows how to wait.
            realWorker.postMessage({ type: 'init-sync', signalSAB });
        }
        
        // Part 3: RELAY responses FOR script content FROM the editor TO all workers.
        if (type === 'import-scripts-response') {
            // Broadcast the response. The correct worker (the one currently waiting)
            // will process it in its 'message' handler.
            for (const worker of activeWorkers.keys()) {
                worker.postMessage(event.data);
            }
        }
    });

    // This is the core of the interception.
    window.Worker = function(path, options) {
        // Don't intercept absolute URLs or blobs, as they are not part of the virtual file system.
        if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
            return new OriginalWorker(path, options);
        }

        console.log(\`[INTERCEPTOR] Intercepting new Worker(path).\`, path);
        const requestId = requestIdCounter++;
        // Create the persistent SIGNAL buffer. It's only 4 bytes and is used for notifications.
        const signalSAB = new SharedArrayBuffer(4); 
        
        // A proxy worker is returned immediately so the user's code doesn't hang.
        // It queues messages until the real worker is ready.
        const proxyWorker = {
            _realWorker: null, _messageQueue: [], _onmessage: null, _onerror: null,
            _connect: function(real) {
                this._realWorker = real;
                this._realWorker.onmessage = this._onmessage;
                this._realWorker.onerror = this._onerror;
                this._messageQueue.forEach(msg => this._realWorker.postMessage(...msg));
                this._messageQueue = [];
            },
            postMessage: function(...args) {
                if (this._realWorker) { this._realWorker.postMessage(...args); } 
                else { this._messageQueue.push(args); }
            },
            terminate: function() { if (this._realWorker) this._realWorker.terminate(); },
            get onmessage() { return this._onmessage; },
            set onmessage(handler) {
                this._onmessage = handler;
                if (this._realWorker) this._realWorker.onmessage = handler;
            },
            get onerror() { return this._onerror; },
            set onerror(handler) {
                this._onerror = handler;
                if (this._realWorker) this._realWorker.onerror = handler;
            }
        };

        // Store the proxy and its signal buffer, waiting for the script content.
        pendingWorkers.set(requestId, { proxy: proxyWorker, options, signalSAB });
        // Request the worker's main script from the editor.
        window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
        return proxyWorker;
    };
})();
`;