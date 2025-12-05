
// B"H
/**
 * @file merkava-sdk.js
 * @version 1.5.0 - The Orchestrator
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

    // The Manifest of Fragments
    const MODULES = [
        'merkava-opcodes.js',
        'merkava-memory/adapter.js',
        'merkava-memory/index.js',
        'merkava-compiler/scope.js',
        'merkava-compiler/builder.js',
        'merkava-compiler/index.js',
        'merkava-vm/thread.js',
        'merkava-vm/index.js',
        'merkava-debugger.js'
    ];

    const loadScript = (filename) => {
        return new Promise((resolve, reject) => {
            if (typeof importScripts === 'function') {
                try { 
                    const url = filename.startsWith('..') ? BASE_PATH + filename : BASE_PATH + filename;
                    importScripts(url); 
                    resolve(); 
                } catch (e) { reject(e); }
            } else {
                const script = document.createElement('script');
                script.src = filename.startsWith('..') ? BASE_PATH + filename : BASE_PATH + filename;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load ${filename}`));
                document.head.appendChild(script);
            }
        });
    };

    const getWorkerBootstrapCode = (basePath) => `
        self.window = self;
        // Load the fragmented world
        ${MODULES.map(m => `importScripts('${basePath}${m}');`).join('\n')}
        
        importScripts('${basePath}${PARSER_PATH}'); 

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
            
            // Load all shards sequentially
            for (const mod of MODULES) {
                await loadScript(mod);
            }
            
            if (!self.MerkavahParserPromise && !self.MerkavahParser) {
                await loadScript(PARSER_PATH);
            }
            
            if (self.MerkavahParserPromise) {
                this.ParserClass = await self.MerkavahParserPromise;
            } else if (self.MerkavahParser) {
                this.ParserClass = self.MerkavahParser;
            } else {
                throw new Error("Failed to load MerkavaParser");
            }
            
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
            await memory.init();
            
            if (memory.nextPtr > 1 && !memory.ram.has(1)) {
                await memory.resolveFault(1);
            }
            if (memory.nextPtr === 1) memory.allocate({});

            class MerkavaWorker {
                constructor(scriptPath) {
                    this.onmessage = null;
                    this._init(scriptPath);
                }
                async _init(path) {
                    const src = options.importResolver ? await options.importResolver(path) : "";
                    const blob = new Blob([getWorkerBootstrapCode(BASE_PATH)], { type: 'application/javascript' });
                    this.native = new Worker(URL.createObjectURL(blob));
                    this.native.onmessage = (e) => {
                        if (e.data && e.data.type === 'MERKAVA_MSG' && this.onmessage) this.onmessage({ data: e.data.payload });
                    };
                    const safeOptions = { 
                        debug: options.debug, 
                        ramLimit: options.ramLimit 
                    };
                    this.native.postMessage({ type: 'MERKAVA_INIT', sourceCode: src, options: safeOptions });
                }
                postMessage(msg) { if(this.native) this.native.postMessage({ type: 'MERKAVA_MSG', payload: msg }); }
                terminate() { if(this.native) this.native.terminate(); }
            }

            const vmContext = { 
                ...options.context, 
                Worker: MerkavaWorker 
            };
            
            const vm = new self.MerkavaVM(memory, { ...options.hostAPI, 0xFF: (t, s) => Object.assign(t || {}, s) }, vmContext);
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
