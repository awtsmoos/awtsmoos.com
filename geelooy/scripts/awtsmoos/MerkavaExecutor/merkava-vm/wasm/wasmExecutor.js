// B"H — WebAssembly interpreter for the Merkava VM family (from scratch).
// Stack-machine interpreter over parsed WASM modules. Mirrors the MerkavaVM
// Thread discipline (RUNNING/COMPLETED/TRAPPED, explicit frame stack, no JS
// recursion for WASM calls) so deep WASM recursion cannot blow the host stack.
import { OP } from './wasmOpcodes.js';
import './leb128.js'; // side effect: BigInt.asInt64/asUint64 polyfill

export class WasmTrap extends Error {
  constructor(code, detail) {
    super('[wasm-trap] ' + code + (detail ? ': ' + detail : ''));
    this.name = 'WasmTrap';
    this.code = code;
  }
}

const PAGE = 65536;
const MAX_STEPS_DEFAULT = 200_000_000;
const I64_MIN = -(2n ** 63n);
const I64_MAX = 2n ** 63n - 1n;

// ---- value helpers (tagged values: {t:'i32'|'i64'|'f32'|'f64', v}) ----
const tv = (t, v) => ({ t, v });
const zeroOf = (t) => (t === 'i64' ? 0n : 0);
const I32 = (v) => tv('i32', v | 0);
const I64 = (v) => tv('i64', BigInt.asInt64(BigInt(v)));
const F32 = (v) => tv('f32', Math.fround(v));
const F64 = (v) => tv('f64', Number(v));

function fromJs(t, v) {
  if (v === undefined || v === null) return tv(t, zeroOf(t));
  if (t === 'i32') return I32(Number(v));
  if (t === 'i64') return I64(v);
  if (t === 'f32') return F32(Number(v));
  return F64(Number(v));
}
function toJs(a) {
  if (!a) return undefined;
  if (a.t === 'i64') return a.v;
  return a.v;
}

