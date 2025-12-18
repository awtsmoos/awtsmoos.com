
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
                
                // B"H - Safe Serializer to prevent DataCloneError on Transferables (Canvas, etc.)
                const safeSerialize = (arg) => {
                    if (typeof arg === 'object' && arg !== null) {
                        // Check for OffscreenCanvas
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
                    logToParent('sys', 'Requesting Import:', url, id);
                    return new Promise((resolve) => {
                        pendingResolves.set(id, resolve);
                        self.postMessage({ type: 'RESOLVE_FILE', id: id, url: url });
                    });
                };

                // Load SDK
                try {
                    logToParent('sys', 'Loading SDK from:', "${sdkUrl}");
                    importScripts("${sdkUrl}");
                    logToParent('sys', 'SDK Loaded.');
                } catch(e) {
                    logToParent('err', 'SDK Load Failed:', e.message);
                    self.postMessage({ type: 'ERROR', payload: "SDK Load Failed: " + e.message });
                }

                if (typeof Merkava !== 'undefined') {
                    logToParent('sys', 'Initializing Merkava Worker Env...');
                    Merkava.initWorker({ 
                        isWorker: true, 
                        ramLimit: 500000,
                        importResolver: bridgedImportResolver
                    }).then(adapter => {
                        logToParent('sys', 'Merkava Worker Env Ready.');
                        
                        let realVM = null;
                        let msgQueue = [];
                        let isRunning = false;

                        const driveVM = () => {
                            if (!realVM) return;
                            if (isRunning) return; 
                            isRunning = true;
                            const loop = () => {
                                try {
                                    const active = realVM.run(100);
                                    if (active) setTimeout(loop, 10);
                                    else isRunning = false;
                                } catch (e) {
                                    console.error("[InnerWorker] VM Crash:", e);
                                    isRunning = false;
                                }
                            };
                            loop();
                        };

                        const processQueue = () => {
                            if (!realVM) return;
                            
                            // B"H - CRITICAL: Handler Detection
                            // We need to find the USER'S onmessage handler.
                            // 1. Check Global Memory (Highest Priority - StoreGlobal Opcode writes here)
                            // 2. Check Context Proxy (Fallback)
                            
                            let handler = null;
                            if (realVM.memory.getGlobal) {
                                handler = realVM.memory.getGlobal('onmessage');
                            }
                            
                            if (!handler && realVM.context) {
                                handler = realVM.context.onmessage;
                                
                                // B"H - SYSTEM PROTECTION
                                // If the handler found via Context Proxy is strictly equal to the
                                // System Bootstrap Router (self.onmessage), it means the user hasn't 
                                // assigned their own handler yet (or the Proxy fell through to Native).
                                // We MUST ignore this to prevent the system from cannibalizing the message.
                                if (handler === self.onmessage) {
                                    // logToParent('sys', 'Queue Waiting: Handler is System Router.');
                                    handler = null;
                                }
                            }

                            if (!handler) {
                                if (msgQueue.length > 0) {
                                    setTimeout(processQueue, 50);
                                }
                                return;
                            }
                            
                            while (msgQueue.length > 0) {
                                const payload = msgQueue.shift();
                                logToParent('sys', 'Processing Message (Payload Safe):', payload);

                                if (handler.type === 'CLOSURE') {
                                    const t = realVM.spawn(handler.code);
                                    // B"H - Restore Closure State
                                    t.currentUpvalues = handler.upvalues;
                                    t.environment = handler.environment || t.environment;
                                    
                                    // Set Arguments
                                    t.currentScope = { 
                                        'this': realVM.context,
                                        'arguments': [{ data: payload }],
                                        0: { data: payload }
                                    };
                                    
                                    logToParent('sys', 'Spawning Handler Thread.');
                                    driveVM(); 
                                } else if (typeof handler === 'function') {
                                    logToParent('sys', 'Invoking Native Handler.');
                                    try {
                                        handler({ data: payload });
                                    } catch(e) {
                                        logToParent('err', 'Native Handler Failed:', e.message);
                                    }
                                }
                            }
                        };
                        
                        if (realVM && !realVM.wake) {
                             realVM.wake = () => {
                                 if (!isRunning) driveVM();
                             };
                        }

                        self.onmessage = function(e) {
                            const msg = e.data;
                            if (msg.type === 'EXEC_CODE') {
                                 logToParent('sys', 'Executing User Code...');
                                 const runOptions = {
                                     context: self,
                                     importResolver: bridgedImportResolver,
                                     hostAPI: {
                                         0: (...args) => {
                                             self.postMessage({ type: 'SYSCALL', args });
                                         }
                                     }
                                 };
                                 adapter.run(msg.code, runOptions).then(res => {
                                     logToParent('sys', 'User Code Compiled & Running.');
                                     realVM = res.vm;
                                     realVM.wake = () => { if (!isRunning) driveVM(); };
                                     processQueue();
                                 }).catch(err => {
                                     logToParent('err', 'Run Failed:', err.message);
                                     self.postMessage({ type: 'ERROR', payload: err.message });
                                 });
                            } else if (msg.type === 'USER_MSG') {
                                 logToParent('sys', 'Received USER_MSG (Safe)', msg.payload);
                                 msgQueue.push(msg.payload);
                                 processQueue();
                            } else if (msg.type === 'RESOLVE_FILE_RESULT') {
                                logToParent('sys', 'File Resolved:', msg.id, msg.found);
                                const resolve = pendingResolves.get(msg.id);
                                if (resolve) {
                                    resolve(msg.found ? { code: msg.code } : null);
                                    pendingResolves.delete(msg.id);
                                }
                            }
                        };
                        
                        self.postMessage({ type: 'READY' });
                    }).catch(err => {
                        logToParent('err', 'Init Failed:', err.message);
                        self.postMessage({ type: 'ERROR', payload: "Init Failed: " + err.message });
                    });
                } else {
                    logToParent('err', 'Merkava Global Missing');
                    self.postMessage({ type: 'ERROR', payload: "Merkava SDK Missing" });
                }
            `;
        }
    };
})(typeof self !== 'undefined' ? self : this);
