// B"H
/**
 * @file MerkavaRuntimeBridge.js
 * @brief Browser/public-root bridge into the Chrome-free Merkava runtime.
 */

const MERKAVA_PUBLIC_MODULES = [
    '/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeGraph.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAddress.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/ImportResolver.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/HTMLAssembler.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/CSSAssembler.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualEvents.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElement.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualDocument.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualConsole.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualStorage.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetch.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualMouse.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualKeyboard.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/RuntimeProbe.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualInteractions.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindow.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-browser/SyntheticBrowserRuntime.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-node/VirtualNodeRuntime.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/ModuleExecutor.js',
    '/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js'
];

let merkavaLoadPromise = null;

async function loadRuntimeAssembler() {
    if (!merkavaLoadPromise) {
        merkavaLoadPromise = (async () => {
            for (const href of MERKAVA_PUBLIC_MODULES) await import(href);
            const RuntimeAssembler = globalThis.Merkava?.RuntimeAssembler;
            if (!RuntimeAssembler) throw new Error('Merkava RuntimeAssembler did not register on globalThis.Merkava.');
            return RuntimeAssembler;
        })();
    }
    return merkavaLoadPromise;
}

function normalize(run, options = {}) {
    const snapshot = run.result?.snapshot || null;
    const win = snapshot?.window || {};
    const errors = []
        .concat(snapshot?.errors || [])
        .concat(win.errors || [])
        .concat(run.result?.ok === false ? [{ message: run.result.error, stack: run.result.stack }] : [])
        .filter(Boolean);

    return {
        ok: run?.ok !== false && errors.length === 0,
        runtime: options.runtime || 'browser',
        entry: options.entry,
        console: run.console || win.console || [],
        errors,
        stackTraces: errors.map(e => e.stack).filter(Boolean),
        domSnapshot: win.document || snapshot?.document || null,
        networkLog: win.network || null,
        moduleGraph: run.assembly?.moduleGraph || null,
        assetGraph: run.assembly?.html || null,
        runtimeGraph: run.graph || run.assembly?.graph || null,
        score: errors.length ? 40 : 100,
        suggestions: errors.length ? ['Inspect stackTraces and add AST probes near the failing line.'] : [],
        raw: run
    };
}

export const MerkavaRuntimeBridge = {
    async assemble(options = {}) {
        const RuntimeAssembler = await loadRuntimeAssembler();
        const assembler = new RuntimeAssembler(options);
        return assembler.assemble(options.entry || 'index.html');
    },

    async simulate(options = {}) {
        const RuntimeAssembler = await loadRuntimeAssembler();
        const assembler = new RuntimeAssembler({
            runtime: options.runtime || 'browser',
            origin: options.origin || 'http://localhost:8080/',
            url: options.url || 'http://localhost:8080/',
            ...options
        });
        const run = await assembler.run(options.entry || 'index.html');
        return normalize(run, options);
    }
};

export { loadRuntimeAssembler };
