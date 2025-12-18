
// B"H
/**
 * Merkava SDK Bootloader
 * "The Keter (Crown) that connects the Infinite to the Finite."
 */
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(root);
    else root.Merkava = factory(root);
}(typeof self !== 'undefined' ? self : this, function(root) {
    // Ensure root is defined
    root = root || (typeof self !== 'undefined' ? self : this);

    // 1. Determine Base Path for Dynamic Loading
    let BASE_PATH = './'; 
    
    // B"H - Worker Override: Allow Blob workers to know their true origin
    if (root.MERKAVA_OVERRIDE_BASE_PATH) {
        BASE_PATH = root.MERKAVA_OVERRIDE_BASE_PATH;
    } else {
        try {
            if (typeof document !== 'undefined' && document.currentScript) {
                const src = document.currentScript.src;
                BASE_PATH = src.substring(0, src.lastIndexOf('/') + 1);
            } else if (typeof self !== 'undefined' && self.location) {
                 // Heuristic for Workers (if not overridden)
                 const path = self.location.href;
                 BASE_PATH = path.substring(0, path.lastIndexOf('/') + 1);
            }
        } catch(e) {}
    }

    // Global Registry for SDK Modules
    root.MerkavaSDK_Internal = {
        BASE_PATH: BASE_PATH,
        MODULES: [
            // Core Runtime
            'merkava-opcodes.js',
            'merkava-memory/adapter.js',
            'merkava-memory/index.js',
            'merkava-vm/polyfills.js',
            'merkava-vm/instructions.js',
            'merkava-vm/index.js',
            'merkava-vm/thread.js',
            // Compiler
            'merkava-compiler/scope.js',
            'merkava-compiler/builder.js',
            'merkava-compiler/visitors.js',
            // B"H - Ensure Visitors are loaded BEFORE the Compiler Index
            'merkava-compiler/visitors/declarations.js',
            'merkava-compiler/visitors/expressions.js',
            'merkava-compiler/visitors/statements.js',
            'merkava-compiler/visitors/literals.js',
            'merkava-compiler/index.js',
            // Tools
            'merkava-debugger.js',
            // SDK Split Modules (New)
            'merkava-sdk/utils.js',
            'merkava-sdk/worker-bootstrap.js', // B"H - New Bootstrap Module
            'merkava-sdk/worker-proxy.js',
            'merkava-sdk/core.js' 
        ],
        isLoaded: false
    };

    // Lightweight Facade
    return {
        async run(source, options) {
            if (!root.MerkavaSDK_Internal.Core) {
                await this.init();
            }
            return root.MerkavaSDK_Internal.Core.run(source, options);
        },
        
        async init() {
            if (root.MerkavaSDK_Internal.isLoaded) return;
            
            const utilsUrl = BASE_PATH + 'merkava-sdk/utils.js';
            
            // 1. Load Utils first to get the loader
            if (typeof importScripts === 'function') {
                importScripts(utilsUrl);
            } else {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = utilsUrl;
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
            }

            // 2. Utils loaded, use it to load the rest
            await root.MerkavaSDK_Internal.Utils.loadModules(root.MerkavaSDK_Internal.MODULES);
            
            root.MerkavaSDK_Internal.isLoaded = true;
            console.log("B\"H - Merkava SDK Fully Ignited.");
        },

        // Called by Child Workers to bootstrap themselves
        async initWorker(options) {
            if (!root.MerkavaSDK_Internal.Core) {
                 await this.init();
            }
            return root.MerkavaSDK_Internal.Core.initWorkerEnv(options);
        }
    };
}));
