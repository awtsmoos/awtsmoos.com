
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
            
            if(!memory.setGlobal) {
                memory._g = {};
                memory.setGlobal = (k,v) => memory._g[k] = v;
                memory.getGlobal = (k) => memory._g[k];
            }
            if (memory.nextPtr === 1) memory.allocate({});

            const context = this._buildContext(options, memory);
            const vm = new self.MerkavaVM(memory, options.hostAPI || {}, context, options.importResolver);
            context._vm = vm;
            memory.ownerVM = vm; 

            vm.spawn(codeObject);

            const resultPromise = new Promise((resolve, reject) => {
                let loopActive = false;
                let loopTimer = null;

                const loop = () => {
                    try {
                        // B"H - Run for a slice of time.
                        const isVMActive = vm.run(5000); 
                        
                        if (isVMActive) {
                            // B"H - FIX: Always use setTimeout for the VM loop.
                            // Do NOT use requestAnimationFrame here. The VM must run independently
                            // of the display refresh rate to handle logic, async tasks, and
                            // events (like the user's own RAF callbacks) without starvation.
                            loopTimer = setTimeout(loop, 0);
                        } else {
                            loopActive = false;
                            loopTimer = null;
                            if (vm.pendingAsyncCount <= 0) {
                                resolve({ status: 'COMPLETED', vm });
                            }
                        }
                    } catch (e) {
                        loopActive = false;
                        reject(e);
                    }
                };

                vm.wake = () => {
                    // B"H - Wake the VM. If the loop isn't running, start it immediately.
                    if (!loopActive) {
                        loopActive = true;
                        if (loopTimer) clearTimeout(loopTimer);
                        loopTimer = setTimeout(loop, 0); 
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
            const workerContext = {
                postMessage: (data) => {
                    self.postMessage({ type: 'USER_MSG', payload: data });
                },
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
            // B"H - Enhanced wrapper generator
            const wrapCallback = (cb) => {
                if (cb && cb.type === 'CLOSURE') {
                    const vm = memory.ownerVM;
                    if (vm && vm._callbackWrappers && vm._callbackWrappers.has(cb)) {
                        return vm._callbackWrappers.get(cb);
                    }

                    const wrapper = function(...args) {
                        // B"H - Robust VM lookup.
                        const activeVM = vm || memory.ownerVM;
                        if (activeVM) {
                             const t = activeVM.spawn(cb.code);
                             t.currentScope = {};
                             
                             const hostThis = this;
                             const scopeThis = cb.isArrow ? (cb.upvalues ? cb.upvalues['this'] : undefined) : hostThis;
                             
                             t.currentScope = { 'this': scopeThis, 'arguments': args };
                             args.forEach((arg, i) => t.currentScope[i] = arg);
                             
                             t.currentUpvalues = cb.upvalues;
                             t.environment = cb.environment;

                             if (activeVM.wake) activeVM.wake(); 
                        } else {
                            console.error("[Merkava] Callback failed: VM not found.");
                        }
                    };
                    
                    if (vm) {
                        if (!vm._callbackWrappers) vm._callbackWrappers = new WeakMap();
                        vm._callbackWrappers.set(cb, wrapper);
                    }
                    return wrapper;
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

            const userContext = options.context || self;
            
            const wrapAddEventListener = (target) => {
                if (target._merkavaWrapped) return;
                
                const originalAdd = target.addEventListener;
                const originalRemove = target.removeEventListener;
                
                if (originalAdd) {
                    target.addEventListener = function(type, listener, options) {
                        const wrapped = wrapCallback(listener);
                        return originalAdd.call(this, type, wrapped, options);
                    };
                }
                
                if (originalRemove) {
                    target.removeEventListener = function(type, listener, options) {
                        const vm = memory.ownerVM;
                        let wrapped = listener;
                        if (vm && vm._callbackWrappers && vm._callbackWrappers.has(listener)) {
                            wrapped = vm._callbackWrappers.get(listener);
                        }
                        return originalRemove.call(this, type, wrapped, options);
                    };
                }
                target._merkavaWrapped = true;
            };

            if (typeof userContext.addEventListener === 'function') {
                wrapAddEventListener(userContext);
            }

            if (userContext.document) {
                wrapAddEventListener(userContext.document);
            }

            const base = {
                SharedArrayBuffer: self.MerkavaVM.Polyfills.SharedArrayBuffer,
                Atomics: self.MerkavaVM.Polyfills.Atomics,
                Float32Array: createWrapper(Float32Array),
                Int32Array: createWrapper(Int32Array),
                Uint8Array: createWrapper(Uint8Array),
                
                Array: Array,
                Object: Object,
                String: String,
                Number: Number,
                Boolean: Boolean,
                Symbol: Symbol,
                Error: Error,
                Promise: Promise,
                Math: Math,
                
                console: userContext.console || console,
                JSON: JSON,
                
                __define_live_export: (exportsObj, exportName, sourceObj, localName) => {
                    if (!exportsObj || typeof exportsObj !== 'object') return;
                    Object.defineProperty(exportsObj, exportName, {
                        get: () => sourceObj[localName],
                        enumerable: true,
                        configurable: true
                    });
                },
                
                requestAnimationFrame: (cb) => {
                    const vm = memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++;
                    const nativeRAF = userContext.requestAnimationFrame || self.requestAnimationFrame;
                    
                    return nativeRAF.call(userContext, (...args) => {
                        try {
                            if(vm) vm.pendingAsyncCount--;
                            const wrapper = wrapCallback(cb);
                            // B"H - Invoke wrapper with correct context
                            wrapper.apply(userContext, args);
                            if(vm && vm.wake) vm.wake();
                        } catch(e) {
                            console.error("[VM] RAF Callback Error:", e);
                        }
                    });
                },
                setTimeout: (cb, delay) => {
                    const vm = memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++;
                    const nativeSTO = userContext.setTimeout || self.setTimeout;
                    return nativeSTO.call(userContext, (...args) => {
                        try {
                            if(vm) vm.pendingAsyncCount--;
                            wrapCallback(cb).apply(userContext, args);
                            if(vm && vm.wake) vm.wake();
                        } catch(e) {
                            console.error("[VM] Timeout Callback Error:", e);
                        }
                    }, delay);
                },
                setInterval: (cb, delay) => {
                    const vm = memory.ownerVM;
                    if(vm) vm.pendingAsyncCount++; 
                    const nativeSI = userContext.setInterval || self.setInterval;
                    return nativeSI.call(userContext, (...args) => {
                        try {
                            wrapCallback(cb).apply(userContext, args);
                            if(vm && vm.wake) vm.wake();
                        } catch(e) {
                            console.error("[VM] Interval Callback Error:", e);
                        }
                    }, delay);
                },
                
                addEventListener: function(type, listener, options) {
                    const target = userContext.addEventListener ? userContext : self;
                    const wrapped = wrapCallback(listener);
                    return target.addEventListener(type, wrapped, options);
                },
                
                importScripts: (...urls) => {
                    return new Promise(async (resolve, reject) => {
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
            
            const finalContext = new Proxy(base, {
                get(target, prop, receiver) {
                    if (Reflect.has(target, prop)) {
                        return Reflect.get(target, prop, receiver);
                    }
                    try {
                        if (userContext && (prop in userContext)) {
                            const val = userContext[prop];
                            if (typeof val === 'function') {
                                if (val.prototype && val.name && /^[A-Z]/.test(val.name)) {
                                    return val;
                                }
                                return val.bind(userContext);
                            }
                            if (val instanceof EventTarget) {
                                wrapAddEventListener(val);
                            }
                            return val;
                        }
                    } catch(e) {}
                    return undefined;
                },
                has(target, prop) {
                    if (Reflect.has(target, prop)) return true;
                    if (userContext && prop in userContext) return true;
                    return false;
                },
                set(target, prop, value, receiver) {
                    if (userContext && (prop in userContext)) {
                        userContext[prop] = value;
                        return true;
                    }
                    return Reflect.set(target, prop, value, receiver);
                }
            });

            base.self = finalContext;
            base.window = finalContext;
            base.globalThis = finalContext;

            return finalContext;
        }
    }

    Internal.Core = new MerkavaCore();

})(typeof self !== 'undefined' ? self : this);
