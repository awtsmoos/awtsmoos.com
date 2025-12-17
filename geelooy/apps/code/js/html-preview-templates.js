
// B"H
// FILE: js/html-preview-templates.js

export const SHIM_SCRIPT = /*js*/`
    (function() {
        // B"H - Double Buffering Shim (Main Thread)
        // Only active for standard canvases, ignored for transferred OffscreenCanvases
        const _getContext = HTMLCanvasElement.prototype.getContext;
        const _rAF = window.requestAnimationFrame;
        const canvasMap = new WeakMap();

        HTMLCanvasElement.prototype.getContext = function(type, options) {
            if (type !== '2d') return _getContext.call(this, type, options);
            const realCtx = _getContext.call(this, type, options);
            if (!this.isConnected) return realCtx;
            
            const offscreen = document.createElement('canvas');
            offscreen.width = this.width; 
            offscreen.height = this.height;
            const offCtx = _getContext.call(offscreen, '2d');
            canvasMap.set(this, { offscreen, offCtx, realCtx });
            return new Proxy(offCtx, {
                get(t, p) { 
                    if (p === 'canvas') return realCtx.canvas;
                    const val = t[p];
                    if (typeof val === 'function') return val.bind(t);
                    return val;
                },
                set(t, p, v) { 
                    if (p === 'width' || p === 'height') {
                        offscreen[p] = v;
                        realCtx.canvas[p] = v;
                    }
                    t[p] = v; return true; 
                }
            });
        };

        window.requestAnimationFrame = function(cb) {
            const canvases = document.getElementsByTagName('canvas');
            for(let cvs of canvases) {
                try {
                    const data = canvasMap.get(cvs);
                    if(data && cvs.width > 0 && cvs.height > 0) {
                        const { offscreen, realCtx } = data;
                        if(offscreen.width !== cvs.width) offscreen.width = cvs.width;
                        if(offscreen.height !== cvs.height) offscreen.height = cvs.height;
                        realCtx.clearRect(0, 0, cvs.width, cvs.height);
                        realCtx.drawImage(offscreen, 0, 0);
                    }
                } catch(e) {}
            }
            return _rAF(cb);
        };
    })();
`;

export const getNetworkInterceptorScript = (workspaceId, referrerPath) => /*js*/`
    (function() {
        console.log('B"H - Network Interceptor Active');
        const WORKSPACE_ID = ${JSON.stringify(workspaceId)};
        const REFERRER = ${JSON.stringify(referrerPath)};
        
        function resolvePath(relPath) {
            if (!relPath || relPath.startsWith('http') || relPath.startsWith('data:') || relPath.startsWith('blob:')) return null;
            if (relPath.startsWith('/')) return relPath;
            const basePath = REFERRER.substring(0, REFERRER.lastIndexOf('/'));
            const stack = basePath ? basePath.split('/').filter(p => p) : [];
            const parts = relPath.split('/');
            for (const p of parts) {
                if (p === '..') stack.pop();
                else if (p !== '.') stack.push(p);
            }
            return '/' + stack.join('/');
        }

        window._resolvePath = resolvePath; 

        function fetchFromParent(path) {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).slice(2);
                const handler = (e) => {
                    if (e.data.type === 'import-response' && e.data.id === id) {
                        window.removeEventListener('message', handler);
                        if (e.data.error) reject(new Error(e.data.error));
                        else resolve(e.data.content);
                    }
                };
                window.addEventListener('message', handler);
                window.parent.postMessage({
                    source: 'html-preview-bridge',
                    type: 'import-request',
                    specifier: path,
                    referrer: REFERRER,
                    workspaceId: WORKSPACE_ID,
                    id: id
                }, '*');
            });
        }
        window._fetchFromParent = fetchFromParent; 

        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            const absPath = resolvePath(url);
            if (absPath) {
                try {
                    const content = await fetchFromParent(absPath);
                    let type = 'text/plain';
                    if (absPath.endsWith('.json')) type = 'application/json';
                    if (absPath.endsWith('.png')) type = 'image/png';
                    if (absPath.endsWith('.js')) type = 'application/javascript';
                    return new Response(content, { status: 200, headers: { 'Content-Type': type } });
                } catch(e) {
                    return new Response(null, { status: 404, statusText: e.message });
                }
            }
            return originalFetch(input, init);
        };
    })();
`;

