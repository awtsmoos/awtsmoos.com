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

    let BASE_PATH = './'; 

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
                script.onerror = () => reject(new Error(`Failed to load ${filename}`));
                document.head.appendChild(script);
            }
        });
    };

    /**
     * B"H - The Standard Library Loader
     * Captures all standard JS Globals from the Host environment.
     */
    const getStandardContext = () => {
        const globalScope = typeof globalThis !== 'undefined' ? globalThis : 
                            (typeof self !== 'undefined' ? self : window);
        
        const context = {};

        // 1. The Essentials
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

        // 2. Web / Node Utilities
        const utilities = [
            'console', 
            'parseInt', 'parseFloat', 'isNaN', 'isFinite', 
            'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
            'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate',
            'requestAnimationFrame', 'cancelAnimationFrame',
            'fetch', 'Headers', 'Request', 'Response', // Network
            'TextEncoder', 'TextDecoder', 'URL', 'URLSearchParams'
        ];

        // 3. Inject into Context
        [...primitives, ...utilities].forEach(key => {
            if (typeof globalScope[key] !== 'undefined') {
                // B"H - Bind functions to globalScope to prevent 'illegal invocation' (crucial for fetch/timers)
                if (typeof globalScope[key] === 'function') {
                    context[key] = globalScope[key].bind(globalScope);
                } else {
                    context[key] = globalScope[key];
                }
            }
        });

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
            console.log("[Merkava] Booting System...");
            await loadScript('merkava-opcodes.js');
            await loadScript('merkava-memory.js');
            await loadScript('merkava-compiler.js');
            await loadScript('merkava-vm.js');
            await loadScript('merkava-debugger.js');

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

            console.log("[Merkava] initializing Memory...");
            const memory = new window.MerkavaMemory.MemoryManager(options.ramLimit || 1000);
            await memory.init();
            if (memory.nextPtr === 1) memory.allocate({}); 

            const hostAPI = {
                0: (...args) => console.log("[VM stdout]", ...args),
                1: async (specifier) => {
                    if (options.importResolver) return await options.importResolver(specifier);
                    throw new Error(`Imports not supported: ${specifier}`);
                },
                2: (name, value) => { if (options.exportHandler) options.exportHandler(name, value); },
                ...options.hostAPI
            };

            // B"H - MERGE CONTEXTS
            // 1. Standard Library (Automatic)
            // 2. User Options (Specific overrides)
            const stdLib = getStandardContext();
            
            // Inject System Helpers
            const systemHelpers = {
                // Allows scripts to pass real arrays/objects to Host APIs instead of pointers
                $unwrap: (val) => {
                    if (typeof val === 'number' && memory.ram.has(val)) {
                        return memory.ram.get(val);
                    }
                    return val;
                }
            };

            const finalContext = Object.assign(stdLib, options.context || {}, systemHelpers);
            const vm = new window.MerkavaVM(memory, hostAPI, finalContext);
            const threadId = vm.spawn(codeObject);

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