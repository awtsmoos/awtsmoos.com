
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
            const memory = new self.MerkavaMemory.MemoryManager(options.ramLimit || 1000);
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
                vm.wake = () => {
                    setTimeout(check, 0);
                };
                
                check();
            });

            return { vm, done: donePromise, memory };
        }

        initWorkerEnv(options) {
            return this;
        }

        _buildContext(options, memory) {
            const baseContext = options.context || {};
            const overrides = {};

            // Apply Polyfills & Overrides
            // Use .bind to ensure they work when detached and prevent illegal invocation
            overrides.console = baseContext.console || self.console;
            overrides.setTimeout = baseContext.setTimeout ? baseContext.setTimeout.bind(baseContext) : self.setTimeout.bind(self);
            overrides.clearTimeout = baseContext.clearTimeout ? baseContext.clearTimeout.bind(baseContext) : self.clearTimeout.bind(self);
            overrides.setInterval = baseContext.setInterval ? baseContext.setInterval.bind(baseContext) : self.setInterval.bind(self);
            overrides.clearInterval = baseContext.clearInterval ? baseContext.clearInterval.bind(baseContext) : self.clearInterval.bind(self);
            
            // B"H - Ensure CSSStyleDeclaration is available for instruction checks
            overrides.CSSStyleDeclaration = self.CSSStyleDeclaration || baseContext.CSSStyleDeclaration;

            // B"H - REQUIRED FOR MODULE EXPORTS
            // The compiler emits calls to this for 'export let/var/func'
            overrides.__define_live_export = (exports, key, env, localKey) => {
                Object.defineProperty(exports, key, {
                    get: () => env[localKey],
                    enumerable: true,
                    configurable: true
                });
            };

            // B"H - TIKKUN: Use Proxy for Context
            // Using Object.create(window) causes "Illegal invocation" for getters like innerWidth.
            // Using Proxy allows us to forward access to the real window object with the correct 'this'.
            const context = new Proxy(overrides, {
                get(target, prop, receiver) {
                    // 0. Pass through Symbols (e.g. Symbol.iterator, Symbol.toPrimitive) 
                    // to prevent TypeErrors in internal engine operations.
                    if (typeof prop === 'symbol') {
                        // Check target first
                        if (prop in target) return target[prop];
                        // Then baseContext
                        return Reflect.get(baseContext, prop);
                    }

                    // 1. Check overrides/local context first
                    if (prop in target) return target[prop];
                    
                    // 2. Check baseContext (Host Window)
                    // We access it directly on baseContext so that getters run with baseContext as 'this'.
                    try {
                        const val = baseContext[prop];
                        
                        // 3. Smart Bind
                        // Only bind functions that are NOT constructors (have no prototype or are specifically identified)
                        // This fixes 'new Image()' failing because 'Image' was bound.
                        if (typeof val === 'function') {
                            // If it has a prototype, it's likely a constructor (e.g. Image, Array). Don't bind.
                            // If it doesn't (e.g. alert, setTimeout), bind it.
                            if (val.prototype) return val; 
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
                    // Write to local overrides to avoid polluting the global window
                    target[prop] = value;
                    return true;
                },
                // B"H - Ensure proper ownership checks for 'in' operator
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