// B"H - Host Worker Body
const HOST_WORKER_BODY = `
// B"H - Merkava Host Worker
self.MERKAVA_OVERRIDE_BASE_PATH = '__SDK_BASE__';
// B"H - Cache Busting for SDK
importScripts('__SDK_URL__?t=' + Date.now());

// B"H - Polyfill requestAnimationFrame
if (!self.requestAnimationFrame) {
    self.requestAnimationFrame = (cb) => {
        return setTimeout(() => {
            try {
                cb(performance.now());
            } catch(e) {
                console.error("[HostWorker] rAF Callback Failed:", e);
            }
        }, 16);
    };
}
if (!self.cancelAnimationFrame) {
    self.cancelAnimationFrame = (id) => clearTimeout(id);
}

let vmInstance = null;
let isDriving = false;
let messageQueue = []; 
let bufferingStartTime = Date.now();
// B"H - Increased Timeout to 60s
const BUFFER_TIMEOUT = 60000; 

// B"H - Drive VM Loop
const driveVM = () => {
    if (!vmInstance) return;
    if (isDriving) return;
    
    isDriving = true;
    
    const loop = () => {
        try {
            // B"H - Increased cycle count for faster startup
            const active = vmInstance.run(500000); 
            
            // B"H - Check for Crashed Threads
            if (vmInstance.threads) {
                vmInstance.threads.forEach(t => {
                    if (t.status === 'CRASHED') {
                        const err = t.stack[t.stack.length - 1]; 
                        console.error(\`[HostWorker] VM Thread \${t.id} CRASHED:\`, err);
                        t.status = 'COMPLETED'; 
                    } else if (t.status === 'COMPLETED' && t._reported !== true) {
                        t._reported = true;
                    }
                });
            }

            if (active) {
                setTimeout(loop, 0);
            } else {
                isDriving = false;
            }
        } catch (e) {
            console.error("[HostWorker] VM Crash in Loop:", e);
            isDriving = false;
        }
    };
    loop();
};

const tryHandleMessage = (e) => {
    if (!vmInstance) {
        return false;
    }

    let handler = self._userOnMessage;
    // Fallback: Check Heap if not set explicitly
    if (!handler && vmInstance.memory) {
         handler = vmInstance.memory.getGlobal('onmessage');
    }

    if (handler) {
        if (handler.type === 'CLOSURE') {
            console.log("[HostWorker] Spawning 'onmessage' thread. Payload:", e);
            // B"H - Ensure 'e' is passed as the first argument (index 0)
            // AND ensure 'this' is set correctly.
            const t = vmInstance.spawn(handler.code);
            t.currentScope = { 
                'this': vmInstance.context, 
                'arguments': [e],
                0: e 
            };
            t.currentUpvalues = handler.upvalues;
            t.environment = handler.environment || vmInstance.context;
            driveVM(); 
        } else if (typeof handler === 'function') {
            try {
                handler(e);
            } catch(err) {
                console.error("[HostWorker] Handler Function Error:", err);
            }
        }
        return true;
    }
    return false;
};

const flushMessageQueue = () => {
    // Keep trying even if vmInstance isn't ready yet, just delay loop
    if (messageQueue.length === 0) return;

    const now = Date.now();
    const isTimeout = (now - bufferingStartTime) > BUFFER_TIMEOUT;
    
    const queueSnapshot = [...messageQueue];
    
    let handledCount = 0;
    
    for (const msgEvent of queueSnapshot) {
        const handled = tryHandleMessage(msgEvent);
        if (handled) {
            const idx = messageQueue.indexOf(msgEvent);
            if (idx > -1) messageQueue.splice(idx, 1);
            handledCount++;
        } else if (isTimeout) {
            console.warn("[HostWorker] Message dropped (Timeout)");
            const idx = messageQueue.indexOf(msgEvent);
            if (idx > -1) messageQueue.splice(idx, 1);
        }
    }
    
    // B"H - If messages remain, reschedule.
    if (messageQueue.length > 0) {
        setTimeout(flushMessageQueue, 50);
    } else if (handledCount > 0) {
        console.log(\`[HostWorker] Flushed \${handledCount} messages.\`);
    }
};

self.onmessage = async (e) => {
    
    if (e.data && (e.data.type === 'INIT_VM' || e.data.type === 'FETCH_RES')) {
        if (e.data.type === 'INIT_VM') {
            bufferingStartTime = Date.now(); 
            const { userScriptPath, userCode } = e.data;
            console.log("[HostWorker] Initializing VM for:", userScriptPath);
            
            try {
                await Merkava.init();
                
                const customImportScripts = async (...urls) => {
                    if (!vmInstance) throw new Error("VM not ready");
                    for (const url of urls) {
                        console.log("[HostWorker] Requesting import:", url);
                        self.postMessage({ type: 'FETCH_REQ', path: url });
                        const content = await new Promise((resolve, reject) => {
                            const h = (ev) => {
                                if(ev.data.type === 'FETCH_RES') {
                                    if (ev.data.path === url) {
                                        self.removeEventListener('message', h);
                                        if (ev.data.error) reject(new Error(ev.data.error));
                                        else resolve(ev.data.content);
                                    }
                                }
                            };
                            self.addEventListener('message', h);
                        });
                        
                        const parser = new self.MerkavahParser(content);
                        if(parser.registerStatementParsers) parser.registerStatementParsers(); 
                        if(parser.registerExpressionParsers) parser.registerExpressionParsers();
                        if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();
                        const compiler = new self.MerkavaCompiler.Compiler();
                        const codeObj = compiler.compile(parser.parse());
                        
                        const thread = vmInstance.spawn(codeObj);
                        
                        await new Promise((resolve, reject) => {
                            const check = () => {
                                if(thread.status === 'COMPLETED') resolve();
                                else if(thread.status === 'CRASHED') {
                                    const err = thread.stack.length > 0 ? thread.stack[thread.stack.length - 1] : "Unknown";
                                    console.error("[HostWorker] Import Crashed:", err);
                                    reject(new Error('Import Crashed: ' + err));
                                }
                                else setTimeout(check, 5);
                            };
                            check();
                        });
                        console.log("[HostWorker] Import completed execution:", url);
                    }
                };

                // B"H - ROBUST CONTEXT CREATION
                const env = {};
                
                // 1. Core Global Properties
                env.self = env;
                env.globalThis = env;
                env.window = env;
                
                // 2. Essential APIs (Bound)
                env.console = self.console;
                env.postMessage = self.postMessage.bind(self);
                env.importScripts = customImportScripts;
                
                // 3. Constructors & Standard Globals (Direct Reference)
                env.OffscreenCanvas = self.OffscreenCanvas;
                env.ImageBitmap = self.ImageBitmap;
                env.ImageData = self.ImageData;
                env.Math = self.Math;
                env.Date = self.Date;
                env.JSON = self.JSON;
                env.Array = self.Array;
                env.Object = self.Object;
                env.Float32Array = self.Float32Array;
                
                // 4. Async Wrapper Logic
                const asyncWrapper = (fn) => {
                    return (...args) => {
                        if (fn && fn.type === 'CLOSURE') {
                            const t = vmInstance.spawn(fn.code);
                            t.currentScope = { 'this': fn.environment, 'arguments': args };
                            args.forEach((val, idx) => t.currentScope[idx] = val);
                            t.currentUpvalues = fn.upvalues;
                            t.environment = fn.environment;
                            vmInstance.wake(); 
                        } else if (typeof fn === 'function') {
                            fn(...args);
                        }
                    };
                };

                // 5. Override Timers
                env.setTimeout = (fn, delay) => self.setTimeout(asyncWrapper(fn), delay);
                env.setInterval = (fn, delay) => self.setInterval(asyncWrapper(fn), delay);
                env.clearTimeout = self.clearTimeout.bind(self);
                env.clearInterval = self.clearInterval.bind(self);
                env.requestAnimationFrame = (fn) => self.requestAnimationFrame(asyncWrapper(fn));
                env.cancelAnimationFrame = self.cancelAnimationFrame.bind(self);

                // 6. Capture 'onmessage' setter
                Object.defineProperty(env, 'onmessage', {
                    get: () => self._userOnMessage,
                    set: (fn) => {
                        console.log("[HostWorker] User code set 'onmessage'. Triggering Flush.");
                        self._userOnMessage = fn;
                        // B"H - CRITICAL FIX: Immediately flush queue when handler is set
                        setTimeout(flushMessageQueue, 0);
                    },
                    configurable: true,
                    enumerable: true
                });

                const result = await Merkava.run(userCode, {
                    context: env,
                    hostAPI: { 0: (...args) => console.log('[WorkerVM]', ...args) }
                });
                
                vmInstance = result.vm;
                vmInstance.wake = () => driveVM();
                
                driveVM();
                setTimeout(flushMessageQueue, 0);

            } catch (e) {
                console.error("[HostWorker] Initialization Failed:", e);
            }
        }
        return;
    }

    // --- User Message Handling ---
    let vmEvent;
    
    // B"H - Direct passthrough
    if (e.data && e.data.type === 'init') {
        vmEvent = { data: e.data };
    } else {
        vmEvent = { data: e.data };
    }
    
    const handled = tryHandleMessage(vmEvent);
    if (!handled) {
        messageQueue.push(vmEvent);
        if (vmInstance) setTimeout(flushMessageQueue, 50);
    }
};
`;

