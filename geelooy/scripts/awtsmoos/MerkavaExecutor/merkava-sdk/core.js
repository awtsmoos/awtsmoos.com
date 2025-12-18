
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
            // This allows the context to reference the VM instance which is created *after* the context.
            const vmRef = { current: null };

            // B"H - Closure Bridge
            // Converts a VM Closure object into a Native JS Function.
            // This is crucial for requestAnimationFrame, setTimeout, etc.
            const bridge = (callback) => {
                if (callback && callback.type === 'CLOSURE') {
                    return (...args) => {
                        const vm = vmRef.current;
                        if (!vm) return;
                        
                        // Spawn a new thread for the callback
                        const thread = vm.spawn(callback.code);
                        
                        // Restore Lexical Scope (Upvalues) from the Closure
                        thread.currentUpvalues = callback.upvalues;
                        thread.environment = callback.environment || thread.environment;
                        
                        // Map Native Arguments to VM Scope (0, 1, 2...)
                        // e.g., timestamp for RAF
                        thread.currentScope = { 
                            'this': baseContext, 
                            'arguments': args 
                        };
                        args.forEach((arg, i) => thread.currentScope[i] = arg);
                        
                        // Ignite the VM Loop
                        if (vm.wake) vm.wake();
                    };
                }
                // If it's already a native function (or unknown), pass it through
                return callback;
            };

            // B"H - Override Async Schedulers
            const schedulers = ['requestAnimationFrame', 'setTimeout', 'setInterval', 'setImmediate'];
            const clearers = ['cancelAnimationFrame', 'clearTimeout', 'clearInterval', 'clearImmediate'];

            schedulers.forEach(name => {
                // Check both baseContext and Global Scope
                const nativeFn = baseContext[name] || (typeof self !== 'undefined' ? self[name] : null);
                if (typeof nativeFn === 'function') {
                    overrides[name] = (cb, ...args) => {
                        // Call native function with BRIDGED callback
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
            
            // Attach vmRef to overrides (non-enumerable) so run() can populate it
            Object.defineProperty(overrides, '__vmRef', { value: vmRef, enumerable: false });

            // B"H - TIKKUN: Use Proxy for Context
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
                            if (val.prototype && val.name) return val; 
                            return val.bind(baseContext);
                        }
                        return val;
                    } catch (e) {
                        return undefined;
                    }
                },
                has(target, prop) {
                    return (prop in target) || (prop in baseContext);
                },
                set(target, prop, value) {
                    // Smart Set Strategy
                    if (prop in target) {
                        target[prop] = value;
                        return true;
                    }
                    if (prop in baseContext) {
                        baseContext[prop] = value;
                        return true;
                    }
                    target[prop] = value;
                    return true;
                },
                ownKeys(target) {
                    return [...Reflect.ownKeys(target), ...Reflect.ownKeys(baseContext)];
                },
                getOwnPropertyDescriptor(target, prop) {
                    if (prop in target) return Object.getOwnPropertyDescriptor(target, prop);
                    return Object.getOwnPropertyDescriptor(baseContext, prop);
                }
            });

            return context;
        }
    }

    Internal.Core = new MerkavaCore();

})(typeof self !== 'undefined' ? self : this);
