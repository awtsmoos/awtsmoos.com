// B"H
// codegen-arrays.js — Native tier v2, Stream 4/8: NATIVE ARRAYS.
//
// Integer-subset JavaScript + real arrays → x86_64 assembly → real machine
// code via the self-hosted Awtsmoos toolchain (compileNativeAsm). This is the
// tier that beats V8 on array kernels: no interpreter, no type guards, no GC
// write barriers — tagged values, inline bounds checks, and a fully native
// stable merge sort with the comparator compiled inline (no VM round-trip).
//
// == Value model (Stream 1 proposal; this module conforms to it) ==
//   tagged value (64 bit): 000 = fixnum61 (bits[63:3] = signed 61-bit value)
//                          001 = heapref  (bits[63:3] = 8-aligned heap ptr>>3)
//                          010 = undefined (provisional; Stream 1 defined only
//                                000/001 — undefined is required for holes and
//                                out-of-bounds reads)
//   array = heap type 2:  [+0] type word = 2
//                         [+8] length   (raw int64 count, NOT tagged)
//                         [+16] capacity (raw int64 count)
//                         [+24 + 8*i] element i (tagged value, inline)
//   Holes are stored as undefined; reads of holes and OOB indices yield
//   undefined, exactly like V8 for every observable operation in this subset.
//
// Helpers are imported from ./value-model.js when Stream 1 lands (deferred to
// whatever names it publishes); allocation goes through Stream 2's ./heap.js
// when it lands. Until then this module carries a local brk()-based bump
// allocator (awts_heap_init / awts_alloc) emitting the same heap layout.
//
// == Register convention (this module's generated code) ==
//   R15 = heap bump top, R14 = heap limit. Never allocated to user code;
//     every runtime helper preserves them (awts_alloc advances R15).
//   RBX, R12, R13 = pinned user locals (callee-saved; helpers preserve them).
//   Expression scratch: RAX, R10, R11, RCX (RDX is additionally clobbered by
//     IDIV/MUL by hardware). RDI/RSI are NEVER scratch (call arg registers).
//   All expression values are tagged. Tagged arithmetic: +,-,<<,&,|,^ and
//     comparisons are tag-transparent; *,/,%,>>,>>> untag/retag.
//
// == Sort ==
//   emitSort produces a specialized awts_sort_cN per comparator shape:
//   bottom-up iterative merge sort (STABLE — V8's sort is stable) with the
//   comparator inlined at the single compare site. tryCompileComparator
//   generalizes commit 3e1382066's single-return-binary-op recognition to a
//   full pure-expression language (arithmetic, comparisons materialized to
//   -1/0/1, nested ternaries, &&/||, unary -, array-index reads of enclosing
//   array/scalar locals). Uncompilable comparators throw NotCompilableError —
//   the pipeline slow path is the interpreter (DefaultMerkavaHost, which keeps
//   its own 3e1382066 fast path).
//
// Subset: integer literals (int64), var, if/while/for/break/continue,
// for-of over arrays, array literals (holes ok), a[i], a[i]=v, a.length,
// a.length=n, a.push(v), a.pop(), a.sort([cmp]), ternary, &&/||, !.
// No: strings, floats, closures (comparators are inlined, never called),
// exceptions (negative a.length=n aborts via exit(134); V8 throws RangeError),
// general function calls.
//
// Known v2 limitation: push/set_grow may REALLOCATE the array object. An
// alias created before growth (var b = a) keeps pointing at the pre-growth
// object. (Stream 2's heap may later offer a fix; the object model keeps
// elements inline per Stream 1.)

import { createRequire } from "module";
import { compileNativeAsm } from "../native/compiler.js";

// ---- Value model: prefer Stream 1's value-model.js when it lands. ----
const _VM = await import("./value-model.js").catch(() => null);
const _HEAP = await import("./heap.js").catch(() => null); // Stream 2 (stub until it lands)
void _HEAP;

export const TAG_FIXNUM = _VM?.TAG_FIXNUM ?? 0;
export const TAG_HEAPREF = _VM?.TAG_HEAPREF ?? 1;
export const TAG_UNDEF = _VM?.TAG_UNDEF ?? 2; // provisional — see header
export const HEAP_TYPE_ARRAY = _VM?.HEAP_TYPE_ARRAY ?? 2;
export const OFF_TYPE = _VM?.OFF_TYPE ?? 0;
export const OFF_LENGTH = _VM?.OFF_LENGTH ?? 8;
export const OFF_CAPACITY = _VM?.OFF_CAPACITY ?? 16;
export const OFF_ELEMS = _VM?.OFF_ELEMS ?? 24;

/** Tagged undefined value. */
export const UNDEF = (0 << 3) | TAG_UNDEF; // 2
/** Encode a JS integer as a tagged fixnum61 (throws outside fixnum61 range). */
export function tagFixnum(v) {
  const b = BigInt(v);
  if (b < -(2n ** 60n) || b > 2n ** 60n - 1n) throw new RangeError(`fixnum61 overflow: ${v}`);
  return b * 8n;
}
/** Decode a tagged fixnum61 to BigInt. */
export function untagFixnum(t) { return BigInt(t) >> 3n; }

// ---------------------------------------------------------------------------
// Not-compilable signal: the pipeline slow path is the interpreter.
// ---------------------------------------------------------------------------
export class NotCompilableError extends Error {
  constructor(msg) { super(`jsArr:not-compilable: ${msg}`); this.name = "NotCompilableError"; }
}

// ---------------------------------------------------------------------------
// Comparator recognition — generalizes 3e1382066.
// Accepts FunctionExpression / ArrowFunctionExpression with exactly two
// identifier params whose body is a single pure expression:
//   function(x, y) { return <pure>; }   |   (x, y) => <pure>
// Pure = integer literals, `undefined`, the two params, read-only references
// to enclosing locals (arrays: a[i] / a.length; scalars: plain reads),
// unary - + ~ !, binary + - * / % << >> >>> & | ^ < <= > >= == !=,
// && ||, and nested ternaries. Anything else (calls, assignment, `this`,
// unknown identifiers) -> null: the caller routes to the slow path.
// ---------------------------------------------------------------------------
const PURE_BINOPS = new Set(["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^",
  "<", "<=", ">", ">=", "==", "!="]);

function isIntLiteral(n) {
  return n && n.type === "Literal" && typeof n.value === "number" && Number.isInteger(n.value);
}

// resolve(name) -> 'param0' | 'param1' | 'array' | 'scalar' | null
function pureCheck(node, resolve) {
  if (!node || typeof node.type !== "string") return false;
  switch (node.type) {
    case "Literal": return typeof node.value === "number" && Number.isInteger(node.value);
    case "Identifier": {
      if (node.name === "undefined") return true;
      return resolve(node.name) !== null;
    }
    case "UnaryExpression":
      return ["-", "+", "~", "!"].includes(node.operator) && pureCheck(node.argument, resolve);
    case "BinaryExpression": {
      if (node.operator === "&&" || node.operator === "||")
        return pureCheck(node.left, resolve) && pureCheck(node.right, resolve);
      if (!PURE_BINOPS.has(node.operator)) return false;
      if (["<<", ">>", ">>>"].includes(node.operator) && !isIntLiteral(node.right)) return false;
      return pureCheck(node.left, resolve) && pureCheck(node.right, resolve);
    }
    case "LogicalExpression":
      return (node.operator === "&&" || node.operator === "||") &&
        pureCheck(node.left, resolve) && pureCheck(node.right, resolve);
    case "ConditionalExpression":
      return pureCheck(node.test, resolve) && pureCheck(node.consequent, resolve) &&
        pureCheck(node.alternate, resolve);
    case "MemberExpression": {
      if (node.object.type !== "Identifier" || resolve(node.object.name) !== "array") return false;
      if (node.computed) return pureCheck(node.property, resolve);
      return node.property.type === "Identifier" && node.property.name === "length";
    }
    default: return false; // calls, assignments, updates, this, etc. -> impure
  }
}

/**
 * Try to compile a sort comparator to a native inline snippet.
 * @param {object} fnNode ESTree FunctionExpression/ArrowFunctionExpression
 * @param {(name:string)=>('param0'|'param1'|'array'|'scalar'|null)} resolve
 *   (params must resolve via 'param0'/'param1'; enclosing locals via the rest)
 * @returns {{p0:string,p1:string,expr:object,key:string}|null}
 */
export function tryCompileComparator(fnNode, resolve) {
  if (!fnNode || (fnNode.type !== "FunctionExpression" && fnNode.type !== "ArrowFunctionExpression"))
    return null;
  const params = fnNode.params || [];
  if (params.length !== 2 || params.some(p => p.type !== "Identifier")) return null;
  const [p0, p1] = params.map(p => p.name);
  if (p0 === p1) return null;
  let expr = null;
  if (fnNode.type === "ArrowFunctionExpression" && fnNode.body && fnNode.body.type !== "BlockStatement") {
    expr = fnNode.body;
  } else {
    const body = fnNode.body;
    if (!body || body.type !== "BlockStatement" || !Array.isArray(body.body) || body.body.length !== 1)
      return null;
    const ret = body.body[0];
    if (!ret || ret.type !== "ReturnStatement" || !ret.argument) return null;
    expr = ret.argument;
  }
  const r = (name) => {
    if (name === p0) return "param0";
    if (name === p1) return "param1";
    return resolve(name);
  };
  if (!pureCheck(expr, r)) return null;
  const key = fnNode.start !== undefined && fnNode.end !== undefined && fnNode._src
    ? fnNode._src.slice(fnNode.start, fnNode.end) : null;
  return { p0, p1, expr, key };
}

// ---------------------------------------------------------------------------
// ArrayAsmGen — emits a complete x86_64 program for the array subset.
// ---------------------------------------------------------------------------
const PINNED = ["RBX", "R12", "R13"]; // user locals; R14/R15 = heap (reserved)
const INT64_MIN = -(2n ** 63n);
const INT64_MAX = 2n ** 63n - 1n;

const CMP_OPS = {
  "<":  { set: "SETL",  jt: "JL",  jf: "JGE" },
  "<=": { set: "SETLE", jt: "JLE", jf: "JG" },
  ">":  { set: "SETG",  jt: "JG",  jf: "JLE" },
  ">=": { set: "SETGE", jt: "JGE", jf: "JL" },
  "==": { set: "SETE",  jt: "JE",  jf: "JNE" },
  "!=": { set: "SETNE", jt: "JNE", jf: "JE" },
  "===": { set: "SETE",  jt: "JE",  jf: "JNE" },
  "!==": { set: "SETNE", jt: "JNE", jf: "JE" },
};

function fail(msg, node) {
  const where = node && node.start !== undefined ? ` at offset ${node.start}` : "";
  throw new Error(`jsArr: ${msg}${where}`);
}

export class ArrayAsmGen {
  constructor() {
    this.lines = [];
    this.labelN = 0;
    this.locals = new Map(); // name -> {kind:'scalar'|'array', reg}|{kind,stackOff}
    this.loopStack = [];
    this.sortSpecs = new Map(); // key -> {label, cmp|null}
    this.stackReserve = 0;
    this.pinnedCount = 0;
  }
  emit(s) { this.lines.push(s); }
  lbl(p) { return `$jsa_${p}_${this.labelN++}`; }

