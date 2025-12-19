
// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(root);
    else root.Merkava = factory(root);
}(typeof self !== 'undefined' ? self : this, function(root) {
    root = root || (typeof self !== 'undefined' ? self : this);
    let BASE_PATH = './'; 
    if (root.MERKAVA_OVERRIDE_BASE_PATH) BASE_PATH = root.MERKAVA_OVERRIDE_BASE_PATH;
    else {
        try {
            if (typeof document !== 'undefined' && document.currentScript) {
                const src = document.currentScript.src;
                BASE_PATH = src.substring(0, src.lastIndexOf('/') + 1);
            } else if (typeof self !== 'undefined' && self.location) {
                 const path = self.location.href;
                 BASE_PATH = path.substring(0, path.lastIndexOf('/') + 1);
            }
        } catch(e) {}
    }

    root.MerkavaSDK_Internal = {
        BASE_PATH: BASE_PATH,
        MODULES: [
            'merkava-opcodes.js',
            'merkava-memory/adapter.js',
            'merkava-memory/index.js',
            'merkava-vm/polyfills.js',
            // Executor Sub-modules
            'merkava-vm/executors/stack.js',
            'merkava-vm/executors/math.js',
            'merkava-vm/executors/flow.js',
            'merkava-vm/executors/objects.js',
            'merkava-vm/executors/functions.js',
            'merkava-vm/instructions.js', // The Dispatcher
            'merkava-vm/index.js',
            'merkava-vm/thread.js',
            'merkava-compiler/scope.js',
            'merkava-compiler/builder.js',
            'merkava-compiler/visitors.js',
            'merkava-compiler/visitors/declarations.js',
            'merkava-compiler/visitors/expressions.js',
            'merkava-compiler/visitors/statements.js',
            'merkava-compiler/visitors/literals.js',
            'merkava-compiler/index.js',
            'merkava-debugger.js',
            'merkava-sdk/utils.js',
            'merkava-sdk/worker-bootstrap.js',
            'merkava-sdk/worker-proxy.js',
            // 'merkava-sdk/context.js', // B"H - Merged into core.js to prevent undefined errors
            'merkava-sdk/core.js' 
        ],
        isLoaded: false
    };

    return {
        async run(source, options) {
            if (!root.MerkavaSDK_Internal.Core) await this.init();
            return root.MerkavaSDK_Internal.Core.run(source, options);
        },
        async init() {
            if (root.MerkavaSDK_Internal.isLoaded) return;
            const utilsUrl = BASE_PATH + 'merkava-sdk/utils.js';
            if (typeof importScripts === 'function') importScripts(utilsUrl);
            else {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = utilsUrl; s.onload = resolve; s.onerror = reject;
                    document.head.appendChild(s);
                });
            }
            await root.MerkavaSDK_Internal.Utils.loadModules(root.MerkavaSDK_Internal.MODULES);
            root.MerkavaSDK_Internal.isLoaded = true;
            console.log("B\"H - Merkava SDK Fully Ignited.");
        },
        async initWorker(options) {
            if (!root.MerkavaSDK_Internal.Core) await this.init();
            return root.MerkavaSDK_Internal.Core.initWorkerEnv(options);
        }
    };
}));
