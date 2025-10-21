//B"H
//worker-intercept.js
export default /*js*/`
    (function() {
        const OriginalWorker = window.Worker;
        const pendingWorkers = new Map();
        let requestIdCounter = 0;
        let activeWorkers = new Map(); // Use a Map to associate worker with its SAB

        window.addEventListener('message', (event) => {
            const { type, id } = event.data;
            console. log("i got more important stuff", event. data)
            if (type === 'worker-script-response' && pendingWorkers.has(id)) {
                const { proxy, options, sab } = pendingWorkers.get(id);
                pendingWorkers.delete(id);
                if (event.data.error) {
                    console.error('Editor failed to load worker script:', event.data.error);
                    if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                    return;
                }
                const realWorker = new OriginalWorker(event.data.blobUrl, options);
                
                // Associate the real worker with its specific SharedArrayBuffer
                activeWorkers.set(realWorker, sab);
                
                realWorker.addEventListener('terminate', () => { activeWorkers.delete(realWorker); });
                
                // This is the relay: messages from the worker go up to the editor
                realWorker.addEventListener('message', (workerEvent) => {
                   console. log("bruh what even are you",workerEvent)
                    if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                        // Attach the correct SAB to the outgoing message
                        workerEvent.data.sab = activeWorkers.get(realWorker);
                        window.parent.postMessage(workerEvent.data, '*');
                    }
                });
                
                proxy._connect(realWorker);
                realWorker.postMessage({ type: 'init-sync', sab });
            }
            // This is the relay: responses for importScripts go down to the workers
            if (type === 'import-scripts-response') {
                // Broadcast to all workers; the correct one will pick it up based on its internal cache
                for (const worker of activeWorkers.keys()) {
                    console. log("poisting", event. data)
                    worker.postMessage(event.data);
                }
            }
        });

        window.Worker = function(path, options) {
            if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
                return new OriginalWorker(path, options);
            }
            const requestId = requestIdCounter++;
            const sab = new SharedArrayBuffer(4);
            
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

            pendingWorkers.set(requestId, { proxy: proxyWorker, options, sab });
            window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
            return proxyWorker;
        };
    })();
`;