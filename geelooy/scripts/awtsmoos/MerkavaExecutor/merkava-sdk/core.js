
// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    // --- CONTEXT BUILDER (Merged for Stability) ---
    Internal.ContextBuilder = {
        build(options, memory) {
            const base = options.context || {};
            const overrides = {};
            const vmRef = { current: null };

            // 1. Built-in Globals
            // B"H - Extended list to support complex apps (Blob, URL, Canvas, etc.)
            const builtIns = [
                'Object','Array','String','Number','Boolean','Date','Math','JSON','Promise',
                'RegExp','Error','Map','Set','WeakMap','WeakSet','Symbol','Proxy','Reflect',
                'parseInt','parseFloat','isNaN','isFinite','console','EventTarget','atob','btoa',
                'Blob', 'URL', 'TextEncoder', 'TextDecoder', 'ImageBitmap', 'OffscreenCanvas',
                'MessageChannel', 'MessagePort', 'ImageData', 'performance', 'setTimeout', 'setInterval',
                'clearTimeout', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame'
            ];
            builtIns.forEach(k => { if(self[k]) overrides[k] = self[k]; });

            // 2. Scheduler Bridge
            const bridge = (cb) => {
                if (cb && cb.type === 'CLOSURE') {
                    // B"H - Must be a regular function to capture 'this' correctly for constructors
                    return function(...args) {
                        if (!vmRef.current) return;
                        const t = vmRef.current.spawn(cb.code);
                        t.currentUpvalues = cb.upvalues;
                        t.environment = cb.environment || t.environment;
                        
                        // Use the 'this' from the call site (important for 'new Bridge()')
                        // If 'this' is the global object/overrides, fallback to base/context
                        const ctx = (this === overrides || this === self || this === undefined) ? base : this;
                        
                        t.currentScope = { 'this': ctx, 'arguments': args };
                        args.forEach((a,i)=>t.currentScope[i]=a);
                        if (vmRef.current.wake) vmRef.current.wake();
                    };
                }
                return cb;
            };

            // Bridge specific timing functions that take callbacks
            ['requestAnimationFrame','setTimeout','setInterval'].forEach(k => {
                if (typeof self[k] === 'function') overrides[k] = (cb, ...args) => self[k](bridge(cb), ...args);
            });
            // These don't take callbacks, just IDs
            ['cancelAnimationFrame','clearTimeout','clearInterval'].forEach(k => {
                if(self[k]) overrides[k] = self[k];
            });

            // 3. Worker & System
            if (Internal.WorkerProxy) {
                // B"H - Must be a regular function to support 'new Worker(...)' usage
                overrides.Worker = function(u) { 
                    return new Internal.WorkerProxy(u, vmRef.current, options); 
                };
            }
            
            overrides.importScripts = async (...urls) => {
                if (vmRef.current && vmRef.current.importScripts) await vmRef.current.importScripts(...urls);
            };

            // 4. Document Proxy
            Object.defineProperty(overrides, 'document', {
                get() {
                    const doc = base.document || self.document;
                    return new Proxy(doc, {
                        get(t, p) {
                            if (p === 'getElementById') return (id) => t.getElementById(id);
                            if (p === 'addEventListener') return (ev, l, o) => t.addEventListener(ev, bridge(l), o);
                            const v = t[p];
                            return typeof v === 'function' ? v.bind(t) : v;
                        }
                    });
                },
                configurable: true
            });

            // 5. Global Proxy
            Object.defineProperty(overrides, '__vmRef', { value: vmRef });
            
            const ctx = new Proxy(overrides, {
                get(t, p) { 
                    if (p in t) return t[p];
                    return base[p];
                },
                set(t, p, v) {
                    if (p in t) { t[p] = v; return true; }
                    base[p] = (v && v.type === 'CLOSURE') ? bridge(v) : v;
                    return true;
                },
                has(t, p) { return p in t || p in base; }
            });
            
            overrides.self = overrides.window = overrides.globalThis = ctx;
            return ctx;
        }
    };

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
            
            let vm, memory;
            if (options.existingVM) {
                vm = options.existingVM;
                memory = vm.memory;
            } else {
                memory = new self.MerkavaMemory.MemoryManager(options.ramLimit || 500000);
                await memory.init();
                if(!memory.setGlobal) { memory._g={}; memory.setGlobal=(k,v)=>memory._g[k]=v; memory.getGlobal=(k)=>memory._g[k]; }
                if (memory.nextPtr === 1) memory.allocate({});

                // B"H - Safe Context Build
                if (!Internal.ContextBuilder) throw new Error("ContextBuilder failed to initialize.");
                const context = Internal.ContextBuilder.build(options, memory);
                
                vm = new self.MerkavaVM(memory, options.hostAPI, context, options.importResolver);
                if (context.__vmRef) context.__vmRef.current = vm;
                
                vm.importScripts = async (...urls) => this._handleImportScripts(vm, urls, options);
                
                this._initDriver(vm);
            }

            const thread = vm.spawn(codeObject);
            if (vm.wake) vm.wake();
            
            return { 
                vm, memory, 
                stop: () => {
                    if (vm._driver) vm._driver.running = false;
                    vm.threads = []; // Kill all threads
                },
                done: new Promise((res, rej) => {
                    const mon = () => {
                        if (thread.status === 'COMPLETED') res({ status: 'COMPLETED', value: thread.stack.length ? thread.peek() : undefined });
                        else if (thread.status === 'CRASHED') rej(thread.stack.length ? thread.stack[thread.stack.length-1] : "Error");
                        else if (vm._driver && !vm._driver.running && vm.threads.length === 0) res({ status: 'TERMINATED' }); // Handle stop()
                        else setTimeout(mon, 50);
                    };
                    mon();
                })
            };
        }

        initWorkerEnv(options) { return this; }
        
        _initDriver(vm) {
            vm._driver = { running: false, kick: () => {
                if (vm._driver.running) return;
                vm._driver.running = true;
                const loop = () => {
                    if (!vm._driver.running) return;
                    try { if (vm.run(1000)) setTimeout(loop, 10); else vm._driver.running = false; }
                    catch (e) { console.error("[VM] Driver Crash", e); vm._driver.running = false; }
                };
                setTimeout(loop, 0);
            }};
            vm.wake = () => vm._driver.kick();
        }

        async _handleImportScripts(vm, urls, options) {
             const Compiler = self.MerkavaCompiler.Compiler;
             const Parser = self.MerkavahParser;
             for (const url of urls) {
                 let code;
                 if (options.importResolver) {
                     const res = await options.importResolver(url).catch(e => console.warn(e));
                     if (res) code = res.code || res;
                 }
                 if (!code) {
                     const r = await fetch(url).catch(e => console.warn(e));
                     if (r && r.ok) code = await r.text();
                 }
                 if (code) {
                     const ast = new Parser(code).parse();
                     const thread = vm.spawn(new Compiler().compile(ast));
                     
                     // B"H - WAIT FOR THREAD COMPLETION
                     // Prevent race conditions by ensuring the script is fully executed
                     // (and has defined its globals) before resolving the await.
                     if (vm.wake) vm.wake(); // Ensure VM driver picks up the new thread
                     
                     await new Promise(resolve => {
                         const check = () => {
                             if (thread.status === 'COMPLETED' || thread.status === 'CRASHED') resolve();
                             else setTimeout(check, 10);
                         };
                         check();
                     });
                 }
             }
        }
    }
    Internal.Core = new MerkavaCore();
    console.log("[MerkavaSDK] Core Initialized with ContextBuilder.");
})(typeof self !== 'undefined' ? self : this);
