// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeGraph.js'), require('./ImportResolver.js'), require('./HTMLAssembler.js'), require('./CSSAssembler.js'), require('./ModuleExecutor.js'), require('../merkava-browser/SyntheticBrowserRuntime.js'), require('../merkava-node/VirtualNodeRuntime.js'), require('./DOMHydrator.js'), require('../merkava-binary/MerkavaVmFileExecutor.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeAssembler = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava.DOMHydrator || root.Merkava, root.Merkava).RuntimeAssembler; }
})(typeof self !== 'undefined' ? self : this, function(graphMod, resolverMod, htmlMod, cssMod, moduleMod, browserMod, nodeMod, domHydratorMod, vmFileMod) {
    const RuntimeGraph = graphMod.RuntimeGraph, ImportResolver = resolverMod.ImportResolver;
    const HTMLAssembler = htmlMod.HTMLAssembler, CSSAssembler = cssMod.CSSAssembler, ModuleExecutor = moduleMod.ModuleExecutor;
    const SyntheticBrowserRuntime = browserMod.SyntheticBrowserRuntime, VirtualNodeRuntime = nodeMod.VirtualNodeRuntime;
    const hydrateHTML = domHydratorMod.hydrateHTML || (() => ({ ok: false, count: 0 }));
    const executeVmFiles = vmFileMod.executeVmFiles;
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    /**
     * B"H
     * Chapter 11: The dynamic module was no longer a shadow. It was fetched
     * from the same localhost river the browser drinks from, lowered into
     * bytecode, and allowed to fail with its own face, its own stack, its own cry.
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
            runtime.__merkavaGlobals = globals;
            installProbeCapture(globals, runtime);
            installDynamicImport(globals, runtime, this.graph, this.options, this.files);

            let result;
            if (entry.endsWith('.html')) result = await this.runHTML(assembly.html, runtime, globals);
            else if (this.options.module || /\bimport\s|\bexport\s|\brequire\s*\(/.test(this.files[entry] || '')) {
                result = await runtime.executeFunction(() => runModuleFile({ files: this.files, entry, globals, runtime: this.options.runtime, graph: this.graph }));
            } else {
                result = await runtime.executeFunction(this.options.execute || makeExecutor(this.files[entry] || '', this.options.runtime));
            }
            return { ok: result.ok, assembly, result, runtime, graph: this.graph.toJSON(), console: result.snapshot?.window?.console || result.snapshot?.logs || [] };
        }

        async runHTML(html, runtime, globals) {
            hydrateHTML(runtime.window?.document, this.files[html.entry] || '');
            let last = null;
            for (const step of html.executionPlan) {
                const code = step.inline ? step.code : this.files[step.resolved] || '';
                if (step.type === 'module') last = await runtime.executeFunction(() => runModuleFile({ files: this.files, entry: step.resolved || step.from, globals, runtime: this.options.runtime || 'browser', graph: this.graph }));
                else last = await runtime.executeFunction(makeExecutor(code, 'browser'));
                if (!last.ok) return last;
            }
            const lifecycle = await dispatchBrowserLifecycle(runtime, this.options.waitMs || 75);
            return lifecycle || last || await runtime.executeFunction(async () => null);
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

    function installDynamicImport(globals, runtime, graph, options, seedFiles) {
        const loader = createDynamicModuleLoader({ globals, runtime, graph, options, seedFiles });
        globals.__merkavaDynamicImport = loader;
        if (globals.window) globals.window.__merkavaDynamicImport = loader;
    }

    function createDynamicModuleLoader({ globals, runtime, graph, options, seedFiles }) {
        const cache = new Map();
        const pageUrl = safeUrl(options.url || runtime.window?.location?.href || options.origin || 'http://localhost/');
        return specifier => {
            const spec = String(specifier || '');
            const href = safeUrl(spec, pageUrl.href)?.href || spec;
            graph?.event?.('module.dynamicImport', { specifier: spec, href });
            return (async () => {
                if (!href) throw new Error('Dynamic import received an empty module specifier.');
                if (cache.has(href)) return cache.get(href);
                const env = await collectDynamicModuleEnv(href, pageUrl, seedFiles, graph, options);
                const result = await runModuleFile({ files: env.files, entry: env.entry, globals, runtime: 'browser', graph });
                if (result?.exports) cache.set(href, result.exports);
                return result?.exports || {};
            })();
        };
    }

    async function collectDynamicModuleEnv(href, pageUrl, seedFiles, graph, options) {
        const files = { ...(seedFiles || {}) };
        const queue = [{ href, key: keyForUrl(safeUrl(href), pageUrl) }];
        const seen = new Set();
        const maxFiles = Number(options.maxDynamicFiles || options.maxFiles || 80);
        while (queue.length && seen.size < maxFiles) {
            const job = queue.shift();
            if (!job?.href || seen.has(job.href)) continue;
            seen.add(job.href);
            const got = await fetchText(job.href);
            files[job.key] = got;
            files['/' + job.key.replace(/^\//, '')] = got;
            graph?.event?.('module.dynamicImport.fetch', { href: job.href, key: job.key });
            for (const ref of staticModuleRefs(got)) {
                const next = safeUrl(ref, job.href);
                if (!next || (pageUrl && next.origin !== pageUrl.origin)) continue;
                const key = keyForUrl(next, pageUrl);
                if (!seen.has(next.href) && files[key] === undefined) queue.push({ href: next.href, key });
            }
        }
        return { entry: keyForUrl(safeUrl(href), pageUrl), files };
    }

    async function fetchText(href) {
        const response = await fetch(href, { headers: { accept: 'text/javascript,*/*' } });
        if (!response.ok) throw new Error(`Dynamic module fetch failed: ${href} (${response.status})`);
        return await response.text();
    }

    function staticModuleRefs(source) {
        const refs = [];
        for (const match of String(source || '').matchAll(/import\s+[^('";]+?\s+from\s+["']([^"']+)["']/g)) refs.push(match[1]);
        for (const match of String(source || '').matchAll(/export\s+[^"']*?\s+from\s+["']([^"']+)["']/g)) refs.push(match[1]);
        return refs;
    }

    function keyForUrl(url, pageUrl) {
        const pageDir = pageUrl ? pageUrl.pathname.replace(/\/[^/]*$/, '/') : '/';
        const pathname = decodeURIComponent(url.pathname || '').replace(/^\/+/, '');
        const base = pageDir.replace(/^\/+/, '');
        return pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
    }

    function safeUrl(spec, base) {
        try { return new URL(spec, base); } catch (_) { return null; }
    }

    async function dispatchBrowserLifecycle(runtime, waitMs) {
        if (!runtime.window || !runtime.window.document) return null;
        return await runtime.executeFunction(async globals => {
            const win = globals.window;
            const doc = globals.document;
            const make = type => new globals.Event(type, { bubbles: false, cancelable: false });
            doc.readyState = 'interactive';
            doc.dispatchEvent(make('DOMContentLoaded'));
            doc.readyState = 'complete';
            win.dispatchEvent(make('load'));
            await new Promise(resolve => globals.setTimeout(resolve, Number(waitMs || 75)));
            return { lifecycle: ['DOMContentLoaded', 'load'] };
        });
    }

    function makeExecutor(source, runtime) {
        if (!source.trim()) return async () => null;
        return runtime === 'node'
            ? async api => AsyncFunction('api', 'with(api){' + source + '\n}')(api)
            : async globals => AsyncFunction('globals', 'with(globals){' + source + '\n}')(globals);
    }
    async function runModuleFile(options) {
        if (typeof executeVmFiles === 'function') return executeVmFiles(options);
        return new ModuleExecutor(options).execute(options.entry);
    }
    return { RuntimeAssembler };
});
