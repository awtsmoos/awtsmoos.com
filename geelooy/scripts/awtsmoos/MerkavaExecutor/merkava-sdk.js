//B"H
/**
 * @file merkava-sdk.js
 * @version 1.0.0 - The Interface of Man
 * @description
 * The High-Level SDK for the Merkava Virtual Machine.
 * 
 * This is the single entry point for developers. It handles:
 * 1. **Loading Dependencies**: Ensures Parser, Opcodes, Memory, Compiler, VM, and Debugger are loaded.
 * 2. **Configuration**: Sets up RAM limits, IndexedDB names, and file paths.
 * 3. **Execution**: Provides a simple `run()` method that takes source code and handles the entire lifecycle (Parse -> Compile -> Load -> Execute).
 * 4. **Bridge**: Maps custom `import` and `export` handlers to the VM's internal logic.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        // Node.js: Assume dependencies are available via require
        module.exports = factory(
            require('./merkava-opcodes.js'),
            require('./merkava-memory.js'),
            require('./merkava-compiler.js'),
            require('./merkava-vm.js'),
            require('./merkava-debugger.js'),
            // Assuming Parser is available or passed in options
            null 
        );
    } else {
        // Browser: Expose global
        root.Merkava = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    // Base path for dynamic loading (can be overridden)
    let BASE_PATH = './'; 

    /**
     * Helper to load a script file dynamically in the browser/worker.
     */
    const loadScript = (filename) => {
        return new Promise((resolve, reject) => {
            if (typeof importScripts === 'function') {
                // Web Worker
                try {
                    importScripts(BASE_PATH + filename);
                    resolve();
                } catch (e) { reject(e); }
            } else {
                // Main Thread
                // Check if already loaded
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

    class MerkavaSDK {
        /**
         * @param {object} config 
         * @param {string} [config.basePath='./'] - Path to the merkava-*.js files.
         * @param {object} [config.parser] - Pre-loaded MerkavaASTParser class (optional).
         */
        constructor(config = {}) {
            if (config.basePath) BASE_PATH = config.basePath;
            this.ParserClass = config.parser || (typeof window !== 'undefined' ? window.MerkavahParser : null);
            this.isReady = false;
        }

        /**
         * Initialize the environment. Loads all necessary script files.
         */
        async init() {
            if (this.isReady) return;

            console.log("[Merkava] Booting System...");
            
            // Load Core VM files
            await loadScript('merkava-opcodes.js');
            await loadScript('merkava-memory.js');
            await loadScript('merkava-compiler.js');
            await loadScript('merkava-vm.js');
            await loadScript('merkava-debugger.js');

            // If Parser wasn't passed in constructor, try to find it globally or load it
            if (!this.ParserClass && typeof window !== 'undefined') {
                if (!window.MerkavahParser) {
                    // Assuming parser-core.js is in the same path
                    // Adjust this specific filename based on your Parser's actual entry file
                    await loadScript('../MerkavaASTParser/parser-core.js'); 
                    
                    // Wait for the Parser's promise to resolve
                    if (window.MerkavahParserPromise) {
                        this.ParserClass = await window.MerkavahParserPromise;
                    } else if (window.MerkavahParser) {
                        this.ParserClass = window.MerkavahParser;
                    } else {
                        throw new Error("MerkavaASTParser could not be loaded.");
                    }
                } else {
                    this.ParserClass = window.MerkavahParser;
                }
            }

            this.isReady = true;
            console.log("[Merkava] System Ready.");
        }

        /**
         * Compiles and Runs JavaScript code within the Virtual Machine.
         * 
         * @param {string} sourceCode - The JavaScript code to run.
         * @param {object} options - Execution options.
         * @param {function(specifier): Promise<any>} [options.importResolver] - Hook to resolve `import`.
         * @param {function(name, value): void} [options.exportHandler] - Hook to handle `export`.
         * @param {object} [options.hostAPI] - Custom functions exposed to the VM via SYSCALL.
         * @param {number} [options.ramLimit=1000] - Max objects in RAM before offloading to Disk.
         * @param {boolean} [options.debug=false] - Return the debugger instance.
         * @param {number} [options.cyclesPerTick=1000] - Speed of execution loop.
         * 
         * @returns {Promise<object>} The Process Context { vm, memory, debugger, resultPromise }.
         */
        async run(sourceCode, options = {}) {
            if (!this.isReady) await this.init();

            // 1. PARSE
            console.log("[Merkava] Parsing...");
            const parser = new this.ParserClass(sourceCode);
            
            // Ensure parser extensions are registered (if the parser requires it)
            if(parser.registerExpressionParsers) parser.registerExpressionParsers();
            if(parser.registerStatementParsers) parser.registerStatementParsers();
            if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();
            
            const ast = parser.parse();
            if (parser.errors.length > 0) {
                throw new Error(`Parsing Failed:\n${parser.errors.join('\n')}`);
            }

            // 2. COMPILE
            console.log("[Merkava] Compiling...");
            const compiler = new window.MerkavaCompiler.Compiler();
            const codeObject = compiler.compile(ast);

            // 3. INITIALIZE MEMORY (The VMM)
            console.log("[Merkava] initializing Memory...");
            const memory = new window.MerkavaMemory.MemoryManager(options.ramLimit || 1000);
            await memory.init();
		// B"H - BOOTSTRAP GLOBAL SCOPE
            // If this is a fresh database, Ptr 1 (Global) hasn't been allocated.
            // We must ensure Ptr 1 exists as an object.
            if (memory.nextPtr === 1) {
                memory.allocate({}); // Allocates Ptr 1
                console.log("[Merkava] Global Scope (Ptr 1) Created.");
            }
            // 4. PREPARE HOST API & IMPORTS
            // We map specific SYSCALL IDs to host functions.
            const hostAPI = {
                // 0: Print (console.log)
                0: (...args) => console.log("[VM stdout]", ...args),
                
                // 1: Import (Dynamic)
                // VM calls this when it hits an IMPORT expression/opcode
                1: async (specifier) => {
                    if (options.importResolver) {
                        return await options.importResolver(specifier);
                    }
                    throw new Error(`Imports not supported (No resolver provided for ${specifier})`);
                },

                // 2: Export
                2: (name, value) => {
                    if (options.exportHandler) {
                        options.exportHandler(name, value);
                    }
                },

                // Merge user-provided API
                ...options.hostAPI
            };

            // 5. SPAWN VM with Robust Context
            // B"H - Auto-inject standard Browser Globals if user/UI forgot them
            const baseContext = {
                window: (typeof window !== 'undefined' ? window : {}),
                document: (typeof document !== 'undefined' ? document : {}),
                console: console,
                fetch: (typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : null)
            };

            // Merge User Context on top
            const finalContext = Object.assign(baseContext, options.context || {});

            const vm = new window.MerkavaVM(memory, hostAPI, finalContext);
            const threadId = vm.spawn(codeObject);

            // 6. SETUP DEBUGGER (Optional)
            let debugTool = null;
            if (options.debug) {
                debugTool = new window.MerkavaDebugger(vm);
                debugTool.attach();
            }

            // 7. START EXECUTION LOOP
            // We return a promise that resolves when the main thread completes.
            const executionPromise = new Promise((resolve, reject) => {
                const tick = () => {
                    try {
                        const running = vm.run(options.cyclesPerTick || 1000);
                        
                        if (running) {
                            // Continue next frame (non-blocking to browser UI)
                            if (typeof requestAnimationFrame !== 'undefined') {
                                requestAnimationFrame(tick);
                            } else {
                                setTimeout(tick, 0); // Node.js / Worker fallback
                            }
                        } else {
                            // Check status of main thread
                            const thread = vm.threads.find(t => t.id === threadId); // Might be cleaned up if completed
                            // If thread is gone, it finished successfully in our simplified VM
                            resolve({ status: 'COMPLETED' });
                        }
                    } catch (e) {
                        reject(e);
                    }
                };
                tick();
            });

            return {
                vm,
                memory,
                debugger: debugTool,
                done: executionPromise
            };
        }
    }

    // Singleton instance for ease of use, but class is exposed too.
    const sdk = new MerkavaSDK();
    sdk.MerkavaSDK = MerkavaSDK; // Expose class for custom instancing

    return sdk;
}));