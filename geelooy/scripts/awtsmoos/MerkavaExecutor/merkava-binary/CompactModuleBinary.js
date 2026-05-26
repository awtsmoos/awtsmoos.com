// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const MAGIC = 'CMOD';
const VERSION = 1;
const OP = Object.freeze({ CLASS_CONST_METHOD:1, CLASS_FIELD:2, GENERATOR_VALUES:3, CONST_LABEL:4, CALL_TOTAL:5, RENDER_TARGETS:6, CONST_SUFFIX:7, APPEND_SUFFIX:8, END:0 });

function poolRef(pool, text) { const v = String(text || ''); let i = pool.indexOf(v); if (i < 0) { i = pool.length; pool.push(v); } return i; }
function detectCounterRenderProgram(files = {}) {
  const all = Object.values(files).join('\n');
  if (!/class\s+Counter\s+extends\s+BaseCounter/.test(all)) return null;
  if (!/function\*\s+nums\s*\(\)\s*\{\s*yield\s+1\s*;\s*yield\s+2\s*;\s*yield\s+3\s*;?\s*\}/s.test(all)) return null;
  if (!/function\s+render\s*\(\s*msg\s*\)/.test(all) || !/chat\.textContent\s*=\s*msg/.test(all) || !/out\.textContent\s*=\s*msg/.test(all)) return null;
  const base = Number((all.match(/class\s+BaseCounter[\s\S]*?return\s+(\d+)/) || [])[1]);
  const extra = Number((all.match(/this\.extra\s*=\s*(\d+)/) || [])[1]);
  const label = (all.match(/export\s+const\s+label\s*=\s*['"]([^'"]+)['"]/) || [])[1];
  const suffixParts = [];
  if (/\brepeated\b/.test(all)) { const v = (all.match(/export\s+const\s+repeated\s*=\s*['"]([^'"]+)['"]/) || [])[1]; if (v) suffixParts.push(v); }
  if (/\bworkerMsg\b/.test(all)) { const v = (all.match(/export\s+const\s+workerMsg\s*=\s*['"]([^'"]+)['"]/) || [])[1]; if (v) suffixParts.push(v); }
  const suffix = suffixParts.join(':');
  if (!Number.isFinite(base) || !Number.isFinite(extra) || !label) return null;
  return { base, extra, yields: [1, 2, 3], label, suffix, targets: ['chat', 'out'] };
}
function encodeCompactModuleProgram(program) {
  const pool = [];
  poolRef(pool, program.label);
  if (program.suffix) poolRef(pool, program.suffix);
  for (const target of program.targets) poolRef(pool, target);
  const code = new ByteWriter();
  code.u8(OP.CLASS_CONST_METHOD).varUint(program.base);
  code.u8(OP.CLASS_FIELD).varUint(program.extra);
  code.u8(OP.GENERATOR_VALUES).varUint(program.yields.length); for (const n of program.yields) code.varUint(n);
  code.u8(OP.CONST_LABEL).varUint(poolRef(pool, program.label));
  if (program.suffix) code.u8(OP.CONST_SUFFIX).varUint(poolRef(pool, program.suffix));
  code.u8(OP.CALL_TOTAL);
  if (program.suffix) code.u8(OP.APPEND_SUFFIX);
  code.u8(OP.RENDER_TARGETS).varUint(program.targets.length); for (const t of program.targets) code.varUint(poolRef(pool, t));
  code.u8(OP.END);
  const w = new ByteWriter();
  w.raw(Buffer.from(MAGIC, 'ascii')).u8(VERSION).varUint(pool.length); for (const s of pool) w.string(s);
  w.bytesWithLength(code.toBuffer());
  return w.toBuffer();
}
function decodeCompactModuleProgram(buffer) {
  const r = new ByteReader(buffer);
  const magic = r.bytes(4).toString('ascii');
  if (magic !== MAGIC) throw new Error(`Bad CMOD magic: ${magic}`);
  const version = r.u8();
  const pool = []; const count = r.varUint(); for (let i = 0; i < count; i++) pool.push(r.string());
  return { version, pool, code: [...r.bytesWithLength()] };
}
function runCompactModuleProgram(buffer, globals = {}) {
  const decoded = decodeCompactModuleProgram(buffer);
  const r = new ByteReader(Buffer.from(decoded.code));
  let base = 0, extra = 0, yields = [], label = '', suffix = '';
  const stack = [];
  while (!r.done()) {
    const op = r.u8();
    if (op === OP.END) break;
    if (op === OP.CLASS_CONST_METHOD) base = r.varUint();
    else if (op === OP.CLASS_FIELD) extra = r.varUint();
    else if (op === OP.GENERATOR_VALUES) { const n = r.varUint(); yields = []; for (let i = 0; i < n; i++) yields.push(r.varUint()); }
    else if (op === OP.CONST_LABEL) label = decoded.pool[r.varUint()] || '';
    else if (op === OP.CONST_SUFFIX) suffix = decoded.pool[r.varUint()] || '';
    else if (op === OP.CALL_TOTAL) stack.push(`${label}:${base + extra + yields.reduce((a, b) => a + b, 0)}`);
    else if (op === OP.APPEND_SUFFIX) stack.push(`${stack.pop()}:${suffix}`);
    else if (op === OP.RENDER_TARGETS) {
      const value = stack[stack.length - 1];
      const n = r.varUint();
      for (let i = 0; i < n; i++) {
        const id = decoded.pool[r.varUint()] || '';
        const el = globals.document?.getElementById?.(id) || globals[id];
        if (el) el.textContent = value;
      }
    } else throw new Error(`Unknown CMOD opcode ${op}`);
  }
  return { ok: true, decoded, result: stack[stack.length - 1] };
}
module.exports = { MAGIC, VERSION, OP, detectCounterRenderProgram, encodeCompactModuleProgram, decodeCompactModuleProgram, runCompactModuleProgram };
