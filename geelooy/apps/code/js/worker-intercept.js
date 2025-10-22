// B"H
// FILE: js/worker-intercept.js

export default /*js*/`
(function() {
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;

    console.log('[INTERCEPTOR] Initializing chunked protocol worker override.');

    const CHUNK_SIZE = 64 * 1024;
    const CONTROL_INT32_COUNT = 5;

    const OriginalWorker = window.Worker;
    const pendingWorkers = new Map();
    let requestIdCounter = 0;

    // This listener only handles messages FROM the editor TO the iframe.
    window.addEventListener('message', (event) => {
        const { type, id } = event.data;

        if (type === 'worker-script-response' && pendingWorkers.has(id)) {
            const { proxy, options, controlSAB, dataSAB } = pendingWorkers.get(id);
            pendingWorkers.delete(id);

            if (event.data.error) {
                if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                return;
            }

            const realWorker = new OriginalWorker(event.data.blobUrl, options);
            
            // This is the UNIFIED RELAY for all messages coming FROM the worker.
            realWorker.onmessage = (workerEvent) => {
                const msg = workerEvent.data;
                if (!msg) return;

                // If it's a request or an ack, forward it to the main editor window.
                if (msg.type === 'import-scripts-request' || msg.type === 'ack') {
                    window.parent.postMessage(msg, '*');
                } 
                // Any other message is for the user's code.
                else if (typeof proxy._onmessage === 'function') {
                    proxy._onmessage(workerEvent);
                }
            };
            
            proxy._connect(realWorker);
            realWorker.postMessage({ type: 'init-chunked-sync', controlSAB, dataSAB });
        }
    });

    window.Worker = function(path, options) {
        if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
            return new OriginalWorker(path, options);
        }

        const requestId = requestIdCounter++;
        const controlSAB = new SharedArrayBuffer(CONTROL_INT32_COUNT * 4);
        const dataSAB = new SharedArrayBuffer(CHUNK_SIZE);
        
        const proxyWorker = {
            _realWorker: null, _messageQueue: [], _onmessage: null, _onerror: null,
            _connect: function(real) {
                this._realWorker = real;
                // The unified onmessage handler is set above.
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