// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const { classNodeToCompact } = require('./CompactClassCodec.js');
const { installCompactClasses } = require('./CompactClassRuntime.js');
const MAGIC = 'CCLS';
const VERSION = 2;

function poolRef(pool, text) {
  const value = String(text || '');
  let index = pool.indexOf(value);
  if (index < 0) { index = pool.length; pool.push(value); }
  return index;
}
function normalizeSpec(spec) {
  return Array.isArray(spec) ? spec : [spec.name, spec.superName || '', spec.fields || [], (spec.methods || []).map(m => [m.name, m.params || [], m.code || []]), spec.constants || []];
}
function encodeConst(w, pool, value) {
  if (value == null) return w.u8(0);
  if (value === false) return w.u8(1);
  if (value === true) return w.u8(2);
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return w.u8(3).varUint(value);
  return w.u8(4).varUint(poolRef(pool, value));
}
function decodeConst(r, pool) {
  const t = r.u8();
  if (t === 0) return null;
  if (t === 1) return false;
  if (t === 2) return true;
  if (t === 3) return r.varUint();
  if (t === 4) return pool[r.varUint()] || '';
  throw new Error(`Bad CCLS constant type ${t}`);
}
function sameScopeName(scope) { return String(scope || 'global'); }

function encodeCompactClassBinary(classes = [], options = {}) {
  const specs = classes.map(normalizeSpec);
  const pool = [];
  const scopeName = sameScopeName(options.scopeName || options.scopeId || 'global');
  poolRef(pool, scopeName);
  for (const s of specs) {
    poolRef(pool, s[0]); if (s[1]) poolRef(pool, s[1]);
    for (const f of s[2]) poolRef(pool, f);
    for (const m of s[3]) { poolRef(pool, m[0]); for (const p of m[1] || []) poolRef(pool, p); }
    for (const c of s[4]) if (typeof c === 'string') poolRef(pool, c);
  }
  const w = new ByteWriter();
  w.raw(Buffer.from(MAGIC, 'ascii')).u8(VERSION);
  w.varUint(pool.length); for (const s of pool) w.string(s);
  w.varUint(poolRef(pool, scopeName));
  w.varUint(specs.length);
  for (let classId = 0; classId < specs.length; classId++) {
    const s = specs[classId];
    w.varUint(poolRef(pool, s[0])).varUint(s[1] ? poolRef(pool, s[1]) + 1 : 0);
    w.varUint(s[2].length); for (const f of s[2]) w.varUint(poolRef(pool, f));
    w.varUint(s[4].length); for (const c of s[4]) encodeConst(w, pool, c);
    w.varUint(s[3].length);
    for (const m of s[3]) {
      w.varUint(poolRef(pool, m[0]));
      w.varUint((m[1] || []).length); for (const p of m[1] || []) w.varUint(poolRef(pool, p));
      w.bytesWithLength(m[2] || []);
    }
  }
  return w.toBuffer();
}
function decodeCompactClassBinary(buffer) {
  const r = new ByteReader(buffer);
  const magic = r.bytes(4).toString('ascii');
  if (magic !== MAGIC) throw new Error(`Bad CCLS magic: ${magic}`);
  const version = r.u8();
  if (version !== 1 && version !== VERSION) throw new Error(`Unsupported CCLS version: ${version}`);
  const pool = []; const pc = r.varUint();
  for (let i = 0; i < pc; i++) pool.push(r.string());
  const scopeName = version >= 2 ? (pool[r.varUint()] || 'global') : 'global';
  const classes = []; const cc = r.varUint();
  for (let i = 0; i < cc; i++) {
    const name = pool[r.varUint()] || '';
    const superIndex = r.varUint();
    const superName = superIndex ? pool[superIndex - 1] || '' : '';
    const fields = []; const fc = r.varUint(); for (let f = 0; f < fc; f++) fields.push(pool[r.varUint()] || '');
    const constants = []; const kc = r.varUint(); for (let k = 0; k < kc; k++) constants.push(decodeConst(r, pool));
    const methods = []; const mc = r.varUint();
    for (let m = 0; m < mc; m++) {
      const mn = pool[r.varUint()] || '';
      const params = []; const pc2 = r.varUint(); for (let p = 0; p < pc2; p++) params.push(pool[r.varUint()] || '');
      methods.push([mn, params, [...r.bytesWithLength()]]);
    }
    classes.push([name, superName, fields, methods, constants, i, scopeName]);
  }
  return { version, scopeName, pool, classes };
}
function astToCompactClassBinary(ast, options = {}) {
  const classes = (ast.body || []).filter(stmt => stmt.type === 'ClassDeclaration').map(classNodeToCompact);
  return encodeCompactClassBinary(classes, options);
}
function runCompactClassBinary(buffer, options = {}) {
  const decoded = decodeCompactClassBinary(buffer);
  const globals = options.globals || {};
  installCompactClasses(decoded.classes, globals, { scopeName: decoded.scopeName, exposeGlobals: options.exposeGlobals !== false });
  return { ok: true, globals: { ...globals }, decoded };
}
module.exports = { MAGIC, VERSION, encodeCompactClassBinary, decodeCompactClassBinary, astToCompactClassBinary, runCompactClassBinary };
