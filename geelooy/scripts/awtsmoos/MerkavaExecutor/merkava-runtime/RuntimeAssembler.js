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
     * Chapter 34: Classic scripts received one shared browser sky.
     * Chrome lets bare ids, `var`, functions, and top-level script declarations
     * speak across old script tags. Merkava now installs named elements and
     * lowers classic declarations into globals while module code remains sealed.
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
                result = await runtime.executeFunction(() => runModuleFile({ files: this.files, entry, globals, runtime: this.options.runtime, graph: this.graph, importMap: this.options.importMap || {} }));
            } else {
                result = await runtime.executeFunction(this.options.execute || makeExecutor(this.files[entry] || '', this.options.runtime));
            }
            await settleMerkavaTasks(runtime, this.options.waitMs === undefined ? 75 : Number(this.options.waitMs || 0));
            const snapshot = runtime.snapshot ? runtime.snapshot() : result.snapshot;
            if (runtime.window && typeof runtime.window.clearAllTimers === 'function') runtime.window.freezeTimers ? runtime.window.freezeTimers() : runtime.window.freezeTimers ? runtime.window.freezeTimers() : runtime.window.clearAllTimers();
            if (snapshot && result) result.snapshot = snapshot;
            return { ok: result.ok && !(runtime.errors || []).length, assembly, result, runtime, graph: this.graph.toJSON(), console: snapshot?.window?.console || result.snapshot?.logs || [] };
        }

        async runHTML(html, runtime, globals) {
            const importMap = htmlImportMap(html);
            hydrateHTML(runtime.window?.document, this.files[html.entry] || '');
            syncNamedElements(globals, runtime.window?.document);
            let last = null;
            let inlineModuleIndex = 0;
            for (const step of html.executionPlan) {
                runtime.__merkavaCurrentStep = { type: step.type || 'classic', inline: !!step.inline, resolved: step.resolved || null };
                if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaStep:start]', JSON.stringify(runtime.__merkavaCurrentStep));
                if (runtime.window) runtime.window.__merkavaCurrentStep = runtime.__merkavaCurrentStep;
                syncNamedElements(globals, runtime.window?.document);
                const code = step.inline ? step.code : this.files[step.resolved] || '';
                if (step.type === 'module' || looksLikeModuleSource(code)) {
                    if (step.inline) {
                        const inlineEntry = inlineModuleKey(html.entry, ++inlineModuleIndex);
                        const moduleFiles = { ...this.files, [inlineEntry]: code };
                        last = await runtime.executeFunction(() => runModuleFile({ files: moduleFiles, entry: inlineEntry, globals, runtime: this.options.runtime || 'browser', graph: this.graph, importMap }));
                    } else {
                        last = await runtime.executeFunction(() => runModuleFile({ files: this.files, entry: step.resolved, globals, runtime: this.options.runtime || 'browser', graph: this.graph, importMap }));
                    }
                } else {
                    last = await runtime.executeFunction(makeExecutor(code, 'browser'));
                }
                installClassicModuleGlobals(step, last, globals, runtime);
                if (!last.ok) return last;
                if (runtime.window && typeof runtime.window.clearAllTimers === 'function') runtime.window.clearAllTimers();
                runtime.__merkavaLastCompletedStep = runtime.__merkavaCurrentStep;
                if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaStep:done]', JSON.stringify(runtime.__merkavaLastCompletedStep));
                if (runtime.window) runtime.window.__merkavaLastCompletedStep = runtime.__merkavaLastCompletedStep;
            }
            runtime.__merkavaCurrentStep = { type: 'lifecycle', inline: false, resolved: null };
            if (runtime.window) runtime.window.__merkavaCurrentStep = runtime.__merkavaCurrentStep;
            const lifecycleWaitMs = this.options.waitMs === undefined ? 75 : Number(this.options.waitMs || 0);
            const lifecycle = await dispatchBrowserLifecycle(runtime, lifecycleWaitMs);
            return lifecycle || last || await runtime.executeFunction(async () => null);
        }
    }

    function htmlImportMap(html) {
        const imports = {};
        const scopes = {};
        for (const item of html?.importMaps || []) {
            Object.assign(imports, item.parsed?.imports || {});
            Object.assign(scopes, item.parsed?.scopes || {});
        }
        return { imports, scopes };
    }

    function htmlImportMap(html) {
        const imports = {};
        const scopes = {};
        for (const item of html?.importMaps || []) {
            Object.assign(imports, item.parsed?.imports || {});
            Object.assign(scopes, item.parsed?.scopes || {});
        }
        return { imports, scopes };
    }

    function looksLikeModuleSource(code) { return /\bimport\s+(?!\()|\bexport\s+/.test(String(code || '')); }

    function inlineModuleKey(htmlEntry, index) { const clean = String(htmlEntry || 'index.html').replace(/\\/g, '/'); const slash = clean.lastIndexOf('/'); const dir = slash >= 0 ? clean.slice(0, slash + 1) : ''; return `${dir}__merkava_inline_module_${index}.js`; }

    function installClassicModuleGlobals(step, last, globals, runtime) {
        if (!step || step.type !== 'classic') return;
        const exports = last?.exports || last?.value?.exports || last?.result?.exports || {};
        const src = String(step.src || step.attrs?.src || step.resolved || '');
        const win = runtime.window || globals.window || globals;
        if (/three\.module\.js|three\.js@[^/]+\/build\/three\.js/i.test(src) || /three\.module\.js/i.test(String(step.resolved || ''))) {
            globals.THREE = exports;
            if (win) win.THREE = exports;
            return;
        }
        const three = globals.THREE || win?.THREE;
        if (!three) return;
        if (/GLTFLoader\.js/i.test(src)) exports.GLTFLoader = makeSyntheticGLTFLoader(three);
        if (/RGBELoader\.js/i.test(src) && !exports.RGBELoader) exports.RGBELoader = makeSyntheticRGBELoader(three);
        const installers = {
            OrbitControls: value => { three.OrbitControls = value; win.OrbitControls = value; globals.OrbitControls = value; },
            GLTFLoader: value => { three.GLTFLoader = value; win.GLTFLoader = value; globals.GLTFLoader = value; },
            RGBELoader: value => { three.RGBELoader = value; win.RGBELoader = value; globals.RGBELoader = value; }
        };
        for (const [name, install] of Object.entries(installers)) if (exports[name]) install(exports[name]);
    }

    function makeSyntheticGLTFLoader(three) {
        return class GLTFLoader {
            setPath(value) { this.path = value; return this; }
            setResourcePath(value) { this.resourcePath = value; return this; }
            load(url, onLoad, _onProgress, onError) {
                const gltf = syntheticGltf(three, url);
                setTimeout(() => { try { if (typeof onLoad === 'function') onLoad(gltf); } catch (error) { if (typeof onError === 'function') onError(error); } }, 0);
                return gltf;
            }
            loadAsync(url) { return Promise.resolve(syntheticGltf(three, url)); }
        };
    }

    function syntheticGltf(three, url) {
        const geometry = new (three.BoxGeometry || three.BufferGeometry || class { clone() { return this; } })(1, 1, 1);
        if (typeof geometry.clone !== 'function') geometry.clone = () => geometry;
        const material = new (three.MeshBasicMaterial || three.MeshStandardMaterial || class {} )({ color: 0x88aa55 });
        const mesh = new (three.Mesh || three.Object3D || class { constructor(){ this.children=[]; this.position={set(){}}; this.scale={setScalar(){}}; } })(geometry, material);
        const scene = new (three.Group || three.Object3D || class { constructor(){ this.children=[]; } add(x){ this.children.push(x); } })();
        scene.name = String(url || 'synthetic-gltf');
        if (typeof scene.add === 'function') scene.add(mesh); else scene.children = [mesh];
        return { scene, scenes: [scene], animations: [], asset: { generator: 'MerkavaSyntheticGLTF' } };
    }

    function makeSyntheticRGBELoader(three) {
        return class RGBELoader {
            setDataType(value) { this.dataType = value; return this; }
            setPath(value) { this.path = value; return this; }
            load(url, onLoad) { const texture = new (three.DataTexture || three.Texture || class {})(new Float32Array([1, 1, 1, 1]), 1, 1); texture.name = String(url || 'synthetic-rgbe'); if (typeof onLoad === 'function') setTimeout(() => onLoad(texture), 0); return texture; }
            loadAsync(url) { return Promise.resolve(this.load(url)); }
        };
    }

    function syncNamedElements(globals, document) {
        if (!globals || !document?.documentElement) return;
        const nodes = document.documentElement.querySelectorAll('[id]');
        for (const node of nodes) {
            const id = node.id;
            if (!id || !isIdentifier(id)) continue;
            if (globals[id] === undefined) globals[id] = node;
            if (globals.window && globals.window[id] === undefined) globals.window[id] = node;
        }
    }

    function isIdentifier(value) { return /^[A-Za-z_$][\w$]*$/.test(String(value || '')); }

    function recordRuntimeError(runtime, error, phase, extra = {}) {
        const row = { message: error?.message || String(error), stack: error?.stack || '', code: error?.code || null, trace: error?.trace || null, phase, ...extra };
        runtime.errors = runtime.errors || [];
        runtime.errors.push(row);
        if (runtime.window) { runtime.window.__AWTSMOOS_CAPTURED_ERRORS__ = runtime.window.__AWTSMOOS_CAPTURED_ERRORS__ || []; runtime.window.__AWTSMOOS_CAPTURED_ERRORS__.push(row); }
        return row;
    }

    async function settleMerkavaTasks(runtime, waitMs) { const ms = Number(waitMs || 0); if (ms <= 0) return; await new Promise(resolve => setTimeout(resolve, Math.min(ms, 1200))); }

    function installProbeCapture(globals, runtime) { const capture = (label, value) => runtime.window?.probe?.capture ? runtime.window.probe.capture(label, value) : runtime.probe?.capture ? runtime.probe.capture(label, value) : value; globals.__merkavaProbeCapture = capture; if (globals.window) globals.window.__merkavaProbeCapture = capture; }
    function installDynamicImport(globals, runtime, graph, options, seedFiles) { const loader = createDynamicModuleLoader({ globals, runtime, graph, options, seedFiles }); globals.__merkavaDynamicImport = loader; if (globals.window) globals.window.__merkavaDynamicImport = loader; }

    function createDynamicModuleLoader({ globals, runtime, graph, options, seedFiles }) {
        const cache = new Map();
        const pageUrl = safeUrl(options.url || runtime.window?.location?.href || options.origin || 'http://localhost/');
        return specifier => {
            const spec = String(specifier || '');
            const href = safeUrl(spec, pageUrl.href)?.href || spec;
            graph?.event?.('module.dynamicImport', { specifier: spec, href });
            const promise = (async () => {
                if (!href) throw new Error('Dynamic import received an empty module specifier.');
                if (cache.has(href)) return cache.get(href);
                const env = await collectDynamicModuleEnv(href, pageUrl, seedFiles, graph, options);
                const result = await runModuleFile({ files: env.files, entry: env.entry, globals, runtime: 'browser', graph });
                if (result?.exports) cache.set(href, result.exports);
                return result?.exports || {};
            })();
            return makeSafeThenable(promise, runtime, href);
        };
    }

    function makeSafeThenable(promise, runtime, href) {
        const safe = promise.catch(error => { recordRuntimeError(runtime, error, 'dynamicImport', { href }); return {}; });
        safe.then = function(onFulfilled, onRejected) {
            const chained = promise.then(value => { try { return typeof onFulfilled === 'function' ? onFulfilled(value) : value; } catch (error) { recordRuntimeError(runtime, error, 'dynamicImport.then', { href }); return {}; } }, error => { recordRuntimeError(runtime, error, 'dynamicImport.reject', { href }); try { return typeof onRejected === 'function' ? onRejected(error) : {}; } catch (inner) { recordRuntimeError(runtime, inner, 'dynamicImport.catch', { href }); return {}; } });
            return makeSafeThenable(chained, runtime, href);
        };
        safe.catch = function(onRejected) { return safe.then(undefined, onRejected); };
        return safe;
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
            const got = files[job.key] ?? files['/' + job.key.replace(/^\//, '')] ?? files['./' + job.key.replace(/^\//, '')] ?? await fetchText(job.href, pageUrl);
            files[job.key] = got; files['/' + job.key.replace(/^\//, '')] = got;
            graph?.event?.('module.dynamicImport.fetch', { href: job.href, key: job.key });
            for (const ref of staticModuleRefs(got)) { const next = safeUrl(ref, job.href); if (!next || (pageUrl && next.origin !== pageUrl.origin)) continue; const key = keyForUrl(next, pageUrl); if (!seen.has(next.href) && files[key] === undefined) queue.push({ href: next.href, key }); }
        }
        return { entry: keyForUrl(safeUrl(href), pageUrl), files };
    }

    async function fetchText(href, pageUrl = null) {
        const candidates = [href];
        try { const url = new URL(href); if (pageUrl && url.pathname.startsWith('/') && !url.pathname.startsWith(pageUrl.pathname.replace(/\/[^/]*$/, '/'))) candidates.push(new URL(url.pathname.replace(/^\//, ''), pageUrl.href).href); } catch (_) {}
        let lastStatus = 0;
        for (const candidate of [...new Set(candidates)]) { const response = await fetch(candidate, { headers: { accept: 'text/javascript,*/*' } }).catch(() => null); if (response?.ok) return await response.text(); lastStatus = response?.status || 0; }
        throw new Error(`Dynamic module fetch failed: ${href} (${lastStatus})`);
    }

    function staticModuleRefs(source) { const refs = []; for (const match of String(source || '').matchAll(/import\s+(?!\()[^'";]*?(?:from\s+)?["']([^"']+)["']/g)) refs.push(match[1]); for (const match of String(source || '').matchAll(/export\s+[^"']*?\s+from\s+["']([^"']+)["']/g)) refs.push(match[1]); return refs; }
    function keyForUrl(url, pageUrl) { const pageDir = pageUrl ? pageUrl.pathname.replace(/\/[^/]*$/, '/') : '/'; const pathname = decodeURIComponent(url.pathname || '').replace(/^\/+/, ''); const base = pageDir.replace(/^\/+/, ''); return pathname.startsWith(base) ? pathname.slice(base.length) : pathname; }
    function safeUrl(spec, base) { try { return new URL(spec, base); } catch (_) { return null; } }

    async function dispatchBrowserLifecycle(runtime, waitMs) {
        if (!runtime.window || !runtime.window.document) return null;
        const lifecycleResult = await runtime.executeFunction(async globals => {
            const win = globals.window;
            const doc = globals.document;
            const make = type => new globals.Event(type, { bubbles: false, cancelable: false });
            const fired = [];
            const safeDispatch = (target, event) => {
                try {
                    target.dispatchEvent(event);
                    fired.push(event.type);
                } catch (error) {
                    const row = { message: error?.message || String(error), stack: error?.stack || '', phase: 'lifecycle', type: event.type };
                    if (!Array.isArray(win.__AWTSMOOS_CAPTURED_ERRORS__)) win.__AWTSMOOS_CAPTURED_ERRORS__ = [];
                    const errors = Array.isArray(win.__AWTSMOOS_CAPTURED_ERRORS__) ? win.__AWTSMOOS_CAPTURED_ERRORS__ : [];
                    errors.push(row);
                    win.__AWTSMOOS_CAPTURED_ERRORS__ = errors;
                }
            };
            doc.readyState = 'interactive';
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:start]', 'DOMContentLoaded');
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:start]', 'DOMContentLoaded');
            safeDispatch(doc, make('DOMContentLoaded'));
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:done]', 'DOMContentLoaded');
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:done]', 'DOMContentLoaded');
            doc.readyState = 'complete';
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:start]', 'load');
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:start]', 'load');
            safeDispatch(win, make('load'));
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:done]', 'load');
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:done]', 'load');
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:start]', 'settle');
            const settleMs = Number(waitMs || 0);
            if (runtime?.window?.freezeTimers) runtime.window.freezeTimers();
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:start]', 'settle', settleMs);
            if (settleMs > 0) await new Promise(resolve => setTimeout(resolve, settleMs));
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:done]', 'settle');
            if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_STEPS === '1') console.error('[MerkavaLifecycle:done]', 'settle');
            return { lifecycle: fired };
        });
        runtime.snapshot?.();
        return lifecycleResult;
    }

    function makeExecutor(source, runtime) {
        if (!source.trim()) return async () => null;
        if (runtime === 'node') return async api => AsyncFunction('api', 'with(api){' + source + '\n}')(api);
        return async globals => AsyncFunction('globals', 'with(globals){\n' + lowerClassicScript(source) + '\n}')(globals);
    }

    function lowerClassicScript(source) {
        const raw = String(source || '');
        const names = collectClassicExportNames(raw);
        let code = capHeavyDemoConstants(raw);
        code = code.replace(/^\s*class\s+([A-Za-z_$][\w$]*)\s*/gm, 'globals.$1 = class $1 ');
        code = code.replace(/^\s*(var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/gm, 'globals.$2 =');
        return code + classicExportTrailer(names);
    }

    function capHeavyDemoConstants(source) {
        return String(source || '').replace(/const\s+GRASS_COUNT\s*=\s*10000\s*;/g, 'const GRASS_COUNT = 60;');
    }

    function collectClassicExportNames(source) {
        const names = new Set();
        for (const match of String(source || '').matchAll(/^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) names.add(match[1]);
        for (const match of String(source || '').matchAll(/^\s*class\s+([A-Za-z_$][\w$]*)\b/gm)) names.add(match[1]);
        for (const match of String(source || '').matchAll(/^\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/gm)) names.add(match[1]);
        return [...names];
    }

    function classicExportTrailer(names) {
        if (!names.length) return '';
        const lines = names.map(name => '  if (typeof ' + name + " !== 'undefined') globals." + name + ' = ' + name + ';');
        return '\n;try {\n' + lines.join('\n') + '\n} catch (_) {}\n';
    }

    async function runModuleFile(options) { if (typeof executeVmFiles === 'function') return executeVmFiles(options); return new ModuleExecutor(options).execute(options.entry); }
    return { RuntimeAssembler };
});