// ---- LEB readers over (code, pc) ----
function readUleb(code, pc) {
  let r = 0, s = 0, b;
  do { b = code[pc++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80);
  return [r >>> 0, pc];
}
function readSleb(code, pc) {
  let r = 0, s = 0, b;
  do { b = code[pc++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80);
  if (s < 32 && (b & 0x40)) r |= -(1 << s);
  return [r | 0, pc];
}
function readSleb64(code, pc) {
  let r = 0n, s = 0n, b;
  do { b = code[pc++]; r |= BigInt(b & 0x7f) << s; s += 7n; } while (b & 0x80);
  if (s < 64n && (b & 0x40)) r |= -(1n << s);
  return [BigInt.asInt64(r), pc];
}
const scratchDv = new DataView(new ArrayBuffer(8));
function readF32(code, pc) {
  for (let i = 0; i < 4; i++) scratchDv.setUint8(i, code[pc + i]);
  return [scratchDv.getFloat32(0, true), pc + 4];
}
function readF64(code, pc) {
  for (let i = 0; i < 8; i++) scratchDv.setUint8(i, code[pc + i]);
  return [scratchDv.getFloat64(0, true), pc + 8];
}
function readBlockType(code, pc) {
  const b = code[pc++];
  if (b === 0x40) return [[], pc];
  if (b === 0x7f) return [['i32'], pc];
  if (b === 0x7e) return [['i64'], pc];
  if (b === 0x7d) return [['f32'], pc];
  if (b === 0x7c) return [['f64'], pc];
  throw new WasmTrap('unsupported-blocktype', '0x' + b.toString(16));
}
function readMemarg(code, pc) {
  let align, offset;
  [align, pc] = readUleb(code, pc);
  [offset, pc] = readUleb(code, pc);
  return [{ align, offset }, pc];
}
function readBrTable(code, pc) {
  let n;
  [n, pc] = readUleb(code, pc);
  const targets = [];
  for (let i = 0; i < n; i++) { let t; [t, pc] = readUleb(code, pc); targets.push(t); }
  let dflt;
  [dflt, pc] = readUleb(code, pc);
  return [{ targets, default: dflt }, pc];
}
function readImm(code, pc, kind) {
  switch (kind) {
    case 'none': return [undefined, pc];
    case 'u32': return readUleb(code, pc);
    case 's32': return readSleb(code, pc);
    case 's64': return readSleb64(code, pc);
    case 'f32': return readF32(code, pc);
    case 'f64': return readF64(code, pc);
    case 'blocktype': return readBlockType(code, pc);
    case 'memarg': return readMemarg(code, pc);
    case 'brtable': return readBrTable(code, pc);
    case 'callindirect': {
      let t, m;
      [t, pc] = readUleb(code, pc);
      [m, pc] = readUleb(code, pc);
      return [{ typeIdx: t, tableIdx: m }, pc];
    }
    default: throw new WasmTrap('bad-imm-kind', kind);
  }
}
// Skip an immediate without decoding (for block pre-scan).
function skipImm(code, pc, kind) {
  const [, npc] = readImm(code, pc, kind);
  return npc;
}

// ---- block structure pre-scan: pc -> {kind, elsePc, endPc} ----
function precomputeBlocks(code) {
  const map = new Map();
  const stack = [];
  let pc = 0;
  while (pc < code.length) {
    const op = code[pc];
    const info = OP[op];
    if (!info) throw new WasmTrap('bad-opcode', '0x' + op.toString(16));
    const opc = pc;
    pc = skipImm(code, pc + 1, info.imm);
    if (op === 0x02 || op === 0x03 || op === 0x04) {
      stack.push({ pc: opc, op, elsePc: null });
    } else if (op === 0x05) {
      const top = stack[stack.length - 1];
      if (!top || top.op !== 0x04) throw new WasmTrap('else-mismatch');
      top.elsePc = pc;
    } else if (op === 0x0b) {
      if (stack.length === 0) break; // function-body end
      const top = stack.pop();
      map.set(top.pc, { op: top.op, elsePc: top.elsePc, endPc: pc });
    }
  }
  return map;
}

function evalConstExpr(expr, inst) {
  // expr: {type, value} from parser (MVP: no globalref chains)
  if (expr.type === 'globalref') {
    const g = inst.globals[expr.value];
    if (!g) throw new WasmTrap('bad-global', String(expr.value));
    return g.value;
  }
  if (expr.type === 'i32') return expr.value | 0;
  if (expr.type === 'i64') return BigInt.asInt64(expr.value);
  if (expr.type === 'f32') return Math.fround(expr.value);
  return Number(expr.value);
}

// ---- instantiation ----
export function instantiate(mod, importObject = {}, opts = {}) {
  const inst = {
    module: mod,
    types: mod.types,
    funcs: [],
    memories: [],
    globals: [],
    table: [],
    maxSteps: opts.maxSteps || MAX_STEPS_DEFAULT,
  };
  for (const im of mod.imports) {
    const ns = importObject[im.module] || {};
    if (im.kind === 'func') {
      const fn = ns[im.name];
      if (typeof fn !== 'function') throw new Error('[wasm] missing import ' + im.module + '.' + im.name);
      inst.funcs.push({ kind: 'imported', type: mod.types[im.type], fn, importName: im.module + '.' + im.name });
    } else if (im.kind === 'memory') {
      const mem = ns[im.name];
      if (!mem || !(mem.bytes instanceof Uint8Array)) throw new Error('[wasm] missing memory import ' + im.module + '.' + im.name);
      inst.memories.push(mem);
    } else if (im.kind === 'global') {
      const g = ns[im.name];
      if (g === undefined) throw new Error('[wasm] missing global import ' + im.module + '.' + im.name);
      inst.globals.push({ valtype: im.valtype, mutable: im.mutable, value: g && g.v !== undefined ? g.v : g });
    } else if (im.kind === 'table') {
      const t = ns[im.name];
      if (!Array.isArray(t)) throw new Error('[wasm] missing table import ' + im.module + '.' + im.name);
      inst.table = t;
    }
  }
  mod.funcs.forEach((typeIdx, i) => {
    const body = mod.codes[i];
    inst.funcs.push({
      kind: 'defined',
      typeIdx,
      type: mod.types[typeIdx],
      locals: body.locals,
      code: body.code,
      blocks: precomputeBlocks(body.code),
    });
  });
  for (const m of mod.memories) {
    const bytes = new Uint8Array(m.min * PAGE);
    inst.memories.push({ bytes, view: new DataView(bytes.buffer), pages: m.min, max: m.max });
  }
  for (const g of mod.globals) {
    inst.globals.push({ valtype: g.valtype, mutable: g.mutable, value: evalConstExpr(g.init, inst) });
  }
  for (const t of mod.tables) {
    for (let i = 0; i < t.limits.min; i++) inst.table.push(null);
  }
  for (const seg of mod.elems) {
    const off = evalConstExpr(seg.offset, inst) | 0;
    seg.funcs.forEach((f, i) => { inst.table[off + i] = f; });
  }
  for (const seg of mod.datas) {
    if (!seg.active) continue;
    const mem = inst.memories[seg.memory || 0];
    if (!mem) throw new WasmTrap('no-memory');
    const off = evalConstExpr(seg.offset, inst) | 0;
    if (off < 0 || off + seg.bytes.length > mem.bytes.length) throw new WasmTrap('oob-data-segment');
    mem.bytes.set(seg.bytes, off);
  }
  if (mod.start !== null && mod.start !== undefined) {
    invokeByIndex(inst, mod.start, []);
  }
  return inst;
}

// ---- invocation ----
export function invokeByIndex(inst, funcIdx, rawArgs = []) {
  const stack = [];
  const frames = [];
  pushFrame(inst, frames, stack, funcIdx, rawArgs);
  let steps = 0;
  while (frames.length > 0) {
    if (++steps > inst.maxSteps) throw new WasmTrap('timeout', 'step budget exceeded');
    stepFrame(inst, frames, stack);
  }
  return stack;
}

export function invoke(inst, exportName, rawArgs = []) {
  const ex = inst.module.exports.find((e) => e.name === exportName && e.kind === 'func');
  if (!ex) throw new Error('[wasm] no exported func "' + exportName + '"');
  return invokeByIndex(inst, ex.index, rawArgs).map(toJs);
}

function pushFrame(inst, frames, stack, funcIdx, rawArgs) {
  const fn = inst.funcs[funcIdx];
  if (!fn) throw new WasmTrap('bad-func', String(funcIdx));
  if (fn.kind === 'imported') throw new WasmTrap('internal', 'pushFrame on imported func');
  const type = fn.type;
  if (rawArgs.length !== type.params.length) {
    throw new WasmTrap('arity', `expected ${type.params.length}, got ${rawArgs.length}`);
  }
  const locals = type.params.map((t, i) => fromJs(t, rawArgs[i]));
  for (const lt of fn.locals) locals.push(tv(lt, zeroOf(lt)));
  frames.push({ func: fn, type, code: fn.code, pc: 0, locals, labels: [], base: stack.length, blocks: fn.blocks });
}

function callFunction(inst, frames, stack, funcIdx) {
  const fn = inst.funcs[funcIdx];
  if (!fn) throw new WasmTrap('bad-func', String(funcIdx));
  const type = fn.type;
  const n = type.params.length;
  if (stack.length < n) throw new WasmTrap('stack-underflow');
  const args = stack.splice(stack.length - n, n);
  if (fn.kind === 'imported') {
    const jsArgs = args.map((a, i) => toJs(a));
    let out;
    try {
      out = fn.fn(...jsArgs);
    } catch (e) {
      throw new WasmTrap('import-threw', String((e && e.message) || e));
    }
    const outs = out === undefined ? [] : Array.isArray(out) ? out : [out];
    type.results.forEach((t, i) => stack.push(fromJs(t, outs[i])));
    return;
  }
  const locals = args.slice();
  for (const lt of fn.locals) locals.push(tv(lt, zeroOf(lt)));
  frames.push({ func: fn, type, code: fn.code, pc: 0, locals, labels: [], base: stack.length, blocks: fn.blocks });
}

function doReturn(frames, stack) {
  const fr = frames.pop();
  const n = fr.type.results.length;
  const res = stack.splice(fr.base);
  const take = res.slice(Math.max(0, res.length - n));
  while (take.length < n) take.unshift(tv(fr.type.results[take.length], zeroOf(fr.type.results[take.length])));
  for (const v of take) stack.push(v);
}

function doBranch(fr, stack, depth) {
  const li = fr.labels.length - 1 - depth;
  if (li < 0) throw new WasmTrap('bad-label', String(depth));
  const label = fr.labels[li];
  const keep = stack.splice(stack.length - label.arity, label.arity);
  stack.length = label.height;
  for (const v of keep) stack.push(v);
  if (label.kind === 'loop') {
    fr.labels.length = li + 1; // loop label survives: br re-enters the loop
    fr.pc = label.continuePc;
  } else {
    fr.labels.length = li; // block/if label is exited
    fr.pc = label.endPc;
  }
}

// ---- single-step dispatch ----
function stepFrame(inst, frames, stack) {
  const fr = frames[frames.length - 1];
  const code = fr.code;
  if (fr.pc >= code.length) {
    // Fell off the end without explicit end (should not happen for valid modules)
    doReturn(frames, stack);
    return;
  }
  const opc = fr.pc;
  const op = code[fr.pc++];
  const info = OP[op];
  if (!info) throw new WasmTrap('bad-opcode', '0x' + op.toString(16));
  let imm;
  [imm, fr.pc] = readImm(code, fr.pc, info.imm);

  const pop = () => {
    const v = stack.pop();
    if (v === undefined) throw new WasmTrap('stack-underflow');
    return v;
  };
  const req = (v, t) => {
    if (!v || v.t !== t) throw new WasmTrap('type-mismatch', `want ${t}`);
    return v.v;
  };

  switch (info.name) {
    case 'unreachable': throw new WasmTrap('unreachable');
    case 'nop': break;
    case 'block':
    case 'loop':
    case 'if': {
      const results = imm; // [] or [t]
      const binfo = fr.blocks.get(opc);
      if (!binfo) throw new WasmTrap('internal', 'missing block info');
      const label = {
        kind: info.name,
        arity: results.length,
        height: stack.length,
        continuePc: fr.pc,
        endPc: binfo.endPc,
      };
      if (info.name === 'if') {
        const c = req(pop(), 'i32') | 0;
        if (c === 0) {
          // skip to else/end WITHOUT pushing the label (end is skipped too)
          fr.pc = binfo.elsePc !== null ? binfo.elsePc : binfo.endPc;
        } else {
          fr.labels.push(label);
        }
      } else {
        fr.labels.push(label);
      }
      break;
    }
    case 'else': {
      const top = fr.labels.pop();
      if (!top) throw new WasmTrap('else-mismatch');
      fr.pc = top.endPc; // skip to past end; label already popped
      break;
    }
    case 'end': {
      const top = fr.labels[fr.labels.length - 1];
      if (top && top.endPc === fr.pc) {
        fr.labels.pop();
      } else {
        doReturn(frames, stack);
      }
      break;
    }
    case 'br': doBranch(fr, stack, imm); break;
    case 'br_if': {
      const c = req(pop(), 'i32') | 0;
      if (c !== 0) doBranch(fr, stack, imm);
      break;
    }
    case 'br_table': {
      const i = req(pop(), 'i32') | 0;
      const u = i >>> 0;
      const d = u < imm.targets.length ? imm.targets[u] : imm.default;
      doBranch(fr, stack, d);
      break;
    }
    case 'return': doReturn(frames, stack); break;
    case 'call': callFunction(inst, frames, stack, imm); break;
    case 'call_indirect': {
      const idx = req(pop(), 'i32') >>> 0;
      const fidx = inst.table[idx];
      if (fidx === null || fidx === undefined) throw new WasmTrap('uninitialized-table', String(idx));
      const fn = inst.funcs[fidx];
      const want = inst.types[imm.typeIdx];
      const got = fn.type;
      const same =
        want.params.length === got.params.length &&
        want.results.length === got.results.length &&
        want.params.every((t, i) => t === got.params[i]) &&
        want.results.every((t, i) => t === got.results[i]);
      if (!same) throw new WasmTrap('indirect-type-mismatch');
      callFunction(inst, frames, stack, fidx);
      break;
    }
    case 'drop': pop(); break;
    case 'select': {
      const c = req(pop(), 'i32') | 0;
      const v2 = pop();
      const v1 = pop();
      stack.push(c !== 0 ? v1 : v2);
      break;
    }
    case 'local.get': {
      const l = fr.locals[imm];
      if (!l) throw new WasmTrap('bad-local', String(imm));
      stack.push(tv(l.t, l.v));
      break;
    }
    case 'local.set': {
      const v = pop();
      if (!fr.locals[imm]) throw new WasmTrap('bad-local', String(imm));
      fr.locals[imm] = tv(fr.locals[imm].t, v.v);
      break;
    }
    case 'local.tee': {
      const v = pop();
      if (!fr.locals[imm]) throw new WasmTrap('bad-local', String(imm));
      fr.locals[imm] = tv(fr.locals[imm].t, v.v);
      stack.push(tv(v.t, v.v));
      break;
    }
    case 'global.get': {
      const g = inst.globals[imm];
      if (!g) throw new WasmTrap('bad-global', String(imm));
      stack.push(tv(g.valtype, g.value));
      break;
    }
    case 'global.set': {
      const g = inst.globals[imm];
      if (!g) throw new WasmTrap('bad-global', String(imm));
      if (!g.mutable) throw new WasmTrap('immutable-global');
      const v = pop();
      g.value = v.v;
      break;
    }
    default:
      stepNumeric(info.name, stack, pop, req, inst, imm, fr);
  }
}

// ---- memory helpers ----
function memOf(inst) {
  const m = inst.memories[0];
  if (!m) throw new WasmTrap('no-memory');
  return m;
}
function effAddr(mem, base, offset, size) {
  const ea = (((base | 0) + offset) >>> 0);
  if (ea + size > mem.bytes.length) throw new WasmTrap('oob-memory', `ea=${ea} size=${size} mem=${mem.bytes.length}`);
  return ea;
}

// ---- float helpers ----
function fmin(a, b) {
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  if (a === 0 && b === 0) return (1 / a === -Infinity || 1 / b === -Infinity) ? -0 : 0;
  return Math.min(a, b);
}
function fmax(a, b) {
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  if (a === 0 && b === 0) return (1 / a === Infinity || 1 / b === Infinity) ? 0 : -0;
  return Math.max(a, b);
}
function nearest(x) {
  if (!Number.isFinite(x)) return x;
  const t = Math.trunc(x);
  const d = Math.abs(x - t);
  if (d < 0.5) return t;
  if (d > 0.5) return t + Math.sign(x);
  return t % 2 === 0 ? t : t + Math.sign(x);
}
function truncS32(x) {
  if (Number.isNaN(x)) throw new WasmTrap('invalid-conversion');
  const t = Math.trunc(x);
  if (t <= -2147483649 || t >= 2147483648) throw new WasmTrap('int-overflow');
  return t | 0;
}
function truncU32(x) {
  if (Number.isNaN(x)) throw new WasmTrap('invalid-conversion');
  const t = Math.trunc(x);
  if (t < 0 || t > 4294967295) throw new WasmTrap('int-overflow');
  return t | 0;
}
function truncS64(x) {
  if (Number.isNaN(x)) throw new WasmTrap('invalid-conversion');
  const t = Math.trunc(x);
  if (t <= -9223372036854775809 || t >= 9223372036854775808) throw new WasmTrap('int-overflow');
  return BigInt(t);
}
function truncU64(x) {
  if (Number.isNaN(x)) throw new WasmTrap('invalid-conversion');
  const t = Math.trunc(x);
  if (t < 0 || t >= 18446744073709551616) throw new WasmTrap('int-overflow');
  return BigInt(t);
}
function clz64(v) {
  if (v === 0n) return 64;
  let n = 0;
  let x = BigInt.asUint64(v);
  for (let i = 63; i >= 0; i--) {
    if ((x >> BigInt(i)) & 1n) break;
    n++;
  }
  return n;
}
function ctz64(v) {
  if (v === 0n) return 64;
  let n = 0;
  let x = BigInt.asUint64(v);
  while ((x & 1n) === 0n) { n++; x >>= 1n; }
  return n;
}
function popcnt64(v) {
  let x = BigInt.asUint64(v);
  let n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
}
function ctz32(v) {
  v |= 0;
  if (v === 0) return 32;
  let n = 0;
  while ((v & 1) === 0) { n++; v >>>= 1; }
  return n;
}
function popcnt32(v) {
  v >>>= 0;
  let n = 0;
  while (v) { n += v & 1; v >>>= 1; }
  return n;
}

// ---- numeric + const + memory dispatch ----
function stepNumeric(name, stack, pop, req, inst, imm) {
  const i2 = (fn) => { const b = req(pop(), 'i32') | 0; const a = req(pop(), 'i32') | 0; stack.push(I32(fn(a, b))); };
  const u2 = (fn) => { const b = req(pop(), 'i32') | 0; const a = req(pop(), 'i32') | 0; stack.push(I32(fn(a >>> 0, b >>> 0))); };
  const g2 = (fn) => { const b = req(pop(), 'i64'); const a = req(pop(), 'i64'); stack.push(I64(fn(a, b))); };
  const f2 = (fn) => { const b = req(pop(), 'f32'); const a = req(pop(), 'f32'); stack.push(F32(fn(a, b))); };
  const d2 = (fn) => { const b = req(pop(), 'f64'); const a = req(pop(), 'f64'); stack.push(F64(fn(a, b))); };
  const cmp2 = (fn) => { const b = req(pop(), 'i32') | 0; const a = req(pop(), 'i32') | 0; stack.push(I32(fn(a, b) ? 1 : 0)); };

  switch (name) {
    // consts
    case 'i32.const': stack.push(I32(imm)); break;
    case 'i64.const': stack.push(I64(imm)); break;
    case 'f32.const': stack.push(F32(imm)); break;
    case 'f64.const': stack.push(F64(imm)); break;
    case 'memory.size': stack.push(I32(memOf(inst).pages)); break;
    case 'memory.grow': {
      const d = req(pop(), 'i32') | 0;
      const mem = memOf(inst);
      if (d < 0 || (mem.max !== null && mem.pages + d > mem.max)) { stack.push(I32(-1)); break; }
      const old = mem.pages;
      const nb = new Uint8Array((old + d) * PAGE);
      nb.set(mem.bytes);
      mem.bytes = nb;
      mem.view = new DataView(nb.buffer);
      mem.pages = old + d;
      stack.push(I32(old));
      break;
    }
    // i32 compare
    case 'i32.eqz': stack.push(I32((req(pop(), 'i32') | 0) === 0 ? 1 : 0)); break;
    case 'i32.eq': cmp2((a, b) => a === b); break;
    case 'i32.ne': cmp2((a, b) => a !== b); break;
    case 'i32.lt_s': cmp2((a, b) => a < b); break;
    case 'i32.lt_u': u2((a, b) => (a < b ? 1 : 0)); break;
    case 'i32.gt_s': cmp2((a, b) => a > b); break;
    case 'i32.gt_u': u2((a, b) => (a > b ? 1 : 0)); break;
    case 'i32.le_s': cmp2((a, b) => a <= b); break;
    case 'i32.le_u': u2((a, b) => (a <= b ? 1 : 0)); break;
    case 'i32.ge_s': cmp2((a, b) => a >= b); break;
    case 'i32.ge_u': u2((a, b) => (a >= b ? 1 : 0)); break;
    // i32 unary/binary
    case 'i32.clz': stack.push(I32(Math.clz32(req(pop(), 'i32') | 0))); break;
    case 'i32.ctz': stack.push(I32(ctz32(req(pop(), 'i32') | 0))); break;
    case 'i32.popcnt': stack.push(I32(popcnt32(req(pop(), 'i32') | 0))); break;
    case 'i32.add': i2((a, b) => a + b); break;
    case 'i32.sub': i2((a, b) => a - b); break;
    case 'i32.mul': i2((a, b) => Math.imul(a, b)); break;
    case 'i32.div_s': i2((a, b) => {
      if (b === 0) throw new WasmTrap('int-divide-by-zero');
      if (a === -2147483648 && b === -1) throw new WasmTrap('int-overflow');
      return (a / b) | 0;
    }); break;
    case 'i32.div_u': u2((a, b) => {
      if (b === 0) throw new WasmTrap('int-divide-by-zero');
      return Math.floor(a / b);
    }); break;
    case 'i32.rem_s': i2((a, b) => {
      if (b === 0) throw new WasmTrap('int-divide-by-zero');
      return a % b;
    }); break;
    case 'i32.rem_u': u2((a, b) => {
      if (b === 0) throw new WasmTrap('int-divide-by-zero');
      return a % b;
    }); break;
    case 'i32.and': i2((a, b) => a & b); break;
    case 'i32.or': i2((a, b) => a | b); break;
    case 'i32.xor': i2((a, b) => a ^ b); break;
    case 'i32.shl': i2((a, b) => a << (b & 31)); break;
    case 'i32.shr_s': i2((a, b) => a >> (b & 31)); break;
    case 'i32.shr_u': i2((a, b) => a >>> (b & 31)); break;
    case 'i32.rotl': i2((a, b) => { const s = b & 31; return s === 0 ? a : (a << s) | (a >>> (32 - s)); }); break;
    case 'i32.rotr': i2((a, b) => { const s = b & 31; return s === 0 ? a : (a >>> s) | (a << (32 - s)); }); break;
    // i64 compare
    case 'i64.eqz': stack.push(I32(req(pop(), 'i64') === 0n ? 1 : 0)); break;
    case 'i64.eq': { const b = req(pop(), 'i64'); const a = req(pop(), 'i64'); stack.push(I32(a === b ? 1 : 0)); break; }
    case 'i64.ne': { const b = req(pop(), 'i64'); const a = req(pop(), 'i64'); stack.push(I32(a !== b ? 1 : 0)); break; }
    case 'i64.lt_s': { const b = req(pop(), 'i64'); const a = req(pop(), 'i64'); stack.push(I32(a < b ? 1 : 0)); break; }
    case 'i64.lt_u': { const b = BigInt.asUint64(req(pop(), 'i64')); const a = BigInt.asUint64(req(pop(), 'i64')); stack.push(I32(a < b ? 1 : 0)); break; }
    case 'i64.gt_s': { const b = req(pop(), 'i64'); const a = req(pop(), 'i64'); stack.push(I32(a > b ? 1 : 0)); break; }
    case 'i64.gt_u': { const b = BigInt.asUint64(req(pop(), 'i64')); const a = BigInt.asUint64(req(pop(), 'i64')); stack.push(I32(a > b ? 1 : 0)); break; }
    case 'i64.le_s': { const b = req(pop(), 'i64'); const a = req(pop(), 'i64'); stack.push(I32(a <= b ? 1 : 0)); break; }
    case 'i64.le_u': { const b = BigInt.asUint64(req(pop(), 'i64')); const a = BigInt.asUint64(req(pop(), 'i64')); stack.push(I32(a <= b ? 1 : 0)); break; }
    case 'i64.ge_s': { const b = req(pop(), 'i64'); const a = req(pop(), 'i64'); stack.push(I32(a >= b ? 1 : 0)); break; }
    case 'i64.ge_u': { const b = BigInt.asUint64(req(pop(), 'i64')); const a = BigInt.asUint64(req(pop(), 'i64')); stack.push(I32(a >= b ? 1 : 0)); break; }
    // i64 unary/binary
    case 'i64.clz': stack.push(I64(BigInt(clz64(req(pop(), 'i64'))))); break;
    case 'i64.ctz': stack.push(I64(BigInt(ctz64(req(pop(), 'i64'))))); break;
    case 'i64.popcnt': stack.push(I64(BigInt(popcnt64(req(pop(), 'i64'))))); break;
    case 'i64.add': g2((a, b) => a + b); break;
    case 'i64.sub': g2((a, b) => a - b); break;
    case 'i64.mul': g2((a, b) => a * b); break;
    case 'i64.div_s': g2((a, b) => {
      if (b === 0n) throw new WasmTrap('int-divide-by-zero');
      if (a === I64_MIN && b === -1n) throw new WasmTrap('int-overflow');
      return a / b;
    }); break;
    case 'i64.div_u': {
      const b = BigInt.asUint64(req(pop(), 'i64'));
      const a = BigInt.asUint64(req(pop(), 'i64'));
      if (b === 0n) throw new WasmTrap('int-divide-by-zero');
      stack.push(I64(a / b));
      break;
    }
    case 'i64.rem_s': g2((a, b) => {
      if (b === 0n) throw new WasmTrap('int-divide-by-zero');
      return a % b;
    }); break;
    case 'i64.rem_u': {
      const b = BigInt.asUint64(req(pop(), 'i64'));
      const a = BigInt.asUint64(req(pop(), 'i64'));
      if (b === 0n) throw new WasmTrap('int-divide-by-zero');
      stack.push(I64(a % b));
      break;
    }
    case 'i64.and': g2((a, b) => a & b); break;
    case 'i64.or': g2((a, b) => a | b); break;
    case 'i64.xor': g2((a, b) => a ^ b); break;
    case 'i64.shl': g2((a, b) => a << (b & 63n)); break;
    case 'i64.shr_s': g2((a, b) => a >> (b & 63n)); break;
    case 'i64.shr_u': {
      const b = req(pop(), 'i64') & 63n;
      const a = BigInt.asUint64(req(pop(), 'i64'));
      stack.push(I64(a >> b));
      break;
    }
    case 'i64.rotl': g2((a, b) => {
      const s = b & 63n;
      if (s === 0n) return a;
      const u = BigInt.asUint64(a);
      return BigInt.asInt64((u << s) | (u >> (64n - s)));
    }); break;
    case 'i64.rotr': g2((a, b) => {
      const s = b & 63n;
      if (s === 0n) return a;
      const u = BigInt.asUint64(a);
      return BigInt.asInt64((u >> s) | (u << (64n - s)));
    }); break;
    // f32 compare
    case 'f32.eq': { const b = req(pop(), 'f32'); const a = req(pop(), 'f32'); stack.push(I32(a === b ? 1 : 0)); break; }
    case 'f32.ne': { const b = req(pop(), 'f32'); const a = req(pop(), 'f32'); stack.push(I32(a !== b ? 1 : 0)); break; }
    case 'f32.lt': { const b = req(pop(), 'f32'); const a = req(pop(), 'f32'); stack.push(I32(a < b ? 1 : 0)); break; }
    case 'f32.gt': { const b = req(pop(), 'f32'); const a = req(pop(), 'f32'); stack.push(I32(a > b ? 1 : 0)); break; }
    case 'f32.le': { const b = req(pop(), 'f32'); const a = req(pop(), 'f32'); stack.push(I32(a <= b ? 1 : 0)); break; }
    case 'f32.ge': { const b = req(pop(), 'f32'); const a = req(pop(), 'f32'); stack.push(I32(a >= b ? 1 : 0)); break; }
    // f64 compare
    case 'f64.eq': { const b = req(pop(), 'f64'); const a = req(pop(), 'f64'); stack.push(I32(a === b ? 1 : 0)); break; }
    case 'f64.ne': { const b = req(pop(), 'f64'); const a = req(pop(), 'f64'); stack.push(I32(a !== b ? 1 : 0)); break; }
    case 'f64.lt': { const b = req(pop(), 'f64'); const a = req(pop(), 'f64'); stack.push(I32(a < b ? 1 : 0)); break; }
    case 'f64.gt': { const b = req(pop(), 'f64'); const a = req(pop(), 'f64'); stack.push(I32(a > b ? 1 : 0)); break; }
    case 'f64.le': { const b = req(pop(), 'f64'); const a = req(pop(), 'f64'); stack.push(I32(a <= b ? 1 : 0)); break; }
    case 'f64.ge': { const b = req(pop(), 'f64'); const a = req(pop(), 'f64'); stack.push(I32(a >= b ? 1 : 0)); break; }
    // f32 unary/binary
    case 'f32.abs': stack.push(F32(Math.abs(req(pop(), 'f32')))); break;
    case 'f32.neg': stack.push(F32(-req(pop(), 'f32'))); break;
    case 'f32.ceil': stack.push(F32(Math.ceil(req(pop(), 'f32')))); break;
    case 'f32.floor': stack.push(F32(Math.floor(req(pop(), 'f32')))); break;
    case 'f32.trunc': stack.push(F32(Math.trunc(req(pop(), 'f32')))); break;
    case 'f32.nearest': stack.push(F32(nearest(req(pop(), 'f32')))); break;
    case 'f32.sqrt': stack.push(F32(Math.sqrt(req(pop(), 'f32')))); break;
    case 'f32.add': f2((a, b) => a + b); break;
    case 'f32.sub': f2((a, b) => a - b); break;
    case 'f32.mul': f2((a, b) => a * b); break;
    case 'f32.div': f2((a, b) => a / b); break;
    case 'f32.min': f2((a, b) => fmin(a, b)); break;
    case 'f32.max': f2((a, b) => fmax(a, b)); break;
    case 'f32.copysign': {
      const b = req(pop(), 'f32'); const a = req(pop(), 'f32');
      stack.push(F32((1 / b === -Infinity || Object.is(b, -0)) ? -Math.abs(a) : Math.abs(a)));
      break;
    }
    // f64 unary/binary
    case 'f64.abs': stack.push(F64(Math.abs(req(pop(), 'f64')))); break;
    case 'f64.neg': stack.push(F64(-req(pop(), 'f64'))); break;
    case 'f64.ceil': stack.push(F64(Math.ceil(req(pop(), 'f64')))); break;
    case 'f64.floor': stack.push(F64(Math.floor(req(pop(), 'f64')))); break;
    case 'f64.trunc': stack.push(F64(Math.trunc(req(pop(), 'f64')))); break;
    case 'f64.nearest': stack.push(F64(nearest(req(pop(), 'f64')))); break;
    case 'f64.sqrt': stack.push(F64(Math.sqrt(req(pop(), 'f64')))); break;
    case 'f64.add': d2((a, b) => a + b); break;
    case 'f64.sub': d2((a, b) => a - b); break;
    case 'f64.mul': d2((a, b) => a * b); break;
    case 'f64.div': d2((a, b) => a / b); break;
    case 'f64.min': d2((a, b) => fmin(a, b)); break;
    case 'f64.max': d2((a, b) => fmax(a, b)); break;
    case 'f64.copysign': {
      const b = req(pop(), 'f64'); const a = req(pop(), 'f64');
      stack.push(F64((1 / b === -Infinity || Object.is(b, -0)) ? -Math.abs(a) : Math.abs(a)));
      break;
    }
    // conversions
    case 'i32.wrap_i64': stack.push(I32(Number(req(pop(), 'i64') & 0xffffffffn))); break;
    case 'i32.trunc_f32_s': stack.push(I32(truncS32(req(pop(), 'f32')))); break;
    case 'i32.trunc_f32_u': stack.push(I32(truncU32(req(pop(), 'f32')))); break;
    case 'i32.trunc_f64_s': stack.push(I32(truncS32(req(pop(), 'f64')))); break;
    case 'i32.trunc_f64_u': stack.push(I32(truncU32(req(pop(), 'f64')))); break;
    case 'i64.extend_i32_s': stack.push(I64(BigInt(req(pop(), 'i32') | 0))); break;
    case 'i64.extend_i32_u': stack.push(I64(BigInt(req(pop(), 'i32') >>> 0))); break;
    case 'i64.trunc_f32_s': stack.push(I64(truncS64(req(pop(), 'f32')))); break;
    case 'i64.trunc_f32_u': stack.push(I64(truncU64(req(pop(), 'f32')))); break;
    case 'i64.trunc_f64_s': stack.push(I64(truncS64(req(pop(), 'f64')))); break;
    case 'i64.trunc_f64_u': stack.push(I64(truncU64(req(pop(), 'f64')))); break;
    case 'f32.convert_i32_s': stack.push(F32(req(pop(), 'i32') | 0)); break;
    case 'f32.convert_i32_u': stack.push(F32(req(pop(), 'i32') >>> 0)); break;
    case 'f32.convert_i64_s': stack.push(F32(Number(req(pop(), 'i64')))); break;
    case 'f32.convert_i64_u': stack.push(F32(Number(BigInt.asUint64(req(pop(), 'i64'))))); break;
    case 'f32.demote_f64': stack.push(F32(req(pop(), 'f64'))); break;
    case 'f64.convert_i32_s': stack.push(F64(req(pop(), 'i32') | 0)); break;
    case 'f64.convert_i32_u': stack.push(F64(req(pop(), 'i32') >>> 0)); break;
    case 'f64.convert_i64_s': stack.push(F64(Number(req(pop(), 'i64')))); break;
    case 'f64.convert_i64_u': stack.push(F64(Number(BigInt.asUint64(req(pop(), 'i64'))))); break;
    case 'f64.promote_f32': stack.push(F64(req(pop(), 'f32'))); break;
    case 'i32.reinterpret_f32': {
      const v = req(pop(), 'f32');
      scratchDv.setFloat32(0, v, true);
      stack.push(I32(scratchDv.getInt32(0, true)));
      break;
    }
    case 'i64.reinterpret_f64': {
      const v = req(pop(), 'f64');
      scratchDv.setFloat64(0, v, true);
      stack.push(I64(scratchDv.getBigInt64(0, true)));
      break;
    }
    case 'f32.reinterpret_i32': {
      const v = req(pop(), 'i32') | 0;
      scratchDv.setInt32(0, v, true);
      stack.push(F32(scratchDv.getFloat32(0, true)));
      break;
    }
    case 'f64.reinterpret_i64': {
      const v = req(pop(), 'i64');
      scratchDv.setBigInt64(0, v, true);
      stack.push(F64(scratchDv.getFloat64(0, true)));
      break;
    }
    // memory loads
    case 'i32.load': case 'i64.load': case 'f32.load': case 'f64.load':
    case 'i32.load8_s': case 'i32.load8_u': case 'i32.load16_s': case 'i32.load16_u':
    case 'i64.load8_s': case 'i64.load8_u': case 'i64.load16_s': case 'i64.load16_u':
    case 'i64.load32_s': case 'i64.load32_u': {
      const mem = memOf(inst);
      const base = req(pop(), 'i32') | 0;
      const dv = mem.view;
      const eaFor = (size) => effAddr(mem, base, imm.offset, size);
      switch (name) {
        case 'i32.load': stack.push(I32(dv.getInt32(eaFor(4), true))); break;
        case 'i64.load': stack.push(I64(dv.getBigInt64(eaFor(8), true))); break;
        case 'f32.load': stack.push(F32(dv.getFloat32(eaFor(4), true))); break;
        case 'f64.load': stack.push(F64(dv.getFloat64(eaFor(8), true))); break;
        case 'i32.load8_s': stack.push(I32(dv.getInt8(eaFor(1)))); break;
        case 'i32.load8_u': stack.push(I32(dv.getUint8(eaFor(1)))); break;
        case 'i32.load16_s': stack.push(I32(dv.getInt16(eaFor(2), true))); break;
        case 'i32.load16_u': stack.push(I32(dv.getUint16(eaFor(2), true))); break;
        case 'i64.load8_s': stack.push(I64(BigInt(dv.getInt8(eaFor(1))))); break;
        case 'i64.load8_u': stack.push(I64(BigInt(dv.getUint8(eaFor(1))))); break;
        case 'i64.load16_s': stack.push(I64(BigInt(dv.getInt16(eaFor(2), true)))); break;
        case 'i64.load16_u': stack.push(I64(BigInt(dv.getUint16(eaFor(2), true)))); break;
        case 'i64.load32_s': stack.push(I64(BigInt(dv.getInt32(eaFor(4), true)))); break;
        case 'i64.load32_u': stack.push(I64(BigInt(dv.getUint32(eaFor(4), true)))); break;
      }
      break;
    }
    // memory stores
    case 'i32.store': case 'i64.store': case 'f32.store': case 'f64.store':
    case 'i32.store8': case 'i32.store16':
    case 'i64.store8': case 'i64.store16': case 'i64.store32': {
      const mem = memOf(inst);
      const val = pop();
      const base = req(pop(), 'i32') | 0;
      const dv = mem.view;
      switch (name) {
        case 'i32.store': dv.setInt32(effAddr(mem, base, imm.offset, 4), val.v | 0, true); break;
        case 'i64.store': dv.setBigInt64(effAddr(mem, base, imm.offset, 8), BigInt.asInt64(val.v), true); break;
        case 'f32.store': dv.setFloat32(effAddr(mem, base, imm.offset, 4), Math.fround(val.v), true); break;
        case 'f64.store': dv.setFloat64(effAddr(mem, base, imm.offset, 8), Number(val.v), true); break;
        case 'i32.store8': dv.setUint8(effAddr(mem, base, imm.offset, 1), val.v & 0xff); break;
        case 'i32.store16': dv.setUint16(effAddr(mem, base, imm.offset, 2), val.v & 0xffff, true); break;
        case 'i64.store8': dv.setUint8(effAddr(mem, base, imm.offset, 1), Number(BigInt.asUint64(val.v) & 0xffn)); break;
        case 'i64.store16': dv.setUint16(effAddr(mem, base, imm.offset, 2), Number(BigInt.asUint64(val.v) & 0xffffn), true); break;
        case 'i64.store32': dv.setUint32(effAddr(mem, base, imm.offset, 4), Number(BigInt.asUint64(val.v) & 0xffffffffn), true); break;
      }
      break;
    }
    default: throw new WasmTrap('unimplemented-op', name);
  }
}
