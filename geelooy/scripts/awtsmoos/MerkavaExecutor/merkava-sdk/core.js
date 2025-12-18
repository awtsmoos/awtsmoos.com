
// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    class MerkavaCore {
        async run(source, options = {}) {
            // 1. Load Parser
            const Parser = self.MerkavahParser;
            if (!Parser) throw new Error("Parser not loaded.");

            // 2. Parse & Compile
            const parser = new Parser(source);
            if(parser.registerExpressionParsers) parser.registerExpressionParsers();
            if(parser.registerStatementParsers) parser.registerStatementParsers();
            if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();

            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error(parser.errors.join('\n'));

            const compiler = new self.MerkavaCompiler.Compiler();
            const codeObject = compiler.compile(ast);
            
            // 3. Initialize Memory
            // B"H - Increased RAM limit to 500,000 to support intensive AI recursion
            const memory = new self.MerkavaMemory.MemoryManager(options.ramLimit || 500000);
            await memory.init();
            
            if(!memory.setGlobal) {
                memory._g = {};
                memory.setGlobal = (k,v) => memory._g[k] = v;
                memory.getGlobal = (k) => memory._g[k];
            }
            if (memory.nextPtr === 1) memory.allocate({});

            // 4. Build Context & VM
            const context = this._buildContext(options, memory);
            const vm = new self.MerkavaVM(memory, options.hostAPI, context, options.importResolver);
            
            // B"H - Connect VM to Context Bridge
            // This allows the async wrappers (raf, setTimeout) to spawn threads on this VM.
            if (context.__vmRef) context.__vmRef.current = vm;

            // 5. Spawn Main Thread
            const thread = vm.spawn(codeObject);
            
            // B"H - Return a Promise that resolves when the VM is done
            const donePromise = new Promise((resolve, reject) => {
                const check = () => {
                    try {
                        const active = vm.run(1000); 
                        if (active) {
                            // If VM is still active (threads running or async pending), schedule next tick
                            if (!vm.wake) {
                                // Default polling if no wake mechanism is bound
                                setTimeout(check, 10);
                            }
                        } else {
                            if (thread.status === 'CRASHED') {
                                const err = thread.stack.length > 0 ? thread.stack[thread.stack.length - 1] : "Unknown Error";
                                reject(err);
                            } else {
                                resolve({ status: thread.status, value: thread.stack.length > 0 ? thread.peek() : undefined });
                            }
                        }
                    } catch (e) {
                        reject(e);
                    }
                };
                
                // Attach wake handler to VM for event-driven execution (e.g. after AWAIT resolve)
                // This default handler uses the internal loop. Hosts can override this.
                vm.wake = () => {
                    setTimeout(check, 0);
                };
                
                // B"H - Delay start to next tick to allow Host to attach overrides/assign instances
                setTimeout(check, 0);
            });

            return { vm, done: donePromise, memory };
        }

        initWorkerEnv(options) {
            return this;
        }

        _buildContext(options, memory) {
            const baseContext = options.context || {};
            const overrides = {};
            
            // B"H - VM Reference Holder
            const vmRef = { current: null };

            // B"H - Closure Bridge
            const bridge = (callback) => {
                if (callback && callback.type === 'CLOSURE') {
                    return (...args) => {
                        const vm = vmRef.current;
                        if (!vm) return;
                        const thread = vm.spawn(callback.code);
                        thread.currentUpvalues = callback.upvalues;
                        thread.environment = callback.environment || thread.environment;
                        
                        // B"H - Handle Bound Closures (this.loop.bind(this))
                        const ctx = callback.boundThis !== undefined ? callback.boundThis : baseContext;
                        const finalArgs = (callback.boundArgs || []).concat(args);

                        thread.currentScope = { 
                            'this': ctx, 
                            'arguments': finalArgs 
                        };
                        finalArgs.forEach((arg, i) => thread.currentScope[i] = arg);
                        if (vm.wake) vm.wake();
                    };
                }
                return callback;
            };

            // B"H - Override Async Schedulers
            const schedulers = ['requestAnimationFrame', 'setTimeout', 'setInterval', 'setImmediate'];
            const clearers = ['cancelAnimationFrame', 'clearTimeout', 'clearInterval', 'clearImmediate'];

            schedulers.forEach(name => {
                const nativeFn = baseContext[name] || (typeof self !== 'undefined' ? self[name] : null);
                if (typeof nativeFn === 'function') {
                    overrides[name] = (cb, ...args) => {
                        return nativeFn.call(baseContext, bridge(cb), ...args);
                    };
                }
            });

            clearers.forEach(name => {
                 const nativeFn = baseContext[name] || (typeof self !== 'undefined' ? self[name] : null);
                 if (typeof nativeFn === 'function') {
                     overrides[name] = nativeFn.bind(baseContext);
                 }
            });
            
            // B"H - SHADOW onmessage
            // This is critical for Workers. By defining it here, the Proxy will
            // write to 'overrides.onmessage' instead of 'baseContext.onmessage'.
            // This prevents user code from overwriting the Native Worker's router.
            overrides.onmessage = null;

            // B"H - Worker Bridge
            if (Internal.WorkerProxy) {
                overrides.Worker = function(scriptUrl) {
                     return new Internal.WorkerProxy(scriptUrl, vmRef.current, options);
                };
            }

            // B"H - Polyfills
            if (self.MerkavaVM && self.MerkavaVM.Polyfills) {
                if (typeof SharedArrayBuffer === 'undefined') {
                    overrides.SharedArrayBuffer = self.MerkavaVM.Polyfills.SharedArrayBuffer;
                }
                if (typeof Atomics === 'undefined') {
                    overrides.Atomics = self.MerkavaVM.Polyfills.Atomics;
                }
            }

            // B"H - ImportScripts with Virtual Execution Support
            overrides.importScripts = async function(...urls) {
                const vm = vmRef.current;
                
                for (const url of urls) {
                    let code = null;

                    // 1. Try Virtual Resolve
                    if (options.importResolver) {
                        try {
                            const res = await options.importResolver(url);
                            if (res && res.code) code = res.code;
                            else if (typeof res === 'string') code = res;
                        } catch(e) { /* Ignore resolve errors, fallback */ }
                    }

                    if (code) {
                        try {
                            // B"H - Virtual Execution
                            if (!self.MerkavahParser || !self.MerkavaCompiler) {
                                throw new Error("Cannot import virtual script: Parser/Compiler missing.");
                            }
                            
                            // Parse
                            const parser = new self.MerkavahParser(code);
                            if(parser.registerExpressionParsers) parser.registerExpressionParsers();
                            if(parser.registerStatementParsers) parser.registerStatementParsers();
                            if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();
                            const ast = parser.parse();
                            
                            // Compile
                            const compiler = new self.MerkavaCompiler.Compiler();
                            const codeObj = compiler.compile(ast);
                            
                            // Spawn on CURRENT VM
                            const thread = vm.spawn(codeObj);
                            
                            // B"H - CRITICAL FIX: Wake the VM Loop!
                            // Since we added a new RUNNING thread, we must ensure the loop sees it immediately.
                            if (vm.wake) vm.wake();
                            
                            // Await Completion
                            await new Promise((resolve, reject) => {
                                const mon = () => {
                                    if (thread.status === 'COMPLETED') resolve();
                                    else if (thread.status === 'CRASHED') {
                                         const err = thread.stack.length > 0 ? thread.stack[thread.stack.length - 1] : "Imported script crashed";
                                         reject(new Error(err));
                                    }
                                    else setTimeout(mon, 10);
                                };
                                mon();
                            });
                        } catch(err) {
                            console.error(`[VM] Virtual Import Failed (${url}):`, err);
                            throw err; // Re-throw to pause/crash the caller
                        }
                    } else {
                        // 2. Native Fallback
                        if (Internal.Utils && Internal.Utils.loadModules) {
                            await Internal.Utils.loadModules([url]);
                        }
                    }
                }
            };

            // B"H - Standard Overrides
            overrides.console = baseContext.console || self.console;
            overrides.CSSStyleDeclaration = self.CSSStyleDeclaration || baseContext.CSSStyleDeclaration;

            overrides.__define_live_export = (exports, key, env, localKey) => {
                Object.defineProperty(exports, key, {
                    get: () => env[localKey],
                    enumerable: true,
                    configurable: true
                });
            };
            
            Object.defineProperty(overrides, '__vmRef', { value: vmRef, enumerable: false });

            // B"H - Proxy
            const context = new Proxy(overrides, {
                get(target, prop, receiver) {
                    if (typeof prop === 'symbol') {
                        if (prop in target) return target[prop];
                        return Reflect.get(baseContext, prop);
                    }
                    if (prop in target) return target[prop];
                    try {
                        const val = baseContext[prop];
                        if (typeof val === 'function') {
                            // B"H - SPECIAL CASE: onmessage
                            // We MUST return the raw function for 'onmessage' to allow strict identity checks
                            // in the Worker Bootstrap. If we bind it, identity checks fail, causing the
                            // bootstrap to mistake the system router for a user handler.
                            if (prop === 'onmessage') return val;

                            if (val.prototype && val.name) return val; 
                            return val.bind(baseContext);
                        }
                        return val;
                    } catch (e) { return undefined; }
                },
                has(target, prop) { return (prop in target) || (prop in baseContext); },
                set(target, prop, value) {
                    // B"H - Fix: Always write to target (overrides) first!
                    // If we blindly fall through to baseContext, we might overwrite native globals
                    // like self.onmessage which breaks the VM host.
                    if (prop in target) { target[prop] = value; return true; }
                    
                    // Only pass through if specifically NOT in target and EXISTS in base
                    // AND it is NOT a critical system property we want to shadow.
                    // But here, we initialized 'onmessage' in target, so it is caught above.
                    
                    if (prop in baseContext) { baseContext[prop] = value; return true; }
                    target[prop] = value; return true;
                },
                ownKeys(target) { return [...Reflect.ownKeys(target), ...Reflect.ownKeys(baseContext)]; },
                getOwnPropertyDescriptor(target, prop) {
                    if (prop in target) return Object.getOwnPropertyDescriptor(target, prop);
                    return Object.getOwnPropertyDescriptor(baseContext, prop);
                }
            });

            // B"H - SELF-REFERENCE FIX
            // We must explicitly point 'self', 'window', 'globalThis' to the PROXY.
            // Otherwise, code like 'self.onmessage = ...' resolves 'self' to the Native Global,
            // bypassing the Proxy and overwriting the System Router (native onmessage),
            // while leaving the Proxy's 'overrides.onmessage' as null.
            overrides.self = context;
            overrides.window = context;
            overrides.globalThis = context;

            return context;
        }
    }

    Internal.Core = new MerkavaCore();

})(typeof self !== 'undefined' ? self : this);
