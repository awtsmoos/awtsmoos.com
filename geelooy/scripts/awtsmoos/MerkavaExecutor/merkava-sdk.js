// B"H
/**
 * @file merkava-sdk.js
 * @version 1.1.0 - The Standard Library
 * @description
 * High-Level SDK that auto-injects the JS Standard Environment.
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

    // B"H - Explicitly define the path to the executor scripts directory.
    // This prevents relative path issues when running from different workspace locations.
    let BASE_PATH = '/scripts/awtsmoos/MerkavaExecutor/'; 

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
            'Blob', 'Worker', 'Image', 'Audio' // Added Image/Audio for games
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

            // Load Parser if needed
            if (!this.ParserClass && typeof window !== 'undefined') {
                if (!window.MerkavahParser) {
                    // Assuming parser is one level up in sibling directory based on provided structure
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

            // --- TIKKUN: Runtime Integrity Check ---
            if (!window.MerkavaCompiler || !window.MerkavaCompiler.Compiler) {
                throw new Error("Merkava Compiler is missing. The scripts failed to load correctly.");
            }
            if (!window.MerkavaVM) {
                throw new Error("Merkava VM is missing.");
            }

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

            const hostAPI = {
                0: (...args) => console.log("[VM stdout]", ...args),
                1: async (specifier) => {
                    if (options.importResolver) return await options.importResolver(specifier);
                    throw new Error(`Imports not supported: ${specifier}`);
                },
                2: (name, value) => { if (options.exportHandler) options.exportHandler(name, value); },
                
                // B"H - SYSCALL 0xFF: Universal Merge (Spread Operator)
                // Handles [...arr] and {...obj}
                0xFF: (target, source) => {
                    if (Array.isArray(target)) {
                        // Array Spread: target.push(...source)
                        if (Symbol.iterator in Object(source)) {
                            target.push(...source);
                        }
                        return target;
                    } else if (target && typeof target === 'object') {
                        // Object Spread: Object.assign(target, source)
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
                Uint8Array: createTypedArrayProxy(Uint8Array)
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
                        // B"H - Attempt to add context to the error
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