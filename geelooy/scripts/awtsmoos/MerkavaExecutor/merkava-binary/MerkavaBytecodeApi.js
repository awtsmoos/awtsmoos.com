// B"H
const { compileSourceFilesToMode2 } = require('./SourceAppCompiler.js');
const { runMode2App, decodeMode2App, MAGIC } = require('./Mode2AppBinary.js');
const { encodeMode2JsBinary, runMode2JsBinary, decodeMode2JsBinary, MODE2_JS_MAGIC } = require('./Mode2JsBinary.js');

function normalizeFiles(files = {}) {
  const out = {};
  for (const [key, value] of Object.entries(files || {})) {
    const clean = String(key || '').replace(/\\/g, '/').replace(/^\.\//, '');
    out[clean] = String(value == null ? '' : value);
    if (!clean.startsWith('/')) out['/' + clean] = out[clean];
  }
  return out;
}

function asBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === 'string') return Buffer.from(value, 'base64');
  throw new Error('Expected Merkava bytecode Buffer, Uint8Array, or base64 string.');
}

async function compileMerkavaApp({ files = {}, entry = 'index.html' } = {}) {
  const normalized = normalizeFiles(files);
  const cleanEntry = String(entry || 'index.html').replace(/^\.\//, '');
  const bytecode = await compileSourceFilesToMode2({ files: normalized, entry: cleanEntry.startsWith('/') ? cleanEntry : '/' + cleanEntry });
  return { ok: true, kind: 'merkava-app', magic: 'MERKAVA', entry: cleanEntry, bytecode, bytecode64: Buffer.from(bytecode).toString('base64') };
}

function runMerkavaApp(bytecode, options = {}) {
  const buffer = asBuffer(bytecode);
  const result = runMode2App(buffer, options);
  return { ok: result && result.ok !== false, kind: 'merkava-app', magic: 'MERKAVA', result };
}

async function compileAndRunMerkavaApp(options = {}) {
  const compiled = await compileMerkavaApp(options);
  return { ...compiled, run: runMerkavaApp(compiled.bytecode, options.runOptions || options).result };
}

async function compileMerkavaJs(source = '', options = {}) {
  const bytecode = await encodeMode2JsBinary(String(source || ''), options);
  return { ok: true, kind: 'merkava-js', magic: 'MERKAVA', bytecode, bytecode64: Buffer.from(bytecode).toString('base64') };
}

function runMerkavaJs(bytecode, options = {}) {
  const buffer = asBuffer(bytecode);
  const result = runMode2JsBinary(buffer, options);
  return { ok: true, kind: 'merkava-js', magic: 'MERKAVA', result };
}

async function compileAndRunMerkavaJs(source = '', options = {}) {
  const compiled = await compileMerkavaJs(source, options);
  return { ...compiled, run: runMerkavaJs(compiled.bytecode, options).result };
}

function inspectMerkava(bytecode) {
  const buffer = asBuffer(bytecode);
  const magic = buffer.slice(0, 4).toString('ascii');
  if (magic === MAGIC) return { ok: true, kind: 'merkava-app', magic: 'MERKAVA', decoded: decodeMode2App(buffer) };
  if (magic === MODE2_JS_MAGIC) return { ok: true, kind: 'merkava-js', magic: 'MERKAVA', decoded: decodeMode2JsBinary(buffer) };
  return { ok: false, error: 'unknown_merkava_magic', magic };
}

module.exports = {
  normalizeFiles,
  compileMerkavaApp,
  runMerkavaApp,
  compileAndRunMerkavaApp,
  compileMerkavaJs,
  runMerkavaJs,
  compileAndRunMerkavaJs,
  inspectMerkava,
  compileMd2App: compileMerkavaApp,
  runMd2App: runMerkavaApp,
  compileAndRunMd2App: compileAndRunMerkavaApp,
  compileMd2Js: compileMerkavaJs,
  runMd2Js: runMerkavaJs,
  compileAndRunMd2Js: compileAndRunMerkavaJs,
  inspectMd2: inspectMerkava
};
