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
            
            // Link Context/VM
            context._vm = vm;
            memory.ownerVM = vm; 

            vm.spawn(codeObject);

            const resultPromise = new Promise((resolve, reject) => {
                let loopActive = false;

                const loop = () => {
                    try {
                        const isVMActive = vm.run(1000); 
                        if (isVMActive) {
                            if (options.context && options.context.requestAnimationFrame) {
                                options.context.requestAnimationFrame(loop);
                            } else {
                                setTimeout(loop, 10);
                            }
                        } else {
                            loopActive = false;
                            // Only resolve if we are truly done (no async tasks)
                            if (vm.pendingAsyncCount <= 0) {
                                resolve({ status: 'COMPLETED', vm });
                            }
                        }
                    } catch (e) {
                        loopActive = false;
                        reject(e);
                    }
                };

                // B"H - Allow external re-ignition of the loop
                vm.wake = () => {
                    if (!loopActive) {
                        loopActive = true;
                        loop();
                    }
                };

                loopActive = true;
                loop();
            });

            return {
                done: resultPromise,
                vm: vm,
                memory: memory,
                debugger: new self.MerkavaDebugger(vm),
                cancel: () => { /* Implement cancellation flag */ }
            };
        }

        async initWorkerEnv(options) {
            // B"H - Worker Context Definition
            // We do NOT set 'self' here circularly, _buildContext handles it.
            const workerContext = {
                // Override postMessage to use our protocol
                postMessage: (data) => {
                    self.postMessage({ type: 'USER_MSG', payload: data });
                },
                // B"H - Copy safe globals
                console: self.console,
                fetch: self.fetch ? self.fetch.bind(self) : undefined
            };

            return {
                context: {}, 
                run: async (source) => {
                     const workerOptions = {
                         hostAPI: { 0: (...args) => console.log(...args) },
                         context: workerContext
                     };
                     
                     if (options.importResolver) workerOptions.importResolver = options.importResolver;
                     
                     return this.run(source, workerOptions);
                }
            };
        }

        _buildContext(options, memory) {
            const wrapCallback = (cb) => {
                if (cb && cb.type === 'CLOSURE') {
                    return (...args) => {
                        const vm = memory.ownerVM; 
                        if (vm) {
                             const t = vm.spawn(cb.code);
                             t.currentScope = {};
                             args.forEach((arg, i) => t.currentScope[i] = arg);
                             if (vm.wake) vm.wake(); // Wake up VM for callback
                        } else {
                            console.error("[Merkava] Callback failed: VM not found.");
                        }
                    };
                }
                return cb;
            };

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
                SharedArrayBuffer: self.MerkavaVM.Polyfills.SharedArrayBuffer,
                Atomics: self.MerkavaVM.Polyfills.Atomics,
                Float32Array: createWrapper(Float32Array),
                Int32Array: createWrapper(Int32Array),
                Uint8Array: createWrapper(Uint8Array),
                console: userContext.console || console,
                Math: Math,
                JSON: JSON,
                
                requestAnimationFrame: (cb) => {
                    const vm = memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++;
                    const nativeRAF = userContext.requestAnimationFrame || self.requestAnimationFrame;
                    return nativeRAF.call(userContext || self, (...args) => {
                        if(vm) vm.pendingAsyncCount--;
                        wrapCallback(cb)(...args);
                    });
                },
                setTimeout: (cb, delay) => {
                    const vm = memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++;
                    const nativeSTO = userContext.setTimeout || self.setTimeout;
                    return nativeSTO.call(userContext || self, (...args) => {
                        if(vm) vm.pendingAsyncCount--;
                        wrapCallback(cb)(...args);
                    }, delay);
                },
                setInterval: (cb, delay) => {
                    const vm = memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++; 
                    const nativeSI = userContext.setInterval || self.setInterval;
                    return nativeSI.call(userContext || self, (...args) => {
                        wrapCallback(cb)(...args);
                    }, delay);
                },
                
                importScripts: (...urls) => {
                    return new Promise(async (resolve, reject) => {
                        console.log("[VM] importScripts:", urls);
                        const vm = memory.ownerVM;
                        if(vm) vm.pendingAsyncCount++;
                        const cleanup = () => { if(vm) vm.pendingAsyncCount--; };

                        if (options.importResolver) {
                            try {
                                const res = await options.importResolver(urls[0]);
                                if (res && (res.code || typeof res === 'string')) {
                                    const code = res.code || res;
                                    const subVM = memory.ownerVM; 
                                    if (subVM) {
                                         const p = new self.MerkavahParser(code);
                                         p.registerStatementParsers(); 
                                         p.registerExpressionParsers(); 
                                         p.registerDeclarationParsers();
                                         const co = (new self.MerkavaCompiler.Compiler()).compile(p.parse());
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
                        setTimeout(() => { cleanup(); resolve(); }, 100); 
                    });
                },

                Worker: class {
                    constructor(url) {
                        return new Internal.WorkerProxy(url, memory.ownerVM, options);
                    }
                }
            };
            
            // B"H - Merge Contexts
            const finalContext = Object.assign({}, userContext, base);

            // B"H - Set Self References on the FINAL context
            // This ensures self.prop = value writes to finalContext.prop
            finalContext.self = finalContext;
            finalContext.window = finalContext;
            finalContext.globalThis = finalContext;

            return finalContext;
        }
    }

    Internal.Core = new MerkavaCore();

})(typeof self !== 'undefined' ? self : this);