// B"H
/**
 * @file merkava-sdk.js
 * @version 1.5.9 - Fixed Infinite Loop & Object Output
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Merkava = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    let BASE_PATH = './'; 
    try {
        if (typeof document !== 'undefined' && document.currentScript) {
            const src = document.currentScript.src;
            BASE_PATH = src.substring(0, src.lastIndexOf('/') + 1);
        } else if (typeof self !== 'undefined' && self.location) {
             const url = self.location.href;
             if (url.includes('MerkavaExecutor')) {
                 BASE_PATH = url.substring(0, url.lastIndexOf('/') + 1);
             }
        }
    } catch(e) {}

    const PARSER_PATH = '../MerkavaASTParser/parser-core.js';

    // B"H - CRITICAL: Load 'index.js' (VM Class) BEFORE 'thread.js' (Thread Class)
    const MODULES = [
        'merkava-opcodes.js',
        'merkava-memory/adapter.js',
        'merkava-memory/index.js',
        'merkava-compiler/scope.js',
        'merkava-compiler/builder.js',
        'merkava-compiler/index.js',
        'merkava-vm/index.js',  // LOAD FIRST
        'merkava-vm/thread.js', // LOAD SECOND
        'merkava-debugger.js'
    ];

    const resolveUrl = (path) => {
        try {
            return new URL(path, new URL(BASE_PATH, self.location.href)).href;
        } catch (e) {
            return path;
        }
    };

    const loadScript = (filename) => {
        return new Promise((resolve, reject) => {
            const url = resolveUrl(filename) + "?t=" + Date.now();
            if (typeof importScripts === 'function') {
                try { importScripts(url); resolve(); } catch (e) { reject(e); }
            } else {
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load ${url}`));
                document.head.appendChild(script);
            }
        });
    };

    const getWorkerBootstrapCode = (basePath, parserPath) => `
        self.window = self;
        const ts = Date.now();
        ${MODULES.map(m => `importScripts('${new URL(m, basePath).href}?t=' + ts);`).join('\n')}
        importScripts('${parserPath}?t=' + ts); 

        self.onmessage = async (e) => {
            if (e.data && e.data.type === 'MERKAVA_INIT') {
                if (self.MerkavahParserPromise) await self.MerkavahParserPromise;

                const { sourceCode, options } = e.data;
                const workerContext = {
                    postMessage: (data) => self.postMessage({ type: 'MERKAVA_MSG', payload: data }),
                    onmessage: null,
                    close: () => self.close()
                };
                try {
                    await self.Merkava.run(sourceCode, {
                        ...options,
                        context: { ...options.context, ...workerContext }
                    });
                    self.addEventListener('message', (ev) => {
                        if (ev.data && ev.data.type === 'MERKAVA_MSG') {
                            if (typeof workerContext.onmessage === 'function') workerContext.onmessage({ data: ev.data.payload });
                        }
                    });
                } catch (err) { console.error("Worker Crash", err); }
            }
        };
    `;

    class MerkavaSDK {
        constructor() { this.isReady = false; }

        async init() {
            if (this.isReady) return;
            for (const mod of MODULES) await loadScript(mod);
            if (!self.MerkavahParserPromise && !self.MerkavahParser) await loadScript(PARSER_PATH);
            
            if (self.MerkavahParserPromise) this.ParserClass = await self.MerkavahParserPromise;
            else if (self.MerkavahParser) this.ParserClass = self.MerkavahParser;
            else throw new Error("Failed to load MerkavaParser");
            
            this.isReady = true;
        }

        async run(sourceCode, options = {}) {
            if (!this.isReady) await this.init();

            const Parser = this.ParserClass || self.MerkavahParser;
            if (!Parser) throw new Error("Parser not loaded");

            const parser = new Parser(sourceCode);
            if(parser.registerExpressionParsers) parser.registerExpressionParsers();
            if(parser.registerStatementParsers) parser.registerStatementParsers();
            if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();

            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error(parser.errors.join('\n'));

            const compiler = new self.MerkavaCompiler.Compiler();
            const codeObject = compiler.compile(ast);
            const memory = new self.MerkavaMemory.MemoryManager(options.ramLimit || 1000);
            
            // B"H - Patch missing Global handling on Memory Manager
            if (typeof memory.setGlobal !== 'function') {
                memory._internalGlobals = {};
                
                const getSafeKey = (key) => {
                    if (typeof key === 'string') return key;
                    if (typeof key === 'number') return String(key);
                    if (key && typeof key === 'object') {
                        if (key.name) return key.name;
                        if (key.value) return String(key.value);
                    }
                    return String(key);
                };

                memory.setGlobal = function(key, value) {
                    // B"H - FORCE UNBOXING: Ensure we store primitives, not VM Objects
                    // This fixes the infinite loop where arithmetic fails on objects
                    let v = value;
                    if (v && typeof v === 'object' && 'value' in v) {
                        v = v.value;
                    }
                    this._internalGlobals[getSafeKey(key)] = v;
                };
                memory.getGlobal = function(key) {
                    return this._internalGlobals[getSafeKey(key)];
                };
            }

            await memory.init();
            
            if (memory.nextPtr > 1 && !memory.ram.has(1)) await memory.resolveFault(1);
            if (memory.nextPtr === 1) memory.allocate({});

            const resolvedBasePath = new URL(BASE_PATH, self.location.href).href;
            const resolvedParserPath = resolveUrl(PARSER_PATH);

            class MerkavaWorker {
                constructor(scriptPath) {
                    this.onmessage = null;
                    this._init(scriptPath);
                }
                async _init(path) {
                    const src = options.importResolver ? await options.importResolver(path) : "";
                    const blob = new Blob([getWorkerBootstrapCode(resolvedBasePath, resolvedParserPath)], { type: 'application/javascript' });
                    this.native = new Worker(URL.createObjectURL(blob));
                    this.native.onmessage = (e) => {
                        if (e.data && e.data.type === 'MERKAVA_MSG' && this.onmessage) this.onmessage({ data: e.data.payload });
                    };
                    const safeOptions = { debug: options.debug, ramLimit: options.ramLimit };
                    this.native.postMessage({ type: 'MERKAVA_INIT', sourceCode: src, options: safeOptions });
                }
                postMessage(msg) { if(this.native) this.native.postMessage({ type: 'MERKAVA_MSG', payload: msg }); }
                terminate() { if(this.native) this.native.terminate(); }
            }

            const vmContext = { ...options.context, Worker: MerkavaWorker };
            
            // B"H - Wrap Host API to safely handle/unwrap VM objects in console
            const safeHostAPI = {};
            if (options.hostAPI) {
                for (const key in options.hostAPI) {
                    const fn = options.hostAPI[key];
                    if (typeof fn === 'function') {
                        safeHostAPI[key] = (...args) => {
                            // Aggressively unwrap args if they have a 'value' property
                            // This fixes [object Object] in console logs
                            const unwrappedArgs = args.map(arg => {
                                if (arg && typeof arg === 'object' && 'value' in arg) {
                                     return arg.value;
                                }
                                return arg;
                            });
                            return fn(...unwrappedArgs);
                        };
                    } else {
                        safeHostAPI[key] = fn;
                    }
                }
            }

            // Fallback for extending objects
            safeHostAPI[0xFF] = (t, s) => Object.assign(t || {}, s);

            const vm = new self.MerkavaVM(memory, safeHostAPI, vmContext);
            vm.spawn(codeObject);

            let dbg = null;
            if (options.debug) { dbg = new self.MerkavaDebugger(vm); dbg.attach(); }

            const done = new Promise((resolve, reject) => {
                const tick = () => {
                    try {
                        if (vm.run(options.cyclesPerTick || 1000)) {
                             if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick);
                             else setTimeout(tick, 0);
                        } else resolve({ status: 'COMPLETED' });
                    } catch (e) { reject(e); }
                };
                tick();
            });

            return { vm, memory, debugger: dbg, done };
        }
    }

    return new MerkavaSDK();
}));