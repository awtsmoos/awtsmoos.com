
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

            // Apply Polyfills & Overrides
            // Use .bind to ensure they work when detached and prevent illegal invocation
            overrides.console = baseContext.console || self.console;
            // B"H - NOTE: setTimeout/Interval are now handled by the Host Wrapper in html-preview-templates.js
            // But we keep fallbacks here just in case.
            overrides.setTimeout = baseContext.setTimeout ? baseContext.setTimeout.bind(baseContext) : self.setTimeout.bind(self);
            overrides.clearTimeout = baseContext.clearTimeout ? baseContext.clearTimeout.bind(baseContext) : self.clearTimeout.bind(self);
            overrides.setInterval = baseContext.setInterval ? baseContext.setInterval.bind(baseContext) : self.setInterval.bind(self);
            overrides.clearInterval = baseContext.clearInterval ? baseContext.clearInterval.bind(baseContext) : self.clearInterval.bind(self);
            
            // B"H - Ensure CSSStyleDeclaration is available for instruction checks
            overrides.CSSStyleDeclaration = self.CSSStyleDeclaration || baseContext.CSSStyleDeclaration;

            // B"H - REQUIRED FOR MODULE EXPORTS
            overrides.__define_live_export = (exports, key, env, localKey) => {
                Object.defineProperty(exports, key, {
                    get: () => env[localKey],
                    enumerable: true,
                    configurable: true
                });
            };

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
                    // B"H - TIKKUN: Smart Set Strategy
                    
                    // 1. If it's already in overrides, update overrides.
                    if (prop in target) {
                        target[prop] = value;
                        return true;
                    }
                    
                    // 2. If it's in baseContext, update baseContext (CRITICAL for onmessage).
                    if (prop in baseContext) {
                        baseContext[prop] = value;
                        return true;
                    }
                    
                    // 3. Otherwise, create new variable in overrides.
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