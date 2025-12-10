// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.Merkava = factory();
}(typeof self !== 'undefined' ? self : this, function() {

    let BASE_PATH = './'; 
    try {
        if (typeof document !== 'undefined' && document.currentScript) {
            BASE_PATH = document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf('/') + 1);
        }
    } catch(e) {}

    const PARSER_PATH = '../MerkavaASTParser/parser-core.js';

    // B"H - Updated Load Order with Split Visitors and Polyfills
    const MODULES = [
        'merkava-opcodes.js',
        'merkava-memory/adapter.js',
        'merkava-memory/index.js',
        'merkava-vm/polyfills.js', // B"H - Load Polyfills
        'merkava-vm/instructions.js', 
        'merkava-vm/index.js',
        'merkava-vm/thread.js',
        'merkava-compiler/scope.js',
        'merkava-compiler/builder.js',
        // Visitors
        'merkava-compiler/visitors/declarations.js',
        'merkava-compiler/visitors/expressions.js',
        'merkava-compiler/visitors/statements.js',
        'merkava-compiler/visitors/literals.js',
        'merkava-compiler/index.js',
        'merkava-debugger.js'
    ];

    const resolveUrl = (path) => {
        try { return new URL(path, new URL(BASE_PATH, self.location.href)).href; } 
        catch (e) { return path; }
    };

    const loadScript = (filename) => {
        return new Promise((resolve, reject) => {
            const url = resolveUrl(filename) + "?t=" + Date.now();
            if (typeof importScripts === 'function') {
                try { importScripts(url); resolve(); } catch (e) { reject(e); }
            } else {
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load ${url}`));
                document.head.appendChild(script);
            }
        });
    };

    class MerkavaSDK {
        constructor() { this.isReady = false; }
        
        async init() {
            if (this.isReady) return;
            
            // 1. Load Internal Modules
            for (const mod of MODULES) await loadScript(mod);
            
            // 2. Load Parser if not present
            if (!self.MerkavahParser) {
                await loadScript(PARSER_PATH);
                if (self.MerkavahParserPromise) {
                    self.MerkavahParser = await self.MerkavahParserPromise;
                }
            }
            
            if (!self.MerkavahParser) throw new Error("MerkavahParser failed to initialize.");
            
            this.isReady = true;
        }

        async run(source, options = {}) {
            if (!this.isReady) await this.init();
            
            const Parser = self.MerkavahParser;
            const parser = new Parser(source);
            
            if(parser.registerExpressionParsers) parser.registerExpressionParsers();
            if(parser.registerStatementParsers) parser.registerStatementParsers();
            if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();

            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error(parser.errors.join('\n'));

            const compiler = new self.MerkavaCompiler.Compiler();
            const codeObject = compiler.compile(ast);
            const memory = new self.MerkavaMemory.MemoryManager(options.ramLimit || 1000);
            await memory.init();
            
            if(!memory.setGlobal) {
                memory._g = {};
                memory.setGlobal = (k,v) => memory._g[k] = v;
                memory.getGlobal = (k) => memory._g[k];
            }
            
            if (memory.nextPtr === 1) memory.allocate({});

            // B"H - Capture VM instance for Workers
            let activeVM = null;

            // B"H - Enhanced VM Worker Simulation
            class MerkavaWorker {
                constructor(scriptUrl) {
                    console.log(`[VM] Spawning Worker for ${scriptUrl}`);
                    this.onmessage = null; 
                    
                    // Increment Pending Async to keep VM alive during startup
                    if (activeVM) activeVM.pendingAsyncCount++;

                    setTimeout(() => {
                        console.log(`[VM] Worker ${scriptUrl} started.`);
                        if (activeVM) activeVM.pendingAsyncCount--;
                        
                        if (this.onmessage) {
                            // Signal 'ready' (optional)
                            this._triggerCallback({ data: "Worker Ready" });
                        }
                    }, 100);
                }

                postMessage(msg) { 
                    console.log("[VM] Worker received:", msg);
                    
                    // Keep VM alive while processing
                    if (activeVM) activeVM.pendingAsyncCount++;
                    
                    setTimeout(() => {
                         if (activeVM) activeVM.pendingAsyncCount--;
                         
                         if(this.onmessage) {
                            this._triggerCallback({ data: { echo: msg, id: Math.random() } });
                         }
                    }, 50);
                }

                _triggerCallback(eventData) {
                    if (this.onmessage && this.onmessage.type === 'CLOSURE' && activeVM) {
                        const thread = activeVM.spawn(this.onmessage.code);
                        thread.currentScope = { 0: eventData };
                    } else if (typeof this.onmessage === 'function') {
                        this.onmessage(eventData);
                    }
                }
            }

            // B"H - TIKKUN: Factory for Native TypedArrays
            const createTypedArrayWrapper = (NativeConstructor, Name) => {
                return class {
                    constructor(arg, ...rest) {
                        if (arg && arg.type === 'POINTER') {
                            const realData = memory.get(arg.value);
                            // B"H - Debug Logging
                            if (!realData || !Array.isArray(realData)) {
                                console.warn(`[VM] ${Name} init with bad pointer:`, realData);
                                return new NativeConstructor(0);
                            }
                            return new NativeConstructor(realData, ...rest);
                        } else if (arg instanceof self.MerkavaVM.Polyfills.SharedArrayBuffer) {
                             return new NativeConstructor(arg._data.buffer, ...rest);
                        } else {
                            return new NativeConstructor(arg, ...rest);
                        }
                    }
                }
            };

            const baseContext = { 
                Worker: MerkavaWorker,
                SharedArrayBuffer: self.MerkavaVM.Polyfills.SharedArrayBuffer,
                Atomics: self.MerkavaVM.Polyfills.Atomics,
                Float32Array: createTypedArrayWrapper(Float32Array, 'Float32Array'),
                Int32Array: createTypedArrayWrapper(Int32Array, 'Int32Array'),
                Uint8Array: createTypedArrayWrapper(Uint8Array, 'Uint8Array'),
                Uint16Array: createTypedArrayWrapper(Uint16Array, 'Uint16Array'),
                
                // B"H - TIKKUN: Wrapper for requestAnimationFrame to handle VM Closures
                requestAnimationFrame: (callback) => {
                    // Keep VM alive until the frame fires
                    if (activeVM) activeVM.pendingAsyncCount++;
                    
                    return self.requestAnimationFrame((timestamp) => {
                         if (activeVM) activeVM.pendingAsyncCount--;
                         
                         if (callback && callback.type === 'CLOSURE' && activeVM) {
                             const thread = activeVM.spawn(callback.code);
                             // Pass timestamp as first argument
                             thread.currentScope = { 0: timestamp };
                         } else if (typeof callback === 'function') {
                             callback(timestamp);
                         }
                    });
                },
                
                importScripts: function(...urls) {
                    if (memory.setGlobal) memory.setGlobal("IMPORTED_LIB_LOADED", true);
                }
            };

            const vmContext = new Proxy(baseContext, {
                get: (target, prop) => {
                    // 1. Check base VM context
                    if (prop in target) return target[prop];
                    
                    // 2. Check User Provided Context
                    if (options.context) {
                        if (prop in options.context) {
                            const val = options.context[prop];
                            if (typeof val === 'function') {
                                return val.bind(options.context);
                            }
                            return val;
                        }
                    }
                    return undefined;
                },
                has: (target, prop) => {
                    return (prop in target) || (options.context && prop in options.context);
                }
            });
            
            const vm = new self.MerkavaVM(memory, options.hostAPI || {}, vmContext);
            activeVM = vm; 

            vm.spawn(codeObject);

            let dbg = options.debug ? new self.MerkavaDebugger(vm) : null;
            if(dbg) dbg.attach();

            // B"H - Cancellation Logic
            let isCancelled = false;

            const done = new Promise((resolve, reject) => {
                const tick = () => {
                    if (isCancelled) {
                        resolve({ status: 'CANCELLED' });
                        return;
                    }
                    try {
                        if (vm.run(1000)) requestAnimationFrame(tick);
                        else resolve({ status: 'COMPLETED' });
                    } catch(e) { reject(e); }
                };
                tick();
            });

            return { 
                vm, 
                memory, 
                debugger: dbg, 
                done,
                cancel: () => { isCancelled = true; } 
            };
        }
    }

    return new MerkavaSDK();
}));