  // ---------------- program ----------------
  compileProgram(program, entry, opts) {
    if (!program || program.type !== "Program") fail("expected Program node");
    if (entry) fail("array tier v2 supports entry=null only (auto-wrapped kernel)");
    const fns = [], rest = [];
    for (const s of program.body || []) (s.type === "FunctionDeclaration" ? fns : rest).push(s);
    if (fns.length) fail("top-level function declarations not supported in array tier v2 (comparators inline at sort sites)");
    if (!rest.length) fail("empty program");
    const stmts = rest.map(s => {
      if (["VariableDeclaration", "ExpressionStatement", "IfStatement", "WhileStatement",
           "ForStatement", "ForOfStatement", "ReturnStatement", "BlockStatement",
           "BreakStatement", "ContinueStatement"].includes(s.type)) return s;
      fail(`top-level ${s.type} not supported`, s);
    });
    const last = stmts[stmts.length - 1];
    if (last && last.type === "ExpressionStatement") {
      stmts[stmts.length - 1] = { type: "ReturnStatement", argument: last.expression };
    }
    const kernel = {
      type: "FunctionDeclaration",
      id: { type: "Identifier", name: "__merkava_kernel" },
      params: [], body: { type: "BlockStatement", body: stmts },
    };
    this.repeat = (opts && opts.repeat | 0) || 0;

    this.emit(`; B"H — native arrays (Stream 4/8)`);
    this.emit(`.code`);
    this.emit(`start:`);
    this.emit(`CALL awts_heap_init`);
    this.emit(`CALL main`);
    this.emit(`MOV RDI, RAX`);
    this.emit(`MOV RAX, 60`);
    this.emit(`SYSCALL`);
    this.emitRuntime();
    this.kernelDecl(kernel);
    for (const c of this.sortChunks || []) this.emit(c);
    this.emitMain();
    return this.lines.join("\n");
  }

  // ---------------- runtime ----------------
  emitRuntime() {
    this.heapInit(); this.allocFn();
    this.arrayAlloc(); this.arrayEnsure(); this.arrayPush(); this.arrayPop();
    this.arraySetGrow(); this.arraySet(); this.arrayLenSet();
    // sort specializations are emitted lazily at first use (see sortLabelFor)
    this.printDriver();
  }

