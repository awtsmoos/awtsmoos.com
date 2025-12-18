
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
            
            // B"H - Message Queue for Async Init
            this.messageQueue = [];
            this.isReady = false;
            
            // B"H - Keep Parent VM Alive
            if (this.parentVM) {
                this.parentVM.pendingAsyncCount++;
            }

            this._init();
        }

        async _init() {
            // 1. Resolve User Code
            let userCode = "";
            try {
                if (this.options.importResolver) {
                    const res = await this.options.importResolver(this.scriptUrl);
                    if (res) userCode = res.code || res;
                    else if (!res &&(this.scriptUrl.startsWith('blob:') || this.scriptUrl.startsWith('http'))) {
                         const resp = await fetch(this.scriptUrl);
                         userCode = await resp.text();
                    }
                    else throw new Error("ImportResolver returned null");
                } else {
                    const resp = await fetch(this.scriptUrl);
                    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
                    userCode = await resp.text();
                }
            } catch(e) {
                console.error(`[WorkerProxy] Failed to resolve script '${this.scriptUrl}': ${e.message}`);
                this.terminate();
                return;
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

            // 3. Bootstrap via Module
            const basePath = new URL(Internal.BASE_PATH, self.location.href).href;
            const sdkUrl = new URL('merkava-sdk.js', new URL(basePath)).href;
            
            // B"H - Use the separated Bootstrap Module
            if (!Internal.WorkerBootstrap) {
                console.error("[WorkerProxy] Critical: WorkerBootstrap module not loaded.");
                this.terminate();
                return;
            }
            
            const bootstrapCode = Internal.WorkerBootstrap.generate(basePath, parserUrl, sdkUrl);

            const blob = new Blob([bootstrapCode], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            this.nativeWorker = new Worker(blobUrl);

            this.nativeWorker.onmessage = async (e) => {
                const msg = e.data;
                if (msg.type === 'READY') {
                    this.isReady = true;
                    this.nativeWorker.postMessage({ type: 'EXEC_CODE', code: userCode });
                    
                    // B"H - Flush Queue
                    while (this.messageQueue.length > 0) {
                        const { msg, transfer } = this.messageQueue.shift();
                        this.nativeWorker.postMessage({ type: 'USER_MSG', payload: msg }, transfer);
                    }
                    
                } else if (msg.type === 'USER_MSG') {
                    if (this.onmessage) {
                        if (this.onmessage.type === 'CLOSURE') {
                             const thread = this.parentVM.spawn(this.onmessage.code);
                             // Restore parent state
                             thread.currentUpvalues = this.onmessage.upvalues;
                             thread.environment = this.onmessage.environment || thread.environment;
                             
                             thread.currentScope = { 
                                 'this': this.parentVM.context,
                                 'arguments': [{ data: msg.payload }],
                                 0: { data: msg.payload } 
                             }; 
                             if (this.parentVM.wake) this.parentVM.wake();
                        } else if (typeof this.onmessage === 'function') {
                             this.onmessage({ data: msg.payload });
                        }
                    }
                    if (this.listeners && this.listeners['message']) {
                        this.listeners['message'].forEach(cb => {
                            if (typeof cb === 'function') cb({ data: msg.payload });
                        });
                    }
                } else if (msg.type === 'SYSCALL') {
                    if (this.parentVM.hostAPI && this.parentVM.hostAPI[0]) {
                        this.parentVM.hostAPI[0]("[WorkerProxy]", ...msg.args);
                    } else {
                        console.log("[WorkerProxy Forward]", ...msg.args);
                    }
                } else if (msg.type === 'RESOLVE_FILE') {
                    if (this.options.importResolver) {
                        try {
                            const res = await this.options.importResolver(msg.url);
                            const code = res && res.code ? res.code : (typeof res === 'string' ? res : null);
                            this.nativeWorker.postMessage({ 
                                type: 'RESOLVE_FILE_RESULT', 
                                id: msg.id, 
                                found: !!code, 
                                code: code 
                            });
                        } catch(err) {
                             this.nativeWorker.postMessage({ type: 'RESOLVE_FILE_RESULT', id: msg.id, found: false });
                        }
                    } else {
                        this.nativeWorker.postMessage({ type: 'RESOLVE_FILE_RESULT', id: msg.id, found: false });
                    }
                } else if (msg.type === 'ERROR') {
                    console.error("[WorkerProxy] Inner Error:", msg.payload);
                    if (this.parentVM.hostAPI && this.parentVM.hostAPI[0]) {
                        this.parentVM.hostAPI[0]("[WorkerProxy Error]", msg.payload);
                    }
                    this.terminate(); 
                }
            };
            
            this.nativeWorker.onerror = (e) => {
                console.error("[WorkerProxy] Native Error:", e.message);
                if (this.parentVM.hostAPI && this.parentVM.hostAPI[0]) {
                    this.parentVM.hostAPI[0]("[WorkerProxy Native Error]", e.message);
                }
                this.terminate();
            };
        }
        
        addEventListener(type, callback) {
            if (!this.listeners) this.listeners = {};
            if (!this.listeners[type]) this.listeners[type] = [];
            this.listeners[type].push(callback);
        }

        postMessage(msg, transfer) {
            if (this.nativeWorker && this.isReady) {
                this.nativeWorker.postMessage({ type: 'USER_MSG', payload: msg }, transfer);
            } else {
                // B"H - Queue message for reliable delivery
                this.messageQueue.push({ msg, transfer });
            }
        }

        terminate() {
            if (this.nativeWorker) {
                this.nativeWorker.terminate();
                this.nativeWorker = null;
                this.isReady = false;
                if (this.parentVM && this.parentVM.pendingAsyncCount > 0) {
                    this.parentVM.pendingAsyncCount--;
                }
            }
        }
    }

    Internal.WorkerProxy = MerkavaWorkerProxy;

})(typeof self !== 'undefined' ? self : this);
