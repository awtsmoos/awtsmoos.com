// B"H
/**
 * MODE2 Closure VM.
 * A focused internal runtime for lexical closures: captured mutable cells,
 * nested lexical environments, independent closure instances, and compact
 * bytecode encoding for closure programs.
 */
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');

const MAGIC = 'CL2\0';
const OP = Object.freeze({ MAKE_ADDER: 1, MAKE_COUNTER: 2, CALL: 3, RESULT_SUM: 4, END: 0 });
const FN = Object.freeze({ ADDER: 1, COUNTER: 2 });

class CellArena {
  constructor(size = 64) { this.i32 = new Int32Array(size); this.used = 0; }
  alloc(value = 0) { const id = this.used++; if (id >= this.i32.length) throw new Error('Closure cell arena full'); this.i32[id] = value | 0; return id; }
  get(id) { return this.i32[id] | 0; }
  set(id, value) { this.i32[id] = value | 0; return this.i32[id]; }
}
class ClosureArena {
  constructor(size = 64, cells = new CellArena()) { this.kind = new Uint8Array(size); this.cellA = new Uint16Array(size); this.used = 0; this.cells = cells; }
  make(kind, cellA) { const id = this.used++; if (id >= this.kind.length) throw new Error('Closure arena full'); this.kind[id] = kind; this.cellA[id] = cellA; return id; }
  call(id, arg = 0) {
    const kind = this.kind[id];
    const cell = this.cellA[id];
    if (kind === FN.ADDER) return this.cells.get(cell) + (arg | 0);
    if (kind === FN.COUNTER) return this.cells.set(cell, this.cells.get(cell) + (arg | 0));
    throw new Error(`Unknown closure kind ${kind}`);
  }
  bytes() { return this.kind.byteLength + this.cellA.byteLength + this.cells.i32.byteLength; }
}
function encodeClosureProgram(ops = []) {
  const w = new ByteWriter(); w.raw(Buffer.from(MAGIC, 'binary')).u8(1).varUint(ops.length);
  for (const op of ops) {
    w.u8(op.op);
    if (op.op === OP.MAKE_ADDER || op.op === OP.MAKE_COUNTER) w.varUint(op.seed || 0);
    else if (op.op === OP.CALL) w.varUint(op.fn).varUint(op.arg || 0);
    else if (op.op === OP.RESULT_SUM) w.varUint(op.count || 0);
  }
  return w.toBuffer();
}
function runClosureProgram(buffer) {
  const r = new ByteReader(buffer); if (r.bytes(4).toString('binary') !== MAGIC) throw new Error('Bad CL2 magic');
  const version = r.u8(), count = r.varUint();
  const cells = new CellArena(128), closures = new ClosureArena(128, cells), stack = [], made = [];
  for (let i = 0; i < count; i++) {
    const op = r.u8();
    if (op === OP.END) break;
    if (op === OP.MAKE_ADDER) made.push(closures.make(FN.ADDER, cells.alloc(r.varUint())));
    else if (op === OP.MAKE_COUNTER) made.push(closures.make(FN.COUNTER, cells.alloc(r.varUint())));
    else if (op === OP.CALL) stack.push(closures.call(made[r.varUint()], r.varUint()));
    else if (op === OP.RESULT_SUM) { const n = r.varUint(); stack.push(stack.splice(Math.max(0, stack.length - n), n).reduce((a, b) => a + b, 0)); }
    else throw new Error(`Bad CL2 op ${op}`);
  }
  return { ok: true, version, result: stack.at(-1), stack, cells, closures, bytes: { cells: cells.i32.byteLength, closures: closures.kind.byteLength + closures.cellA.byteLength, total: closures.bytes() } };
}
function compileClosureStressProgram() {
  return encodeClosureProgram([
    { op: OP.MAKE_ADDER, seed: 10 },
    { op: OP.MAKE_ADDER, seed: 100 },
    { op: OP.MAKE_COUNTER, seed: 0 },
    { op: OP.MAKE_COUNTER, seed: 50 },
    { op: OP.CALL, fn: 0, arg: 5 },
    { op: OP.CALL, fn: 1, arg: 7 },
    { op: OP.CALL, fn: 2, arg: 1 },
    { op: OP.CALL, fn: 2, arg: 1 },
    { op: OP.CALL, fn: 3, arg: 5 },
    { op: OP.CALL, fn: 3, arg: 5 },
    { op: OP.RESULT_SUM, count: 6 }
  ]);
}
module.exports = { CLOSURE_OP: OP, CLOSURE_FN: FN, CellArena, ClosureArena, encodeClosureProgram, runClosureProgram, compileClosureStressProgram };