  heapInit() {
    this.emit(`awts_heap_init:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`MOV RAX, 12`); this.emit(`XOR RDI, RDI`); this.emit(`SYSCALL`); // brk(0)
    this.emit(`MOV R15, RAX`);                       // bump top
    this.emit(`ADD RAX, 268435456`);                  // +256MB virtual reserve
    this.emit(`MOV RDI, RAX`); this.emit(`MOV RAX, 12`); this.emit(`SYSCALL`);
    this.emit(`MOV R14, RAX`);                        // limit
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  allocFn() {
    // awts_alloc: RDI = bytes -> RAX = ptr. Clobbers RAX/RDI/R10; bumps R15.
    this.emit(`awts_alloc:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`ADD RDI, 7`); this.emit(`AND RDI, -8`);
    this.emit(`MOV RAX, R15`);
    this.emit(`ADD R15, RDI`);
    this.emit(`CMP R15, R14`);
    this.emit(`JLE $awts_alloc_ok`); // R15/R14 are heap addresses: always positive, so signed<= is exact
    this.emit(`PUSH RAX`); this.emit(`PUSH RDI`);
    this.emit(`MOV RDI, R15`); this.emit(`ADD RDI, 268435456`);
    this.emit(`MOV RAX, 12`); this.emit(`SYSCALL`);
    this.emit(`MOV R14, RAX`);
    this.emit(`POP RDI`); this.emit(`POP RAX`);
    this.emit(`$awts_alloc_ok:`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  arrayAlloc() {
    // awts_array_alloc: RDI = capacity -> RAX = tagged heapref (len 0).
    this.emit(`awts_array_alloc:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R12`);
    this.emit(`MOV R12, RDI`);
    this.emit(`SHL RDI, 3`); this.emit(`ADD RDI, 24`);
    this.emit(`CALL awts_alloc`);
    this.emit(`MOV QWORD PTR [RAX+${OFF_TYPE}], ${HEAP_TYPE_ARRAY}`);
    this.emit(`MOV QWORD PTR [RAX+${OFF_LENGTH}], 0`);
    this.emit(`MOV QWORD PTR [RAX+${OFF_CAPACITY}], R12`);
    this.emit(`OR RAX, 1`);
    this.emit(`POP R12`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  arrayEnsure() {
    // awts_array_ensure: RDI = heapref, RSI = mincap -> RAX = heapref.
    this.emit(`awts_array_ensure:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R12`); this.emit(`PUSH R13`);
    this.emit(`MOV R12, RDI`); this.emit(`XOR R12, 1`);
    this.emit(`MOV R13, QWORD PTR [R12+${OFF_CAPACITY}]`);
    this.emit(`CMP R13, RSI`);
    this.emit(`JGE $awts_ensure_done`);
    this.emit(`MOV RAX, R13`); this.emit(`ADD RAX, RAX`); // 2*cap
    this.emit(`CMP RAX, 4`); this.emit(`JGE $awts_ensure_nc1`);
    this.emit(`MOV RAX, 4`);
    this.emit(`$awts_ensure_nc1:`);
    this.emit(`CMP RAX, RSI`); this.emit(`JGE $awts_ensure_nc2`);
    this.emit(`MOV RAX, RSI`);
    this.emit(`$awts_ensure_nc2:`);
    this.emit(`PUSH RDI`);
    this.emit(`MOV RDI, RAX`);
    this.emit(`CALL awts_array_alloc`);
    this.emit(`POP RDI`);
    this.emit(`MOV R10, RAX`); this.emit(`XOR R10, 1`);
    this.emit(`XOR RDI, 1`);
    this.emit(`MOV RCX, QWORD PTR [RDI+${OFF_LENGTH}]`);
    this.emit(`MOV QWORD PTR [R10+${OFF_LENGTH}], RCX`);
    this.emit(`XOR RDX, RDX`);
    this.emit(`$awts_ensure_copy:`);
    this.emit(`CMP RDX, RCX`); this.emit(`JGE $awts_ensure_copied`);
    this.emit(`MOV R11, QWORD PTR [RDI+RDX*8+${OFF_ELEMS}]`);
    this.emit(`MOV QWORD PTR [R10+RDX*8+${OFF_ELEMS}], R11`);
    this.emit(`INC RDX`); this.emit(`JMP $awts_ensure_copy`);
    this.emit(`$awts_ensure_copied:`);
    // RAX = new heapref already
    this.emit(`JMP $awts_ensure_exit`);
    this.emit(`$awts_ensure_done:`);
    this.emit(`MOV RAX, RDI`);
    this.emit(`$awts_ensure_exit:`);
    this.emit(`POP R13`); this.emit(`POP R12`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  arrayPush() {
    // awts_array_push: RDI = heapref, RSI = tagged val -> RAX = heapref, RDX = tagged newlen.
    this.emit(`awts_array_push:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R12`);
    this.emit(`MOV R12, RDI`); this.emit(`XOR R12, 1`);
    this.emit(`MOV RAX, QWORD PTR [R12+${OFF_LENGTH}]`);
    this.emit(`CMP RAX, QWORD PTR [R12+${OFF_CAPACITY}]`);
    this.emit(`JL $awts_push_store`);
    this.emit(`PUSH RSI`); this.emit(`PUSH RAX`);
    this.emit(`MOV RSI, RAX`); this.emit(`INC RSI`);
    this.emit(`CALL awts_array_ensure`);
    this.emit(`POP RCX`); this.emit(`POP RSI`);
    this.emit(`MOV R12, RAX`); this.emit(`XOR R12, 1`);
    this.emit(`MOV RAX, RCX`);
    this.emit(`$awts_push_store:`);
    this.emit(`MOV QWORD PTR [R12+RAX*8+${OFF_ELEMS}], RSI`);
    this.emit(`INC RAX`);
    this.emit(`MOV QWORD PTR [R12+${OFF_LENGTH}], RAX`);
    this.emit(`MOV RDX, RAX`); this.emit(`SHL RDX, 3`);
    this.emit(`MOV RAX, R12`); this.emit(`OR RAX, 1`);
    this.emit(`POP R12`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  arrayPop() {
    // awts_array_pop: RDI = heapref -> RAX = heapref, RDX = tagged val | UNDEF.
    this.emit(`awts_array_pop:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`MOV RAX, RDI`); this.emit(`XOR RAX, 1`);
    this.emit(`MOV RCX, QWORD PTR [RAX+${OFF_LENGTH}]`);
    this.emit(`TEST RCX, RCX`);
    this.emit(`JZ $awts_pop_empty`);
    this.emit(`DEC RCX`);
    this.emit(`MOV QWORD PTR [RAX+${OFF_LENGTH}], RCX`);
    this.emit(`MOV RDX, QWORD PTR [RAX+RCX*8+${OFF_ELEMS}]`);
    this.emit(`MOV RAX, RDI`);
    this.emit(`JMP $awts_pop_done`);
    this.emit(`$awts_pop_empty:`);
    this.emit(`MOV RDX, ${UNDEF}`);
    this.emit(`MOV RAX, RDI`);
    this.emit(`$awts_pop_done:`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  arraySetGrow() {
    // awts_array_set_grow: RDI = heapref, RSI = idx (raw), RDX = tagged val -> RAX = heapref.
    this.emit(`awts_array_set_grow:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R12`); this.emit(`PUSH R13`);
    this.emit(`MOV R12, RDX`);
    this.emit(`MOV R13, RSI`);
    this.emit(`INC RSI`);
    this.emit(`CALL awts_array_ensure`);
    this.emit(`MOV R10, RAX`); this.emit(`XOR R10, 1`);
    this.emit(`MOV RCX, QWORD PTR [R10+${OFF_LENGTH}]`);
    this.emit(`CMP R13, RCX`);
    this.emit(`JL $awts_sg_store`);
    this.emit(`$awts_sg_fill:`);
    this.emit(`CMP RCX, R13`); this.emit(`JGE $awts_sg_filled`);
    this.emit(`MOV QWORD PTR [R10+RCX*8+${OFF_ELEMS}], ${UNDEF}`);
    this.emit(`INC RCX`); this.emit(`JMP $awts_sg_fill`);
    this.emit(`$awts_sg_filled:`);
    this.emit(`LEA RCX, [R13+1]`);
    this.emit(`MOV QWORD PTR [R10+${OFF_LENGTH}], RCX`);
    this.emit(`$awts_sg_store:`);
    this.emit(`MOV QWORD PTR [R10+R13*8+${OFF_ELEMS}], R12`);
    this.emit(`POP R13`); this.emit(`POP R12`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  arraySet() {
    // awts_array_set: RDI = heapref, RSI = idx (raw, -1 = drop), RDX = tagged val
    // -> RAX = heapref (possibly reallocated).
    this.emit(`awts_array_set:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R12`);
    this.emit(`CMP RSI, 0`);
    this.emit(`JL $awts_ss_drop`);
    this.emit(`MOV R12, RDI`); this.emit(`XOR R12, 1`);
    this.emit(`CMP RSI, QWORD PTR [R12+${OFF_CAPACITY}]`);
    this.emit(`JGE $awts_ss_grow`);
    this.emit(`CMP RSI, QWORD PTR [R12+${OFF_LENGTH}]`);
    this.emit(`JG $awts_ss_grow`);
    this.emit(`MOV QWORD PTR [R12+RSI*8+${OFF_ELEMS}], RDX`);
    this.emit(`JE $awts_ss_inc`);
    this.emit(`MOV RAX, R12`); this.emit(`OR RAX, 1`);
    this.emit(`JMP $awts_ss_exit`);
    this.emit(`$awts_ss_inc:`);
    this.emit(`MOV R10, QWORD PTR [R12+${OFF_LENGTH}]`);
    this.emit(`INC R10`);
    this.emit(`MOV QWORD PTR [R12+${OFF_LENGTH}], R10`);
    this.emit(`MOV RAX, R12`); this.emit(`OR RAX, 1`);
    this.emit(`JMP $awts_ss_exit`);
    this.emit(`$awts_ss_grow:`);
    this.emit(`CALL awts_array_set_grow`); // RDI/RSI/RDX intact
    this.emit(`JMP $awts_ss_exit`);
    this.emit(`$awts_ss_drop:`);
    this.emit(`MOV RAX, RDI`);
    this.emit(`$awts_ss_exit:`);
    this.emit(`POP R12`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }

  arrayLenSet() {
    // awts_array_len_set: RDI = heapref, RSI = tagged newlen -> RAX = heapref.
    // Negative / non-fixnum length: V8 throws RangeError; subset aborts (134).
    this.emit(`awts_array_len_set:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R12`); this.emit(`PUSH R13`);
    this.emit(`TEST RSI, 7`);
    this.emit(`JNZ $awts_ls_abort`);
    this.emit(`MOV R12, RDI`); this.emit(`XOR R12, 1`);
    this.emit(`MOV R13, RSI`); this.emit(`SAR R13, 3`);
    this.emit(`CMP R13, 0`);
    this.emit(`JL $awts_ls_abort`);
    this.emit(`MOV RAX, QWORD PTR [R12+${OFF_LENGTH}]`);
    this.emit(`CMP R13, RAX`);
    this.emit(`JE $awts_ls_done`);
    this.emit(`JL $awts_ls_trunc`);
    this.emit(`MOV RSI, R13`);
    this.emit(`CALL awts_array_ensure`);
    this.emit(`MOV R12, RAX`); this.emit(`XOR R12, 1`);
    this.emit(`MOV RCX, QWORD PTR [R12+${OFF_LENGTH}]`);
    this.emit(`$awts_ls_fill:`);
    this.emit(`CMP RCX, R13`); this.emit(`JGE $awts_ls_filled`);
    this.emit(`MOV QWORD PTR [R12+RCX*8+${OFF_ELEMS}], ${UNDEF}`);
    this.emit(`INC RCX`); this.emit(`JMP $awts_ls_fill`);
    this.emit(`$awts_ls_filled:`);
    this.emit(`MOV QWORD PTR [R12+${OFF_LENGTH}], R13`);
    this.emit(`JMP $awts_ls_done`);
    this.emit(`$awts_ls_trunc:`);
    this.emit(`MOV QWORD PTR [R12+${OFF_LENGTH}], R13`);
    this.emit(`$awts_ls_done:`);
    this.emit(`MOV RAX, R12`); this.emit(`OR RAX, 1`);
    this.emit(`POP R13`); this.emit(`POP R12`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
    this.emit(`$awts_ls_abort:`);
    this.emit(`MOV RAX, 60`); this.emit(`MOV RDI, 134`); this.emit(`SYSCALL`);
  }

  printDriver() {
    // awts_putchar: RDI = byte. Preserves R14/R15 (heap regs).
    this.emit(`awts_putchar:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R10`); this.emit(`PUSH R11`);
    this.emit(`PUSH RDI`);
    this.emit(`MOV RAX, 1`); this.emit(`MOV RDI, 1`);
    this.emit(`MOV RSI, RSP`); this.emit(`MOV RDX, 1`);
    this.emit(`SYSCALL`);
    this.emit(`ADD RSP, 8`);
    this.emit(`POP R11`); this.emit(`POP R10`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
    // awts_print_u: RDI = unsigned 61-bit.
    this.emit(`awts_print_u:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R10`);
    this.emit(`MOV R10, RDI`);
    this.emit(`CMP R10, 10`); this.emit(`JL $awts_ppu_one`);
    this.emit(`MOV RAX, R10`); this.emit(`XOR RDX, RDX`);
    this.emit(`MOV RCX, 10`); this.emit(`DIV RCX`);
    this.emit(`PUSH RDX`);
    this.emit(`MOV RDI, RAX`); this.emit(`CALL awts_print_u`);
    this.emit(`POP RDX`); this.emit(`MOV R10, RDX`);
    this.emit(`$awts_ppu_one:`);
    this.emit(`ADD R10, 48`); this.emit(`MOV RDI, R10`);
    this.emit(`CALL awts_putchar`);
    this.emit(`POP R10`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
    // awts_print: RDI = signed 61-bit.
    this.emit(`awts_print:`);
    this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
    this.emit(`PUSH R10`);
    this.emit(`MOV R10, RDI`);
    this.emit(`CMP R10, 0`); this.emit(`JGE $awts_pp_nonneg`);
    this.emit(`MOV RDI, 45`); this.emit(`CALL awts_putchar`);
    this.emit(`MOV RAX, R10`); this.emit(`NEG RAX`);
    this.emit(`MOV RDI, RAX`); this.emit(`CALL awts_print_u`);
    this.emit(`JMP $awts_pp_done`);
    this.emit(`$awts_pp_nonneg:`);
    this.emit(`MOV RDI, R10`); this.emit(`CALL awts_print_u`);
    this.emit(`$awts_pp_done:`);
    this.emit(`POP R10`);
    this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
  }
}

// ---------------------------------------------------------------------------
// Sort: stable bottom-up merge sort, comparator specialized per shape.
// Frame (64B, RBP-relative): -8 p0 | -16 p1 | -24 n | -32 width | -40 lo |
//                            -48 hi | -56 krbp | -64 base(untagged)
// Loop regs: R8=data base, R9=tmp, RDX=i, RDI=j, RSI=k, RCX=mid.
// The compare snippet sees [RBP-8]=a_tagged, [RBP-16]=b_tagged and leaves a
// sign in RAX (0/neg -> take left = stable, pos -> take right). It may clobber
// RAX/R10/R11 only (RDX is PUSHed/POPed around it: IDIV/MUL need RDX).
// ---------------------------------------------------------------------------
ArrayAsmGen.prototype.sortLabelFor = function (cmp) {
  const key = cmp ? `cmp:${cmp.key ?? `anon${this.sortSpecs.size}`}` : "default";
  const hit = this.sortSpecs.get(key);
  if (hit) return hit;
  const label = `awts_sort_${this.sortSpecs.size}`;
  this.sortSpecs.set(key, label);
  const gen = this;
  this.emitDeferred(() => gen.emitMergeSort(label, cmp));
  return label;
};

ArrayAsmGen.prototype.emitDeferred = function (fn) {
  const saved = this.lines;
  this.lines = [];
  this.sortChunks = this.sortChunks || [];
  fn();
  this.sortChunks.push(this.lines.join("\n"));
  this.lines = saved;
};

ArrayAsmGen.prototype.emitMergeSort = function (label, cmp) {
  const L = (s) => `${label}_${s}`;
  const E = (s) => this.emit(s);
  E(`${label}:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`SUB RSP, 64`);
  E(`MOV QWORD PTR [RBP-56], RSI`);          // krbp (kernel frame)
  E(`MOV R11, RDI`); E(`XOR R11, 1`);
  E(`MOV QWORD PTR [RBP-64], R11`);          // base (untagged)
  E(`MOV R10, QWORD PTR [R11+${OFF_LENGTH}]`);
  E(`MOV QWORD PTR [RBP-24], R10`);          // n
  E(`CMP R10, 2`); E(`JL ${L("done")}`);
  E(`MOV RDI, R10`); E(`SHL RDI, 3`);
  E(`CALL awts_alloc`);                       // RAX = tmp (n*8)
  E(`MOV R9, RAX`);                           // tmp
  E(`MOV R8, QWORD PTR [RBP-64]`);
  E(`ADD R8, ${OFF_ELEMS}`);                  // data base
  E(`MOV QWORD PTR [RBP-32], 1`);             // width = 1
  E(`${L("wloop")}:`);
  E(`MOV RAX, QWORD PTR [RBP-32]`);
  E(`CMP RAX, QWORD PTR [RBP-24]`); E(`JGE ${L("done")}`);
  E(`MOV QWORD PTR [RBP-40], 0`);             // lo = 0
  E(`${L("loloop")}:`);
  E(`MOV RSI, QWORD PTR [RBP-40]`);          // k = lo
  E(`CMP RSI, QWORD PTR [RBP-24]`); E(`JGE ${L("wnext")}`);
  E(`MOV RCX, RSI`); E(`ADD RCX, QWORD PTR [RBP-32]`);   // mid = lo+width
  E(`CMP RCX, QWORD PTR [RBP-24]`); E(`JL ${L("midok")}`);
  E(`MOV RCX, QWORD PTR [RBP-24]`);
  E(`${L("midok")}:`);
  E(`MOV RAX, QWORD PTR [RBP-32]`);          // hi = min(lo+2*width, n)
  E(`ADD RAX, RAX`); E(`ADD RAX, RSI`);
  E(`CMP RAX, QWORD PTR [RBP-24]`); E(`JL ${L("hiok")}`);
  E(`MOV RAX, QWORD PTR [RBP-24]`);
  E(`${L("hiok")}:`);
  E(`MOV QWORD PTR [RBP-48], RAX`);          // hi
  E(`MOV RDX, RSI`);                          // i = lo
  E(`MOV RDI, RCX`);                          // j = mid
  E(`${L("mloop")}:`);
  E(`CMP RDX, RCX`); E(`JGE ${L("drainR")}`);
  E(`CMP RDI, QWORD PTR [RBP-48]`); E(`JGE ${L("drainL")}`);
  E(`MOV RAX, QWORD PTR [R8+RDX*8]`);
  E(`MOV QWORD PTR [RBP-8], RAX`);
  E(`MOV RAX, QWORD PTR [R8+RDI*8]`);
  E(`MOV QWORD PTR [RBP-16], RAX`);
  E(`PUSH RDX`);                              // IDIV/MUL inside cmp need RDX
  if (cmp) this.emitCustomCompare(L, cmp);
  else this.emitDefaultCompare(L);
  E(`POP RDX`);
  E(`TEST RAX, RAX`);
  E(`JG ${L("takeR")}`);
  E(`${L("takeL")}:`);                        // <= 0: take left (STABLE)
  E(`MOV RAX, QWORD PTR [R8+RDX*8]`);
  E(`MOV QWORD PTR [R9+RSI*8], RAX`);
  E(`INC RDX`); E(`INC RSI`);
  E(`JMP ${L("mloop")}`);
  E(`${L("takeR")}:`);
  E(`MOV RAX, QWORD PTR [R8+RDI*8]`);
  E(`MOV QWORD PTR [R9+RSI*8], RAX`);
  E(`INC RDI`); E(`INC RSI`);
  E(`JMP ${L("mloop")}`);
  E(`${L("drainR")}:`);
  E(`CMP RDI, QWORD PTR [RBP-48]`); E(`JGE ${L("copyback")}`);
  E(`MOV RAX, QWORD PTR [R8+RDI*8]`);
  E(`MOV QWORD PTR [R9+RSI*8], RAX`);
  E(`INC RDI`); E(`INC RSI`); E(`JMP ${L("drainR")}`);
  E(`${L("drainL")}:`);
  E(`CMP RDX, RCX`); E(`JGE ${L("copyback")}`);
  E(`MOV RAX, QWORD PTR [R8+RDX*8]`);
  E(`MOV QWORD PTR [R9+RSI*8], RAX`);
  E(`INC RDX`); E(`INC RSI`); E(`JMP ${L("drainL")}`);
  E(`${L("copyback")}:`);
  E(`MOV RDX, QWORD PTR [RBP-40]`);
  E(`${L("cbloop")}:`);
  E(`CMP RDX, QWORD PTR [RBP-48]`); E(`JGE ${L("cbend")}`);
  E(`MOV RAX, QWORD PTR [R9+RDX*8]`);
  E(`MOV QWORD PTR [R8+RDX*8], RAX`);
  E(`INC RDX`); E(`JMP ${L("cbloop")}`);
  E(`${L("cbend")}:`);
  E(`MOV RAX, QWORD PTR [RBP-32]`);
  E(`ADD RAX, RAX`);
  E(`ADD QWORD PTR [RBP-40], RAX`);          // lo += 2*width
  E(`JMP ${L("loloop")}`);
  E(`${L("wnext")}:`);
  E(`MOV RAX, QWORD PTR [RBP-32]`);
  E(`SHL RAX, 1`);                            // width *= 2
  E(`MOV QWORD PTR [RBP-32], RAX`);
  E(`JMP ${L("wloop")}`);
  E(`${L("done")}:`);
  E(`MOV RAX, QWORD PTR [RBP-64]`);
  E(`OR RAX, 1`);                             // re-tag heapref
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);
};

// Shared undefined/hole prologue. Jumps to bothDef when both are defined.
// Convention: undefined sorts after every defined value (V8 SortCompare);
// holes are stored as undefined so they compact to the tail, like V8.
ArrayAsmGen.prototype.emitUndefPrologue = function (L, bothDef) {
  const E = (s) => this.emit(s);
  const adef = `${bothDef}_adef`, bothu = `${bothDef}_bothu`, done = `${bothDef}_done`;
  E(`MOV RAX, QWORD PTR [RBP-8]`);
  E(`CMP RAX, ${UNDEF}`);
  E(`JNE ${adef}`);
  E(`MOV R10, QWORD PTR [RBP-16]`);
  E(`CMP R10, ${UNDEF}`);
  E(`JE ${bothu}`);
  E(`MOV RAX, 1`); E(`JMP ${done}`);        // a undef, b defined -> take right
  E(`${adef}:`);
  E(`MOV R10, QWORD PTR [RBP-16]`);
  E(`CMP R10, ${UNDEF}`);
  E(`JNE ${bothDef}`);
  E(`MOV RAX, -1`); E(`JMP ${done}`);       // b undef -> take left
  E(`${bothu}:`);
  E(`XOR RAX, RAX`); E(`JMP ${done}`);      // both undef -> equal (stable)
  E(`${bothDef}:`);
  this._undefDone = done;
};

// Custom comparator, inlined. [RBP-8]=a, [RBP-16]=b -> RAX sign (tagged ok).
ArrayAsmGen.prototype.emitCustomCompare = function (L, cmp) {
  const bothDef = L("cboth");
  this.emitUndefPrologue(L, bothDef);
  const cx = { p0name: cmp.p0, p1name: cmp.p1, p0off: -8, p1off: -16, krbpoff: -56 };
  const saved = this.pureCx;
  this.pureCx = cx;
  try { this.expr(cmp.expr); }               // -> RAX tagged; sign decides
  finally { this.pureCx = saved; }
  this.emit(`JMP ${this._undefDone}`);
  this.emit(`${this._undefDone}:`);
};

// Default (no-comparator) sort: V8 orders elements by their decimal STRING
// form. For non-negative integers, string comparison == numeric comparison
// of the two values with the shorter right-padded with zeros to equal length,
// i.e.: let da,db be digit counts; if da>db compare floor(a/10^(da-db)) with
// b (tie -> the shorter, b, wins); if da<db compare a with floor(b/10^(db-da))
// (tie -> the shorter, a, wins); equal digits -> numeric compare. Every
// negative precedes every non-negative ("-" is 0x2D < digits); both-negative
// compares |a|,|b| with the same rule. Undefined sorts last (prologue).
ArrayAsmGen.prototype.emitDefaultCompare = function (L) {
  const E = (s) => this.emit(s);
  const bothDef = L("dboth");
  this.emitUndefPrologue(L, bothDef);
  const done = this._undefDone;
  const afirst = L("afirst"), bfirst = L("bfirst"), eq = L("eq");
  E(`MOV RAX, QWORD PTR [RBP-8]`); E(`SAR RAX, 3`);
  E(`MOV R10, QWORD PTR [RBP-16]`); E(`SAR R10, 3`);
  E(`CMP RAX, 0`); E(`JL ${L("aneg")}`);
  E(`CMP R10, 0`); E(`JL ${L("apos_bneg")}`);
  this.emitNonnegStringCompare(L, afirst, bfirst, eq, done, false);
  E(`${L("aneg")}:`);                        // a < 0
  E(`CMP R10, 0`); E(`JGE ${afirst}`);       // b >= 0 -> a first
  E(`NEG RAX`); E(`NEG R10`);                // |a|, |b| (61-bit: no overflow)
  this.emitNonnegStringCompare(L, afirst, bfirst, eq, done, true);
  E(`${L("apos_bneg")}:`); E(`MOV RAX, 1`); E(`JMP ${done}`);
  E(`${afirst}:`); E(`MOV RAX, -1`); E(`JMP ${done}`);
  E(`${bfirst}:`); E(`MOV RAX, 1`); E(`JMP ${done}`);
  E(`${eq}:`); E(`XOR RAX, RAX`);
  E(`${done}:`);
};

// Compare RAX=a_raw>=0, R10=b_raw>=0 by decimal string order.
// Clobbers RAX, R10, R11, RDX. Jumps to afirst/bfirst/eq (not done).
ArrayAsmGen.prototype.emitNonnegStringCompare = function (L, afirst, bfirst, eq, done, neg) {
  const E = (s) => this.emit(s);
  const pfx = neg ? "n" : "p";
  E(`PUSH RAX`); E(`PUSH R10`);
  this.emitDigitCount(`QWORD PTR [RSP+8]`, L);
  E(`MOV QWORD PTR [RSP+8], R11`);           // da
  this.emitDigitCount(`QWORD PTR [RSP]`, L);  // db -> R11
  E(`MOV R10, QWORD PTR [RSP+8]`);           // da
  E(`ADD RSP, 16`);
  E(`CMP R10, R11`);
  E(`JE ${L(pfx + "dig_eq")}`);
  E(`JG ${L(pfx + "da_gt")}`);
  // da < db: q = b / 10^(db-da); cmp(a, q); tie -> shorter a first.
  E(`MOV RDX, R11`); E(`SUB RDX, R10`);
  E(`MOV R11, 1`);
  E(`${L(pfx + "pow1")}:`);
  E(`TEST RDX, RDX`); E(`JZ ${L(pfx + "pow1d")}`);
  E(`IMUL R11, R11, 10`); E(`DEC RDX`); E(`JMP ${L(pfx + "pow1")}`);
  E(`${L(pfx + "pow1d")}:`);
  E(`MOV RAX, QWORD PTR [RBP-16]`); E(`SAR RAX, 3`);
  if (neg) { E(`NEG RAX`); }
  E(`XOR RDX, RDX`); E(`DIV R11`);           // RAX = q
  E(`MOV R10, QWORD PTR [RBP-8]`); E(`SAR R10, 3`);
  if (neg) { E(`NEG R10`); }
  E(`CMP R10, RAX`);
  E(`JL ${afirst}`); E(`JG ${bfirst}`); E(`JMP ${afirst}`);
  // da > db: q = a / 10^(da-db); cmp(q, b); tie -> shorter b first.
  E(`${L(pfx + "da_gt")}:`);
  E(`MOV RDX, R10`); E(`SUB RDX, R11`);
  E(`MOV R11, 1`);
  E(`${L(pfx + "pow2")}:`);
  E(`TEST RDX, RDX`); E(`JZ ${L(pfx + "pow2d")}`);
  E(`IMUL R11, R11, 10`); E(`DEC RDX`); E(`JMP ${L(pfx + "pow2")}`);
  E(`${L(pfx + "pow2d")}:`);
  E(`MOV RAX, QWORD PTR [RBP-8]`); E(`SAR RAX, 3`);
  if (neg) { E(`NEG RAX`); }
  E(`XOR RDX, RDX`); E(`DIV R11`);           // RAX = q
  E(`MOV R10, QWORD PTR [RBP-16]`); E(`SAR R10, 3`);
  if (neg) { E(`NEG R10`); }
  E(`CMP RAX, R10`);
  E(`JL ${afirst}`); E(`JG ${bfirst}`); E(`JMP ${bfirst}`);
  E(`${L(pfx + "dig_eq")}:`);
  E(`MOV RAX, QWORD PTR [RBP-8]`); E(`SAR RAX, 3`);
  E(`MOV R10, QWORD PTR [RBP-16]`); E(`SAR R10, 3`);
  E(`CMP RAX, R10`);
  E(`JL ${afirst}`); E(`JG ${bfirst}`); E(`JMP ${eq}`);
};

// R11 = decimal digit count of the raw non-negative integer at memOp.
// Clobbers RAX, R10, R11.
ArrayAsmGen.prototype.emitDigitCount = function (memOp, L) {
  const E = (s) => this.emit(s);
  const done = L(`dc_${this.labelN++}`);
  E(`MOV RAX, ${memOp}`);
  E(`MOV R11, 1`);
  for (let i = 0; i < 18; i++) {
    const t = 10n ** BigInt(i + 1); // 10 .. 10^18
    if (t <= 2147483647n) E(`CMP RAX, ${t}`);
    else { E(`MOV R10, ${t}`); E(`CMP RAX, R10`); }
    E(`JL ${done}`);
    E(`MOV R11, ${i + 2}`);
  }
  E(`${done}:`);
};

// ---------------------------------------------------------------------------
// Kernel function, statements, expressions.
// ---------------------------------------------------------------------------
ArrayAsmGen.prototype.kernelDecl = function (node) {
  // Collect locals (function-scoped). Comparators are inlined at sort sites:
  // never descend into function expressions here.
  const localNames = [], kinds = new Map(), seen = new Set(), declarators = [];
  const collect = (n) => {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression") return;
    if (n.type === "VariableDeclaration") {
      for (const d of n.declarations) {
        if (!d.id || d.id.type !== "Identifier") fail("destructuring not supported", d);
        if (!seen.has(d.id.name)) {
          seen.add(d.id.name); localNames.push(d.id.name);
          kinds.set(d.id.name, d.init && d.init.type === "ArrayExpression" ? "array" : "scalar");
          declarators.push([d.id.name, d.init]);
        }
        if (d.init) collect(d.init);
      }
      return;
    }
    for (const k of Object.keys(n)) {
      const v = n[k];
      if (Array.isArray(v)) v.forEach(collect);
      else if (v && typeof v.type === "string") collect(v);
    }
  };
  collect(node.body);
  // Fixpoint: `var b = a` / `var b = a.sort()` inherit array-ness (aliases).
  let changed = true;
  while (changed) {
    changed = false;
    for (const [nm, init] of declarators) {
      let k = null;
      if (init && init.type === "Identifier" && init.name !== nm) k = kinds.get(init.name) || null;
      else if (init && init.type === "CallExpression") {
        const c = init.callee;
        if (c && c.type === "MemberExpression" && !c.computed &&
            c.property.type === "Identifier" && c.property.name === "sort") k = "array";
      }
      if (k === "array" && kinds.get(nm) !== "array") { kinds.set(nm, "array"); changed = true; }
    }
  }
  this.locals = new Map();
  let stackBytes = 0, regIdx = 0;
  for (const nm of localNames) {
    const kind = kinds.get(nm) || "scalar";
    if (regIdx < PINNED.length) this.locals.set(nm, { kind, reg: PINNED[regIdx++] });
    else { stackBytes += 8; this.locals.set(nm, { kind, stackOff: stackBytes }); }
  }
  // 16-byte stack alignment before CALLs.
  let sub = stackBytes;
  const need = (((8 - 8 * (1 + regIdx)) % 16) + 16) % 16;
  while ((sub & 15) !== need) sub++;
  this.stackReserve = sub;
  this.pinnedCount = regIdx;
  this.loopStack = [];

  this.emit(`__merkava_kernel:`);
  this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
  const used = PINNED.slice(0, regIdx);
  for (const r of used) this.emit(`PUSH ${r}`);
  if (sub) this.emit(`SUB RSP, ${sub}`);
  const epilogue = this.lbl("epilogue");
  this.epilogue = epilogue;
  this.emitBlock(node.body);
  this.emit(`${epilogue}:`);
  if (sub) this.emit(`ADD RSP, ${sub}`);
  for (let i = used.length - 1; i >= 0; i--) this.emit(`POP ${used[i]}`);
  this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
};

ArrayAsmGen.prototype.emitMain = function () {
  this.emit(`main:`);
  this.emit(`PUSH RBP`); this.emit(`MOV RBP, RSP`);
  this.emit(`PUSH RBX`); this.emit(`PUSH R12`); this.emit(`PUSH R13`);
  // R14/R15 (heap) stay live across main — never pushed.
  if (this.repeat > 1) { this.emit(`MOV R10, ${this.repeat}`); this.emit(`$mrep:`); }
  this.emit(`CALL __merkava_kernel`);
  if (this.repeat > 1) { this.emit(`DEC R10`); this.emit(`JNZ $mrep`); }
  this.emit(`SAR RAX, 3`); // kernel returns a tagged fixnum
  this.emit(`MOV RDI, RAX`);
  this.emit(`CALL awts_print`);
  this.emit(`MOV RDI, 10`);
  this.emit(`CALL awts_putchar`);
  this.emit(`XOR RAX, RAX`);
  this.emit(`POP R13`); this.emit(`POP R12`); this.emit(`POP RBX`);
  this.emit(`MOV RSP, RBP`); this.emit(`POP RBP`); this.emit(`RET`);
};

ArrayAsmGen.prototype.kindOfInit = function (init) {
  if (!init) return "scalar";
  if (init.type === "ArrayExpression") return "array";
  if (init.type === "Identifier") {
    const l = this.locals.get(init.name);
    return l ? l.kind : "scalar";
  }
  return this.kindOfExpr(init);
};

ArrayAsmGen.prototype.kindOfExpr = function (node) {
  if (!node || typeof node.type !== "string") return "scalar";
  if (node.type === "ArrayExpression") return "array";
  if (node.type === "Identifier") {
    if (node.name === "undefined") return "scalar";
    const l = this.locals.get(node.name);
    return l ? l.kind : "scalar";
  }
  if (node.type === "CallExpression") {
    const c = node.callee;
    if (c && c.type === "MemberExpression" && !c.computed &&
        c.property.type === "Identifier" && c.object.type === "Identifier") {
      const m = c.property.name;
      if (m === "sort") return "array";
      if (m === "push" || m === "pop") return "scalar";
    }
  }
  return "scalar";
};

ArrayAsmGen.prototype.stackAddr = function (loc) {
  return `QWORD PTR [RBP-${loc.stackOff + this.pinnedCount * 8}]`;
};
ArrayAsmGen.prototype.locOf = function (name, node) {
  const loc = this.locals.get(name);
  if (!loc) fail(`undeclared variable '${name}'`, node);
  return loc;
};
ArrayAsmGen.prototype.loadLoc = function (loc) {
  if (loc.reg) { if (loc.reg !== "RAX") this.emit(`MOV RAX, ${loc.reg}`); }
  else this.emit(`MOV RAX, ${this.stackAddr(loc)}`);
};
ArrayAsmGen.prototype.storeLoc = function (loc) {
  if (loc.reg) this.emit(`MOV ${loc.reg}, RAX`);
  else this.emit(`MOV ${this.stackAddr(loc)}, RAX`);
};
ArrayAsmGen.prototype.storeLocByName = function (name, node) {
  this.storeLoc(this.locOf(name, node));
};
ArrayAsmGen.prototype.loadArrayBase = function (objNode) {
  if (!objNode || objNode.type !== "Identifier") fail("array base must be an identifier", objNode);
  const loc = this.locOf(objNode.name, objNode);
  if (loc.kind !== "array") fail(`'${objNode.name}' is not an array`, objNode);
  this.loadLoc(loc);
};

// RAX = idx tagged, R11 = heapref tagged -> RCX = raw idx, or -1 if bad.
ArrayAsmGen.prototype.emitNormIdxToRCX = function () {
  const bad = this.lbl("idxbad"), done = this.lbl("idxdone");
  this.emit(`TEST RAX, 7`);
  this.emit(`JNZ ${bad}`);
  this.emit(`MOV RCX, RAX`);
  this.emit(`SAR RCX, 3`);
  this.emit(`JMP ${done}`);
  this.emit(`${bad}:`);
  this.emit(`MOV RCX, -1`);
  this.emit(`${done}:`);
};
// R11 = heapref tagged, RCX = raw idx or -1 -> RAX = tagged value | UNDEF.
ArrayAsmGen.prototype.emitCheckedRead = function () {
  const done = this.lbl("rdone");
  this.emit(`MOV RAX, ${UNDEF}`);
  this.emit(`CMP RCX, 0`);
  this.emit(`JL ${done}`);
  this.emit(`MOV R10, R11`); this.emit(`XOR R10, 1`);
  this.emit(`CMP RCX, QWORD PTR [R10+${OFF_LENGTH}]`);
  this.emit(`JGE ${done}`);
  this.emit(`MOV RAX, QWORD PTR [R10+RCX*8+${OFF_ELEMS}]`);
  this.emit(`${done}:`);
};

// ---------------- statements ----------------
ArrayAsmGen.prototype.emitBlock = function (node) {
  if (!node || node.type !== "BlockStatement") fail("expected block", node);
  for (const s of node.body || []) this.statement(s);
};
ArrayAsmGen.prototype.stmtInPlace = function (node) {
  if (node.type === "BlockStatement") { this.emitBlock(node); return; }
  this.statement(node);
};

ArrayAsmGen.prototype.statement = function (node) {
  switch (node.type) {
    case "VariableDeclaration":
      for (const d of node.declarations) this.initLoc(this.locOf(d.id.name, d), d.init);
      return;
    case "ExpressionStatement":
      this.exprVoid(node.expression);
      return;
    case "ReturnStatement":
      if (node.argument) this.expr(node.argument);
      else this.emit(`MOV RAX, 0`);
      this.emit(`JMP ${this.epilogue}`);
      return;
    case "IfStatement": {
      const els = this.lbl("else"), end = this.lbl("endif");
      this.condJump(node.test, els, false);
      this.stmtInPlace(node.consequent);
      if (node.alternate) {
        this.emit(`JMP ${end}`); this.emit(`${els}:`);
        this.stmtInPlace(node.alternate); this.emit(`${end}:`);
      } else this.emit(`${els}:`);
      return;
    }
    case "WhileStatement": {
      const top = this.lbl("while"), end = this.lbl("wend");
      this.loopStack.push({ breakLbl: end, contLbl: top });
      this.emit(`${top}:`);
      this.condJump(node.test, end, false);
      this.stmtInPlace(node.body);
      this.emit(`JMP ${top}`);
      this.emit(`${end}:`);
      this.loopStack.pop();
      return;
    }
    case "ForStatement": {
      const top = this.lbl("for"), step = this.lbl("fstep"), end = this.lbl("fend");
      if (node.init) {
        if (node.init.type === "VariableDeclaration") {
          for (const d of node.init.declarations)
            this.initLoc(this.locOf(d.id.name, d), d.init || { type: "Literal", value: 0 });
        } else this.exprVoid(node.init);
      }
      this.loopStack.push({ breakLbl: end, contLbl: step });
      this.emit(`${top}:`);
      if (node.test) this.condJump(node.test, end, false);
      this.stmtInPlace(node.body);
      this.emit(`${step}:`);
      if (node.update) this.exprVoid(node.update);
      this.emit(`JMP ${top}`);
      this.emit(`${end}:`);
      this.loopStack.pop();
      return;
    }
    case "ForOfStatement": {
      // for (var v of arr) — arr: identifier, array local. Index hidden on stack.
      if (!node.left || node.left.type !== "VariableDeclaration" ||
          node.left.declarations.length !== 1 ||
          node.left.declarations[0].id.type !== "Identifier")
        fail("for-of needs 'for (var v of arr)'", node);
      const vloc = this.locOf(node.left.declarations[0].id.name, node.left);
      if (!node.right || node.right.type !== "Identifier")
        fail("for-of over an identifier only", node);
      const aloc = this.locOf(node.right.name, node.right);
      if (aloc.kind !== "array") fail("for-of over non-array", node.right);
      const top = this.lbl("forof"), cont = this.lbl("fofcont"), brk = this.lbl("fofbrk");
      this.emit(`XOR R10, R10`); this.emit(`PUSH R10`); // hidden raw index
      this.loopStack.push({ breakLbl: brk, contLbl: cont });
      this.emit(`${top}:`);
      this.loadLoc(aloc); // base reloaded each iteration (body may grow it)
      this.emit(`XOR RAX, 1`);
      this.emit(`MOV R10, QWORD PTR [RSP]`);
      this.emit(`CMP R10, QWORD PTR [RAX+${OFF_LENGTH}]`);
      this.emit(`JGE ${brk}`);
      this.emit(`MOV RAX, QWORD PTR [RAX+R10*8+${OFF_ELEMS}]`);
      this.storeLoc(vloc);
      this.stmtInPlace(node.body);
      this.emit(`${cont}:`);
      this.emit(`MOV R10, QWORD PTR [RSP]`);
      this.emit(`INC R10`);
      this.emit(`MOV QWORD PTR [RSP], R10`);
      this.emit(`JMP ${top}`);
      this.emit(`${brk}:`);
      this.emit(`ADD RSP, 8`);
      this.loopStack.pop();
      return;
    }
    case "BreakStatement": {
      const l = this.loopStack[this.loopStack.length - 1];
      if (!l) fail("break outside loop", node);
      this.emit(`JMP ${l.breakLbl}`);
      return;
    }
    case "ContinueStatement": {
      const l = this.loopStack[this.loopStack.length - 1];
      if (!l) fail("continue outside loop", node);
      this.emit(`JMP ${l.contLbl}`);
      return;
    }
    case "BlockStatement": this.emitBlock(node); return;
    default: fail(`statement ${node.type} not supported`, node);
  }
};

ArrayAsmGen.prototype.initLoc = function (loc, initNode) {
  if (!initNode) {
    if (loc.reg) this.emit(`MOV ${loc.reg}, 0`);
    else this.emit(`MOV ${this.stackAddr(loc)}, 0`);
    return;
  }
  const k = this.kindOfInit(initNode);
  if (k === "array") loc.kind = "array";
  if (loc.kind === "array") {
    if (k !== "array") fail("array local requires an array value", initNode);
    this.expr(initNode); // RAX = heapref
    this.storeLoc(loc);
    return;
  }
  if (k === "array") fail("cannot store an array into scalar local", initNode);
  if (initNode.type === "Literal" && typeof initNode.value === "number" &&
      Number.isInteger(initNode.value)) {
    const t = tagFixnum(initNode.value);
    if (loc.reg) { this.emit(`MOV ${loc.reg}, ${t}`); return; }
    this.emit(`MOV RAX, ${t}`);
    this.emit(`MOV ${this.stackAddr(loc)}, RAX`);
    return;
  }
  this.expr(initNode);
  this.storeLoc(loc);
};

// ---------------- expressions ----------------
// Every expression value is a tagged value in RAX.
// Scratch: RAX, R10, R11, RCX (RDX additionally clobbered by IDIV/MUL).
// RDI/RSI are never scratch (argument registers).
ArrayAsmGen.prototype.exprVoid = function (node) {
  if (node.type === "CallExpression") { this.methodCall(node, false); return; }
  if (node.type === "UpdateExpression" &&
      (node.operator === "++" || node.operator === "--")) {
    this.updateExpr(node, false);
    return;
  }
  if (node.type === "AssignmentExpression") {
    this.assignExpr(node, false);
    return;
  }
  this.expr(node);
};

ArrayAsmGen.prototype.expr = function (node) {
  switch (node.type) {
    case "Literal": {
      if (typeof node.value !== "number" || !Number.isInteger(node.value))
        fail(`only integer literals, got ${JSON.stringify(node.value)}`, node);
      this.emit(`MOV RAX, ${tagFixnum(node.value)}`);
      return;
    }
    case "Identifier": {
      if (this.pureCx) { this.emitPureIdent(node); return; }
      if (node.name === "undefined" && !this.locals.has(node.name)) {
        this.emit(`MOV RAX, ${UNDEF}`); return;
      }
      this.loadLoc(this.locOf(node.name, node));
      return;
    }
    case "ArrayExpression":
      if (this.pureCx) fail("array literal in comparator", node);
      this.emitArrayLit(node);
      return;
    case "MemberExpression": {
      if (this.pureCx) { this.pureMember(node); return; }
      if (node.computed) {
        this.expr(node.property);          // RAX = idx
        this.emit(`PUSH RAX`);
        this.loadArrayBase(node.object);   // RAX = heapref
        this.emit(`MOV R11, RAX`);
        this.emit(`POP RAX`);
        this.emitNormIdxToRCX();
        this.emitCheckedRead();
        return;
      }
      if (node.property.type === "Identifier" && node.property.name === "length") {
        this.loadArrayBase(node.object);
        this.emit(`XOR RAX, 1`);
        this.emit(`MOV RAX, QWORD PTR [RAX+${OFF_LENGTH}]`);
        this.emit(`SHL RAX, 3`);
        return;
      }
      fail("only a[i] and a.length supported", node);
      return;
    }
    case "BinaryExpression": this.binary(node); return;
    case "LogicalExpression": this.logical(node); return;
    case "AssignmentExpression": this.assignExpr(node, true); return;
    case "UpdateExpression": this.updateExpr(node, true); return;
    case "UnaryExpression": {
      const op = node.operator;
      if (op === "-") { this.expr(node.argument); this.emit(`NEG RAX`); return; }
      if (op === "+") { this.expr(node.argument); return; }
      if (op === "~") {
        this.expr(node.argument);
        // ~x == -x-1 (no NOT mnemonic in the assembler)
        this.emit(`SAR RAX, 3`); this.emit(`NEG RAX`); this.emit(`SUB RAX, 1`);
        this.emit(`SHL RAX, 3`);
        return;
      }
      if (op === "!") {
        this.expr(node.argument);
        const chk = this.lbl("notchk"), tru = this.lbl("nottrue"), done = this.lbl("notdone");
        this.emit(`TEST RAX, RAX`);
        this.emit(`JNZ ${chk}`);
        this.emit(`JMP ${tru}`);                             // 0 -> true
        this.emit(`${chk}:`);
        this.emit(`CMP RAX, ${UNDEF}`);
        this.emit(`JE ${tru}`);                              // undefined -> true
        this.emit(`XOR RAX, RAX`);                            // else false
        this.emit(`JMP ${done}`);
        this.emit(`${tru}:`);
        this.emit(`MOV RAX, 8`);                              // tagged true
        this.emit(`${done}:`);
        return;
      }
      fail(`unary ${op} not supported`, node);
      return;
    }
    case "CallExpression": this.methodCall(node, true); return;
    case "ConditionalExpression": {
      const els = this.lbl("celse"), end = this.lbl("cend");
      this.condJump(node.test, els, false);
      this.expr(node.consequent);
      this.emit(`JMP ${end}`);
      this.emit(`${els}:`);
      this.expr(node.alternate);
      this.emit(`${end}:`);
      return;
    }
    default:
      fail(`expression ${node.type} not supported`, node);
  }
};

// Array literal -> RAX = heapref. Holes stored as undefined.
ArrayAsmGen.prototype.emitArrayLit = function (node) {
  const els = node.elements || [];
  for (const el of els) {
    if (el !== null && el.type === "SpreadElement") fail("spread not supported", el);
  }
  this.emit(`MOV RDI, ${els.length}`);
  this.emit(`CALL awts_array_alloc`);
  this.emit(`PUSH RAX`);
  this.emit(`MOV R10, RAX`); this.emit(`XOR R10, 1`);
  this.emit(`PUSH R10`); // [RSP] = untagged base
  els.forEach((el, i) => {
    const disp = OFF_ELEMS + 8 * i;
    if (el === null) {
      this.emit(`MOV R10, QWORD PTR [RSP]`);
      this.emit(`MOV QWORD PTR [R10+${disp}], ${UNDEF}`);
    } else {
      this.expr(el); // RAX (element exprs use R10/R11 scratch freely)
      this.emit(`MOV R10, QWORD PTR [RSP]`);
      this.emit(`MOV QWORD PTR [R10+${disp}], RAX`);
    }
  });
  this.emit(`MOV R10, QWORD PTR [RSP]`);
  this.emit(`MOV QWORD PTR [R10+${OFF_LENGTH}], ${els.length}`);
  this.emit(`ADD RSP, 8`);
  this.emit(`POP RAX`); // heapref
};

// a.length = n  (L is the MemberExpression)
ArrayAsmGen.prototype.emitLengthSet = function (objNode, rhsNode) {
  this.expr(rhsNode);                       // RAX = newlen tagged
  this.emit(`PUSH RAX`);
  this.loadArrayBase(objNode);               // RAX = heapref
  this.emit(`MOV RDI, RAX`);
  this.emit(`MOV RSI, QWORD PTR [RSP]`);
  this.emit(`CALL awts_array_len_set`);     // RAX = heapref
  this.storeLocByName(objNode.name, objNode);
  this.emit(`MOV RAX, QWORD PTR [RSP]`);
  this.emit(`ADD RSP, 8`);
};

// a[i] = v  (memNode is the MemberExpression)
ArrayAsmGen.prototype.emitIndexSet = function (memNode, rhsNode) {
  this.loadArrayBase(memNode.object);        // RAX = heapref
  this.emit(`MOV RDI, RAX`);
  this.expr(memNode.property);               // RAX = idx
  this.emit(`PUSH RAX`);
  this.expr(rhsNode);                        // RAX = v
  this.emit(`PUSH RAX`);
  this.emit(`MOV RDX, QWORD PTR [RSP]`);
  this.emit(`MOV RSI, QWORD PTR [RSP+8]`);
  const bad = this.lbl("sidxbad"), ok = this.lbl("sidxok");
  this.emit(`TEST RSI, 7`);
  this.emit(`JNZ ${bad}`);
  this.emit(`SAR RSI, 3`);
  this.emit(`JMP ${ok}`);
  this.emit(`${bad}:`);
  this.emit(`MOV RSI, -1`);
  this.emit(`${ok}:`);
  this.emit(`CALL awts_array_set`);          // RDI/RSI/RDX -> RAX heapref
  this.storeLocByName(memNode.object.name, memNode);
  this.emit(`MOV RAX, QWORD PTR [RSP]`);     // expression value = v
  this.emit(`ADD RSP, 16`);
};

// a[i]++/a[i]--  (prefix/postfix value semantics; UNDEF propagates)
ArrayAsmGen.prototype.emitElemUpdate = function (memNode, delta, prefix) {
  this.expr(memNode.property);               // RAX = idx
  this.emit(`PUSH RAX`);
  this.loadArrayBase(memNode.object);
  this.emit(`MOV R11, RAX`);                 // R11 = heapref
  this.emit(`MOV RAX, QWORD PTR [RSP]`);
  this.emitNormIdxToRCX();
  this.emitCheckedRead();                    // RAX = old
  if (!prefix) this.emit(`PUSH RAX`);        // save old for postfix value
  const isundef = this.lbl("uundef"), doneop = this.lbl("udone");
  this.emit(`CMP RAX, ${UNDEF}`);
  this.emit(`JE ${isundef}`);
  this.emit(delta > 0 ? `ADD RAX, 8` : `SUB RAX, 8`);
  this.emit(`JMP ${doneop}`);
  this.emit(`${isundef}:`);
  this.emit(`MOV RAX, ${UNDEF}`);
  this.emit(`${doneop}:`);
  this.emit(`MOV RDX, RAX`);                 // new
  this.emit(`MOV RSI, RCX`);
  this.emit(`MOV RDI, R11`);
  this.emit(`PUSH RDX`);
  this.emit(`CALL awts_array_set`);
  this.emit(`POP RDX`);
  this.storeLocByName(memNode.object.name, memNode);
  if (prefix) { this.emit(`MOV RAX, RDX`); this.emit(`ADD RSP, 8`); }
  else { this.emit(`POP RAX`); this.emit(`ADD RSP, 8`); }
};

// a[i] op= v  (UNDEF propagates; value = new). JS evaluation order: a, i, v.
ArrayAsmGen.prototype.emitElemCompound = function (memNode, bop, rhsNode) {
  this.expr(memNode.property);               // RAX = idx
  this.emit(`PUSH RAX`);
  this.expr(rhsNode);                        // RAX = rhs
  this.emit(`PUSH RAX`);
  this.loadArrayBase(memNode.object);
  this.emit(`MOV R11, RAX`);                 // R11 = heapref
  this.emit(`MOV RAX, QWORD PTR [RSP+8]`);   // idx
  this.emitNormIdxToRCX();
  this.emitCheckedRead();                    // RAX = old
  const isundef = this.lbl("cundef"), doneop = this.lbl("cdone");
  this.emit(`CMP RAX, ${UNDEF}`);
  this.emit(`JE ${isundef}`);
  this.emit(`MOV R10, QWORD PTR [RSP]`);     // rhs
  if (bop === "<<" || bop === ">>" || bop === ">>>") {
    if (!isIntLiteral(rhsNode)) fail("variable shift not supported", rhsNode);
    this.emitShiftOp(bop, ((rhsNode.value % 64) + 64) % 64);
  } else this.arithOp(bop, rhsNode);
  this.emit(`JMP ${doneop}`);
  this.emit(`${isundef}:`);
  this.emit(`MOV RAX, ${UNDEF}`);
  this.emit(`${doneop}:`);
  this.emit(`MOV RDX, RAX`);
  this.emit(`MOV RSI, RCX`);
  this.emit(`MOV RDI, R11`);
  this.emit(`PUSH RDX`);
  this.emit(`CALL awts_array_set`);
  this.emit(`POP RDX`);
  this.storeLocByName(memNode.object.name, memNode);
  this.emit(`MOV RAX, RDX`);
  this.emit(`ADD RSP, 16`);
};

ArrayAsmGen.prototype.assignExpr = function (node, wantValue) {
  const op = node.operator;
  const L = node.left;
  if (op === "=") {
    if (L.type === "Identifier") {
      const loc = this.locOf(L.name, L);
      const rk = this.kindOfExpr(node.right);
      if (rk === "array") loc.kind = "array";
      else if (loc.kind === "array" && rk !== "array") fail(`cannot assign non-array to '${L.name}'`, node);
      this.expr(node.right);
      this.storeLoc(loc);
      return;
    }
    if (L.type === "MemberExpression" && L.computed) { this.emitIndexSet(L, node.right); return; }
    if (L.type === "MemberExpression" && !L.computed &&
        L.property.type === "Identifier" && L.property.name === "length") {
      this.emitLengthSet(L.object, node.right); return;
    }
    fail("bad lvalue", node);
  }
  const bop = op.slice(0, -1);
  if (!["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^"].includes(bop))
    fail(`assignment ${op} not supported`, node);
  if (L.type === "Identifier") {
    const loc = this.locOf(L.name, L);
    if (loc.kind === "array") fail(`compound assignment on array '${L.name}'`, node);
    this.loadLoc(loc);                       // RAX = old
    this.emit(`PUSH RAX`);
    this.expr(node.right);                   // RAX = rhs
    this.emit(`MOV R10, RAX`);
    this.emit(`POP RAX`);                    // RAX = old, R10 = rhs
    if (bop === "<<" || bop === ">>" || bop === ">>>") {
      if (!isIntLiteral(node.right)) fail("variable shift not supported", node.right);
      this.emitShiftOp(bop, ((node.right.value % 64) + 64) % 64);
    } else this.arithOp(bop, node);
    this.storeLoc(loc);
    return; // RAX = value
  }
  if (L.type === "MemberExpression" && L.computed) { this.emitElemCompound(L, bop, node.right); return; }
  fail("bad lvalue", node);
};

ArrayAsmGen.prototype.updateExpr = function (node, wantValue) {
  const delta = node.operator === "++" ? 1 : node.operator === "--" ? -1 : fail("bad update", node);
  const arg = node.argument;
  if (arg.type === "MemberExpression" && arg.computed) {
    this.emitElemUpdate(arg, delta, !!node.prefix);
    if (!wantValue) { /* value in RAX discarded */ }
    return;
  }
  if (arg.type !== "Identifier") fail("bad update target", arg);
  const loc = this.locOf(arg.name, arg);
  if (loc.kind === "array") fail(`update on array '${arg.name}'`, arg);
  const ins = delta > 0 ? "ADD" : "SUB";
  if (loc.reg) {
    const r = loc.reg;
    if (node.prefix) {
      this.emit(`${ins} ${r}, 8`);
      if (wantValue && r !== "RAX") this.emit(`MOV RAX, ${r}`);
      else if (!wantValue) { /* discarded */ }
      if (wantValue && r === "RAX") { /* RAX already new */ }
    } else {
      if (r !== "RAX") this.emit(`MOV RAX, ${r}`);
      this.emit(`${ins} ${r}, 8`);
    }
    return;
  }
  this.loadLoc(loc);                         // RAX = old
  if (!node.prefix) this.emit(`PUSH RAX`);
  this.emit(`${ins} RAX, 8`);
  this.storeLoc(loc);
  if (!node.prefix) this.emit(`POP RAX`);
};

// a.push(v) / a.pop() / a.sort([cmp]) — wantValue: expression value needed.
ArrayAsmGen.prototype.methodCall = function (node, wantValue) {
  const cal = node.callee;
  if (!cal || cal.type !== "MemberExpression" || cal.computed ||
      cal.object.type !== "Identifier" || cal.property.type !== "Identifier")
    fail("only a.push/a.pop/a.sort method calls supported", node);
  const objName = cal.object.name, m = cal.property.name;
  const loc = this.locOf(objName, cal);
  if (loc.kind !== "array") fail(`'${m}' on non-array '${objName}'`, cal);
  const args = node.arguments || [];
  if (m === "push" && args.length === 1) {
    this.loadLoc(loc); this.emit(`MOV RDI, RAX`);
    this.expr(args[0]); this.emit(`MOV RSI, RAX`);
    this.emit(`CALL awts_array_push`);       // RAX = heapref, RDX = tagged len
    this.storeLoc(loc);
    if (wantValue) this.emit(`MOV RAX, RDX`);
    return;
  }
  if (m === "pop" && args.length === 0) {
    this.loadLoc(loc); this.emit(`MOV RDI, RAX`);
    this.emit(`CALL awts_array_pop`);        // RAX = heapref, RDX = val|UNDEF
    this.storeLoc(loc);
    if (wantValue) this.emit(`MOV RAX, RDX`);
    return;
  }
  if (m === "sort" && args.length <= 1) {
    let cmp = null;
    const arg = args[0];
    if (arg && !(arg.type === "Identifier" && arg.name === "undefined")) {
      const src = this.jsSource || "";
      const resolve = (name) => {
        const l = this.locals.get(name);
        return l ? (l.kind === "array" ? "array" : "scalar") : null;
      };
      cmp = tryCompileComparator(arg, resolve);
      if (!cmp) {
        const snippet = src && arg.start !== undefined ? src.slice(arg.start, arg.end) : "?";
        throw new NotCompilableError(
          `sort comparator must be a pure (x,y)=>expr or function(x,y){return expr}; ` +
          `got: ${snippet.slice(0, 80)} — route to interpreter slow path`);
      }
      cmp.key = src && arg.start !== undefined ? src.slice(arg.start, arg.end) : `anon${this.sortSpecs.size}`;
    }
    const label = this.sortLabelFor(cmp);
    this.loadLoc(loc); this.emit(`MOV RDI, RAX`);
    this.emit(`MOV RSI, RBP`);
    this.emit(`CALL ${label}`);              // RAX = heapref
    this.storeLoc(loc);
    return; // RAX = the array
  }
  fail(`array method '${m}' not supported`, cal);
};

// ---------------- binary ops, comparisons, conditions ----------------
// Simple operand: {text} for reg, or {isImm, text: tagged, tagFits32,
// rawText, rawValue} for integer literals. Immediates are tagged for
// +,-,&,|,^ and comparisons (tag-transparent); raw for * (IMUL form).
ArrayAsmGen.prototype.simpleOperand = function (node) {
  if (node.type === "Literal" && typeof node.value === "number" && Number.isInteger(node.value)) {
    const raw = BigInt(node.value);
    if (raw < INT64_MIN || raw > INT64_MAX) return null;
    const tag = raw * 8n;
    return {
      isImm: true, text: String(tag), tagFits32: tag >= -2147483648n && tag <= 2147483647n,
      rawText: String(raw), rawValue: raw,
      immFits32Raw: raw >= -2147483648n && raw <= 2147483647n,
    };
  }
  if (node.type === "Identifier" && !this.pureCx) {
    const loc = this.locals.get(node.name);
    if (loc && loc.reg) return { text: loc.reg };
  }
  return null;
};

// RAX = left tagged, R10 = right tagged -> RAX tagged. No shifts here.
ArrayAsmGen.prototype.arithOp = function (op, node) {
  switch (op) {
    case "+": this.emit(`ADD RAX, R10`); return;
    case "-": this.emit(`SUB RAX, R10`); return;
    case "*": this.emit(`IMUL RAX, R10`); this.emit(`SAR RAX, 3`); return;
    case "/":
      this.emit(`SAR RAX, 3`);
      this.emit(`MOV R11, R10`); this.emit(`SAR R11, 3`);
      this.emit(`CQO`); this.emit(`IDIV R11`);
      this.emit(`SHL RAX, 3`); return;
    case "%":
      this.emit(`SAR RAX, 3`);
      this.emit(`MOV R11, R10`); this.emit(`SAR R11, 3`);
      this.emit(`CQO`); this.emit(`IDIV R11`);
      this.emit(`MOV RAX, RDX`); this.emit(`SHL RAX, 3`); return;
    case "&": this.emit(`AND RAX, R10`); return;
    case "|": this.emit(`OR RAX, R10`); return;
    case "^": this.emit(`XOR RAX, R10`); return;
    default: fail(`arith op ${op}`, node);
  }
};

// RAX = tagged value; constant shift k (already mod 64).
ArrayAsmGen.prototype.emitShiftOp = function (bop, k) {
  if (bop === "<<") { this.emit(`SHL RAX, ${k}`); return; }
  if (bop === ">>") {
    this.emit(`SAR RAX, 3`); this.emit(`SAR RAX, ${k}`); this.emit(`SHL RAX, 3`); return;
  }
  // >>> : ToUint32(x) >>> k == floor(ToUint32(x) / 2^k) (no SHR mnemonic).
  // NB: AND r64, imm32 sign-extends, so the 0xFFFFFFFF mask needs a register.
  this.emit(`SAR RAX, 3`);
  this.emit(`MOV R10, 4294967295`); this.emit(`AND RAX, R10`);
  this.emit(`MOV R10, ${2n ** BigInt(k)}`);
  this.emit(`XOR RDX, RDX`); this.emit(`DIV R10`);
  this.emit(`SHL RAX, 3`);
};

// RAX = n (raw signed) -> RAX = n % d (raw). d > 1, d <= 2^31-1.
// Barrett: q = mulhi(|n|, mu), r = |n| - q*d, corrected; sign of n reapplied.
ArrayAsmGen.prototype.barrettModRaw = function (d) {
  const mu = (1n << 64n) / d;
  const corr = this.lbl("bcorr"), cdone = this.lbl("bcdone");
  this.emit(`MOV R11, RAX`);
  this.emit(`SAR R11, 63`);
  this.emit(`XOR RAX, R11`);
  this.emit(`SUB RAX, R11`);
  this.emit(`PUSH RAX`);
  this.emit(`MOV R10, ${mu}`);
  this.emit(`MUL R10`);
  this.emit(`IMUL R10, RDX, ${d}`);
  this.emit(`POP RAX`);
  this.emit(`SUB RAX, R10`);
  this.emit(`${corr}:`);
  this.emit(`CMP RAX, ${d}`);
  this.emit(`JL ${cdone}`);
  this.emit(`SUB RAX, ${d}`);
  this.emit(`JMP ${corr}`);
  this.emit(`${cdone}:`);
  this.emit(`XOR RAX, R11`);
  this.emit(`SUB RAX, R11`);
};

// JS value semantics for &&/|| with undefined-aware truthiness.
// (The parser emits these as BinaryExpression; LogicalExpression too.)
ArrayAsmGen.prototype.logical = function (node) {
  const end = this.lbl("logic");
  this.expr(node.left);
  this.emit(`TEST RAX, RAX`);
  if (node.operator === "&&") {
    this.emit(`JZ ${end}`);        // falsy -> keep left
    this.emit(`CMP RAX, ${UNDEF}`);
    this.emit(`JE ${end}`);        // undefined -> keep left
  } else if (node.operator === "||") {
    const rhs = this.lbl("lrhs");
    this.emit(`JZ ${rhs}`);        // 0 -> falsy -> evaluate rhs
    this.emit(`CMP RAX, ${UNDEF}`);
    this.emit(`JE ${rhs}`);        // undefined -> falsy -> evaluate rhs
    this.emit(`JMP ${end}`);       // truthy -> keep left value
    this.emit(`${rhs}:`);
  } else fail(`logical ${node.operator}`, node);
  this.expr(node.right);
  this.emit(`${end}:`);
};

ArrayAsmGen.prototype.binary = function (node) {
  const op = node.operator;
  if (op === "&&" || op === "||") { this.logical(node); return; }
  if (CMP_OPS[op]) {
    const info = CMP_OPS[op];
    const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
    if (l && r && !(l.isImm && r.isImm) &&
        (!l.isImm || l.tagFits32) && (!r.isImm || r.tagFits32)) {
      if (!l.isImm) { this.emit(`CMP ${l.text}, ${r.text}`); this.emit(`${info.set} AL`); }
      else {
        const flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=", "===": "===", "!==": "!==" };
        const finfo = CMP_OPS[flip[op]];
        this.emit(`CMP ${r.text}, ${l.text}`); this.emit(`${finfo.set} AL`);
      }
      this.emit(`MOVZX RAX, AL`);
      this.emit(`SHL RAX, 3`); // tagged boolean
      return;
    }
    this.expr(node.left);
    this.emit(`PUSH RAX`);
    this.expr(node.right);
    this.emit(`MOV R10, RAX`);
    this.emit(`POP RAX`);
    this.emit(`CMP RAX, R10`);
    this.emit(`${info.set} AL`);
    this.emit(`MOVZX RAX, AL`);
    this.emit(`SHL RAX, 3`);
    return;
  }
  if ((op === "<<" || op === ">>" || op === ">>>")) {
    if (!isIntLiteral(node.right)) fail(`variable ${op} not supported`, node);
    const k = ((node.right.value % 64) + 64) % 64;
    this.expr(node.left);
    this.emitShiftOp(op, k);
    return;
  }
  const MOP = { "+": "ADD", "-": "SUB", "*": "IMUL", "&": "AND", "|": "OR", "^": "XOR" };
  const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
  // x * imm: IMUL on raw imm — tagged result directly.
  if (op === "*" && r && r.isImm) {
    this.expr(node.left);
    if (r.immFits32Raw) this.emit(`IMUL RAX, ${r.rawText}`);
    else { this.emit(`MOV R10, ${r.rawText}`); this.emit(`IMUL RAX, R10`); }
    return;
  }
  if (op === "*" && l && l.isImm && ["+", "*", "&", "|", "^"].includes(op)) {
    this.expr(node.right);
    if (l.immFits32Raw) this.emit(`IMUL RAX, ${l.rawText}`);
    else { this.emit(`MOV R10, ${l.rawText}`); this.emit(`IMUL RAX, R10`); }
    return;
  }
  // +,-,&,|,^ with immediate: tagged immediate.
  if (MOP[op] && op !== "*" && r && r.isImm) {
    this.expr(node.left);
    if (r.tagFits32) this.emit(`${MOP[op]} RAX, ${r.text}`);
    else { this.emit(`MOV R10, ${r.text}`); this.emit(`${MOP[op]} RAX, R10`); }
    return;
  }
  if (MOP[op] && op !== "*" && l && l.isImm && ["+", "&", "|", "^"].includes(op)) {
    this.expr(node.right);
    if (l.tagFits32) this.emit(`${MOP[op]} RAX, ${l.text}`);
    else { this.emit(`MOV R10, ${l.text}`); this.emit(`${MOP[op]} RAX, R10`); }
    return;
  }
  // / and %: untag, divide, retag. Constant % -> Barrett (remainder);
  // constant / -> IDIV (quotient; Barrett-division not implemented).
  if (op === "/" || op === "%") {
    if (r && r.isImm && r.rawValue !== 0n) {
      const d = r.rawValue < 0n ? -r.rawValue : r.rawValue;
      this.expr(node.left);
      this.emit(`SAR RAX, 3`);
      if (op === "%") {
        if (d === 1n) this.emit(`XOR RAX, RAX`);
        else if (d <= 2147483647n) this.barrettModRaw(d);
        else {
          this.emit(`MOV R10, ${r.rawText}`);
          this.emit(`CQO`); this.emit(`IDIV R10`);
          this.emit(`MOV RAX, RDX`);
        }
      } else {
        this.emit(`MOV R10, ${r.rawText}`);
        this.emit(`CQO`); this.emit(`IDIV R10`); // truncates toward zero
      }
      this.emit(`SHL RAX, 3`);
      return;
    }
    this.expr(node.left);
    this.emit(`PUSH RAX`);
    this.expr(node.right);
    this.emit(`MOV R10, RAX`);
    this.emit(`POP RAX`);
    this.emit(`SAR RAX, 3`);
    this.emit(`MOV R11, R10`); this.emit(`SAR R11, 3`);
    this.emit(`CQO`); this.emit(`IDIV R11`);
    if (op === "%") this.emit(`MOV RAX, RDX`);
    this.emit(`SHL RAX, 3`);
    return;
  }
  if (!MOP[op]) fail(`binary op ${op} not supported`, node);
  // General: left -> RAX, push, right -> R10, pop.
  this.expr(node.left);
  this.emit(`PUSH RAX`);
  this.expr(node.right);
  this.emit(`MOV R10, RAX`);
  this.emit(`POP RAX`);
  this.arithOp(op, node);
};

// Jump to lbl when the condition is (wantTrue ? true : false).
// Falsy = tagged 0 or undefined; comparisons fuse into jumps.
ArrayAsmGen.prototype.condJump = function (node, lbl, wantTrue) {
  if (node.type === "BinaryExpression" && CMP_OPS[node.operator]) {
    const info = CMP_OPS[node.operator];
    const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
    if (l && r && !(l.isImm && r.isImm) &&
        (!l.isImm || l.tagFits32) && (!r.isImm || r.tagFits32)) {
      if (!l.isImm) {
        this.emit(`CMP ${l.text}, ${r.text}`);
        this.emit(`${wantTrue ? info.jt : info.jf} ${lbl}`);
      } else {
        const flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=", "===": "===", "!==": "!==" };
        const finfo = CMP_OPS[flip[node.operator]];
        this.emit(`CMP ${r.text}, ${l.text}`);
        this.emit(`${wantTrue ? finfo.jt : finfo.jf} ${lbl}`);
      }
      return;
    }
    this.expr(node.left);
    this.emit(`PUSH RAX`);
    this.expr(node.right);
    this.emit(`MOV R10, RAX`);
    this.emit(`POP RAX`);
    this.emit(`CMP RAX, R10`);
    this.emit(`${wantTrue ? info.jt : info.jf} ${lbl}`);
    return;
  }
  if (node.type === "UnaryExpression" && node.operator === "!") {
    this.condJump(node.argument, lbl, !wantTrue);
    return;
  }
  this.expr(node); // RAX tagged; falsy = 0 or undefined
  const isfalsy = this.lbl("isfalsy"), done = this.lbl("tval");
  this.emit(`TEST RAX, RAX`);
  this.emit(`JZ ${isfalsy}`);
  this.emit(`CMP RAX, ${UNDEF}`);
  this.emit(`JE ${isfalsy}`);
  if (wantTrue) this.emit(`JMP ${lbl}`); // truthy and wanted true -> jump
  this.emit(`JMP ${done}`);
  this.emit(`${isfalsy}:`);
  if (!wantTrue) this.emit(`JMP ${lbl}`); // falsy and wanted false -> jump
  this.emit(`${done}:`);
};

// ---------------- pure-comparator support ----------------
// Identifier in pure (comparator) context: params live in the sort helper's
// frame; enclosing locals are either pinned regs or reached via the saved
// kernel RBP (cx.krbpoff).
ArrayAsmGen.prototype.emitPureIdent = function (node) {
  const cx = this.pureCx, name = node.name;
  if (name === "undefined") { this.emit(`MOV RAX, ${UNDEF}`); return; }
  if (name === cx.p0name) { this.emit(`MOV RAX, QWORD PTR [RBP${cx.p0off}]`); return; }
  if (name === cx.p1name) { this.emit(`MOV RAX, QWORD PTR [RBP${cx.p1off}]`); return; }
  const loc = this.locals.get(name);
  if (!loc) fail(`unknown identifier '${name}' in comparator`, node);
  if (loc.reg) { if (loc.reg !== "RAX") this.emit(`MOV RAX, ${loc.reg}`); return; }
  const off = loc.stackOff + this.pinnedCount * 8;
  this.emit(`MOV R11, QWORD PTR [RBP${cx.krbpoff}]`);
  this.emit(`MOV RAX, QWORD PTR [R11-${off}]`);
};

// MemberExpression in pure context: a.length or a[i] (bounds-checked).
ArrayAsmGen.prototype.pureMember = function (node) {
  const cx = this.pureCx;
  if (!node.object || node.object.type !== "Identifier") fail("bad member base in comparator", node);
  const loc = this.locals.get(node.object.name);
  if (!loc || loc.kind !== "array") fail(`'${node.object.name}' is not an array`, node.object);
  const loadBaseToR11 = () => {
    if (loc.reg) this.emit(`MOV R11, ${loc.reg}`);
    else {
      const off = loc.stackOff + this.pinnedCount * 8;
      this.emit(`MOV R11, QWORD PTR [RBP${cx.krbpoff}]`);
      this.emit(`MOV R11, QWORD PTR [R11-${off}]`);
    }
  };
  if (!node.computed) {
    loadBaseToR11();
    this.emit(`XOR R11, 1`);
    this.emit(`MOV RAX, QWORD PTR [R11+${OFF_LENGTH}]`);
    this.emit(`SHL RAX, 3`);
    return;
  }
  this.expr(node.property); // RAX = idx (pure)
  this.emit(`PUSH RAX`);
  loadBaseToR11();
  this.emit(`POP RAX`);
  this.emitNormIdxToRCX();
  this.emitCheckedRead();
};

// ---------------- entry points ----------------
const requireForParser = createRequire(import.meta.url);

/**
 * Transpile array-subset JS to portable x86_64 assembly.
 */
export async function transpileArrayJsToAsm(jsSource, entry, opts) {
  const Parser = await requireForParser("../../MerkavaASTParser/parser-core.js");
  const program = new Parser(String(jsSource)).parse();
  const g = new ArrayAsmGen();
  g.jsSource = String(jsSource);
  return { asm: g.compileProgram(program, entry || null, opts || {}) };
}

/**
 * Compile array-subset JS straight to a native binary.
 * Mirrors compileJsToNativeAsm(jsSource, entry=null, opts={repeat}).
 */
export async function compileJsToNativeArrayAsm(jsSource, entry, opts) {
  const t0 = Date.now();
  const { asm } = await transpileArrayJsToAsm(jsSource, entry, opts);
  const out = await compileNativeAsm(asm, "linux-x64-static");
  const compileMs = Date.now() - t0;
  const { chmodSync, mkdirSync, writeFileSync } = await import("fs");
  const { tmpdir } = await import("os");
  const { join } = await import("path");
  const WORK = join(tmpdir(), "merkava-js-native");
  mkdirSync(WORK, { recursive: true });
  const path = join(WORK, `arr${process.pid}_${Date.now() % 1000000}`);
  writeFileSync(path, Buffer.from(out.bytes));
  chmodSync(path, 0o755);
  return { path, asm, compileMs };
}
