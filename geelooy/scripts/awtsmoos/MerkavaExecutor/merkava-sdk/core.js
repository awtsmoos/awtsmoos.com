// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    class MerkavaCore {
        async run(source, options = {}) {
            const Parser = self.MerkavahParser;
            if (!Parser) throw new Error("Parser not loaded.");

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
            
            // Ensure globals object exists
            if(!memory.setGlobal) {
                memory._g = {};
                memory.setGlobal = (k,v) => memory._g[k] = v;
                memory.getGlobal = (k) => memory._g[k];
            }
            if (memory.nextPtr === 1) memory.allocate({});

            // Context Construction
            const context = this._buildContext(options, memory);
            
            // VM Initialization
            const vm = new self.MerkavaVM(memory, options.hostAPI || {}, context);
            
            // Attach vm to context so WorkerProxy can use it if needed (to spawn callback threads)
            context._vm = vm;

            // Spawn Main Thread
            vm.spawn(codeObject);

            // Execution Loop
            const resultPromise = new Promise((resolve, reject) => {
                const loop = () => {
                    try {
                        // Check if VM is active (threads running OR waiting for async/RAF)
                        const isVMActive = vm.run(1000); // 1000 cycles per frame
                        
                        if (isVMActive) {
                            if (options.context && options.context.requestAnimationFrame) {
                                options.context.requestAnimationFrame(loop);
                            } else {
                                setTimeout(loop, 10);
                            }
                        } else {
                            resolve({ status: 'COMPLETED', vm });
                        }
                    } catch (e) {
                        reject(e);
                    }
                };
                loop();
            });

            // Return a control object
            return {
                done: resultPromise,
                vm: vm,
                memory: memory,
                debugger: new self.MerkavaDebugger(vm),
                cancel: () => { /* Implement cancellation flag */ }
            };
        }

        // Called by the Inner Worker to set up its environment
        async initWorkerEnv(options) {
            return {
                context: {}, // Will be populated by _buildContext inside run
                run: async (source) => {
                     // Inside the worker, we run this code.
                     const workerOptions = {
                         hostAPI: { 0: (...args) => console.log(...args) },
                         context: self // Use the worker's self
                     };
                     
                     // B"H - Merge passed options if needed (like imports)
                     if (options.importResolver) workerOptions.importResolver = options.importResolver;
                     
                     return this.run(source, workerOptions);
                }
            };
        }

        _buildContext(options, memory) {
            // Helper to wrap VM Closures for Native APIs
            const wrapCallback = (cb) => {
                if (cb && cb.type === 'CLOSURE') {
                    return (...args) => {
                        // We must spawn a new thread in the VM to run this closure
                        const vm = options.context?._vm || (memory.ownerVM); 
                        if (vm) {
                             const t = vm.spawn(cb.code);
                             // Pass arguments by setting them in the initial scope
                             t.currentScope = {};
                             args.forEach((arg, i) => t.currentScope[i] = arg);
                        }
                    };
                }
                return cb;
            };

            // Native TypedArray Wrapper Factory
            const createWrapper = (NativeConstructor) => {
                return class {
                    constructor(arg, ...rest) {
                        if (arg && arg.type === 'POINTER') {
                            const realData = memory.get(arg.value);
                            return new NativeConstructor(realData || 0, ...rest);
                        } else if (arg instanceof self.MerkavaVM.Polyfills.SharedArrayBuffer) {
                             return new NativeConstructor(arg._data.buffer, ...rest);
                        }
                        return new NativeConstructor(arg, ...rest);
                    }
                }
            };

            const userContext = options.context || {};
            
            const base = {
                // Polyfills
                SharedArrayBuffer: self.MerkavaVM.Polyfills.SharedArrayBuffer,
                Atomics: self.MerkavaVM.Polyfills.Atomics,
                
                // Typed Arrays
                Float32Array: createWrapper(Float32Array),
                Int32Array: createWrapper(Int32Array),
                Uint8Array: createWrapper(Uint8Array),
                
                // Standard Globals
                console: userContext.console || console,
                Math: Math,
                JSON: JSON,
                
                // B"H - Wrapped Timers & RAF with Async Persistence
                requestAnimationFrame: (cb) => {
                    const vm = options.context?._vm || memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++;
                    
                    const nativeRAF = userContext.requestAnimationFrame || self.requestAnimationFrame;
                    
                    return nativeRAF.call(userContext || self, (...args) => {
                        if(vm) vm.pendingAsyncCount--;
                        wrapCallback(cb)(...args);
                    });
                },
                setTimeout: (cb, delay) => {
                    const vm = options.context?._vm || memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++;

                    const nativeSTO = userContext.setTimeout || self.setTimeout;
                    return nativeSTO.call(userContext || self, (...args) => {
                        if(vm) vm.pendingAsyncCount--;
                        wrapCallback(cb)(...args);
                    }, delay);
                },
                setInterval: (cb, delay) => {
                    const vm = options.context?._vm || memory.ownerVM;
                    // Interval keeps VM alive indefinitely until cleared (not fully handled here, but prevents immediate exit)
                    if(vm) vm.pendingAsyncCount++; 

                    const nativeSI = userContext.setInterval || self.setInterval;
                    return nativeSI.call(userContext || self, (...args) => {
                        // For interval, we don't decrement because it repeats? 
                        // Simplified: treating as long-running task.
                        wrapCallback(cb)(...args);
                    }, delay);
                },
                
                // ASYNC ImportScripts
                importScripts: (...urls) => {
                    return new Promise(async (resolve, reject) => {
                        console.log("[VM] importScripts:", urls);
                        
                        const vm = options.context?._vm || memory.ownerVM;
                        if(vm) vm.pendingAsyncCount++;

                        const cleanup = () => { if(vm) vm.pendingAsyncCount--; };

                        if (options.importResolver) {
                            try {
                                const res = await options.importResolver(urls[0]);
                                if (res && (res.code || typeof res === 'string')) {
                                    // Compile & Run in-place
                                    const code = res.code || res;
                                    const subVM = options.context._vm; 
                                    
                                    if (subVM) {
                                         const p = new self.MerkavahParser(code);
                                         p.registerStatementParsers(); 
                                         p.registerExpressionParsers(); 
                                         p.registerDeclarationParsers();
                                         const co = (new self.MerkavaCompiler.Compiler()).compile(p.parse());
                                         
                                         // Spawn and wait
                                         const t = subVM.spawn(co);
                                         
                                         const check = () => {
                                             if (t.status === 'COMPLETED') { cleanup(); resolve(); }
                                             else if (t.status === 'CRASHED') { cleanup(); reject(t.error); }
                                             else setTimeout(check, 10);
                                         };
                                         check();
                                         return;
                                    }
                                }
                            } catch(e) {
                                console.error("[VM] Import Failed:", e);
                            }
                        }
                        // Default Fallback
                        setTimeout(() => { cleanup(); resolve(); }, 100); 
                    });
                },

                // Worker Constructor
                Worker: class {
                    constructor(url) {
                        return new Internal.WorkerProxy(url, base._vm, options);
                    }
                }
            };
            
            // Allow memory to know its VM for callbacks
            if (!memory.ownerVM && base._vm) memory.ownerVM = base._vm;

            // B"H - Merge 'base' LAST so our wrappers overwrite raw window functions
            return Object.assign({}, userContext, base);
        }
    }

    Internal.Core = new MerkavaCore();

})(typeof self !== 'undefined' ? self : this);