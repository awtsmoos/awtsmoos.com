//B"H
//worker-intercept.js
export default /*js*/`
    (function() {
        const OriginalWorker = window.Worker;
        const pendingWorkers = new Map();
        let requestIdCounter = 0;
        // Map now stores the signal SAB for each active worker
        let activeWorkers = new Map(); 

        window.addEventListener('message', (event) => {
            const { type, id } = event.data;
            
            if (type === 'worker-script-response' && pendingWorkers.has(id)) {
                // Destructure signalSAB from the pending worker data
                const { proxy, options, signalSAB } = pendingWorkers.get(id);
                pendingWorkers.delete(id);

                if (event.data.error) {
                    console.error('Editor failed to load worker script:', event.data.error);
                    if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                    return;
                }
                const realWorker = new OriginalWorker(event.data.blobUrl, options);
                
                // Associate the real worker with its specific signal SharedArrayBuffer
                activeWorkers.set(realWorker, signalSAB);
                
                realWorker.addEventListener('terminate', () => { activeWorkers.delete(realWorker); });
                
                // --- B"H: CRITICAL RELAY LOGIC ---
                realWorker.addEventListener('message', (workerEvent) => {
                    // Check if this is a request that needs the signal SAB attached
                    if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                        // Find the correct signalSAB and attach it to the outgoing message
                        const signalForThisWorker = activeWorkers.get(realWorker);
                        if (signalForThisWorker) {
                            workerEvent.data.signalSAB = signalForThisWorker;
                            window.parent.postMessage(workerEvent.data, '*');
                        } else {
                            console.error("Interceptor: Could not find signalSAB for an active worker!");
                        }
                    }
                    // For other messages, you might want to relay them too, if applicable.
                });
                
                proxy._connect(realWorker);
                // Send the signalSAB to the worker for initialization
                realWorker.postMessage({ type: 'init-sync', signalSAB });
            }
            
            if (type === 'import-scripts-response') {
                // This response contains the contentSAB. Broadcast it to all workers.
                // The correct worker will be the one currently in an Atomics.wait state.
                // While it's waiting, its message handler CAN still process this message.
                for (const worker of activeWorkers.keys()) {
                    worker.postMessage(event.data);
                }
            }
        });

        window.Worker = function(path, options) {
            if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
                return new OriginalWorker(path, options);
            }
            const requestId = requestIdCounter++;
            // This SAB is now ONLY for notifications/signals.
            const signalSAB = new SharedArrayBuffer(4); 
            
            const proxyWorker = {
                _realWorker: null, _messageQueue: [], _onmessage: null, _onerror: null,
                _connect: function(real) {
                    this._realWorker = real;
                    real.onmessage = this._onmessage;
                    real.onerror = this._onerror;
                    this._messageQueue.forEach(msg => real.postMessage(...msg));
                    this._messageQueue = [];
                },
                postMessage: function(...args) {
                    if (this._realWorker) { this._realWorker.postMessage(...args); } 
                    else { this._messageQueue.push(args); }
                },
                terminate: function() { if (this._realWorker) this._realWorker.terminate(); },
            };
            Object.defineProperty(proxyWorker, 'onmessage', { get: () => proxyWorker._onmessage, set: (h) => { proxyWorker._onmessage = h; if(proxyWorker._realWorker) proxyWorker._realWorker.onmessage = h; } });
            Object.defineProperty(proxyWorker, 'onerror', { get: () => proxyWorker._onerror, set: (h) => { proxyWorker._onerror = h; if(proxyWorker._realWorker) proxyWorker._realWorker.onerror = h; } });

            // Store the signalSAB with the pending worker info
            pendingWorkers.set(requestId, { proxy: proxyWorker, options, signalSAB });
            window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
            return proxyWorker;
        };
    })();
`;