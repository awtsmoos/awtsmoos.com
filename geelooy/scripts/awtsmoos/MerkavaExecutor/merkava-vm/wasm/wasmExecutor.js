// B"H — WebAssembly interpreter for the Merkava VM family (from scratch).
// Stack-machine interpreter over parsed WASM modules. Mirrors the MerkavaVM
// Thread discipline (RUNNING/COMPLETED/TRAPPED, explicit frame stack, no JS
// recursion for WASM calls) so deep WASM recursion cannot blow the host stack.
//
// OPTIMIZED (2026-10-09): inline-threaded dispatch loop + unboxed values.
// - Single numeric switch(op) on the opcode byte (was: two string switches:
//   stepFrame on info.name -> stepNumeric on name again)
// - Hot frame/stack state hoisted into runLoop locals (was: fr.code/fr.pc
//   property traffic and pop()/req() closure calls per instruction)
// - Operand stack is preallocated parallel arrays: vs[] (raw values) + ts[]
//   (Smi type tags). Arithmetic produces raw numbers/BigInts with ZERO
//   per-result object allocation (was: one {t,v} object per result value).
// - Locals are a plain values array; tags are fixed per function and stored
//   once on the function record (local.set never changes a local's type).
// - Frame pool: WASM calls are strictly LIFO, so frame shells + locals
//   arrays are recycled with zero per-call allocation in the common case.
// - Immediates decoded inline, no [v, pc] array alloc per instruction.
// - Zero per-instruction closures on the hot path (was: 8 closures/instr).
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

// ---- value representation ----
// Unboxed: raw JS values in vs[], parallel Smi tags in ts[].
// Tags: 0=i32, 1=i64, 2=f32, 3=f64. i32 values are int32 numbers,
// i64 values are BigInts, f32/f64 are numbers (f32 Math.fround'ed).
const T_I32 = 0, T_I64 = 1, T_F32 = 2, T_F64 = 3;
const TAG_OF = { 'i32': 0, 'i64': 1, 'f32': 2, 'f64': 3 };
const TAG_STR = ['i32', 'i64', 'f32', 'f64'];
const zeroOfTag = (tag) => (tag === T_I64 ? 0n : 0);

// fromJs: validate a JS call arg -> {tag, val} (raw, unboxed)
function fromJs(t, v) {
  if (v === undefined || v === null) return { tag: TAG_OF[t], val: zeroOfTag(TAG_OF[t]) };
  if (t === 'i64') {
    if (typeof v !== 'bigint') throw new WasmTrap('bad-arg', `i64 needs BigInt, got ${typeof v}`);
    return { tag: T_I64, val: BigInt.asInt64(BigInt(v)) };
  }
  if (typeof v === 'boolean') throw new WasmTrap('bad-arg', `${t} got boolean`);
  const n = Number(v);
  if (t === 'i32') {
    if (!Number.isFinite(n)) throw new WasmTrap('bad-arg', `i32 got ${JSON.stringify(v)}`);
    return { tag: T_I32, val: n | 0 };
  }
  // f32/f64: NaN and Infinity are legal values; reject only non-numeric junk
  if (Number.isNaN(n) && typeof v !== 'number') throw new WasmTrap('bad-arg', `${t} got ${JSON.stringify(v)}`);
  return t === 'f32' ? { tag: T_F32, val: Math.fround(n) } : { tag: T_F64, val: n };
}
// toJs: raw value -> JS (i64 stays BigInt; tag carried for clarity)
function toJs(tag, val) {
  return val;
}
// Re-tag raw stack values for the invokeByIndex return contract ({t, v} objects)
function retag(ts, vs, sp) {
  const out = new Array(sp);
  for (let i = 0; i < sp; i++) out[i] = { t: TAG_STR[ts[i]], v: vs[i] };
  return out;
}

// ---- LEB readers over (code, pc) ----
// Used at instantiate time and for cold immediates (br_table, f32/f64/s64 const).
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
      map.set(top.pc, { op: top.op, elsePc: top.elsePc, endPc: opc });
    }
  }
  return map;
}