export const getWorkerInterceptorScript = (workspaceId, referrerPath, sdkPath) => {
    const absoluteSdkUrl = sdkPath;
    const absoluteSdkBase = sdkPath.substring(0, sdkPath.lastIndexOf('/') + 1);

    const filledBody = HOST_WORKER_BODY
        .replace('__SDK_URL__', absoluteSdkUrl)
        .replace('__SDK_BASE__', absoluteSdkBase);

    return /*js*/`
(function() {
    if (window.hasWorkerInterceptor) return;
    window.hasWorkerInterceptor = true;
    
    const WORKSPACE_ID = ${JSON.stringify(workspaceId)};
    const HOST_SOURCE = ${JSON.stringify(filledBody)};
    
    const OriginalWorker = window.Worker;

    window.Worker = function(scriptPath, options) {
        const absPath = window._resolvePath ? window._resolvePath(scriptPath) : scriptPath;
        
        const blob = new Blob([HOST_SOURCE], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        const realWorker = new OriginalWorker(blobUrl, options);

        const fetcher = window._fetchFromParent;
        if (!fetcher) {
            console.error("Network Interceptor not initialized. Cannot fetch worker script.");
            return realWorker;
        }

        fetcher(absPath).then(code => {
            realWorker.postMessage({ type: 'INIT_VM', userScriptPath: absPath, userCode: code });
        });

        const originalPostMessage = realWorker.postMessage.bind(realWorker);
        
        realWorker.onmessage = (e) => {
            const msg = e.data;
            if (msg && msg.type === 'FETCH_REQ') {
                const resolvedImportPath = window._resolvePath ? window._resolvePath(msg.path) : msg.path;
                
                fetcher(resolvedImportPath).then(content => {
                    originalPostMessage({ type: 'FETCH_RES', path: msg.path, content });
                }).catch(err => {
                    console.error("Failed to fetch imported script:", resolvedImportPath, err);
                    originalPostMessage({ type: 'FETCH_RES', path: msg.path, error: err.message });
                });
                return;
            }
            if (proxyWorker.onmessage) proxyWorker.onmessage(e);
        };
        
        const proxyWorker = {
            postMessage: (msg, transfer) => {
                realWorker.postMessage(msg, transfer);
            },
            terminate: () => realWorker.terminate(),
            addEventListener: (type, listener) => realWorker.addEventListener(type, listener),
            removeEventListener: (type, listener) => realWorker.removeEventListener(type, listener),
            set onmessage(fn) { this._onmessage = fn; },
            get onmessage() { return this._onmessage; }
        };

        return proxyWorker;
    };
})();
`;
};

