// B"H
/**
 * @file merkava-sdk.js
 * @version 1.4.3 - The Fractal Worker (Rectified)
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

    // B"H - Path to the Immutable Parser
    const PARSER_PATH = '../MerkavaASTParser/parser-core.js';

    const loadScript = (filename) => {
        return new Promise((resolve, reject) => {
            if (typeof importScripts === 'function') {
                try { 
                    // B"H - Relative paths in importScripts need absolute base in some envs
                    const url = filename.startsWith('..') ? BASE_PATH + filename : BASE_PATH + filename;
                    importScripts(url); 
                    resolve(); 
                } catch (e) { reject(e); }
            } else {
                const globalName = filename.replace('.js','').replace(/-/g,'');
                if (window[globalName]) return resolve();
                const script = document.createElement('script');
                // B"H - Browser handles relative paths natively
                script.src = filename.startsWith('..') ? BASE_PATH + filename : BASE_PATH + filename;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load ${filename}`));
                document.head.appendChild(script);
            }
        });
    };

    const getWorkerBootstrapCode = (basePath) => `
        self.window = self;
        importScripts('${basePath}merkava-opcodes.js');
        importScripts('${basePath}merkava-memory.js');
        importScripts('${basePath}merkava-compiler.js');
        importScripts('${basePath}merkava-vm.js');
        importScripts('${basePath}merkava-debugger.js');
        importScripts('${basePath}merkava-sdk.js'); 
        
        // Load External Parser
        importScripts('${basePath}${PARSER_PATH}'); 

        self.onmessage = async (e) => {
            if (e.data && e.data.type === 'MERKAVA_INIT') {
                // Wait for Parser Promise
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
            await loadScript('merkava-opcodes.js');
            await loadScript('merkava-memory.js');
            await loadScript('merkava-compiler.js');
            await loadScript('merkava-vm.js');
            await loadScript('merkava-debugger.js');
            
            // Load external parser
            if (!self.MerkavahParserPromise && !self.MerkavahParser) {
                await loadScript(PARSER_PATH);
            }
            
            if (self.MerkavahParserPromise) {
                this.ParserClass = await self.MerkavahParserPromise;
            } else if (self.MerkavahParser) {
                this.ParserClass = self.MerkavahParser;
            } else {
                throw new Error("Failed to load MerkavaParser from " + PARSER_PATH);
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
                        // TIKKUN: Guard against null e.data
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