function evalConstExpr(expr, inst) {
  // expr: {type, value} from parser (MVP: no globalref chains); returns RAW value
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
      if (!mem.view) mem.view = new DataView(mem.bytes.buffer, mem.bytes.byteOffset, mem.bytes.byteLength);
      if (mem.pages === undefined) mem.pages = Math.floor(mem.bytes.length / PAGE);
      if (mem.max === undefined) mem.max = null;
      inst.memories.push(mem);
    } else if (im.kind === 'global') {
      let g = ns[im.name];
      if (g === undefined) throw new Error('[wasm] missing global import ' + im.module + '.' + im.name);
      // accept WebAssembly.Global objects as well as raw values / {v} wrappers
      if (typeof WebAssembly !== 'undefined' && g instanceof WebAssembly.Global) g = g.value;
      else if (g && g.v !== undefined) g = g.v;
      inst.globals.push({ valtype: im.valtype, mutable: im.mutable, value: g });
    } else if (im.kind === 'table') {
      const t = ns[im.name];
      if (!Array.isArray(t)) throw new Error('[wasm] missing table import ' + im.module + '.' + im.name);
      inst.table = t;
    }
  }
  mod.funcs.forEach((typeIdx, i) => {
    const body = mod.codes[i];
    const type = mod.types[typeIdx];
    // Fixed per-function local tags (params then declared); local.set never
    // changes a local's type, so no per-frame tag array is needed.
    const localTags = type.params.map((t) => TAG_OF[t]);
    for (const lt of body.locals) localTags.push(TAG_OF[lt]);
    inst.funcs.push({
      kind: 'defined',
      typeIdx,
      type,
      locals: body.locals,
      localTags,
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
  const stk = { v: new Array(1024), t: new Array(1024), sp: 0 };
  const frames = [];
  pushFrame(inst, frames, stk, funcIdx, rawArgs);
  runLoop(inst, frames, stk);
  return retag(stk.t, stk.v, stk.sp);
}

export function invoke(inst, exportName, rawArgs = []) {
  const ex = inst.module.exports.find((e) => e.name === exportName && e.kind === 'func');
  if (!ex) throw new Error('[wasm] no exported func "' + exportName + '"');
  return invokeByIndex(inst, ex.index, rawArgs).map((a) => toJs(TAG_OF[a.t], a.v));
}

// Frame pool: WASM calls are strictly LIFO, so a simple stack pool recycles
// frame shells + locals arrays with zero per-call allocation in the common case.
const framePool = [];
function obtainFrame(fn, type, base) {
  const fr = framePool.pop();
  if (fr) {
    if (fr.lv.length !== fn.localTags.length) fr.lv = new Array(fn.localTags.length);
    fr.func = fn; fr.type = type; fr.code = fn.code; fr.pc = 0;
    fr.ltags = fn.localTags; fr.labels.length = 0; fr.base = base; fr.blocks = fn.blocks;
    return fr;
  }
  return { func: fn, type, code: fn.code, pc: 0, lv: new Array(fn.localTags.length), ltags: fn.localTags, labels: [], base, blocks: fn.blocks };
}
function releaseFrame(fr) {
  framePool.push(fr);
}

function pushFrame(inst, frames, stk, funcIdx, rawArgs) {
  const fn = inst.funcs[funcIdx];
  if (!fn) throw new WasmTrap('bad-func', String(funcIdx));
  if (fn.kind === 'imported') throw new WasmTrap('internal', 'pushFrame on imported func');
  const type = fn.type;
  if (rawArgs.length !== type.params.length) {
    throw new WasmTrap('arity', `expected ${type.params.length}, got ${rawArgs.length}`);
  }
  const fr = obtainFrame(fn, type, stk.sp);
  const lv = fr.lv;
  for (let i = 0; i < type.params.length; i++) lv[i] = fromJs(type.params[i], rawArgs[i]).val;
  for (let i = type.params.length; i < lv.length; i++) lv[i] = zeroOfTag(fn.localTags[i]);
  frames.push(fr);
}

function callFunction(inst, frames, stk, funcIdx) {
  const fn = inst.funcs[funcIdx];
  if (!fn) throw new WasmTrap('bad-func', String(funcIdx));
  const type = fn.type;
  const n = type.params.length;
  const vs = stk.v, ts = stk.t;
  if (stk.sp < n) throw new WasmTrap('stack-underflow');
  if (fn.kind === 'imported') {
    const jsArgs = new Array(n);
    for (let i = 0; i < n; i++) jsArgs[i] = toJs(ts[stk.sp - n + i], vs[stk.sp - n + i]);
    stk.sp -= n;
    let out;
    try {
      out = fn.fn(...jsArgs);
    } catch (e) {
      throw new WasmTrap('import-threw', String((e && e.message) || e));
    }
    const outs = out === undefined ? [] : Array.isArray(out) ? out : [out];
    const results = type.results;
    for (let i = 0; i < results.length; i++) {
      const a = fromJs(results[i], outs[i]);
      ts[stk.sp] = a.tag; vs[stk.sp] = a.val; stk.sp++;
    }
    return;
  }
  const fr2 = obtainFrame(fn, type, stk.sp - n);
  const lv = fr2.lv;
  for (let i = 0; i < n; i++) lv[i] = vs[stk.sp - n + i];
  for (let i = n; i < lv.length; i++) lv[i] = zeroOfTag(fn.localTags[i]);
  stk.sp -= n;
  frames.push(fr2);
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

// ---- inline-threaded dispatch loop (unboxed values) ----
// vs[]: raw values, ts[]: Smi tags, sp: stack pointer. Zero per-instruction
// allocation: arithmetic writes raw numbers/BigInts directly.
function runLoop(inst, frames, stk) {
  const maxSteps = inst.maxSteps;
  let steps = 0;
  const vs = stk.v, ts = stk.t;
  let sp = stk.sp;
  let fr = frames[frames.length - 1];
  let code = fr.code, pc = fr.pc, lv = fr.lv, ltags = fr.ltags, labels = fr.labels;
  let mem = inst.memories[0] || null;
  let view = mem ? mem.view : null;
  let mlen = mem ? mem.bytes.length : 0;
  const syncMem = () => {
    mem = inst.memories[0] || null;
    view = mem ? mem.view : null;
    mlen = mem ? mem.bytes.length : 0;
  };

  const doReturnInline = () => {
    const fr2 = frames.pop();
    const results = fr2.type.results;
    const n = results.length;
    const base = fr2.base;
    const have = sp - base;
    const take = have >= n ? n : have;
    for (let i = 0; i < take; i++) { vs[base + i] = vs[sp - take + i]; ts[base + i] = ts[sp - take + i]; }
    for (let i = take; i < n; i++) { vs[base + i] = zeroOfTag(TAG_OF[results[i]]); ts[base + i] = TAG_OF[results[i]]; }
    sp = base + n;
    releaseFrame(fr2);
    if (frames.length === 0) return;
    fr = frames[frames.length - 1];
    code = fr.code; pc = fr.pc; lv = fr.lv; ltags = fr.ltags; labels = fr.labels;
  };
  const doBranchInline = (depth) => {
    const li = labels.length - 1 - depth;
    if (li < 0) {
      if (depth === labels.length) { doReturnInline(); return; }
      throw new WasmTrap('bad-label', String(depth));
    }
    const label = labels[li];
    const arity = label.arity;
    for (let i = 0; i < arity; i++) { vs[label.height + i] = vs[sp - arity + i]; ts[label.height + i] = ts[sp - arity + i]; }
    sp = label.height + arity;
    if (label.kind === 'loop') {
      labels.length = li + 1; // loop label survives: br re-enters the loop
      pc = label.continuePc;
    } else {
      labels.length = li; // block/if label is exited
      pc = label.endPc + 1; // skip past the end opcode (1 byte, no immediate)
    }
  };
  // Inline ULEB128 u32 reader for hot immediates (localidx, funcidx, labelidx).
  const readU32 = () => {
    let r = 0, s = 0, b;
    do { b = code[pc++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80);
    return r >>> 0;
  };

  while (frames.length > 0) {
    // Step budget checked once per 4096-instruction quantum (not per instr).
    for (let q = 0; q < 4096 && frames.length > 0; q++) {
    if (pc >= code.length) { doReturnInline(); continue; } // fell off the end
    const op = code[pc++];
    switch (op) {
      // ---- control ----
      case 0x00: throw new WasmTrap('unreachable');
      case 0x01: break; // nop
      case 0x02: case 0x03: case 0x04: { // block / loop / if
        const opc = pc - 1;
        const bt = code[pc++];
        let arity;
        if (bt === 0x40) arity = 0;
        else if (bt === 0x7f || bt === 0x7e || bt === 0x7d || bt === 0x7c) arity = 1;
        else throw new WasmTrap('unsupported-blocktype', '0x' + bt.toString(16));
        const binfo = fr.blocks.get(opc);
        if (!binfo) throw new WasmTrap('internal', 'missing block info');
        const kind = op === 0x02 ? 'block' : op === 0x03 ? 'loop' : 'if';
        const label = { kind, arity, height: sp, continuePc: pc, endPc: binfo.endPc };
        if (kind === 'if') {
          if (sp < 1) throw new WasmTrap('stack-underflow');
          sp--;
          if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
          const cv = vs[sp] | 0;
          labels.push(label);
          if (cv === 0) pc = binfo.elsePc !== null ? binfo.elsePc : binfo.endPc;
        } else {
          labels.push(label);
        }
        break;
      }
      case 0x05: { // else: then-branch finished, skip the else-branch
        const top = labels[labels.length - 1];
        if (!top || top.kind !== 'if') throw new WasmTrap('else-mismatch');
        pc = top.endPc;
        break;
      }
      case 0x0b: { // end
        const opc = pc - 1;
        const top = labels[labels.length - 1];
        if (top && top.endPc === opc) {
          labels.pop();
        } else if (!top) {
          doReturnInline();
        } else {
          throw new WasmTrap('end-mismatch');
        }
        break;
      }
      case 0x0c: { // br
        const depth = readU32();
        doBranchInline(depth);
        break;
      }
      case 0x0d: { // br_if
        const depth = readU32();
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        if ((vs[sp] | 0) !== 0) doBranchInline(depth);
        break;
      }
      case 0x0e: { // br_table
        let n, tpc = pc;
        const r1 = readUleb(code, tpc); n = r1[0]; tpc = r1[1];
        const targets = new Array(n);
        for (let i = 0; i < n; i++) { const r = readUleb(code, tpc); targets[i] = r[0]; tpc = r[1]; }
        const r2 = readUleb(code, tpc); const dflt = r2[0]; tpc = r2[1];
        pc = tpc;
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const u = (vs[sp] | 0) >>> 0;
        doBranchInline(u < targets.length ? targets[u] : dflt);
        break;
      }
      case 0x0f: doReturnInline(); break; // return
      case 0x10: { // call
        const fidx = readU32();
        fr.pc = pc; stk.sp = sp;
        callFunction(inst, frames, stk, fidx);
        sp = stk.sp;
        fr = frames[frames.length - 1];
        code = fr.code; pc = fr.pc; lv = fr.lv; ltags = fr.ltags; labels = fr.labels;
        syncMem(); // imports may have grown memory
        break;
      }
      case 0x11: { // call_indirect
        const typeIdx = readU32();
        readU32(); // tableIdx (MVP: single table)
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const idx = (vs[sp] | 0) >>> 0;
        const fidx = inst.table[idx];
        if (fidx === null || fidx === undefined) throw new WasmTrap('uninitialized-table', String(idx));
        const fn = inst.funcs[fidx];
        const want = inst.types[typeIdx];
        const got = fn.type;
        const same =
          want.params.length === got.params.length &&
          want.results.length === got.results.length &&
          want.params.every((t, i) => t === got.params[i]) &&
          want.results.every((t, i) => t === got.results[i]);
        if (!same) throw new WasmTrap('indirect-type-mismatch');
        fr.pc = pc; stk.sp = sp;
        callFunction(inst, frames, stk, fidx);
        sp = stk.sp;
        fr = frames[frames.length - 1];
        code = fr.code; pc = fr.pc; lv = fr.lv; ltags = fr.ltags; labels = fr.labels;
        syncMem();
        break;
      }
      // ---- parametric ----
      case 0x1a: // drop
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        break;
      case 0x1b: { // select
        if (sp < 3) throw new WasmTrap('stack-underflow');
        const c = vs[--sp];
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        if ((c | 0) === 0) { vs[sp - 2] = vs[sp - 1]; ts[sp - 2] = ts[sp - 1]; }
        sp--;
        break;
      }
      // ---- locals / globals ----
      case 0x20: { // local.get
        const u = readU32();
        if (u >= lv.length) throw new WasmTrap('bad-local', String(u));
        vs[sp] = lv[u]; ts[sp] = ltags[u]; sp++;
        break;
      }
      case 0x21: { // local.set (local's type never changes)
        const u = readU32();
        if (u >= lv.length) throw new WasmTrap('bad-local', String(u));
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        lv[u] = vs[sp];
        break;
      }
      case 0x22: { // local.tee (value stays on stack top)
        const u = readU32();
        if (u >= lv.length) throw new WasmTrap('bad-local', String(u));
        if (sp < 1) throw new WasmTrap('stack-underflow');
        lv[u] = vs[sp - 1];
        break;
      }
      case 0x23: { // global.get
        const u = readU32();
        const g = inst.globals[u];
        if (!g) throw new WasmTrap('bad-global', String(u));
        vs[sp] = g.value; ts[sp] = TAG_OF[g.valtype]; sp++;
        break;
      }
      case 0x24: { // global.set
        const u = readU32();
        const g = inst.globals[u];
        if (!g) throw new WasmTrap('bad-global', String(u));
        if (!g.mutable) throw new WasmTrap('immutable-global');
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        g.value = vs[sp];
        break;
      }
      // ---- memory loads ----
      case 0x28: case 0x29: case 0x2a: case 0x2b:
      case 0x2c: case 0x2d: case 0x2e: case 0x2f:
      case 0x30: case 0x31: case 0x32: case 0x33:
      case 0x34: case 0x35: {
        readU32(); // align (advisory)
        const off = readU32();
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        if (!view) throw new WasmTrap('no-memory');
        const ea = (((vs[sp] | 0) + off) >>> 0);
        switch (op) {
          case 0x28: if (ea + 4 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=4 mem=${mlen}`); vs[sp] = view.getInt32(ea, true); ts[sp] = T_I32; break;
          case 0x29: if (ea + 8 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=8 mem=${mlen}`); vs[sp] = view.getBigInt64(ea, true); ts[sp] = T_I64; break;
          case 0x2a: if (ea + 4 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=4 mem=${mlen}`); vs[sp] = Math.fround(view.getFloat32(ea, true)); ts[sp] = T_F32; break;
          case 0x2b: if (ea + 8 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=8 mem=${mlen}`); vs[sp] = view.getFloat64(ea, true); ts[sp] = T_F64; break;
          case 0x2c: if (ea + 1 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=1 mem=${mlen}`); vs[sp] = view.getInt8(ea); ts[sp] = T_I32; break;
          case 0x2d: if (ea + 1 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=1 mem=${mlen}`); vs[sp] = view.getUint8(ea); ts[sp] = T_I32; break;
          case 0x2e: if (ea + 2 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=2 mem=${mlen}`); vs[sp] = view.getInt16(ea, true); ts[sp] = T_I32; break;
          case 0x2f: if (ea + 2 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=2 mem=${mlen}`); vs[sp] = view.getUint16(ea, true); ts[sp] = T_I32; break;
          case 0x30: if (ea + 1 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=1 mem=${mlen}`); vs[sp] = BigInt(view.getInt8(ea)); ts[sp] = T_I64; break;
          case 0x31: if (ea + 1 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=1 mem=${mlen}`); vs[sp] = BigInt(view.getUint8(ea)); ts[sp] = T_I64; break;
          case 0x32: if (ea + 2 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=2 mem=${mlen}`); vs[sp] = BigInt(view.getInt16(ea, true)); ts[sp] = T_I64; break;
          case 0x33: if (ea + 2 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=2 mem=${mlen}`); vs[sp] = BigInt(view.getUint16(ea, true)); ts[sp] = T_I64; break;
          case 0x34: if (ea + 4 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=4 mem=${mlen}`); vs[sp] = BigInt(view.getInt32(ea, true)); ts[sp] = T_I64; break;
          case 0x35: if (ea + 4 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=4 mem=${mlen}`); vs[sp] = BigInt(view.getUint32(ea, true)); ts[sp] = T_I64; break;
        }
        sp++;
        break;
      }
      // ---- memory stores ----
      case 0x36: case 0x37: case 0x38: case 0x39:
      case 0x3a: case 0x3b: case 0x3c: case 0x3d: case 0x3e: {
        readU32(); // align (advisory)
        const off = readU32();
        if (sp < 2) throw new WasmTrap('stack-underflow');
        sp--;
        const vv = vs[sp];
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        if (!view) throw new WasmTrap('no-memory');
        const ea = (((vs[sp] | 0) + off) >>> 0);
        switch (op) {
          case 0x36: if (ea + 4 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=4 mem=${mlen}`); view.setInt32(ea, vv | 0, true); break;
          case 0x37: if (ea + 8 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=8 mem=${mlen}`); view.setBigInt64(ea, BigInt.asInt64(vv), true); break;
          case 0x38: if (ea + 4 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=4 mem=${mlen}`); view.setFloat32(ea, Math.fround(vv), true); break;
          case 0x39: if (ea + 8 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=8 mem=${mlen}`); view.setFloat64(ea, Number(vv), true); break;
          case 0x3a: if (ea + 1 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=1 mem=${mlen}`); view.setUint8(ea, vv & 0xff); break;
          case 0x3b: if (ea + 2 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=2 mem=${mlen}`); view.setUint16(ea, vv & 0xffff, true); break;
          case 0x3c: if (ea + 1 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=1 mem=${mlen}`); view.setUint8(ea, Number(BigInt.asUint64(vv) & 0xffn)); break;
          case 0x3d: if (ea + 2 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=2 mem=${mlen}`); view.setUint16(ea, Number(BigInt.asUint64(vv) & 0xffffn), true); break;
          case 0x3e: if (ea + 4 > mlen) throw new WasmTrap('oob-memory', `ea=${ea} size=4 mem=${mlen}`); view.setUint32(ea, Number(BigInt.asUint64(vv) & 0xffffffffn), true); break;
        }
        break;
      }
      case 0x3f: { // memory.size
        readU32(); // reserved
        if (!mem) throw new WasmTrap('no-memory');
        vs[sp] = mem.pages; ts[sp] = T_I32; sp++;
        break;
      }
      case 0x40: { // memory.grow
        readU32(); // reserved
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        if (!mem) throw new WasmTrap('no-memory');
        const d = vs[sp] | 0;
        if (d < 0 || (mem.max !== null && mem.pages + d > mem.max)) { vs[sp] = -1; ts[sp] = T_I32; sp++; break; }
        const old = mem.pages;
        const nb = new Uint8Array((old + d) * PAGE);
        nb.set(mem.bytes);
        mem.bytes = nb;
        mem.view = new DataView(nb.buffer);
        mem.pages = old + d;
        view = mem.view; mlen = nb.length; // re-sync hoisted
        vs[sp] = old; ts[sp] = T_I32; sp++;
        break;
      }
      // ---- consts ----
      case 0x41: { // i32.const
        let r = 0, s = 0, b;
        do { b = code[pc++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80);
        if (s < 32 && (b & 0x40)) r |= -(1 << s);
        vs[sp] = r | 0; ts[sp] = T_I32; sp++;
        break;
      }
      case 0x42: { // i64.const
        const r = readSleb64(code, pc); pc = r[1];
        vs[sp] = r[0]; ts[sp] = T_I64; sp++;
        break;
      }
      case 0x43: { // f32.const
        const r = readF32(code, pc); pc = r[1];
        vs[sp] = Math.fround(r[0]); ts[sp] = T_F32; sp++;
        break;
      }
      case 0x44: { // f64.const
        const r = readF64(code, pc); pc = r[1];
        vs[sp] = r[0]; ts[sp] = T_F64; sp++;
        break;
      }
      // ---- i32 compare ----
      case 0x45: { // i32.eqz
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = (vs[sp] | 0) === 0 ? 1 : 0; ts[sp] = T_I32; sp++;
        break;
      }
      case 0x46: case 0x47: case 0x48: case 0x4a: case 0x4c: case 0x4e: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const av = vs[sp - 2] | 0, bv = vs[sp - 1] | 0;
        sp -= 2;
        vs[sp] = (op === 0x46 ? av === bv : op === 0x47 ? av !== bv : op === 0x48 ? av < bv : op === 0x4a ? av > bv : op === 0x4c ? av <= bv : av >= bv) ? 1 : 0;
        ts[sp] = T_I32; sp++;
        break;
      }
      case 0x49: case 0x4b: case 0x4d: case 0x4f: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const av = vs[sp - 2] >>> 0, bv = vs[sp - 1] >>> 0;
        sp -= 2;
        vs[sp] = (op === 0x49 ? av < bv : op === 0x4b ? av > bv : op === 0x4d ? av <= bv : av >= bv) ? 1 : 0;
        ts[sp] = T_I32; sp++;
        break;
      }
      // ---- i32 arithmetic ----
      case 0x6a: { // i32.add
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp - 2] = ((vs[sp - 2] | 0) + (vs[sp - 1] | 0)) | 0;
        sp--; // ts[sp-2] already T_I32
        break;
      }
      case 0x6b: { // i32.sub
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp - 2] = ((vs[sp - 2] | 0) - (vs[sp - 1] | 0)) | 0;
        sp--;
        break;
      }
      case 0x6c: { // i32.mul
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp - 2] = Math.imul(vs[sp - 2] | 0, vs[sp - 1] | 0);
        sp--;
        break;
      }
      case 0x6d: { // i32.div_s
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const av = vs[sp - 2] | 0, bv = vs[sp - 1] | 0;
        if (bv === 0) throw new WasmTrap('int-divide-by-zero');
        if (av === -2147483648 && bv === -1) throw new WasmTrap('int-overflow');
        vs[sp - 2] = (av / bv) | 0;
        sp--;
        break;
      }
      case 0x6e: { // i32.div_u
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const av = vs[sp - 2] >>> 0, bv = vs[sp - 1] >>> 0;
        if (bv === 0) throw new WasmTrap('int-divide-by-zero');
        vs[sp - 2] = Math.floor(av / bv);
        sp--;
        break;
      }
      case 0x6f: { // i32.rem_s
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const bv = vs[sp - 1] | 0;
        if (bv === 0) throw new WasmTrap('int-divide-by-zero');
        vs[sp - 2] = ((vs[sp - 2] | 0) % bv) | 0;
        sp--;
        break;
      }
      case 0x70: { // i32.rem_u
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const bv = vs[sp - 1] >>> 0;
        if (bv === 0) throw new WasmTrap('int-divide-by-zero');
        vs[sp - 2] = (vs[sp - 2] >>> 0) % bv;
        sp--;
        break;
      }
      case 0x71: case 0x72: case 0x73: case 0x74: case 0x75: case 0x76: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const av = vs[sp - 2] | 0, bv = vs[sp - 1] | 0;
        vs[sp - 2] = op === 0x71 ? av & bv : op === 0x72 ? av | bv : op === 0x73 ? av ^ bv : op === 0x74 ? av << (bv & 31) : op === 0x75 ? av >> (bv & 31) : av >>> (bv & 31);
        sp--;
        break;
      }
      case 0x77: case 0x78: { // rotl / rotr
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I32 || ts[sp - 2] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        const av = vs[sp - 2] | 0, s = (vs[sp - 1] | 0) & 31;
        vs[sp - 2] = s === 0 ? av : op === 0x77 ? (av << s) | (av >>> (32 - s)) : (av >>> s) | (av << (32 - s));
        sp--;
        break;
      }
      case 0x67: { // i32.clz
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = Math.clz32(vs[sp] | 0); ts[sp] = T_I32; sp++;
        break;
      }
      case 0x68: { // i32.ctz
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = ctz32(vs[sp] | 0); ts[sp] = T_I32; sp++;
        break;
      }
      case 0x69: { // i32.popcnt
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = popcnt32(vs[sp] | 0); ts[sp] = T_I32; sp++;
        break;
      }
      // ---- i64 compare ----
      case 0x50: { // i64.eqz
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp] = vs[sp] === 0n ? 1 : 0; ts[sp] = T_I32; sp++;
        break;
      }
      case 0x51: case 0x52: case 0x53: case 0x55: case 0x57: case 0x59: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const av = vs[sp - 2], bv = vs[sp - 1];
        sp -= 2;
        vs[sp] = (op === 0x51 ? av === bv : op === 0x52 ? av !== bv : op === 0x53 ? av < bv : op === 0x55 ? av > bv : op === 0x57 ? av <= bv : av >= bv) ? 1 : 0;
        ts[sp] = T_I32; sp++;
        break;
      }
      case 0x54: case 0x56: case 0x58: case 0x5a: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const av = BigInt.asUint64(vs[sp - 2]), bv = BigInt.asUint64(vs[sp - 1]);
        sp -= 2;
        vs[sp] = (op === 0x54 ? av < bv : op === 0x56 ? av > bv : op === 0x58 ? av <= bv : av >= bv) ? 1 : 0;
        ts[sp] = T_I32; sp++;
        break;
      }
      // ---- i64 arithmetic ----
      case 0x7c: case 0x7d: case 0x7e: case 0x83: case 0x84: case 0x85: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const av = vs[sp - 2], bv = vs[sp - 1];
        vs[sp - 2] = BigInt.asInt64(op === 0x7c ? av + bv : op === 0x7d ? av - bv : op === 0x7e ? av * bv : op === 0x83 ? av & bv : op === 0x84 ? av | bv : av ^ bv);
        sp--; // ts already T_I64
        break;
      }
      case 0x86: case 0x87: { // shl / shr_s
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const s = vs[sp - 1] & 63n;
        vs[sp - 2] = BigInt.asInt64(op === 0x86 ? vs[sp - 2] << s : vs[sp - 2] >> s);
        sp--;
        break;
      }
      case 0x88: { // i64.shr_u
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp - 2] = BigInt.asInt64(BigInt.asUint64(vs[sp - 2]) >> (vs[sp - 1] & 63n));
        sp--;
        break;
      }
      case 0x89: case 0x8a: { // rotl / rotr
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const s = vs[sp - 1] & 63n;
        if (s !== 0n) {
          const u = BigInt.asUint64(vs[sp - 2]);
          vs[sp - 2] = BigInt.asInt64(op === 0x89 ? (u << s) | (u >> (64n - s)) : (u >> s) | (u << (64n - s)));
        }
        sp--;
        break;
      }
      case 0x7f: { // i64.div_s
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const av = vs[sp - 2], bv = vs[sp - 1];
        if (bv === 0n) throw new WasmTrap('int-divide-by-zero');
        if (av === I64_MIN && bv === -1n) throw new WasmTrap('int-overflow');
        vs[sp - 2] = av / bv;
        sp--;
        break;
      }
      case 0x80: { // i64.div_u
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const av = BigInt.asUint64(vs[sp - 2]), bv = BigInt.asUint64(vs[sp - 1]);
        if (bv === 0n) throw new WasmTrap('int-divide-by-zero');
        vs[sp - 2] = BigInt.asInt64(av / bv);
        sp--;
        break;
      }
      case 0x81: { // i64.rem_s
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        if (vs[sp - 1] === 0n) throw new WasmTrap('int-divide-by-zero');
        vs[sp - 2] = vs[sp - 2] % vs[sp - 1];
        sp--;
        break;
      }
      case 0x82: { // i64.rem_u
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_I64 || ts[sp - 2] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        const av = BigInt.asUint64(vs[sp - 2]), bv = BigInt.asUint64(vs[sp - 1]);
        if (bv === 0n) throw new WasmTrap('int-divide-by-zero');
        vs[sp - 2] = BigInt.asInt64(av % bv);
        sp--;
        break;
      }
      case 0x79: { // i64.clz
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp] = BigInt(clz64(vs[sp])); ts[sp] = T_I64; sp++;
        break;
      }
      case 0x7a: { // i64.ctz
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp] = BigInt(ctz64(vs[sp])); ts[sp] = T_I64; sp++;
        break;
      }
      case 0x7b: { // i64.popcnt
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp] = BigInt(popcnt64(vs[sp])); ts[sp] = T_I64; sp++;
        break;
      }
      // ---- f32 compare ----
      case 0x5b: case 0x5c: case 0x5d: case 0x5e: case 0x5f: case 0x60: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F32 || ts[sp - 2] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        const av = vs[sp - 2], bv = vs[sp - 1];
        sp -= 2;
        vs[sp] = (op === 0x5b ? av === bv : op === 0x5c ? av !== bv : op === 0x5d ? av < bv : op === 0x5e ? av > bv : op === 0x5f ? av <= bv : av >= bv) ? 1 : 0;
        ts[sp] = T_I32; sp++;
        break;
      }
      // ---- f64 compare ----
      case 0x61: case 0x62: case 0x63: case 0x64: case 0x65: case 0x66: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F64 || ts[sp - 2] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        const av = vs[sp - 2], bv = vs[sp - 1];
        sp -= 2;
        vs[sp] = (op === 0x61 ? av === bv : op === 0x62 ? av !== bv : op === 0x63 ? av < bv : op === 0x64 ? av > bv : op === 0x65 ? av <= bv : av >= bv) ? 1 : 0;
        ts[sp] = T_I32; sp++;
        break;
      }
      // ---- f32 arithmetic ----
      case 0x92: case 0x93: case 0x94: case 0x95: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F32 || ts[sp - 2] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        const av = vs[sp - 2], bv = vs[sp - 1];
        vs[sp - 2] = Math.fround(op === 0x92 ? av + bv : op === 0x93 ? av - bv : op === 0x94 ? av * bv : av / bv);
        sp--; // ts already T_F32
        break;
      }
      case 0x96: case 0x97: { // f32.min / f32.max
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F32 || ts[sp - 2] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        vs[sp - 2] = Math.fround(op === 0x96 ? fmin(vs[sp - 2], vs[sp - 1]) : fmax(vs[sp - 2], vs[sp - 1]));
        sp--;
        break;
      }
      case 0x8b: case 0x8c: case 0x8d: case 0x8e: case 0x8f: case 0x90: case 0x91: {
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        const v = vs[sp];
        vs[sp] = Math.fround(op === 0x8b ? Math.abs(v) : op === 0x8c ? -v : op === 0x8d ? Math.ceil(v) : op === 0x8e ? Math.floor(v) : op === 0x8f ? Math.trunc(v) : op === 0x90 ? nearest(v) : Math.sqrt(v));
        ts[sp] = T_F32; sp++;
        break;
      }
      case 0x98: { // f32.copysign
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F32 || ts[sp - 2] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        const bv = vs[sp - 1];
        vs[sp - 2] = Math.fround((1 / bv === -Infinity || Object.is(bv, -0)) ? -Math.abs(vs[sp - 2]) : Math.abs(vs[sp - 2]));
        sp--;
        break;
      }
      // ---- f64 arithmetic ----
      case 0xa0: case 0xa1: case 0xa2: case 0xa3: {
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F64 || ts[sp - 2] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        const av = vs[sp - 2], bv = vs[sp - 1];
        vs[sp - 2] = op === 0xa0 ? av + bv : op === 0xa1 ? av - bv : op === 0xa2 ? av * bv : av / bv;
        sp--; // ts already T_F64
        break;
      }
      case 0xa4: case 0xa5: { // f64.min / f64.max
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F64 || ts[sp - 2] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        vs[sp - 2] = op === 0xa4 ? fmin(vs[sp - 2], vs[sp - 1]) : fmax(vs[sp - 2], vs[sp - 1]);
        sp--;
        break;
      }
      case 0x99: case 0x9a: case 0x9b: case 0x9c: case 0x9d: case 0x9e: case 0x9f: {
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        const v = vs[sp];
        vs[sp] = op === 0x99 ? Math.abs(v) : op === 0x9a ? -v : op === 0x9b ? Math.ceil(v) : op === 0x9c ? Math.floor(v) : op === 0x9d ? Math.trunc(v) : op === 0x9e ? nearest(v) : Math.sqrt(v);
        ts[sp] = T_F64; sp++;
        break;
      }
      case 0xa6: { // f64.copysign
        if (sp < 2) throw new WasmTrap('stack-underflow');
        if (ts[sp - 1] !== T_F64 || ts[sp - 2] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        const bv = vs[sp - 1];
        vs[sp - 2] = (1 / bv === -Infinity || Object.is(bv, -0)) ? -Math.abs(vs[sp - 2]) : Math.abs(vs[sp - 2]);
        sp--;
        break;
      }
      // ---- conversions ----
      case 0xa7: { // i32.wrap_i64
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp] = Number(vs[sp] & 0xffffffffn) | 0; ts[sp] = T_I32; sp++;
        break;
      }
      case 0xa8: case 0xa9: { // i32.trunc_f32_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        vs[sp] = op === 0xa8 ? truncS32(vs[sp]) : truncU32(vs[sp]); ts[sp] = T_I32; sp++;
        break;
      }
      case 0xaa: case 0xab: { // i32.trunc_f64_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        vs[sp] = op === 0xaa ? truncS32(vs[sp]) : truncU32(vs[sp]); ts[sp] = T_I32; sp++;
        break;
      }
      case 0xac: { // i64.extend_i32_s
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = BigInt(vs[sp] | 0); ts[sp] = T_I64; sp++;
        break;
      }
      case 0xad: { // i64.extend_i32_u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = BigInt(vs[sp] >>> 0); ts[sp] = T_I64; sp++;
        break;
      }
      case 0xae: case 0xaf: { // i64.trunc_f32_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        vs[sp] = op === 0xae ? truncS64(vs[sp]) : truncU64(vs[sp]); ts[sp] = T_I64; sp++;
        break;
      }
      case 0xb0: case 0xb1: { // i64.trunc_f64_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        vs[sp] = op === 0xb0 ? truncS64(vs[sp]) : truncU64(vs[sp]); ts[sp] = T_I64; sp++;
        break;
      }
      case 0xb2: case 0xb3: { // f32.convert_i32_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = Math.fround(op === 0xb2 ? (vs[sp] | 0) : (vs[sp] >>> 0)); ts[sp] = T_F32; sp++;
        break;
      }
      case 0xb4: case 0xb5: { // f32.convert_i64_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp] = Math.fround(op === 0xb4 ? Number(vs[sp]) : Number(BigInt.asUint64(vs[sp]))); ts[sp] = T_F32; sp++;
        break;
      }
      case 0xb6: { // f32.demote_f64
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        vs[sp] = Math.fround(vs[sp]); ts[sp] = T_F32; sp++;
        break;
      }
      case 0xb7: case 0xb8: { // f64.convert_i32_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        vs[sp] = op === 0xb7 ? (vs[sp] | 0) : (vs[sp] >>> 0); ts[sp] = T_F64; sp++;
        break;
      }
      case 0xb9: case 0xba: { // f64.convert_i64_s/u
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        vs[sp] = op === 0xb9 ? Number(vs[sp]) : Number(BigInt.asUint64(vs[sp])); ts[sp] = T_F64; sp++;
        break;
      }
      case 0xbb: { // f64.promote_f32
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        ts[sp] = T_F64; sp++; // value already a number
        break;
      }
      case 0xbc: { // i32.reinterpret_f32
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F32) throw new WasmTrap('type-mismatch', 'want f32');
        scratchDv.setFloat32(0, vs[sp], true);
        vs[sp] = scratchDv.getInt32(0, true); ts[sp] = T_I32; sp++;
        break;
      }
      case 0xbd: { // i64.reinterpret_f64
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_F64) throw new WasmTrap('type-mismatch', 'want f64');
        scratchDv.setFloat64(0, vs[sp], true);
        vs[sp] = scratchDv.getBigInt64(0, true); ts[sp] = T_I64; sp++;
        break;
      }
      case 0xbe: { // f32.reinterpret_i32
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I32) throw new WasmTrap('type-mismatch', 'want i32');
        scratchDv.setInt32(0, vs[sp] | 0, true);
        vs[sp] = Math.fround(scratchDv.getFloat32(0, true)); ts[sp] = T_F32; sp++;
        break;
      }
      case 0xbf: { // f64.reinterpret_i64
        if (sp < 1) throw new WasmTrap('stack-underflow');
        sp--;
        if (ts[sp] !== T_I64) throw new WasmTrap('type-mismatch', 'want i64');
        scratchDv.setBigInt64(0, vs[sp], true);
        vs[sp] = scratchDv.getFloat64(0, true); ts[sp] = T_F64; sp++;
        break;
      }
      default: {
        const info = OP[op];
        if (!info) throw new WasmTrap('bad-opcode', '0x' + op.toString(16));
        throw new WasmTrap('unimplemented-op', info.name);
      }
    }
    } // end 4096-quantum for
    steps += 4096;
    if (steps > maxSteps) throw new WasmTrap('timeout', 'step budget exceeded');
  }
  stk.sp = sp;
}
