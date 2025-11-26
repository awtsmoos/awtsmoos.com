// B"H
/**
 * @file merkava-sdk.js
 * @version 1.3.1 - The Fractal Worker (Restored)
 * @description
 * High-Level SDK that auto-injects the JS Standard Environment.
 * NOW SUPPORTS: Spawning nested Merkava instances via `new Worker()`.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('./merkava-opcodes.js'),
            require('./merkava-memory.js'),
            require('./merkava-compiler.js'),
            require('./merkava-vm.js'),
            require('./merkava-debugger.js'),
            null 
        );
    } else {
        root.Merkava = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    // B"H - Determine Absolute Base Path for Worker Imports
    // Workers cannot use relative paths easily in Blobs, so we fix the absolute path.
    let BASE_PATH = '/scripts/awtsmoos/MerkavaExecutor/'; 
    try {
        // Attempt to auto-detect if loaded via script tag
        if (typeof document !== 'undefined' && document.currentScript) {
            const src = document.currentScript.src;
            BASE_PATH = src.substring(0, src.lastIndexOf('/') + 1);
        } else if (typeof self !== 'undefined' && self.location) {
             // Fallback for inside a worker
             const url = self.location.href;
             if (url.includes('MerkavaExecutor')) {
                 BASE_PATH = url.substring(0, url.lastIndexOf('/') + 1);
             }
        }
    } catch(e) {}

    const loadScript = (filename) => {
        return new Promise((resolve, reject) => {
            if (typeof importScripts === 'function') {
                try { importScripts(BASE_PATH + filename); resolve(); } catch (e) { reject(e); }
            } else {
                if (filename.includes('opcodes') && window.MerkavaOpcodes) return resolve();
                if (filename.includes('memory') && window.MerkavaMemory) return resolve();
                if (filename.includes('compiler') && window.MerkavaCompiler) return resolve();
                if (filename.includes('vm') && window.MerkavaVM) return resolve();
                if (filename.includes('debugger') && window.MerkavaDebugger) return resolve();

                const script = document.createElement('script');
                script.src = BASE_PATH + filename;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load ${filename} from ${BASE_PATH}`));
                document.head.appendChild(script);
            }
        });
    };

    /**
     * B"H - The Standard Library Loader
     * Restored in v1.3.1
     */
    const getStandardContext = () => {
        const globalScope = typeof globalThis !== 'undefined' ? globalThis : 
                            (typeof self !== 'undefined' ? self : window);
        
        const context = {};

        const primitives = [
            'Object', 'Function', 'Boolean', 'Symbol', 
            'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
            'Number', 'BigInt', 'Math', 'Date',
            'String', 'RegExp',
            'Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array',
            'ArrayBuffer', 'SharedArrayBuffer', 'Atomics', 'DataView',
            'JSON', 'Promise', 'Generator', 'GeneratorFunction', 'AsyncFunction',
            'Map', 'Set', 'WeakMap', 'WeakSet',
            'Proxy', 'Reflect',
            'Intl'
        ];

        const utilities = [
            'console', 
            'parseInt', 'parseFloat', 'isNaN', 'isFinite', 
            'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
            'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate',
            'requestAnimationFrame', 'cancelAnimationFrame',
            'fetch', 'Headers', 'Request', 'Response',
            'TextEncoder', 'TextDecoder', 'URL', 'URLSearchParams',
            'Blob', 'Worker', 'Image', 'Audio', 'FileReader' 
        ];

         [...primitives, ...utilities].forEach(key => {
            if (typeof globalScope[key] !== 'undefined') {
                if (typeof globalScope[key] === 'function') {
                    context[key] = globalScope[key].bind(globalScope);
                } else {
                    context[key] = globalScope[key];
                }
            }
        });

        context.undefined = undefined;
        return context;
    };

    /**
     * B"H - The Worker Bootstrapper
     * This code runs INSIDE the new Native Worker to spin up a Merkava instance.
     */
    const getWorkerBootstrapCode = (basePath) => `
        // B"H - Merkava Worker Entry Point
        self.window = self; // Polyfill window for SDK
        
        // 1. Load the SDK logic (Native JS)
        importScripts('${basePath}merkava-opcodes.js');
        importScripts('${basePath}merkava-memory.js');
        importScripts('${basePath}merkava-compiler.js');
        importScripts('${basePath}merkava-vm.js');
        importScripts('${basePath}merkava-debugger.js');
        importScripts('${basePath}merkava-sdk.js'); // Load SDK to get Merkava.run

        // 2. Listen for Initialization
        self.onmessage = async (e) => {
            const msg = e.data;
            if (msg && msg.type === 'MERKAVA_INIT') {
                const { sourceCode, options } = msg;
                
                try {
                    // 3. Override Global postMessage to talk to Parent
                    // The guest code calls postMessage(...). We forward it natively.
                    const workerContext = {
                        postMessage: (data) => self.postMessage({ type: 'MERKAVA_MSG', payload: data }),
                        onmessage: null, // Guest will overwrite this
                        close: () => self.close(),
                        importScripts: () => { throw new Error("importScripts not supported in V1 Worker"); }
                    };

                    // 4. Run the VM
                    // We merge options but override context
                    await self.Merkava.run(sourceCode, {
                        ...options,
                        context: { ...options.context, ...workerContext },
                        hostAPI: {
                            ...options.hostAPI,
                        }
                    });

                    // 5. Handle Incoming Native Messages -> Guest onmessage
                    self.addEventListener('message', (nativeEvent) => {
                        if (nativeEvent.data && nativeEvent.data.type === 'MERKAVA_MSG') {
                            const payload = nativeEvent.data.payload;
                            // Access the Guest's onmessage handler from the VM scope
                            // Note: This requires the VM to have exposed the scope or we access context
                            if (typeof workerContext.onmessage === 'function') {
                                workerContext.onmessage({ data: payload });
                            }
                        }
                    });

                } catch (err) {
                    console.error("[Merkava Worker] Crash:", err);
                }
            }
        };
    `;

    class MerkavaSDK {
        constructor(config = {}) {
            if (config.basePath) BASE_PATH = config.basePath;
            this.ParserClass = config.parser || (typeof window !== 'undefined' ? window.MerkavahParser : null);
            this.isReady = false;
        }

        async init() {
            if (this.isReady) return;
            console.log("[Merkava] Booting System from " + BASE_PATH);
            try {
                await loadScript('merkava-opcodes.js');
                await loadScript('merkava-memory.js');
                await loadScript('merkava-compiler.js');
                await loadScript('merkava-vm.js');
                await loadScript('merkava-debugger.js');
            } catch (e) {
                console.error("[Merkava] Critical Boot Failure:", e);
                throw e;
            }

            if (!this.ParserClass && typeof window !== 'undefined') {
                if (!window.MerkavahParser) {
                    await loadScript('../MerkavaASTParser/parser-core.js'); 
                    if (window.MerkavahParserPromise) this.ParserClass = await window.MerkavahParserPromise;
                    else if (window.MerkavahParser) this.ParserClass = window.MerkavahParser;
                    else throw new Error("MerkavaASTParser could not be loaded.");
                } else {
                    this.ParserClass = window.MerkavahParser;
                }
            }
            this.isReady = true;
            console.log("[Merkava] System Ready.");
        }

        async run(sourceCode, options = {}) {
            if (!this.isReady) await this.init();

            if (!window.MerkavaCompiler || !window.MerkavaCompiler.Compiler) throw new Error("Merkava Compiler is missing.");
            if (!window.MerkavaVM) throw new Error("Merkava VM is missing.");

            console.log("[Merkava] Parsing...");
            const parser = new this.ParserClass(sourceCode);
            if(parser.registerExpressionParsers) parser.registerExpressionParsers();
            if(parser.registerStatementParsers) parser.registerStatementParsers();
            if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();
            
            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error(`Parsing Failed:\n${parser.errors.join('\n')}`);

            console.log("[Merkava] Compiling...");
            const compiler = new window.MerkavaCompiler.Compiler();
            const codeObject = compiler.compile(ast);

            console.log("[Merkava] Initializing Memory...");
            const memory = new window.MerkavaMemory.MemoryManager(options.ramLimit || 1000);
            await memory.init();

            if (memory.nextPtr === 1) {
                memory.allocate({});
            } else if (!memory.ram.has(1)) {
                const success = await memory.resolveFault(1);
                if (!success) memory.set(1, {}); 
            }

            // B"H - Define the Proxy Worker Class
            // This allows guest code to do: new Worker('chess.js')
            class MerkavaWorker {
                constructor(scriptPath) {
                    this.nativeWorker = null;
                    this.onmessage = null;
                    this.onerror = null;
                    this._init(scriptPath);
                }

                async _init(path) {
                    try {
                        // 1. Resolve Source using the Main Thread's resolver
                        let src = "";
                        if (options.importResolver) {
                            // We assume 'options.fileReader' is passed from html-preview-processor
                            if (options.fileReader) {
                                src = await options.fileReader(path);
                            } else {
                                console.warn("[Merkava] No fileReader option provided for Worker. Using importResolver (might fail if it executes).");
                                src = await options.importResolver(path, true); 
                            }
                        }

                        if (typeof src !== 'string') {
                            throw new Error("Worker source must be a string. Ensure fileReader returns text.");
                        }

                        // 2. Create Native Worker Blob
                        const bootstrap = getWorkerBootstrapCode(BASE_PATH);
                        const blob = new Blob([bootstrap], { type: 'application/javascript' });
                        this.nativeWorker = new window.Worker(URL.createObjectURL(blob));

                        // 3. Bridge Messages
                        this.nativeWorker.onmessage = (e) => {
                            if (e.data && e.data.type === 'MERKAVA_MSG') {
                                if (this.onmessage) this.onmessage({ data: e.data.payload });
                            }
                        };
                        this.nativeWorker.onerror = (e) => {
                            if (this.onerror) this.onerror(e);
                            else console.error("[Merkava Worker Error]", e);
                        };

                        // 4. Start the Fractal VM
                        this.nativeWorker.postMessage({
                            type: 'MERKAVA_INIT',
                            sourceCode: src,
                            options: { 
                                debug: options.debug,
                                cyclesPerTick: options.cyclesPerTick
                            }
                        });

                    } catch (e) {
                        console.error("[Merkava] Worker Init Failed:", e);
                        if (this.onerror) this.onerror(e);
                    }
                }

                postMessage(msg) {
                    if (this.nativeWorker) {
                        this.nativeWorker.postMessage({ type: 'MERKAVA_MSG', payload: msg });
                    } else {
                        console.warn("[Merkava] Worker not ready, message dropped:", msg);
                    }
                }
                
                terminate() {
                    if (this.nativeWorker) this.nativeWorker.terminate();
                }
            }

            const hostAPI = {
                0: (...args) => console.log("[VM stdout]", ...args),
                1: async (specifier) => {
                    if (options.importResolver) return await options.importResolver(specifier);
                    throw new Error(`Imports not supported: ${specifier}`);
                },
                2: (name, value) => { if (options.exportHandler) options.exportHandler(name, value); },
                
                // B"H - SYSCALL 0xFF: Universal Merge (Spread Operator)
                0xFF: (target, source) => {
                    if (Array.isArray(target)) {
                        if (Symbol.iterator in Object(source)) {
                            target.push(...source);
                        }
                        return target;
                    } else if (target && typeof target === 'object') {
                        return Object.assign(target, source);
                    }
                    return target;
                },
                
                ...options.hostAPI
            };
            
            const stdLib = getStandardContext();

            const createTypedArrayProxy = (TargetClass) => {
                return new Proxy(TargetClass, {
                    get: (target, prop) => {
                        if (prop === 'from') {
                            return (arg) => {
                                if (typeof arg === 'number' && memory.ram.has(arg)) {
                                    return target.from(memory.ram.get(arg));
                                }
                                return target.from(arg);
                            };
                        }
                        return target[prop];
                    }
                });
            };

            const smartContext = {
                ...stdLib,
                Float32Array: createTypedArrayProxy(Float32Array),
                Uint16Array: createTypedArrayProxy(Uint16Array),
                Uint8Array: createTypedArrayProxy(Uint8Array),
                // B"H - Inject Custom Worker Class
                Worker: MerkavaWorker
            };

            const finalContext = Object.assign(smartContext, options.context || {});

            const vm = new window.MerkavaVM(memory, hostAPI, finalContext);
            vm.spawn(codeObject);

            let debugTool = null;
            if (options.debug) {
                debugTool = new window.MerkavaDebugger(vm);
                debugTool.attach();
            }

            const executionPromise = new Promise((resolve, reject) => {
                const tick = () => {
                    try {
                        const running = vm.run(options.cyclesPerTick || 1000);
                        if (running) {
                            if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick);
                            else setTimeout(tick, 0);
                        } else {
                            resolve({ status: 'COMPLETED' });
                        }
                    } catch (e) {
                        e.message = `[Runtime] ${e.message}`;
                        reject(e);
                    }
                };
                tick();
            });

            return { vm, memory, debugger: debugTool, done: executionPromise };
        }
    }

    const sdk = new MerkavaSDK();
    sdk.MerkavaSDK = MerkavaSDK; 
    return sdk;
}));