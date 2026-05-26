// B"H
const path = require('path');
const { compileJsToJson } = require('./MerkavaJsCompiler.js');
const { runJsonCode } = require('./MerkavaJsonRunner.js');

function canonicalModulePath(value = '') {
  const raw = String(value || '').replace(/\\/g, '/');
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
  for (const [key, value] of Object.entries(files)) {
    for (const alias of moduleAliases(key)) out[alias] = value;
  }
  return out;
}
function resolveSpecifier(specifier, from = '') {
  const raw = String(specifier || '').replace(/\\/g, '/');
  if (/^[a-z]+:/i.test(raw)) return raw;
  if (raw.startsWith('/')) return `/${canonicalModulePath(raw).replace(/^\//, '')}`;
  const base = from && from.includes('/') ? from.split('/').slice(0, -1).join('/') : '';
  const joined = base ? `${base}/${raw}` : raw;
  return `/${canonicalModulePath(joined).replace(/^\//, '')}`;
}
function parseImports(source, from) {
  const imports = [];
  const re = /import\s+([^'";]+?)\s+from\s+['"]([^'"]+)['"]\s*;?/g;
  for (const match of source.matchAll(re)) {
    const body = match[1].trim();
    const names = [];
    if (body.startsWith('{')) {
      names.push(...parseNamedImports(body.replace(/^\{|\}$/g, '')));
    } else {
      const [defaultName, namedBlock] = body.split(/,\s*(?=\{)/);
      if (defaultName?.trim()) names.push({ imported: 'default', local: defaultName.trim() });
      if (namedBlock) names.push(...parseNamedImports(namedBlock.replace(/^\{|\}$/g, '')));
    }
    imports.push({
      specifier: match[2],
      resolved: resolveSpecifier(match[2], from),
      names
    });
  }
  return imports;
}
function parseNamedImports(body) {
  return body.split(',').map(part => {
    const [imported, local] = part.trim().split(/\s+as\s+/);
    return { imported: imported.trim(), local: (local || imported).trim() };
  }).filter(item => item.imported);
}
function stripImports(source) {
  return source.replace(/import\s+[^'";]+?\s+from\s+['"][^'"]+['"]\s*;?/g, '');
}
function stripExports(source) {
  const names = new Set();
  let defaultName = null;
  let code = stripImports(source);
  code = code.replace(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => {
    defaultName = name;
    return `function ${name}`;
  });
  code = code.replace(/export\s+default\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => {
    defaultName = name;
    return `class ${name}`;
  });
  code = code.replace(/export\s+default\s+([^;\n]+)\s*;?/g, (_, expression) => {
    defaultName = '__merkavaDefaultExport';
    return `const ${defaultName} = ${expression};`;
  });
  code = code.replace(/export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (_, kind, name) => { names.add(name); return `${kind} ${name}`; });
  code = code.replace(/export\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `class ${name}`; });
  code = code.replace(/export\s+async\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `async function* ${name}`; });
  code = code.replace(/export\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `function* ${name}`; });
  code = code.replace(/export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `async function ${name}`; });
  code = code.replace(/export\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => { names.add(name); return `function ${name}`; });
  code = code.replace(/export\s*\{([^}]+)\}\s*;?/g, (_, body) => {
    for (const part of body.split(',')) {
      const [local, exported] = part.trim().split(/\s+as\s+/);
      if (local) names.add((exported || local).trim());
    }
    return '';
  });
  return { code, exportNames: [...names], defaultName };
}
function createVirtualNodeGlobals(files) {
  const fs = {
    readFileSync(path, encoding = 'utf8') { return files[path] ?? files['/' + path] ?? files['./' + path] ?? ''; },
    writeFileSync(path, value) { files[path] = String(value); files['/' + path.replace(/^\//, '')] = String(value); return undefined; },
    existsSync(path) { return files[path] != null || files['/' + path] != null || files['./' + path] != null; }
  };
  return { api: { fs }, fs };
}

/**
 * VM-only file/module executor for a strict ES module subset.
 * Imports/exports are resolved structurally; module bodies run through VM.
 */
async function executeVmFiles({ files = {}, entry = '/main.js', globals = {}, runtime = 'node' } = {}) {
  const allFiles = normalizeFiles(files);
  const cache = new Map();
  const runtimeGlobals = runtime === 'node' ? createVirtualNodeGlobals(allFiles) : {};

  async function load(file) {
    const resolvedFile = resolveSpecifier(file, '/');
    const key = moduleAliases(resolvedFile).find(alias => allFiles[alias] !== undefined)
      || moduleAliases(file).find(alias => allFiles[alias] !== undefined)
      || resolvedFile;
    if (cache.has(key)) return cache.get(key);
    const source = allFiles[key];
    if (source == null) throw new Error(`VM module not found: ${file} resolved as ${resolvedFile}`);

    const moduleGlobals = { ...runtimeGlobals, ...globals };
    for (const imp of parseImports(source, key)) {
      const imported = await load(imp.resolved);
      for (const item of imp.names) moduleGlobals[item.local] = imported[item.imported];
    }

    const { code, exportNames, defaultName } = stripExports(source);
    const json = await compileJsToJson(code);
    const run = runJsonCode(json, { globals: moduleGlobals });
    if (!run.ok) throw new Error(`VM module failed: ${key}`);
    const exports = {};
    for (const name of exportNames) exports[name] = run.globals[name];
    exports.default = defaultName ? run.globals[defaultName] : run.globals.default;
    cache.set(key, exports);
    return exports;
  }

  const exports = await load(entry);
  return { ok: true, entry, exports, files: allFiles, modules: Object.fromEntries(cache.entries()) };
}

module.exports = { executeVmFiles, normalizeFiles, parseImports, stripExports, resolveSpecifier, canonicalModulePath, moduleAliases, createVirtualNodeGlobals };
