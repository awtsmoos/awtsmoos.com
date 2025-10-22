// B"H
// FILE: js/worker-intercept.js

export default /*js*/`
(function() {
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;

    console.log('[INTERCEPTOR] Initializing worker override.');
    const OriginalWorker = window.Worker;
    const pendingWorkers = new Map();
    let requestIdCounter = 0;
    const activeWorkers = new Map();

    window.addEventListener('message', (event) => {
        const { type, id } = event.data;

        if (type === 'worker-script-response' && pendingWorkers.has(id)) {
            const { proxy, options, signalSAB } = pendingWorkers.get(id);
            pendingWorkers.delete(id);

            if (event.data.error) {
                if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                return;
            }

            const realWorker = new OriginalWorker(event.data.blobUrl, options);
            activeWorkers.set(realWorker, signalSAB);
            realWorker.addEventListener('terminate', () => activeWorkers.delete(realWorker));
            
            realWorker.addEventListener('message', (workerEvent) => {
                if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                    const signalForThisWorker = activeWorkers.get(realWorker);
                    workerEvent.data.signalSAB = signalForThisWorker;
                    window.parent.postMessage(workerEvent.data, '*');
                }
            });
            
            proxy._connect(realWorker);
            realWorker.postMessage({ type: 'init-sync', signalSAB });
        }
        
        if (type === 'import-scripts-response') {
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
            get onmessage() { return this._onmessage; },
            set onmessage(handler) { this._onmessage = handler; if(this._realWorker) this._realWorker.onmessage = handler; },
            get onerror() { return this._onerror; },
            set onerror(handler) { this._onerror = handler; if(this._realWorker) this._realWorker.onerror = handler; }
        };

        pendingWorkers.set(requestId, { proxy: proxyWorker, options, signalSAB });
        window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
        return proxyWorker;
    };
})();
`;