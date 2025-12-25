
// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    Internal.ContextBuilder = {
        /**
         * B"H
         * Constructs the sacred environment for the VM.
         */
        build(options, memory) {
            const base = options.context || {};
            const overrides = {};
            const vmRef = { current: null };

            const builtIns = [
                'Object','Array','String','Number','Boolean','Date','Math','JSON','Promise',
                'RegExp','Error','Map','Set','WeakMap','WeakSet','Symbol','Proxy','Reflect',
                'parseInt','parseFloat','isNaN','isFinite','console','EventTarget','atob','btoa',
                'Blob', 'URL', 'TextEncoder', 'TextDecoder', 'ImageBitmap', 'OffscreenCanvas',
                'MessageChannel', 'MessagePort', 'ImageData', 'performance', 'setTimeout', 'setInterval',
                'clearTimeout', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame',
                'ArrayBuffer', 'Uint8Array', 'Int8Array', 'Uint16Array', 'Int16Array', 
                'Uint32Array', 'Int32Array', 'Float32Array', 'Float64Array', 'Uint8ClampedArray',
                'DataView', 'SharedArrayBuffer', 'Atomics', 'crypto'
            ];
            builtIns.forEach(k => { if(self[k]) overrides[k] = self[k]; });

            // B"H - Initialize the Root Export Vessel
            overrides.exports = {};

            const traps = ['onmessage', 'onerror', 'onclose', 'onload'];
            traps.forEach(k => { overrides[k] = null; });

            const captureEvent = (arg) => {
                if (arg && (arg instanceof Event || (arg.constructor && arg.constructor.name.includes('Event')))) {
                    const copy = {};
                    const props = [
                        'key', 'code', 'clientX', 'clientY', 'offsetX', 'offsetY',
                        'target', 'type', 'button', 'buttons', 'shiftKey', 'ctrlKey', 
                        'altKey', 'metaKey', 'detail', 'deltaX', 'deltaY', 'deltaZ'
                    ];
                    props.forEach(k => { if (arg[k] !== undefined) copy[k] = arg[k]; });
                    copy.preventDefault = () => { try { arg.preventDefault(); } catch(e) {} };
                    copy.stopPropagation = () => { try { arg.stopPropagation(); } catch(e) {} };
                    return copy;
                }
                return arg;
            };

            const bridge = (cb) => {
                if (cb && cb.type === 'CLOSURE') {
                    return function(...args) {
                        if (!vmRef.current) return;
                        const safeArgs = args.map(captureEvent);
                        const t = vmRef.current.spawn(cb.code);
                        if (!t || t.status === 'SUPPRESSED') return;
                        
                        t.currentUpvalues = cb.upvalues;
                        t.environment = cb.environment || t.environment;
                        const ctx = (this === overrides || this === self || this === undefined) ? overrides.self : this;
                        t.currentScope = { 'this': ctx, 'arguments': safeArgs };
                        safeArgs.forEach((a, i) => t.currentScope[i] = a);
                        if (vmRef.current.wake) vmRef.current.wake();
                    };
                }
                return cb;
            };

            ['requestAnimationFrame','setTimeout','setInterval'].forEach(k => {
                if (typeof self[k] === 'function') overrides[k] = (cb, ...args) => self[k](bridge(cb), ...args);
            });
            ['cancelAnimationFrame','clearTimeout','clearInterval'].forEach(k => {
                if(self[k]) overrides[k] = self[k];
            });

            if (Internal.WorkerProxy) {
                overrides.Worker = function(u) { 
                    return new Internal.WorkerProxy(u, vmRef.current, options); 
                };
            }
            
            overrides.importScripts = async (...urls) => {
                if (vmRef.current && vmRef.current.importScripts) await vmRef.current.importScripts(...urls);
            };

            Object.defineProperty(overrides, 'document', {
                get() {
                    const doc = base.document || self.document;
                    return new Proxy(doc, {
                        get(t, p) {
                            if (p === 'getElementById') {
                                return (id) => {
                                    const el = t.getElementById(id);
                                    if (!el) return null;
                                    return new Proxy(el, {
                                        get(target, prop) {
                                            if (prop === 'addEventListener') return (ev, l, o) => target.addEventListener(ev, bridge(l), o);
                                            const val = target[prop];
                                            if (typeof val === 'function') return val.bind(target);
                                            return val;
                                        }
                                    });
                                };
                            }
                            if (p === 'addEventListener') return (ev, l, o) => t.addEventListener(ev, bridge(l), o);
                            const v = t[p];
                            return typeof v === 'function' ? v.bind(t) : v;
                        },
                        ownKeys(t) { return Reflect.ownKeys(t); },
                        getOwnPropertyDescriptor(t, p) { return Reflect.getOwnPropertyDescriptor(t, p); }
                    });
                },
                configurable: true
            });

            Object.defineProperty(overrides, '__vmRef', { value: vmRef });
            
            const ctx = new Proxy(overrides, {
                get(t, p) { 
                    if (p in t) return t[p];
                    return base[p];
                },
                set(t, p, v) {
                    if (p in t) { t[p] = (v && v.type === 'CLOSURE') ? bridge(v) : v; return true; }
                    base[p] = (v && v.type === 'CLOSURE') ? bridge(v) : v;
                    return true;
                },
                has(t, p) { return p in t || p in base; },
                ownKeys(t) {
                    return Array.from(new Set([...Reflect.ownKeys(t), ...Reflect.ownKeys(base)]));
                },
                getOwnPropertyDescriptor(t, p) {
                    return Reflect.getOwnPropertyDescriptor(t, p) || Reflect.getOwnPropertyDescriptor(base, p);
                }
            });
            
            overrides.self = overrides.window = overrides.globalThis = ctx;
            return ctx;
        }
    };

    class MerkavaCore {
        /**
         * B"H
         * The Main Execution Loop. Ignites the soul of the VM.
         */
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

                const context = Internal.ContextBuilder.build(options, memory);
                vm = new self.MerkavaVM(memory, options.hostAPI, context, options.importResolver);
                if (context.__vmRef) context.__vmRef.current = vm;
                
                vm._moduleCache = {};
                vm.importModule = async (url) => this._importModule(vm, url, options);
                vm.importScripts = async (...urls) => this._handleImportScripts(vm, urls, options);
                
                this._initDriver(vm, options);
            }

            const thread = vm.spawn(codeObject);
            if (vm.wake) vm.wake();
            
            return { 
                vm, memory, 
                stop: () => {
                    if (vm._driver) vm._driver.running = false;
                    vm.threads = []; 
                },
                done: new Promise((res, rej) => {
                    const mon = () => {
                        if (thread.status === 'COMPLETED') res({ status: 'COMPLETED', value: thread.stack.length ? thread.peek() : undefined });
                        else if (thread.status === 'CRASHED') {
                            const trace = thread.getDivineTrace ? thread.getDivineTrace() : ["Trace unavailable."];
                            const msg = `[Merkava SDK] VM Shattered.\n${trace.join('\n')}`;
                            if (options.hostAPI && options.hostAPI[0]) options.hostAPI[0]("[CRASH]", msg);
                            rej(new Error(msg));
                        }
                        else if (vm._driver && !vm._driver.running && vm.threads.length === 0) res({ status: 'TERMINATED' });
                        else setTimeout(mon, 50);
                    };
                    mon();
                })
            };
        }

        /**
         * B"H
         * The Module Loading Alchemist.
         * Creates a dedicated vessel for each module's truth.
         */
        async _importModule(vm, url, options) {
            if (vm._moduleCache[url]) return vm._moduleCache[url];
            
            const Compiler = self.MerkavaCompiler.Compiler;
            const Parser = self.MerkavahParser;
            
            let code;
            if (options.importResolver) {
                const res = await options.importResolver(url);
                code = res?.code || res;
            }
            if (!code) {
                const r = await fetch(url);
                if (r.ok) code = await r.text();
            }
            if (!code) throw new Error(`Could not resolve module: ${url}`);
            
            const ast = new Parser(code).parse();
            const codeObj = new Compiler().compile(ast);
            
            const exports = {};
            const thread = vm.spawn(codeObj);
            thread.environment = vm.context;
            thread.currentScope = { 'this': vm.context, 'exports': exports };
            
            if (vm.wake) vm.wake();
            
            await new Promise((resolve, reject) => {
                const check = () => {
                    if (thread.status === 'COMPLETED') resolve();
                    else if (thread.status === 'CRASHED') reject(new Error("Module execution failed: " + url));
                    else setTimeout(check, 10);
                };
                check();
            });
            
            vm._moduleCache[url] = exports;
            return exports;
        }

        /**
         * B"H
         * The Script Inhaler.
         * Leverages the Module Alchemist to populate the global exports vessel.
         */
        async _handleImportScripts(vm, urls, options) {
             const sharedExports = vm.context.exports;

             for (const url of urls) {
                 const moduleExports = await this._importModule(vm, url, options);
                 // B"H - Synchronize module exports with the global vessel
                 if (moduleExports && typeof moduleExports === 'object') {
                     Object.assign(sharedExports, moduleExports);
                 }
             }
        }

        initWorkerEnv(options) { return this; }
        
        _initDriver(vm, options) {
            vm._driver = { running: false, kick: () => {
                if (vm._driver.running) return;
                vm._driver.running = true;
                
                const loop = () => {
                    if (!vm._driver.running) return;
                    try { 
                        const active = vm.run(60000); 
                        if (active) {
                            requestAnimationFrame(loop);
                        } else {
                            if (vm.threads.some(t => t.status === 'RUNNING' || t.status === 'READY')) {
                                requestAnimationFrame(loop);
                            } else {
                                vm._driver.running = false; 
                            }
                        }
                    } catch (e) { 
                        console.error("[VM] Driver Pulse Stopped:", e); 
                        vm._driver.running = false; 
                    }
                };
                requestAnimationFrame(loop);
            }};
            vm.wake = () => vm._driver.kick();
        }
    }
    Internal.Core = new MerkavaCore();
})(typeof self !== 'undefined' ? self : this);