export const getBootstrapScript = (absoluteBase, SDK_PATH, userScripts, workspaceId) => /*js*/`
    (function() {
        const initMerkava = async function() {
            window.MERKAVA_OVERRIDE_BASE_PATH = ${JSON.stringify(absoluteBase)};
            const WORKSPACE_ID = ${JSON.stringify(workspaceId)}; 
            const SDK_URL = ${JSON.stringify(SDK_PATH)};
            
            // B"H - Cache Busting for Bootstrap
            const sdkBlob = await fetch(SDK_URL + '?t=' + Date.now()).then(r => r.blob());
            const sdkUrl = URL.createObjectURL(sdkBlob);
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = sdkUrl;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });

            if (!window.Merkava) return;
            await window.Merkava.init();
            
            const scripts = ${JSON.stringify(userScripts)};
            for (const script of scripts) {
                try {
                    const importResolver = async (specifier) => {
                        return new Promise((resolve, reject) => {
                            const id = Math.random().toString(36).slice(2);
                            const handler = (e) => {
                                if (e.data.type === 'import-response' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    if (e.data.error) reject(new Error(e.data.error));
                                    else resolve(e.data.content);
                                }
                            };
                            window.addEventListener('message', handler);
                            window.parent.postMessage({
                                source: 'html-preview-bridge',
                                type: 'import-request',
                                specifier: specifier,
                                referrer: script.path,
                                workspaceId: WORKSPACE_ID,
                                id: id
                            }, '*');
                        });
                    };

                    await window.Merkava.run(script.content, {
                        context: window,
                        importResolver: importResolver
                    });
                } catch(e) { console.error("Runtime Error:", e); }
            }
        };

        if (document.readyState === 'complete') initMerkava();
        else window.addEventListener('load', initMerkava);
    })();
`;