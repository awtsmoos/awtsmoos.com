
// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    Internal.WorkerBootstrap = {
        generate: (basePath, parserUrl, sdkUrl) => {
            return `
                // B"H - Inner Worker Bootstrap
                self.MERKAVA_OVERRIDE_BASE_PATH = "${basePath}";
                self.MERKAVA_PARSER_URL = "${parserUrl}";

                self.window = self;
                self.document = self.document || {
                    currentScript: { src: "${parserUrl}" }, 
                    querySelectorAll: () => [],
                    createElement: () => ({ src: '' }),
                    head: { appendChild: () => {} },
                    body: { appendChild: () => {} }
                };
                
                // --- SYSCALL BRIDGE (EARLY) ---
                
                // B"H - Safe Serializer to prevent DataCloneError on Transferables
                const safeSerialize = (arg) => {
                    if (typeof arg === 'object' && arg !== null) {
                        if (arg[Symbol.toStringTag] === 'OffscreenCanvas' || (arg.getContext && arg.transferToImageBitmap)) {
                            return '[OffscreenCanvas]';
                        }
                        if (arg instanceof ArrayBuffer) return '[ArrayBuffer]';
                        if (arg instanceof MessagePort) return '[MessagePort]';
                        
                        try {
                            const str = JSON.stringify(arg);
                            if (str.length > 500) return '[Object (Large)]';
                            return JSON.parse(str);
                        } catch(e) {
                            return '[Complex Object]';
                        }
                    }
                    return arg;
                };

                const logToParent = (level, ...args) => {
                    const safeArgs = args.map(safeSerialize);
                    self.postMessage({ type: 'SYSCALL', args: ['['+level.toUpperCase()+']', ...safeArgs] });
                };
                self.console = {
                    log: (...args) => logToParent('log', ...args),
                    warn: (...args) => logToParent('warn', ...args),
                    error: (...args) => logToParent('err', ...args),
                    info: (...args) => logToParent('info', ...args)
                };
                
                logToParent('sys', 'Worker Bootstrap Started.');

                // Polyfill RAF
                if (!self.requestAnimationFrame) {
                    self.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
                    self.cancelAnimationFrame = (id) => clearTimeout(id);
                }

                // Import Resolver Bridge
                const pendingResolves = new Map();
                const bridgedImportResolver = async (url) => {
                    const id = Math.random().toString(36).substr(2);
                    return new Promise((resolve) => {
                        pendingResolves.set(id, resolve);
                        self.postMessage({ type: 'RESOLVE_FILE', id: id, url: url });
                    });
                };

                // Load SDK
                try {
                    importScripts("${sdkUrl}");
                } catch(e) {
                    logToParent('err', 'SDK Load Failed:', e.message);
                    self.postMessage({ type: 'ERROR', payload: "SDK Load Failed: " + e.message });
                }

                if (typeof Merkava !== 'undefined') {
                    Merkava.initWorker({ 
                        isWorker: true, 
                        ramLimit: 500000,
                        importResolver: bridgedImportResolver
                    }).then(adapter => {
                        let realVM = null;
                        let msgQueue = [];
                        let isRunning = false;

                        const driveVM = () => {
                            if (!realVM || isRunning) return; 
                            isRunning = true;
                            
                            const pulse = () => {
                                try {
                                    // B"H - Full power cycle surge
                                    const active = realVM.run(60000); 
                                    if (active) {
                                        if (self.requestAnimationFrame) requestAnimationFrame(pulse);
                                        else setTimeout(pulse, 0);
                                    } else {
                                        isRunning = false;
                                    }
                                } catch (e) {
                                    console.error("[InnerWorker] VM Pulse Shattered:", e);
                                    isRunning = false;
                                }
                            };
                            
                            if (self.requestAnimationFrame) requestAnimationFrame(pulse);
                            else pulse();
                        };

                        const processQueue = () => {
                            // B"H - Resilient Queue: Wait for the VM to ignite
                            if (!realVM) {
                                if (msgQueue.length > 0) setTimeout(processQueue, 100);
                                return;
                            }
                            
                            let handler = null;
                            if (realVM.memory.getGlobal) {
                                handler = realVM.memory.getGlobal('onmessage');
                            }
                            
                            if (!handler && realVM.context) {
                                handler = realVM.context.onmessage;
                            }

                            if (!handler) {
                                if (msgQueue.length > 0) setTimeout(processQueue, 100);
                                return;
                            }
                            
                            while (msgQueue.length > 0) {
                                const payload = msgQueue.shift();
                                if (handler.type === 'CLOSURE') {
                                    const t = realVM.spawn(handler.code);
                                    t.currentUpvalues = handler.upvalues;
                                    t.environment = handler.environment || t.environment;
                                    t.currentScope = { 
                                        'this': realVM.context,
                                        'arguments': [{ data: payload }],
                                        0: { data: payload }
                                    };
                                    driveVM(); 
                                } else if (typeof handler === 'function') {
                                    try { handler({ data: payload }); } catch(e) {}
                                }
                            }
                        };
                        
                        self.onmessage = function(e) {
                            const msg = e.data;
                            if (msg.type === 'EXEC_CODE') {
                                 const runOptions = {
                                     context: self,
                                     importResolver: bridgedImportResolver,
                                     hostAPI: { 0: (...args) => self.postMessage({ type: 'SYSCALL', args }) }
                                 };
                                 adapter.run(msg.code, runOptions).then(res => {
                                     realVM = res.vm;
                                     realVM.wake = () => driveVM();
                                     processQueue();
                                 });
                            } else if (msg.type === 'USER_MSG') {
                                 msgQueue.push(msg.payload);
                                 processQueue();
                            } else if (msg.type === 'RESOLVE_FILE_RESULT') {
                                const resolve = pendingResolves.get(msg.id);
                                if (resolve) {
                                    resolve(msg.found ? { code: msg.code } : null);
                                    pendingResolves.delete(msg.id);
                                }
                            }
                        };
                        
                        self.postMessage({ type: 'READY' });
                    });
                }
            `;
        }
    };
})(typeof self !== 'undefined' ? self : this);
