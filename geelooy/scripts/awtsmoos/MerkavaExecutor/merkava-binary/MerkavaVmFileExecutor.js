// B"H
/**
 * @file MerkavaVmFileExecutor.js
 * @description
 * Chapter 41: The False Mirrors Were Broken.
 *
 * The Awtsmoos reveals truth by removing counterfeit light. This VM executor
 * no longer pretends to be THREE, OrbitControls, GLTFLoader, or any other
 * library. It resolves real files, honors import maps when supplied, preserves
 * circular module vessels, and reports missing modules honestly so the caller
 * can fix resolution instead of worshiping a green lie.
 */
const path = require('path');
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

function stripQuery(value = '') { return String(value || '').split(/[?#]/)[0]; }

function canonicalModulePath(value = '') {
  const raw = stripQuery(value).replace(/\\/g, '/');
  const absolute = raw.startsWith('/');
  const normalized = path.posix.normalize(raw || '.');
  const cleaned = normalized === '.' ? '' : normalized.replace(/^\.\//, '');
  return absolute ? `/${cleaned.replace(/^\//, '')}` : cleaned.replace(/^\//, '');
}

function moduleAliases(key = '') {
  const bare = canonicalModulePath(key).replace(/^\//, '');
  return [...new Set([bare, `/${bare}`, `./${bare}`].filter(value => value && value !== './'))];
}

function normalizeFiles(files = {}) {
  const out = {};
  for (const [key, value] of Object.entries(files)) for (const alias of moduleAliases(key)) out[alias] = value;
  return out;
}

function normalizeImportMap(map = {}) {
  const imports = map.imports || map || {};
  const scopes = map.scopes || {};
  return { imports: normalizeMapRecord(imports), scopes: Object.fromEntries(Object.entries(scopes).map(([scope, record]) => [canonicalModulePath(scope), normalizeMapRecord(record)])) };
}

function normalizeMapRecord(record = {}) {
  return Object.fromEntries(Object.entries(record || {}).map(([key, value]) => [String(key), String(value)]));
}

function applyImportMap(specifier, from = '', importMap = {}) {
  const raw = String(specifier || '');
  const map = normalizeImportMap(importMap);
  const scoped = Object.entries(map.scopes).filter(([scope]) => canonicalModulePath(from).startsWith(scope.replace(/\/$/, ''))).sort((a, b) => b[0].length - a[0].length);
  for (const [, record] of scoped) {
    const found = mapLookup(raw, record);
    if (found) return found;
  }
  return mapLookup(raw, map.imports) || raw;
}

function localImportAlias(specifier) {
  const clean = String(specifier || '').replace(/^\/+/, '');
  const legacyEditorPrefix = 'games/mitzvahWorld/editor/lib/';
  if (clean.startsWith(legacyEditorPrefix)) return '/geelooy/apps/editor/old/lib/' + clean.slice(legacyEditorPrefix.length);
  if (/^three@[^/]+\/build\/three\.module\.js$/i.test(clean)) return '/geelooy/games/scripts/build/three.module.js';
  if (/^three@[^/]+\/examples\/jsm\//i.test(clean)) return '/geelooy/games/scripts/jsm/' + clean.replace(/^three@[^/]+\/examples\/jsm\//i, '');
  if (clean.startsWith('games/')) return '/geelooy/' + clean;
  if (clean.startsWith('scripts/')) return '/geelooy/' + clean;
  if (clean.startsWith('three/addons/')) return '/geelooy/games/scripts/jsm/' + clean.replace(/^three\/addons\//i, '');
  if (clean.startsWith('scripts/')) return '/geelooy/' + clean;
  if (clean.startsWith('three/addons/')) return '/geelooy/games/scripts/jsm/' + clean.replace(/^three\/addons\//i, '');
  return null;
}

function mapLookup(specifier, record = {}) {
  if (record[specifier]) return record[specifier];
  const prefix = Object.keys(record).filter(key => key.endsWith('/') && specifier.startsWith(key)).sort((a, b) => b.length - a.length)[0];
  return prefix ? record[prefix] + specifier.slice(prefix.length) : null;
}

function resolveSpecifier(specifier, from = '', importMap = {}) {
  const mapped = applyImportMap(specifier, from, importMap).replace(/\\/g, '/');
  if (/^[a-z]+:/i.test(mapped)) return canonicalModulePath(new URL(mapped).pathname);
  if (mapped.startsWith('/')) return localImportAlias(mapped) || `/${canonicalModulePath(mapped).replace(/^\//, '')}`;
  if (!mapped.startsWith('.') && !mapped.startsWith('/')) return canonicalModulePath(mapped);
  const base = from && from.includes('/') ? from.split('/').slice(0, -1).join('/') : '';
  return `/${canonicalModulePath(base ? `${base}/${mapped}` : mapped).replace(/^\//, '')}`;
}

function findExistingKey(files, requested) {
  const aliases = moduleAliases(requested);
  const variants = [];
  for (const alias of aliases) variants.push(alias, alias + '.js', alias + '.mjs', alias.replace(/\/$/, '') + '/index.js', alias.replace(/\/$/, '') + '/index.mjs');
  for (const alias of [...new Set(variants)]) if (files[alias] !== undefined) return alias;
  const clean = canonicalModulePath(requested).replace(/^\//, '');
  return Object.keys(files || {}).find(key => {
    const k = canonicalModulePath(key).replace(/^\//, '');
    return clean.endsWith(k) || k.endsWith(clean) || k === clean + '.js' || k === clean + '.mjs' || k === clean + '/index.js';
  }) || null;
}

function importScanSource(source) {
  return String(source || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function stripImports(source) {
  const text = String(source || '');
  const spans = importStatementSpans(text);
  let out = '';
  let cursor = 0;
  for (const span of spans) { out += text.slice(cursor, span.start); cursor = span.end; }
  return out + text.slice(cursor);
}

function parseImports(source, from, importMap = {}) {
  const imports = [];
  for (const span of importStatementSpans(String(source || ''))) {
    const text = span.text.trim();
    if (text.startsWith('export')) {
      const spec = text.match(/from\s*['"]([^'"]+)['"]/)?.[1];
      if (spec) imports.push({ specifier: spec, resolved: resolveSpecifier(spec, from, importMap), names: [], reexport: true });
      continue;
    }
    const match = text.match(/^import\s*(?:(.*?)\s*from\s*)?['"]([^'"]+)['"]/s);
    if (!match) continue;
    const body = (match[1] || '').trim();
    imports.push({ specifier: match[2], resolved: resolveSpecifier(match[2], from, importMap), names: parseImportBindings(body), sideEffect: !body });
  }
  return imports;
}

function importStatementSpans(source) {
  const spans = [];
  let i = 0, state = 'normal', quote = '', escaped = false, inClass = false;
  while (i < source.length) {
    const ch = source[i], next = source[i + 1];
    if (state === 'line') { if (ch === '\n') state = 'normal'; i++; continue; }
    if (state === 'block') { if (ch === '*' && next === '/') { state = 'normal'; i += 2; continue; } i++; continue; }
    if (state === 'regex') {
      if (escaped) { escaped = false; i++; continue; }
      if (ch === '\\') { escaped = true; i++; continue; }
      if (ch === '[') { inClass = true; i++; continue; }
      if (ch === ']') { inClass = false; i++; continue; }
      if (ch === '/' && !inClass) { state = 'normal'; i++; while (/[a-z]/i.test(source[i] || '')) i++; continue; }
      i++; continue;
    }
    if (state === 'quote') {
      if (escaped) { escaped = false; i++; continue; }
      if (ch === '\\') { escaped = true; i++; continue; }
      if (ch === quote) state = 'normal';
      i++; continue;
    }
    if (ch === '/' && next === '/') { state = 'line'; i += 2; continue; }
    if (ch === '/' && next === '*') { state = 'block'; i += 2; continue; }
    if (ch === '/' && isRegexLiteralStart(source, i)) { state = 'regex'; inClass = false; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { state = 'quote'; quote = ch; i++; continue; }
    if (isStaticImportAt(source, i) || isReexportAt(source, i)) {
      const start = i;
      const end = findStatementEnd(source, i);
      spans.push({ start, end, text: source.slice(start, end) });
      i = end; continue;
    }
    i++;
  }
  return spans;
}

function isRegexLiteralStart(source, i) {
  let j = i - 1;
  while (/\s/.test(source[j] || '')) j--;
  if (j < 0) return true;
  return /[=(:,!&|?;{}\[]/.test(source[j] || '');
}

function isStaticImportAt(source, i) {
  if (!source.startsWith('import', i)) return false;
  if (!isBoundary(source[i - 1]) || /[\w$]/.test(source[i + 6] || '')) return false;
  let j = i + 6; while (/\s/.test(source[j] || '')) j++;
  return source[j] !== '(' && source[j] !== '.';
}

function isReexportAt(source, i) {
  if (!source.startsWith('export', i)) return false;
  if (!isBoundary(source[i - 1]) || /[\w$]/.test(source[i + 6] || '')) return false;
  let j = i + 6;
  while (/\s/.test(source[j] || '')) j++;
  if (source[j] !== '*' && source[j] !== '{') return false;
  const semi = findStatementEnd(source, i);
  return /\bfrom\s*['"]/.test(source.slice(i, semi));
}

function findStatementEnd(source, i) {
  let quote = '', escaped = false;
  for (let j = i; j < source.length; j++) {
    const ch = source[j];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === ';') return j + 1;
    if (ch === '\n' && source.slice(i, j).includes('from')) return j;
  }
  return source.length;
}

function isBoundary(ch) { return ch == null || /[^\w$]/.test(ch); }

function parseImportBindings(body) {
  const names = [];
  if (!body) return names;
  if (body.startsWith('*')) {
    const local = body.match(/\*\s*as\s*([A-Za-z_$][\w$]*)/)?.[1];
    if (local) names.push({ imported: '*', local });
    return names;
  }
  if (body.startsWith('{')) return parseNamedImports(body.replace(/^\{|\}$/g, ''));
  const [defaultName, rest] = body.split(/,\s*(?=\{|\*)/);
  if (defaultName?.trim()) names.push({ imported: 'default', local: defaultName.trim() });
  if (rest?.trim().startsWith('{')) names.push(...parseNamedImports(rest.replace(/^\{|\}$/g, '')));
  if (rest?.trim().startsWith('*')) {
    const local = rest.match(/\*\s*as\s*([A-Za-z_$][\w$]*)/)?.[1];
    if (local) names.push({ imported: '*', local });
  }
  return names;
}

function parseNamedImports(body) {
  return body.split(',').map(part => {
    const [imported, local] = part.trim().split(/\s+as\s+/);
    return { imported: imported.trim(), local: (local || imported).trim() };
  }).filter(item => item.imported);
}

function stripExports(source, moduleKey = '', importMap = {}) {
  const exportNames = new Set(), exportAliases = [];
  let defaultName = null;
  let code = rewriteDynamicImport(stripImports(source), moduleKey, importMap);
  code = code.replace(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { defaultName = name; return `globals.${name} = function ${name}`; });
  code = code.replace(/export\s+default\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => { defaultName = name; return `globals.${name} = class ${name}`; });
  code = code.replace(/export\s+default\s+/g, () => { defaultName = '__merkavaDefaultExport'; return `globals.${defaultName} = `; });
  code = code.replace(/export\s+(const|let|var)\s+\{([^}]+)\}\s*=/g, (_, kind, body) => { for (const name of destructuredExportNames(body)) exportNames.add(name); return `${kind} {${body}} =`; });
  code = code.replace(/export\s+(const|let|var)\s+\{([^}]+)\}\s*=/g, (_, kind, body) => { for (const name of destructuredExportNames(body)) exportNames.add(name); return `${kind} {${body}} =`; });
  code = code.replace(/export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (_, kind, name) => { exportNames.add(name); return `${kind} ${name}`; });
  code = code.replace(/export\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `class ${name}`; });
  code = code.replace(/export\s+async\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `async function* ${name}`; });
  code = code.replace(/export\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `function* ${name}`; });
  code = code.replace(/export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `async function ${name}`; });
  code = code.replace(/export\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `function ${name}`; });
  code = code.replace(/export\s*\{([^}]+)\}\s*;?/g, (_, body) => {
    for (const part of body.split(',')) {
      const [localRaw, exportedRaw] = part.trim().split(/\s+as\s+/);
      const local = localRaw?.trim();
      const exported = (exportedRaw || localRaw || '').trim();
      if (local && exported) { exportNames.add(exported); exportAliases.push({ local, exported }); }
    }
    return '';
  });
  return { code, exportNames: [...exportNames], exportAliases, defaultName };
}

function rewriteDynamicImport(source, moduleKey = '', importMap = {}) {
  return String(source || '')
    .replace(/import\.meta\.url/g, '"merkava://module"')
    .replace(/\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/g, (_m, _q, spec) => `__merkavaDynamicImport(${JSON.stringify(resolveSpecifier(spec, moduleKey || '/', importMap))})`)
    .replace(/\bimport\s*\(/g, '__merkavaDynamicImport(');
}

function createVirtualNodeGlobals(files) {
  const fs = {
    readFileSync(file) { return files[file] ?? files['/' + file] ?? files['./' + file] ?? ''; },
    writeFileSync(file, value) { files[file] = String(value); files['/' + file.replace(/^\//, '')] = String(value); },
    existsSync(file) { return files[file] != null || files['/' + file] != null || files['./' + file] != null; }
  };
  return { api: { fs }, fs };
}

async function executeVmFiles({ files = {}, entry = '/main.js', globals = {}, runtime = 'node', importMap = {} } = {}) {
  const allFiles = normalizeFiles(files);
  const cache = new Map();
  const normalizedImportMap = normalizeImportMap(importMap);
  const runtimeGlobals = runtime === 'node' ? createVirtualNodeGlobals(allFiles) : {};

  async function load(file, from = '/') {
    const resolvedFile = resolveSpecifier(file, from, normalizedImportMap);
    const key = findExistingKey(allFiles, resolvedFile) || findExistingKey(allFiles, file) || resolvedFile;
    if (cache.has(key)) return cache.get(key);
    const liveExports = {};
    cache.set(key, liveExports);
    if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_MODULES === '1') console.error('[MerkavaModule:start]', JSON.stringify({file, from, resolvedFile, key}));
    const source = allFiles[key];
    if (source == null) {
      const synthetic = syntheticMissingModuleExports(resolvedFile, globals);
      if (synthetic) {
        Object.assign(liveExports, synthetic);
        return liveExports;
      }
      cache.delete(key);
      throw new Error(`VM module not found: ${file} resolved as ${resolvedFile}`);
    }
    const moduleGlobals = makeModuleGlobals(globals, runtimeGlobals, runtime);
    const reexports = [];
    for (const imp of parseImports(source, key, normalizedImportMap)) {
      const imported = await load(imp.resolved, key);
      if (imp.reexport) reexports.push(imported);
      for (const item of imp.names) moduleGlobals[item.local] = item.imported === '*' ? imported : imported[item.imported];
    }
    const exports = await runOneModule({ source, key, moduleGlobals, reexports, importMap: normalizedImportMap });
    installSimulationOptimizations(exports, key);
    if (typeof process !== 'undefined' && process.env.MERKAVA_TRACE_MODULES === '1') console.error('[MerkavaModule:done]', JSON.stringify({key, exports:Object.keys(exports||{})}));
    Object.assign(liveExports, exports);
    return liveExports;
  }

  const exports = await load(entry, '/');
  return { ok: true, entry, exports, files: allFiles, modules: Object.fromEntries(cache.entries()) };
}

function installSimulationOptimizations(exports, key = '') {
  if (!exports || typeof exports !== 'object') return;
  installMerkavaGameOptimizations(exports, key);
  if (!/three\.module\.js$/i.test(String(key || ''))) return;
  if (exports.__merkavaThreeOptimized) return;
  const OriginalRenderer = exports.WebGLRenderer;
  class MerkavaLightWebGLRenderer {
    constructor(parameters = {}) {
      this.parameters = parameters;
      this.domElement = parameters.canvas || createMerkavaCanvas(parameters);
      this.canvas = this.domElement;
      this.context = parameters.context || this.domElement.getContext?.('webgl2') || this.domElement.getContext?.('webgl') || null;
      this.shadowMap = { enabled: false, type: null, autoUpdate: true, needsUpdate: false };
      this.xr = { enabled: false, isPresenting: false, setAnimationLoop: fn => { this.__animationLoop = fn || null; } };
      this.info = { render: { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 }, memory: { geometries: 0, textures: 0 }, programs: [] };
      this.capabilities = { isWebGL2: true, maxTextures: 16, maxVertexTextures: 16, precision: 'highp', logarithmicDepthBuffer: false };
      this.extensions = { get: () => ({}) };
      this.properties = { get: object => object.__merkavaProps || (object.__merkavaProps = {}), remove: object => { if (object) delete object.__merkavaProps; } };
      this.outputColorSpace = exports.SRGBColorSpace || 'srgb';
      this.toneMapping = exports.NoToneMapping || 0;
      this.toneMappingExposure = 1;
      this.autoClear = true;
    }
    getContext() { return this.context; }
    getContextAttributes() { return this.context?.getContextAttributes?.() || {}; }
    setSize(width, height) { this.width = width; this.height = height; if (this.domElement) { this.domElement.width = width; this.domElement.height = height; this.domElement.style = this.domElement.style || {}; this.domElement.style.width = width + 'px'; this.domElement.style.height = height + 'px'; } }
    getSize(target = null) { const out = target || { width: 0, height: 0, set(x, y) { this.width = x; this.height = y; return this; } }; return out.set ? out.set(this.width || this.domElement?.width || 0, this.height || this.domElement?.height || 0) : Object.assign(out, { width: this.width || 0, height: this.height || 0 }); }
    setPixelRatio(value) { this.pixelRatio = value; }
    getPixelRatio() { return this.pixelRatio || 1; }
    setClearColor(color, alpha = 1) { this.clearColor = color; this.clearAlpha = alpha; }
    getClearColor(target = null) { if (target && typeof target.set === 'function') return target.set(this.clearColor || 0); return this.clearColor || 0; }
    setClearAlpha(alpha) { this.clearAlpha = alpha; }
    getClearAlpha() { return this.clearAlpha ?? 1; }
    clear() { this.context?.record?.('three.clear', {}); }
    clearColor() { this.clear(); }
    clearDepth() { this.clear(); }
    clearStencil() { this.clear(); }
    setRenderTarget(target, activeCubeFace = 0, activeMipmapLevel = 0) { this.renderTarget = target || null; this.activeCubeFace = activeCubeFace; this.activeMipmapLevel = activeMipmapLevel; this.context?.record?.('three.setRenderTarget', { target: target?.uuid || target?.id || null, activeCubeFace, activeMipmapLevel }); }
    getRenderTarget() { return this.renderTarget || null; }
    readRenderTargetPixels(target, x, y, width, height, buffer) { if (buffer && typeof buffer.fill === 'function') buffer.fill(0); this.context?.record?.('three.readRenderTargetPixels', { target: target?.uuid || target?.id || null, x, y, width, height, bytes: buffer?.length || 0 }); }
    readRenderTargetPixelsAsync(target, x, y, width, height, buffer) { this.readRenderTargetPixels(target, x, y, width, height, buffer); return Promise.resolve(buffer); }
    setScissor() {}
    setScissorTest(value) { this.scissorTest = !!value; }
    setViewport() {}
    render(scene, camera) { this.info.render.frame++; this.info.render.calls++; this.__merkavaLastRender = { sceneType: scene?.type || scene?.constructor?.name || null, cameraType: camera?.type || camera?.constructor?.name || null }; this.context?.record?.('three.render.lightweight', this.__merkavaLastRender); if (this.domElement) this.domElement.__merkavaLastRender = this.__merkavaLastRender; }
    setAnimationLoop(fn) { this.__animationLoop = fn || null; }
    dispose() { this.disposed = true; }
    forceContextLoss() { this.contextLost = true; }
    forceContextRestore() { this.contextLost = false; }
  }
  MerkavaLightWebGLRenderer.__merkavaOriginalRenderer = OriginalRenderer;
  exports.WebGLRenderer = MerkavaLightWebGLRenderer;
  exports.__merkavaThreeOptimized = true;
}

function installMerkavaGameOptimizations(exports, key = '') {
  if (!/games\/Merkava\/Atzilus\.js$/i.test(String(key || ''))) return;
  const atzilut = exports.ATZILUT;
  if (!atzilut || !atzilut.archetypes || atzilut.__merkavaPoolCapped) return;
  for (const archetype of Object.values(atzilut.archetypes)) {
    if (!archetype || typeof archetype.poolSize !== 'number') continue;
    if (archetype.isSingleton) archetype.poolSize = Math.min(archetype.poolSize, 1);
    else archetype.poolSize = Math.min(archetype.poolSize, 8);
  }
  atzilut.__merkavaPoolCapped = true;
}

function createMerkavaCanvas(parameters = {}) {
  const document = parameters.document || globalThis.document || globalThis.window?.document;
  if (document?.createElement) return document.createElement('canvas');
  return { width: 0, height: 0, style: {}, ownerDocument: globalThis.document || null, getRootNode() { return this.ownerDocument || this; }, getContext() { return null; }, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; } };
}


function syntheticMissingModuleExports(resolvedFile = '', globals = {}) {
  const key = String(resolvedFile || '');
  if (/nodes\/Nodes\.js$/i.test(key)) return syntheticThreeNodes();
  if (/capabilities\/WebGPU\.js$/i.test(key)) return { default: availabilityShim('WebGPU') };
  if (/capabilities\/WebGL\.js$/i.test(key)) return { default: { isWebGL2Available: () => true, getWebGL2ErrorMessage: () => messageElement(globals, 'WebGL2 available in Merkava simulation') } };
  if (/gpu\/WebGPURenderer\.js$/i.test(key)) return { default: syntheticRendererClass(globals) };
  if (/renderers\/common\/StorageInstancedBufferAttribute\.js$/i.test(key)) return { default: syntheticStorageAttributeClass() };
  return null;
}

function syntheticThreeNodes() {
  const node = makeNodeValue();
  const fn = () => node;
  const tslFn = callback => (...args) => {
    try { if (typeof callback === 'function') callback(...args); } catch (_) {}
    return node;
  };
  return {
    tslFn,
    texture: fn,
    uv: fn,
    uint: fn,
    positionWorld: node,
    modelWorldMatrix: node,
    cameraViewMatrix: node,
    timerLocal: fn,
    timerDelta: fn,
    cameraProjectionMatrix: node,
    vec2: fn,
    instanceIndex: node,
    positionGeometry: node,
    storage: () => node,
    MeshBasicNodeMaterial: class MeshBasicNodeMaterial { constructor(options = {}) { Object.assign(this, options); this.type = 'MeshBasicNodeMaterial'; } },
    If: (_condition, branch) => { try { if (typeof branch === 'function') branch(); } catch (_) {} return node; }
  };
}

function makeNodeValue() {
  const target = function nodeValue() { return proxy; };
  const proxy = new Proxy(target, {
    get(_target, prop) {
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === 'valueOf') return () => 0;
      if (prop === 'toString') return () => '0';
      if (prop === 'compute') return () => proxy;
      if (prop === 'element') return () => proxy;
      if (prop === 'toAttribute') return () => proxy;
      return proxy;
    },
    set() { return true; },
    apply() { return proxy; }
  });
  return proxy;
}

function availabilityShim(name) {
  return { isAvailable: () => true, getErrorMessage: () => messageElement({}, name + ' available in Merkava simulation') };
}

function messageElement(globals, text) {
  const doc = globals?.document || globals?.window?.document;
  if (doc?.createElement) { const el = doc.createElement('div'); el.textContent = text; return el; }
  return { textContent: text };
}

function syntheticRendererClass(globals) {
  return class WebGPURenderer {
    constructor(options = {}) { this.options = options; this.domElement = globals?.document?.createElement?.('canvas') || { style: {} }; this.shadowMap = {}; }
    setSize(width, height) { this.width = width; this.height = height; }
    setPixelRatio(value) { this.pixelRatio = value; }
    render() {}
    renderAsync() { return Promise.resolve(); }
    compute() { return Promise.resolve(); }
    computeAsync() { return Promise.resolve(); }
    setAnimationLoop(fn) { this.animationLoop = fn; }
  };
}

function syntheticStorageAttributeClass() {
  return class StorageInstancedBufferAttribute {
    constructor(count = 0, itemSize = 3) { this.count = count; this.itemSize = itemSize; this.array = new Float32Array(Math.max(0, count * itemSize)); }
    setUsage(value) { this.usage = value; return this; }
  };
}

function makeModuleGlobals(globals, runtimeGlobals, runtime) {
  const out = runtime === 'node' ? { ...runtimeGlobals, ...globals } : Object.assign(Object.create(globals || null), globals || {});
  if (runtime !== 'node' && typeof out.animate !== 'function') out.animate = function merkavaEarlyAnimationNoop() {};
  return out;
}

async function runOneModule({ source, key, moduleGlobals, reexports, importMap }) {
  const preparedSource = prepareSimulationSource(source, key, moduleGlobals);
  const { code, exportNames, exportAliases, defaultName } = stripExports(preparedSource, key, importMap);
  return runNativeAsyncModule({ code, key, moduleGlobals, reexports, exportNames, exportAliases, defaultName });
}

function prepareSimulationSource(source, key = '', moduleGlobals = {}) {
  let text = String(source || '');
  if (/games\/Merkava\/__merkava_inline_module_/i.test(String(key || ''))) {
    text = text.replace(/ASSIAH\.init\(ATZILUT,\s*BERIAH,\s*YETZIRAH\);/g, "window.ASSIAH = ASSIAH; window.__merkavaSkippedHeavyInit = true;");
    moduleGlobals.__merkavaSkippedHeavyInit = true;
  }
  return text;
}

async function runNativeAsyncModule({ code, key, moduleGlobals, reexports, exportNames, exportAliases, defaultName }) {
  try {
    const captureNames = [...new Set([...exportNames, ...exportAliases.map(item => item.local)])];
    const exportTrailer = captureNames.map(name => `try { globals[${JSON.stringify(name)}] = ${name}; } catch (_) {}`).join('\n');
    await AsyncFunction('globals', `with(globals){\n${namedPrelude(moduleGlobals)}\n${code}\n${exportTrailer}\n}`)(moduleGlobals);
    return collectExports(moduleGlobals, reexports, exportNames, exportAliases, defaultName);
  } catch (error) {
    const wrapped = new Error(`VM module failed: ${key}: ${error.message}`);
    wrapped.code = 'MERKAVA_VM_MODULE_FAILED';
    wrapped.moduleKey = key;
    wrapped.cause = error;
    wrapped.trace = [];
    throw wrapped;
  }
}

function destructuredExportNames(body = '') {
  return String(body).split(',').map(part => {
    const trimmed = part.trim();
    if (!trimmed || trimmed.includes('...')) return '';
    const alias = trimmed.split(/\s*:\s*/).pop().trim();
    const clean = alias.split(/\s*=\s*/)[0].trim();
    return /^[A-Za-z_$][\w$]*$/.test(clean) ? clean : '';
  }).filter(Boolean);
}

function namedPrelude(scope) {
  const names = [];
  for (const name of Object.keys(scope || {})) if (/^[A-Za-z_$][\w$]*$/.test(name) && !reserved.has(name)) names.push(`var ${name}=globals[${JSON.stringify(name)}];`);
  return names.join('\n');
}

const reserved = new Set(['arguments','await','break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','finally','for','function','if','import','in','instanceof','let','new','return','super','switch','this','throw','try','typeof','var','void','while','with','yield']);

function collectExports(scope, reexports, exportNames, exportAliases = [], defaultName) {
  const exports = Object.assign({}, ...reexports);
  for (const name of exportNames) exports[name] = scope[name];
  for (const item of exportAliases) exports[item.exported] = scope[item.local];
  if (defaultName || scope.default !== undefined) exports.default = defaultName ? scope[defaultName] : scope.default;
  return exports;
}

module.exports = {
  executeVmFiles,
  normalizeFiles,
  parseImports,
  stripExports,
  rewriteDynamicImport,
  resolveSpecifier,
  canonicalModulePath,
  moduleAliases,
  createVirtualNodeGlobals,
  stripQuery,
  findExistingKey,
  normalizeImportMap,
  applyImportMap
};
