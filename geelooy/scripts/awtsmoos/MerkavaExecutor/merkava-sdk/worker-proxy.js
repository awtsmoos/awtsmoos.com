// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    class MerkavaWorkerProxy {
        constructor(scriptUrl, parentVM, options) {
            this.scriptUrl = scriptUrl;
            this.parentVM = parentVM;
            this.options = options;
            this.nativeWorker = null;
            this.onmessage = null; // Set by user code in VM: w.onmessage = ...

            this._init();
        }

        async _init() {
            console.log(`[WorkerProxy] Resolving script: ${this.scriptUrl}`);
            
            // 1. Resolve the User's Worker Script Code
            let userCode = "";
            try {
                if (this.options.importResolver) {
                    const res = await this.options.importResolver(this.scriptUrl);
                    userCode = res.code || res;
                } else {
                    // Fallback fetch
                    const resp = await fetch(this.scriptUrl);
                    userCode = await resp.text();
                }
            } catch(e) {
                console.error(`[WorkerProxy] Failed to resolve script: ${e.message}`);
            }

            // 2. Locate Dependencies (Parser, etc)
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
                // If not found in DOM, assume standard relative structure
                parserUrl = new URL('../MerkavaASTParser/parser-core.js', new URL(Internal.BASE_PATH, self.location.href)).href;
            }

            // 3. Create the Bootstrap Code for the Native Worker
            const basePath = Internal.BASE_PATH;
            const sdkUrl = new URL('merkava-sdk.js', new URL(basePath, self.location.href)).href;
            
            // B"H - Worker Bootstrap Script
            // We inject logic to fix 'importScripts' so the Parser can load its siblings correctly inside a Blob.
            const bootstrapCode = `
                // B"H - Inner Worker Bootstrap
                self.MERKAVA_OVERRIDE_BASE_PATH = "${basePath}";
                self.MERKAVA_PARSER_URL = "${parserUrl}";

                // 1. Shim Document (for Parser checks)
                self.document = self.document || {
                    currentScript: null,
                    querySelectorAll: () => [],
                    createElement: () => ({ src: '' }),
                    head: { appendChild: () => {} },
                    body: { appendChild: () => {} }
                };

                // 2. Shim importScripts to handle Parser Dependencies
                // The Parser library often tries to load sibling files (e.g. 'constants.js') via importScripts.
                // In a Blob Worker, relative paths fail. We redirect them to the Parser's directory.
                const originalImportScripts = self.importScripts;
                const parserBase = self.MERKAVA_PARSER_URL.substring(0, self.MERKAVA_PARSER_URL.lastIndexOf('/') + 1);
                
                self.importScripts = function(...urls) {
                    const fixedUrls = urls.map(u => {
                        // If simple filename or relative path, assume it belongs to Parser if Parser isn't loaded yet
                        if ((u.indexOf('/') === -1 || u.startsWith('./')) && !self.MerkavahParser) {
                             return new URL(u, parserBase).href;
                        }
                        return u;
                    });
                    try {
                        return originalImportScripts.apply(self, fixedUrls);
                    } catch(e) {
                        console.error("[InnerWorker] importScripts failed:", e);
                        throw e;
                    }
                };
                
                const SDK_URL = "${sdkUrl}";
                console.log("[InnerWorker] Booting from:", SDK_URL);
                
                // 3. Load SDK
                importScripts(SDK_URL);

                // 4. Initialize the Inner VM
                Merkava.initWorker({
                    isWorker: true
                }).then(vm => {
                    // Message Handler for Native Worker
                    self.onmessage = function(e) {
                        const msg = e.data;
                        if (msg.type === 'EXEC_CODE') {
                             console.log("[InnerWorker] Compiling & Running User Script...");
                             vm.run(msg.code).catch(err => console.error(err));
                        } else if (msg.type === 'USER_MSG') {
                             // Dispatch to the VM's "self.onmessage" if it exists
                             if (vm.context.onmessage) {
                                 vm.context.onmessage({ data: msg.payload });
                             }
                        }
                    };

                    // Bridge: VM -> Main Thread
                    vm.context.postMessage = function(payload) {
                        self.postMessage({ type: 'USER_MSG', payload: payload });
                    };
                    
                    // Signal Ready
                    self.postMessage({ type: 'READY' });
                });
            `;

            const blob = new Blob([bootstrapCode], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);

            this.nativeWorker = new Worker(blobUrl);

            // 4. Handle Messages from Native Worker
            this.nativeWorker.onmessage = (e) => {
                const msg = e.data;
                if (msg.type === 'READY') {
                    // Worker is ready, send the user code to execute
                    this.nativeWorker.postMessage({ type: 'EXEC_CODE', code: userCode });
                } else if (msg.type === 'USER_MSG') {
                    // Dispatch to the VM's "w.onmessage" listener
                    if (this.onmessage) {
                        // We must spawn a thread in the PARENT VM to handle the callback
                        // because 'onmessage' is a function/closure in the PARENT VM.
                        
                        if (this.onmessage.type === 'CLOSURE') {
                             // Closure logic: spawn thread
                             const thread = this.parentVM.spawn(this.onmessage.code);
                             thread.currentScope = { 0: { data: msg.payload } }; // Arg 0 is event
                        } else if (typeof this.onmessage === 'function') {
                             // Native JS function (if context allows)
                             this.onmessage({ data: msg.payload });
                        }
                    }
                }
            };
        }

        postMessage(msg) {
            if (this.nativeWorker) {
                this.nativeWorker.postMessage({ type: 'USER_MSG', payload: msg });
            } else {
                setTimeout(() => this.postMessage(msg), 50);
            }
        }

        terminate() {
            if (this.nativeWorker) this.nativeWorker.terminate();
        }
    }

    Internal.WorkerProxy = MerkavaWorkerProxy;

})(typeof self !== 'undefined' ? self : this);