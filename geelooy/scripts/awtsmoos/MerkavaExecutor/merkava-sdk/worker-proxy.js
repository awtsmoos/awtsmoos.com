
// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    class MerkavaWorkerProxy {
        constructor(scriptUrl, parentVM, options) {
            this.scriptUrl = scriptUrl;
            this.parentVM = parentVM;
            this.options = options;
            this.nativeWorker = null;
            this.onmessage = null; 
            
            // B"H - Keep Parent VM Alive
            if (this.parentVM) {
                this.parentVM.pendingAsyncCount++;
            }

            this._init();
        }

        async _init() {
            console.log(`[WorkerProxy] Resolving script: ${this.scriptUrl}`);
            
            // 1. Resolve User Code
            let userCode = "";
            try {
                if (this.options.importResolver) {
                    const res = await this.options.importResolver(this.scriptUrl);
                    userCode = res.code || res;
                } else {
                    const resp = await fetch(this.scriptUrl);
                    userCode = await resp.text();
                }
            } catch(e) {
                console.error(`[WorkerProxy] Failed to resolve script: ${e.message}`);
            }

            // 2. Resolve Parser URL
            let parserUrl = null;
            if (typeof document !== 'undefined') {
                const scripts = document.querySelectorAll('script');
                for(let s of scripts) {
                    if (s.src && (s.src.includes('parser') || s.src.includes('MerkavaAST'))) {
                        parserUrl = s.src; 
                        break;
                    }
                }
            }
            if (!parserUrl) {
                const base = new URL(Internal.BASE_PATH, self.location.href);
                parserUrl = new URL('../MerkavaASTParser/parser-core.js', base).href;
            }

            // 3. Bootstrap
            const basePath = new URL(Internal.BASE_PATH, self.location.href).href;
            const sdkUrl = new URL('merkava-sdk.js', new URL(basePath)).href;
            
            const bootstrapCode = `
                // B"H - Inner Worker Bootstrap
                self.MERKAVA_OVERRIDE_BASE_PATH = "${basePath}";
                self.MERKAVA_PARSER_URL = "${parserUrl}";

                // 0. Shim Window (Required for Parser libraries that assume Browser env)
                self.window = self;

                // 1. Shim Document (CRITICAL for Parser Base Path Detection)
                self.document = self.document || {
                    currentScript: { src: "${parserUrl}" }, 
                    querySelectorAll: () => [],
                    createElement: () => ({ src: '' }),
                    head: { appendChild: () => {} },
                    body: { appendChild: () => {} }
                };

                // 2. Shim importScripts for Relative Dependencies
                const originalImportScripts = self.importScripts;
                const parserBase = "${parserUrl}".substring(0, "${parserUrl}".lastIndexOf('/') + 1);
                
                self.importScripts = function(...urls) {
                    const fixedUrls = urls.map(u => {
                        if (!self.MerkavahParser) {
                            if (u.startsWith('http://') && u.split('/').length === 3) {
                                const fname = u.split('/').pop();
                                return new URL(fname, parserBase).href;
                            }
                            if (u.indexOf('://') === -1) {
                                 return new URL(u, parserBase).href;
                            }
                        }
                        return u;
                    });
                    try {
                        return originalImportScripts.apply(self, fixedUrls);
                    } catch(e) {
                        console.error("[InnerWorker] importScripts failed:", fixedUrls, e);
                        throw e;
                    }
                };
                
                try {
                    importScripts("${sdkUrl}");
                } catch(e) {
                    console.error("[InnerWorker] SDK Load Failed:", e);
                }

                // 4. Initialize Inner VM
                if (typeof Merkava !== 'undefined') {
                    // B"H - Configure High RAM for Workers (500,000 objects)
                    // This prevents page faults during Minimax recursion.
                    Merkava.initWorker({ isWorker: true, ramLimit: 500000 }).then(adapter => {
                        
                        let realVM = null;
                        let msgQueue = [];
                        let isRunning = false;

                        // B"H - VM Driver: Resumes the VM loop
                        const driveVM = () => {
                            if (!realVM) return;
                            if (isRunning) return; 
                            
                            isRunning = true;
                            const loop = () => {
                                try {
                                    const active = realVM.run(1000);
                                    if (active) {
                                        setTimeout(loop, 10);
                                    } else {
                                        isRunning = false;
                                    }
                                } catch (e) {
                                    console.error("[InnerWorker] VM Crash:", e);
                                    isRunning = false;
                                }
                            };
                            loop();
                        };

                        const processQueue = () => {
                            if (!realVM) return;
                            
                            const heapHandler = realVM.memory.getGlobal('onmessage');
                            const contextHandler = realVM.context ? realVM.context.onmessage : null;
                            const handler = heapHandler || contextHandler;

                            if (!handler) {
                                if (msgQueue.length > 0) {
                                    setTimeout(processQueue, 50);
                                }
                                return;
                            }
                            
                            while (msgQueue.length > 0) {
                                const payload = msgQueue.shift();
                                
                                if (handler.type === 'CLOSURE') {
                                    const t = realVM.spawn(handler.code);
                                    t.currentScope = { 0: { data: payload } };
                                    driveVM(); 
                                } else if (typeof handler === 'function') {
                                    handler({ data: payload });
                                } else {
                                    console.warn("[InnerWorker] 'onmessage' is not a function/closure:", handler);
                                }
                            }
                        };

                        self.onmessage = function(e) {
                            const msg = e.data;
                            if (msg.type === 'EXEC_CODE') {
                                 adapter.run(msg.code).then(res => {
                                     realVM = res.vm;
                                     processQueue();
                                 }).catch(err => console.error(err));
                            } else if (msg.type === 'USER_MSG') {
                                 msgQueue.push(msg.payload);
                                 processQueue();
                            }
                        };
                        
                        self.postMessage({ type: 'READY' });
                    });
                }
            `;

            const blob = new Blob([bootstrapCode], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            this.nativeWorker = new Worker(blobUrl);

            this.nativeWorker.onmessage = (e) => {
                const msg = e.data;
                if (msg.type === 'READY') {
                    this.nativeWorker.postMessage({ type: 'EXEC_CODE', code: userCode });
                } else if (msg.type === 'USER_MSG') {
                    if (this.onmessage) {
                        if (this.onmessage.type === 'CLOSURE') {
                             const thread = this.parentVM.spawn(this.onmessage.code);
                             thread.currentScope = { 0: { data: msg.payload } }; 
                             if (this.parentVM.wake) this.parentVM.wake();
                        } else if (typeof this.onmessage === 'function') {
                             this.onmessage({ data: msg.payload });
                        }
                    }
                }
            };
        }

        postMessage(msg, transfer) {
            if (this.nativeWorker) {
                this.nativeWorker.postMessage({ type: 'USER_MSG', payload: msg }, transfer);
            } else {
                setTimeout(() => this.postMessage(msg, transfer), 50);
            }
        }

        terminate() {
            if (this.nativeWorker) {
                this.nativeWorker.terminate();
                this.nativeWorker = null;
                if (this.parentVM) this.parentVM.pendingAsyncCount--;
            }
        }
    }

    Internal.WorkerProxy = MerkavaWorkerProxy;

})(typeof self !== 'undefined' ? self : this);