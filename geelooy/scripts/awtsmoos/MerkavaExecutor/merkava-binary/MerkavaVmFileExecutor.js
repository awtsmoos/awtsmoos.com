// B"H
const path = require('path');
const { compileJsToJson } = require('./MerkavaJsCompiler.js');
const { runJsonCode } = require('./MerkavaJsonRunner.js');

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
function resolveSpecifier(specifier, from = '') {
  const raw = String(specifier || '').replace(/\\/g, '/');
  if (/^[a-z]+:/i.test(raw)) return canonicalModulePath(new URL(raw).pathname);
  if (raw.startsWith('/')) return `/${canonicalModulePath(raw).replace(/^\//, '')}`;
  const base = from && from.includes('/') ? from.split('/').slice(0, -1).join('/') : '';
  return `/${canonicalModulePath(base ? `${base}/${raw}` : raw).replace(/^\//, '')}`;
}
function findExistingKey(files, requested) {
  for (const alias of moduleAliases(requested)) if (files[alias] !== undefined) return alias;
  const clean = canonicalModulePath(requested).replace(/^\//, '');
  const keys = Object.keys(files || {});
  return keys.find(key => clean.endsWith(canonicalModulePath(key).replace(/^\//, ''))) || null;
}
function inferAppBase(files = {}) {
  const full = Object.keys(files).find(key => /^https?:\/\//.test(key) && /\/games\/mitzvahWorld\//.test(key));
  if (!full) return null;
  try { return new URL('/games/mitzvahWorld/', full).href; } catch (_) { return null; }
}
async function fetchMissingModule(files, requested) {
  const clean = canonicalModulePath(requested).replace(/^\//, '');
  const base = inferAppBase(files);
  if (!base || !clean) return null;
  const candidates = [new URL(clean, base).href, new URL('/' + clean, base).href];
  for (const href of [...new Set(candidates)]) {
    const response = await fetch(href, { headers: { accept: 'text/javascript,*/*' } }).catch(() => null);
    if (!response?.ok) continue;
    const body = await response.text();
    for (const alias of moduleAliases(clean)) files[alias] = body;
    files[href] = body;
    return findExistingKey(files, clean) || clean;
  }
  return null;
}
function parseImports(source, from) {
  const imports = [];
  const staticRe = /import\s+(?!\()(?:(.*?)\s+from\s+)?['"]([^'"]+)['"]\s*;?/gs;
  for (const match of source.matchAll(staticRe)) {
    const body = (match[1] || '').trim();
    imports.push({ specifier: match[2], resolved: resolveSpecifier(match[2], from), names: parseImportBindings(body), sideEffect: !body });
  }
  const exportRe = /export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]\s*;?/gs;
  for (const match of source.matchAll(exportRe)) imports.push({ specifier: match[1], resolved: resolveSpecifier(match[1], from), names: [], reexport: true });
  return imports;
}
function parseImportBindings(body) {
  const names = [];
  if (!body) return names;
  if (body.startsWith('*')) { const local = body.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/)?.[1]; if (local) names.push({ imported: '*', local }); return names; }
  if (body.startsWith('{')) return parseNamedImports(body.replace(/^\{|\}$/g, ''));
  const [defaultName, rest] = body.split(/,\s*(?=\{|\*)/);
  if (defaultName?.trim()) names.push({ imported: 'default', local: defaultName.trim() });
  if (rest?.trim().startsWith('{')) names.push(...parseNamedImports(rest.replace(/^\{|\}$/g, '')));
  if (rest?.trim().startsWith('*')) { const local = rest.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/)?.[1]; if (local) names.push({ imported: '*', local }); }
  return names;
}
function parseNamedImports(body) {
  return body.split(',').map(part => { const [imported, local] = part.trim().split(/\s+as\s+/); return { imported: imported.trim(), local: (local || imported).trim() }; }).filter(item => item.imported);
}
function stripImports(source) {
  return String(source || '')
    .replace(/import\s+(?!\()(?:(.*?)\s+from\s+)?['"][^'"]+['"]\s*;?/gs, '')
    .replace(/export\s+(?:\*|\{[^}]*\})\s+from\s+['"][^'"]+['"]\s*;?/gs, '');
}
function stripExports(source) {
  const names = new Set();
  let defaultName = null;
  let code = rewriteDynamicImport(stripImports(source));
  code = code.replace(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { defaultName = name; return `function ${name}`; });
  code = code.replace(/export\s+default\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => { defaultName = name; return `class ${name}`; });
  code = code.replace(/export\s+default\s+/g, () => { defaultName = '__merkavaDefaultExport'; return `const ${defaultName} = `; });
  code = code.replace(/export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (_, kind, name) => { names.add(name); return `${kind} ${name}`; });
  code = code.replace(/export\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `class ${name}`; });
  code = code.replace(/export\s+async\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `async function* ${name}`; });
  code = code.replace(/export\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `function* ${name}`; });
  code = code.replace(/export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `async function ${name}`; });
  code = code.replace(/export\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `function ${name}`; });
  code = code.replace(/export\s*\{([^}]+)\}\s*;?/g, (_, body) => { for (const part of body.split(',')) { const [local, exported] = part.trim().split(/\s+as\s+/); if (local) names.add((exported || local).trim()); } return ''; });
  return { code, exportNames: [...names], defaultName };
}
function rewriteDynamicImport(source) { return String(source || '').replace(/import\.meta\.url/g, '"merkava://module"').replace(/\bimport\s*\(/g, '__merkavaDynamicImport('); }
function createVirtualNodeGlobals(files) {
  const fs = { readFileSync(file) { return files[file] ?? files['/' + file] ?? files['./' + file] ?? ''; }, writeFileSync(file, value) { files[file] = String(value); files['/' + file.replace(/^\//, '')] = String(value); return undefined; }, existsSync(file) { return files[file] != null || files['/' + file] != null || files['./' + file] != null; } };
  return { api: { fs }, fs };
}
async function executeVmFiles({ files = {}, entry = '/main.js', globals = {}, runtime = 'node' } = {}) {
  const allFiles = normalizeFiles(files);
  const cache = new Map();
  const runtimeGlobals = runtime === 'node' ? createVirtualNodeGlobals(allFiles) : {};
  async function load(file) {
    const resolvedFile = resolveSpecifier(file, '/');
    let key = findExistingKey(allFiles, resolvedFile) || findExistingKey(allFiles, file);
    if (!key) key = await fetchMissingModule(allFiles, resolvedFile) || await fetchMissingModule(allFiles, file) || resolvedFile;
    if (cache.has(key)) return cache.get(key);
    const source = allFiles[key];
    if (source == null) throw new Error(`VM module not found: ${file} resolved as ${resolvedFile}`);
    const moduleGlobals = { ...runtimeGlobals, ...globals };
    const reexports = [];
    for (const imp of parseImports(source, key)) {
      const imported = await load(imp.resolved);
      if (imp.reexport) reexports.push(imported);
      for (const item of imp.names) moduleGlobals[item.local] = item.imported === '*' ? imported : imported[item.imported];
    }
    const { code, exportNames, defaultName } = stripExports(source);
    const json = await compileJsToJson(code);
    const run = runJsonCode(json, { globals: moduleGlobals });
    if (!run.ok) {
      const cause = run.crash || { message: run.error || 'unknown bytecode crash', trace: run.trace || [] };
      const error = new Error(`VM module failed: ${key}: ${cause.message}`);
      error.code = 'MERKAVA_VM_MODULE_FAILED';
      error.moduleKey = key;
      error.cause = cause;
      error.trace = cause.trace || [];
      error.bytecode = { status: run.status, ip: cause.ip, bytecodeLength: cause.bytecodeLength, stackSummary: cause.stackSummary || [] };
      throw error;
    }
    const exports = Object.assign({}, ...reexports);
    for (const name of exportNames) exports[name] = run.globals[name];
    if (defaultName || run.globals.default !== undefined) exports.default = defaultName ? run.globals[defaultName] : run.globals.default;
    cache.set(key, exports);
    return exports;
  }
  const exports = await load(entry);
  return { ok: true, entry, exports, files: allFiles, modules: Object.fromEntries(cache.entries()) };
}
module.exports = { executeVmFiles, normalizeFiles, parseImports, stripExports, rewriteDynamicImport, resolveSpecifier, canonicalModulePath, moduleAliases, createVirtualNodeGlobals, stripQuery, findExistingKey };
