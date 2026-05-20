// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeGraph.js'), require('./ImportResolver.js'), require('./HTMLAssembler.js'), require('./CSSAssembler.js'), require('./ModuleExecutor.js'), require('../merkava-browser/SyntheticBrowserRuntime.js'), require('../merkava-node/VirtualNodeRuntime.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeAssembler = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).RuntimeAssembler; }
})(typeof self !== 'undefined' ? self : this, function(graphMod, resolverMod, htmlMod, cssMod, moduleMod, browserMod, nodeMod) {
    const RuntimeGraph = graphMod.RuntimeGraph, ImportResolver = resolverMod.ImportResolver;
    const HTMLAssembler = htmlMod.HTMLAssembler, CSSAssembler = cssMod.CSSAssembler, ModuleExecutor = moduleMod.ModuleExecutor;
    const SyntheticBrowserRuntime = browserMod.SyntheticBrowserRuntime, VirtualNodeRuntime = nodeMod.VirtualNodeRuntime;
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    /**
     * B"H
     * Builds and runs a virtual runtime while keeping the living runtime vessel visible
     * to higher Merkava service layers for probes, interactions, and final snapshots.
     */
    class RuntimeAssembler {
        constructor(options = {}) { this.options = options; this.files = options.files || {}; this.graph = new RuntimeGraph(); }

        assemble(entry = this.options.entry || 'index.js') {
            this.graph.node('runtime', { kind: this.options.runtime || 'browser', entry });
            const resolver = new ImportResolver({ files: this.files, graph: this.graph, origin: this.options.origin, base: entry });
            const moduleGraph = resolver.graphFrom(entry);
            const html = entry.endsWith('.html') ? new HTMLAssembler({ files: this.files, graph: this.graph, origin: this.options.origin, base: entry }).assemble(entry) : null;
            const css = html ? html.styles.map(s => new CSSAssembler({ files: this.files, graph: this.graph, origin: this.options.origin, base: s.href }).assemble(s.href)) : [];
            return { graph: this.graph.toJSON(), moduleGraph, html, css };
        }

        async run(entry = this.options.entry || 'index.js') {
            const assembly = this.assemble(entry);
            const runtime = this.options.runtime === 'node'
                ? new VirtualNodeRuntime({ files: this.files, env: this.options.env || {} })
                : new SyntheticBrowserRuntime({ files: this.files, graph: this.graph, url: this.options.url || this.options.origin });
            const globals = runtime.globals ? runtime.globals() : {};
            installProbeCapture(globals, runtime);

            let result;
            if (entry.endsWith('.html')) result = await this.runHTML(assembly.html, runtime, globals);
            else if (this.options.module || /\bimport\s|\bexport\s|\brequire\s*\(/.test(this.files[entry] || '')) {
                result = await runtime.executeFunction(() => new ModuleExecutor({ files: this.files, graph: this.graph, runtimeGlobals: globals, runtime: this.options.runtime }).execute(entry));
            } else {
                result = await runtime.executeFunction(this.options.execute || makeExecutor(this.files[entry] || '', this.options.runtime));
            }
            return { ok: result.ok, assembly, result, runtime, graph: this.graph.toJSON(), console: result.snapshot?.window?.console || result.snapshot?.logs || [] };
        }

        async runHTML(html, runtime, globals) {
            let last = null;
            for (const step of html.executionPlan) {
                const code = step.inline ? step.code : this.files[step.resolved] || '';
                if (step.type === 'module') last = await runtime.executeFunction(() => new ModuleExecutor({ files: this.files, graph: this.graph, runtimeGlobals: globals }).execute(step.resolved || step.from));
                else last = await runtime.executeFunction(makeExecutor(code, 'browser'));
                if (!last.ok) return last;
            }
            return last || await runtime.executeFunction(async () => null);
        }
    }

    function installProbeCapture(globals, runtime) {
        const capture = (label, value) => {
            if (runtime.window?.probe?.capture) return runtime.window.probe.capture(label, value);
            if (runtime.probe?.capture) return runtime.probe.capture(label, value);
            return value;
        };
        globals.__merkavaProbeCapture = capture;
        if (globals.window) globals.window.__merkavaProbeCapture = capture;
    }

    function makeExecutor(source, runtime) {
        if (!source.trim()) return async () => null;
        return runtime === 'node'
            ? async api => AsyncFunction('api', 'with(api){' + source + '\n}')(api)
            : async globals => AsyncFunction('globals', 'with(globals){' + source + '\n}')(globals);
    }
    return { RuntimeAssembler };
});
