// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.Merkava = factory();
}(typeof self !== 'undefined' ? self : this, function() {

    let BASE_PATH = './'; 
    try {
        if (typeof document !== 'undefined' && document.currentScript) {
            BASE_PATH = document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf('/') + 1);
        }
    } catch(e) {}

    const PARSER_PATH = '../MerkavaASTParser/parser-core.js';

    // B"H - Updated Load Order
    const MODULES = [
        'merkava-opcodes.js',
        'merkava-memory/adapter.js',
        'merkava-memory/index.js',
        'merkava-vm/instructions.js', 
        'merkava-vm/index.js',
        'merkava-vm/thread.js',
        'merkava-compiler/scope.js',
        'merkava-compiler/builder.js',
        'merkava-compiler/visitors.js', 
        'merkava-compiler/index.js',
        'merkava-debugger.js'
    ];

    const resolveUrl = (path) => {
        try { return new URL(path, new URL(BASE_PATH, self.location.href)).href; } 
        catch (e) { return path; }
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

    class MerkavaSDK {
        constructor() { this.isReady = false; }
        
        async init() {
            if (this.isReady) return;
            
            // 1. Load Internal Modules
            for (const mod of MODULES) await loadScript(mod);
            
            // 2. Load Parser if not present
            if (!self.MerkavahParser) {
                await loadScript(PARSER_PATH);
                // B"H - THE FIX: Wait for the promise exposed by parser-core
                if (self.MerkavahParserPromise) {
                    self.MerkavahParser = await self.MerkavahParserPromise;
                }
            }
            
            if (!self.MerkavahParser) throw new Error("MerkavahParser failed to initialize.");
            
            this.isReady = true;
        }

        async run(source, options = {}) {
            if (!this.isReady) await this.init();
            
            const Parser = self.MerkavahParser;
            const parser = new Parser(source);
            
            // Register Parsers (Parser core handles this, but good to ensure)
            if(parser.registerExpressionParsers) parser.registerExpressionParsers();
            if(parser.registerStatementParsers) parser.registerStatementParsers();
            if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();

            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error(parser.errors.join('\n'));

            const compiler = new self.MerkavaCompiler.Compiler();
            const codeObject = compiler.compile(ast);
            const memory = new self.MerkavaMemory.MemoryManager(options.ramLimit || 1000);
            await memory.init();
            
            // Patch Globals
            if(!memory.setGlobal) {
                memory._g = {};
                memory.setGlobal = (k,v) => memory._g[k] = v;
                memory.getGlobal = (k) => memory._g[k];
            }
            
            if (memory.nextPtr === 1) memory.allocate({});

            // Worker Logic
            class MerkavaWorker {
                constructor(script) {
                    console.log("MerkavaWorker spawned (Simulation)");
                }
                postMessage(msg) { console.log("Worker MSG:", msg); }
            }

            const vmContext = { ...options.context, Worker: MerkavaWorker, SharedArrayBuffer: self.SharedArrayBuffer };
            
            const vm = new self.MerkavaVM(memory, options.hostAPI || {}, vmContext);
            vm.spawn(codeObject);

            let dbg = options.debug ? new self.MerkavaDebugger(vm) : null;
            if(dbg) dbg.attach();

            const done = new Promise((resolve, reject) => {
                const tick = () => {
                    try {
                        if (vm.run(1000)) requestAnimationFrame(tick);
                        else resolve({ status: 'COMPLETED' });
                    } catch(e) { reject(e); }
                };
                tick();
            });

            return { vm, memory, debugger: dbg, done };
        }
    }

    return new MerkavaSDK();
}));