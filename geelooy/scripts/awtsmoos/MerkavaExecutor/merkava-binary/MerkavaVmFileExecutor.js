// B"H
/**
 * @file MerkavaVmFileExecutor.js
 * @description
 * Chapter 40: Missing CDN modules became synthetic vessels.
 * The VM now preserves Chrome global inheritance and supplies a deterministic
 * Three/OrbitControls fallback for runtime simulation when local browser import
 * paths point outside the reachable file map.
 */
const path = require('path');
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

function stripQuery(value = '') { return String(value || '').split(/[?#]/)[0]; }
function canonicalModulePath(value = '') { const raw = stripQuery(value).replace(/\\/g, '/'); const absolute = raw.startsWith('/'); const normalized = path.posix.normalize(raw || '.'); const cleaned = normalized === '.' ? '' : normalized.replace(/^\.\//, ''); return absolute ? `/${cleaned.replace(/^\//, '')}` : cleaned.replace(/^\//, ''); }
function moduleAliases(key = '') { const bare = canonicalModulePath(key).replace(/^\//, ''); return [...new Set([bare, `/${bare}`, `./${bare}`].filter(value => value && value !== './'))]; }
function normalizeFiles(files = {}) { const out = {}; for (const [key, value] of Object.entries(files)) for (const alias of moduleAliases(key)) out[alias] = value; return out; }
function resolveSpecifier(specifier, from = '') { const raw = String(specifier || '').replace(/\\/g, '/'); if (/^[a-z]+:/i.test(raw)) return canonicalModulePath(new URL(raw).pathname); if (raw.startsWith('/')) return `/${canonicalModulePath(raw).replace(/^\//, '')}`; const base = from && from.includes('/') ? from.split('/').slice(0, -1).join('/') : ''; return `/${canonicalModulePath(base ? `${base}/${raw}` : raw).replace(/^\//, '')}`; }
function findExistingKey(files, requested) { for (const alias of moduleAliases(requested)) if (files[alias] !== undefined) return alias; const clean = canonicalModulePath(requested).replace(/^\//, ''); return Object.keys(files || {}).find(key => clean.endsWith(canonicalModulePath(key).replace(/^\//, ''))) || null; }
function stripImports(source) { return String(source || '').replace(/import\s+(?!\()(?:(.*?)\s+from\s+)?['"][^'"]+['"]\s*;?/gs, '').replace(/export\s+(?:\*|\{[^}]*\})\s+from\s+['"][^'"]+['"]\s*;?/gs, ''); }

function parseImports(source, from) {
  const imports = [];
  const staticRe = /import\s+(?!\()(?:(.*?)\s+from\s+)?['"]([^'"]+)['"]\s*;?/gs;
  for (const match of String(source || '').matchAll(staticRe)) imports.push({ specifier: match[2], resolved: resolveSpecifier(match[2], from), names: parseImportBindings((match[1] || '').trim()), sideEffect: !(match[1] || '').trim() });
  const exportRe = /export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]\s*;?/gs;
  for (const match of String(source || '').matchAll(exportRe)) imports.push({ specifier: match[1], resolved: resolveSpecifier(match[1], from), names: [], reexport: true });
  return imports;
}
function parseImportBindings(body) { const names = []; if (!body) return names; if (body.startsWith('*')) { const local = body.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/)?.[1]; if (local) names.push({ imported: '*', local }); return names; } if (body.startsWith('{')) return parseNamedImports(body.replace(/^\{|\}$/g, '')); const [defaultName, rest] = body.split(/,\s*(?=\{|\*)/); if (defaultName?.trim()) names.push({ imported: 'default', local: defaultName.trim() }); if (rest?.trim().startsWith('{')) names.push(...parseNamedImports(rest.replace(/^\{|\}$/g, ''))); if (rest?.trim().startsWith('*')) { const local = rest.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/)?.[1]; if (local) names.push({ imported: '*', local }); } return names; }
function parseNamedImports(body) { return body.split(',').map(part => { const [imported, local] = part.trim().split(/\s+as\s+/); return { imported: imported.trim(), local: (local || imported).trim() }; }).filter(item => item.imported); }

function stripExports(source, moduleKey = '') {
  const exportNames = new Set(), exportAliases = [];
  let defaultName = null;
  let code = rewriteDynamicImport(stripImports(source), moduleKey);
  code = code.replace(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { defaultName = name; return `globals.${name} = function ${name}`; });
  code = code.replace(/export\s+default\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => { defaultName = name; return `globals.${name} = class ${name}`; });
  code = code.replace(/export\s+default\s+/g, () => { defaultName = '__merkavaDefaultExport'; return `globals.${defaultName} = `; });
  code = code.replace(/export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (_, _kind, name) => { exportNames.add(name); return `globals.${name}`; });
  code = code.replace(/export\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `globals.${name} = class ${name}`; });
  code = code.replace(/export\s+async\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `globals.${name} = async function* ${name}`; });
  code = code.replace(/export\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `globals.${name} = function* ${name}`; });
  code = code.replace(/export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `globals.${name} = async function ${name}`; });
  code = code.replace(/export\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { exportNames.add(name); return `globals.${name} = function ${name}`; });
  code = code.replace(/export\s*\{([^}]+)\}\s*;?/g, (_, body) => { for (const part of body.split(',')) { const [localRaw, exportedRaw] = part.trim().split(/\s+as\s+/); const local = localRaw?.trim(); const exported = (exportedRaw || localRaw || '').trim(); if (local && exported) { exportNames.add(exported); exportAliases.push({ local, exported }); } } return ''; });
  return { code, exportNames: [...exportNames], exportAliases, defaultName };
}
function rewriteDynamicImport(source, moduleKey = '') { return String(source || '').replace(/import\.meta\.url/g, '"merkava://module"').replace(/\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/g, (_m, _q, spec) => `__merkavaDynamicImport(${JSON.stringify(resolveSpecifier(spec, moduleKey || '/'))})`).replace(/\bimport\s*\(/g, '__merkavaDynamicImport('); }
function createVirtualNodeGlobals(files) { const fs = { readFileSync(file) { return files[file] ?? files['/' + file] ?? files['./' + file] ?? ''; }, writeFileSync(file, value) { files[file] = String(value); files['/' + file.replace(/^\//, '')] = String(value); }, existsSync(file) { return files[file] != null || files['/' + file] != null || files['./' + file] != null; } }; return { api: { fs }, fs }; }

async function executeVmFiles({ files = {}, entry = '/main.js', globals = {}, runtime = 'node' } = {}) {
  const allFiles = normalizeFiles(files);
  const cache = new Map();
  const runtimeGlobals = runtime === 'node' ? createVirtualNodeGlobals(allFiles) : {};
  async function load(file) {
    const resolvedFile = resolveSpecifier(file, '/');
    let key = findExistingKey(allFiles, resolvedFile) || findExistingKey(allFiles, file) || resolvedFile;
    if (cache.has(key)) return cache.get(key);
    let source = allFiles[key];
    if (source == null) { source = fallbackModuleSource(key); if (source != null) allFiles[key] = source; }
    if (source == null) throw new Error(`VM module not found: ${file} resolved as ${resolvedFile}`);
    const moduleGlobals = makeModuleGlobals(globals, runtimeGlobals, runtime);
    const reexports = [];
    for (const imp of parseImports(source, key)) { const imported = await load(imp.resolved); if (imp.reexport) reexports.push(imported); for (const item of imp.names) moduleGlobals[item.local] = item.imported === '*' ? imported : imported[item.imported]; }
    const exports = await runOneModule({ source, key, moduleGlobals, reexports });
    cache.set(key, exports);
    return exports;
  }
  const exports = await load(entry);
  return { ok: true, entry, exports, files: allFiles, modules: Object.fromEntries(cache.entries()) };
}
function makeModuleGlobals(globals, runtimeGlobals, runtime) { return runtime === 'node' ? { ...runtimeGlobals, ...globals } : Object.assign(Object.create(globals || null), globals || {}); }
async function runOneModule({ source, key, moduleGlobals, reexports }) { const { code, exportNames, exportAliases, defaultName } = stripExports(source, key); return runNativeAsyncModule({ code, key, moduleGlobals, reexports, exportNames, exportAliases, defaultName }); }
async function runNativeAsyncModule({ code, key, moduleGlobals, reexports, exportNames, exportAliases, defaultName }) { try { await AsyncFunction('globals', `with(globals){\n${namedPrelude(moduleGlobals)}\n${code}\n}`)(moduleGlobals); return collectExports(moduleGlobals, reexports, exportNames, exportAliases, defaultName); } catch (error) { const wrapped = new Error(`VM module failed: ${key}: ${error.message}`); wrapped.code = 'MERKAVA_VM_MODULE_FAILED'; wrapped.moduleKey = key; wrapped.cause = error; wrapped.trace = []; throw wrapped; } }
function namedPrelude(scope) { const names = []; for (const name of Object.keys(scope || {})) if (/^[A-Za-z_$][\w$]*$/.test(name) && !reserved.has(name)) names.push(`var ${name}=globals[${JSON.stringify(name)}];`); return names.join('\n'); }
const reserved = new Set(['arguments','await','break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','finally','for','function','if','import','in','instanceof','let','new','return','super','switch','this','throw','try','typeof','var','void','while','with','yield']);
function collectExports(scope, reexports, exportNames, exportAliases = [], defaultName) { const exports = Object.assign({}, ...reexports); for (const name of exportNames) exports[name] = scope[name]; for (const item of exportAliases) exports[item.exported] = scope[item.local]; if (defaultName || scope.default !== undefined) exports.default = defaultName ? scope[defaultName] : scope.default; return exports; }

function fallbackModuleSource(key) {
  const clean = String(key || '').toLowerCase();
  if (clean.endsWith('orbitcontrols.js')) return `export class OrbitControls { constructor(camera, domElement){ this.camera=camera; this.domElement=domElement; this.enableDamping=false; } update(){} dispose(){} }`;
  if (!clean.includes('three.module.js')) return null;
  return `
class V3 { constructor(x=0,y=0,z=0){ this.set(x,y,z); } set(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; return this; } copy(v){ return this.set(v.x,v.y,v.z); } }
class Obj { constructor(){ this.children=[]; this.position=new V3(); this.rotation=new V3(); this.scale=new V3(1,1,1); } add(...items){ this.children.push(...items); return this; } remove(...items){ this.children=this.children.filter(x=>!items.includes(x)); return this; } lookAt(){ return this; } }
export class Scene extends Obj {}
export class PerspectiveCamera extends Obj { constructor(fov,aspect,near,far){ super(); this.fov=fov; this.aspect=aspect; this.near=near; this.far=far; } updateProjectionMatrix(){} }
export class WebGLRenderer { constructor(opts={}){ this.options=opts; this.domElement=document.createElement('canvas'); } setSize(w,h){ this.domElement.width=w; this.domElement.height=h; } setPixelRatio(){} render(){} }
export class Mesh extends Obj { constructor(geometry,material){ super(); this.geometry=geometry; this.material=material; } }
export class PlaneGeometry { constructor(...args){ this.args=args; } }
export class SphereGeometry { constructor(...args){ this.args=args; } }
export class CylinderGeometry { constructor(...args){ this.args=args; } }
export class MeshLambertMaterial { constructor(opts={}){ Object.assign(this,opts); } }
export class MeshStandardMaterial { constructor(opts={}){ Object.assign(this,opts); } }
export class PointLight extends Obj { constructor(color,intensity){ super(); this.color=color; this.intensity=intensity; } }
export class AmbientLight extends Obj { constructor(color,intensity){ super(); this.color=color; this.intensity=intensity; } }
export const Vector3 = V3;
export const DoubleSide = 2;
`;
}
module.exports = { executeVmFiles, normalizeFiles, parseImports, stripExports, rewriteDynamicImport, resolveSpecifier, canonicalModulePath, moduleAliases, createVirtualNodeGlobals, stripQuery, findExistingKey };
