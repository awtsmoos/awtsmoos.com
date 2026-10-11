// B"H
// Merkava JS -> Native, NATIVE TIER v2 STREAM 5/8: NATIVE OBJECTS (dynamic shape).
//
// Dynamic heap objects with runtime shapes (hidden classes), inline caches,
// shape transitions, prototype chain, accessors, delete, `in`, Object.keys,
// and method calls.
//
// CONFORMS TO Stream 1's OBJECT_MODEL.md / value-model.js (single source of
// truth). All tag constants, type ids, header layout, and immediates are
// imported from ./value-model.js -- never re-derived. The import is static so
// a missing module fails LOUD at load time (no silent fallback).
//
//   tags: 000=fixnum61, 001=heapref, 010=double, 011=smallstr, 100=immediate
//   heap types: 1=string, 2=array, 3=object, 4=double, 5=closure, 7=sparse,
//               8=shape. 16-byte header [type u32, flags u32, meta u64].
//   object: meta = shape ptr, payload = N tagged values inline at +16.
//   shape:  meta = count N, payload = N x heapref name + N x u32 slot.
//   immediates: undefined=0, null=1, true=2, false=3, NaN=4, hole=5.
//
// Allocation: Stream 2's heap.js via __awtsmoos_alloc_raw (S1-header-exact).
// Transitions RELOCATE the object (S1 payload is inline); emitters perform
// writeback to the base after a relocating set/delete/defineProperty.
//
// v2.0 is data-only per S1 (getters/setters/prototypes are deferred there).
// This stream needs prototype-chain lookup and correct accessors, so those
// live in RUNTIME-SIDE tables (proto_map, acc_map) -- the heap itself stays
// 100% S1-pure (a GC walking it per OBJECT_MODEL.md never misreads a word).
// __proto__ is NEVER added to a shape: slow paths intercept the name.
//
// Inline caches: one 24-byte .data cell per get/set site:
//   [cachedShapePtr, cachedSlot, kind]   kind 0 = data (fast), else slow.
// Fast path: tag check -> shape compare -> kind check -> direct indexed load.
// Miss -> __ob2_get_slow / __ob2_set_slow (fill the cell on data hits).
//
// Subset notes: property keys are identifier/string/integer-literal (interned
// at codegen); `==`/`!=` are rejected (use ===); `/` is truncating; `/` or `%`
// by zero traps; arithmetic overflow traps (no silent wraparound; the
// arithmetic stream owns double-boxing); method call on a non-function traps
// (V8 would throw -- no exceptions here); get on a non-object traps.

import { createRequire } from "module";
import { compileNativeAsm } from "../native/compiler.js";
import { heapAsm } from "./heap.js";
import {
  TAG_FIXNUM, TAG_HEAPREF, TAG_DOUBLE, TAG_SMALLSTR, TAG_IMM, TAG_MASK,
  FIXNUM_MIN, FIXNUM_MAX, fixnum, fixnumValue,
  IMM_UNDEFINED, IMM_NULL, IMM_TRUE, IMM_FALSE, IMM_NAN, IMM_HOLE,
  imm, V_UNDEFINED, V_NULL, V_TRUE, V_FALSE, V_NAN, V_HOLE,
  heapref, heapPtr,
  smallString, smallStringLength, SSO_MAX_UNITS,
  HEADER_SIZE, TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT, TYPE_DOUBLE,
  TYPE_CLOSURE, TYPE_BUFFER, TYPE_SPARSE_ARRAY, TYPE_SHAPE,
} from "./value-model.js";

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// S1-derived numeric constants for embedding as immediates.
// ---------------------------------------------------------------------------
const V_UNDEF = Number(V_UNDEFINED); // 4
const V_NUL = Number(V_NULL);        // 8
const V_TRU = Number(V_TRUE);        // 20
const V_FLS = Number(V_FALSE);       // 28
const V_NN = Number(V_NAN);          // 36
const V_HLE = Number(V_HOLE);        // 44

const T_STR = TYPE_STRING;   // 1
const T_ARR = TYPE_ARRAY;    // 2
const T_OBJ = TYPE_OBJECT;   // 3
const T_DBL = TYPE_DOUBLE;   // 4
const T_CLO = TYPE_CLOSURE;  // 5
const T_SHP = TYPE_SHAPE;    // 8

// Shape payload: names[i] at +16+8*i (heapref), slots[i] at +16+8*N+4*i (u32).
// Object payload: values[i] at +16+8*i. Array: meta=(len<<32)|cap, elems at +16.
// String: meta=lenUnits, units at +16. Closure: meta=code.

const PINNED = ["RBX", "R12", "R13", "R14", "R15"]; // callee-saved tagged locals
const ARG_REGS = ["RDI", "RSI", "RDX", "RCX", "R8", "R9"];
const TRANS_CAP = 2048;   // transition cache entries (static .data)
const PROTO_CAP = 256;    // proto map entries (static .data)
const ACC_CAP = 256;      // accessor map entries (static .data)

function fail(msg, node) {
  const where = node && node.start !== undefined ? ` at offset ${node.start}` : "";
  throw new Error(`jsObj: ${msg}${where}`);
}

// 8 little-endian byte values for one qword (assembler stores numerics 1 byte each).
function dq(v) {
  let n = BigInt(v);
  if (n < 0) n += 1n << 64n;
  const out = [];
  for (let i = 0; i < 8; i++) { out.push(String((n >> BigInt(i * 8)) & 0xffn)); }
  return out.join(",");
}
function zb(n) { return new Array(n).fill("0").join(","); }
function escStr(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }

// UTF-16LE byte list (as decimal byte strings) for a JS string, padded to 8.
function utf16Bytes(s) {
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    const u = s.charCodeAt(i);
    bytes.push(String(u & 0xff), String((u >> 8) & 0xff));
  }
  while (bytes.length % 8) bytes.push("0");
  return bytes;
}

const CMP_OPS = {
  "<": "SETL", "<=": "SETLE", ">": "SETG", ">=": "SETGE",
};

// ===========================================================================
// ObjAsmGen: S1 tagged-value codegen.
// ===========================================================================
class ObjAsmGen {
  fail(msg, node) { fail(msg, node); }
  constructor() {
    this.lines = [];
    this.dataLines = [];
    this.labelN = 0;
    this.functions = new Map();   // name -> {node, synthetic}
    this.fnOrder = [];
    this.locals = new Map();
    this.loopStack = [];
    this.interns = new Map();     // name -> id
    this.internList = [];
    this.icCount = 0;
    this.stackReserve = 0;
    this.pinnedCount = 0;
    this.usesThis = false;
    this.thisSlot = 0;
    this.fnValueNames = [];       // function names materialized as closures
  }
  emit(s) { this.lines.push(s); }
  emitData(s) { this.dataLines.push(s); }
  lbl(p) { return `$ob2_${p}_${this.labelN++}`; }
  intern(name) {
    let id = this.interns.get(name);
    if (id === undefined) { id = this.internList.length; this.interns.set(name, id); this.internList.push(name); }
    return id;
  }
  icCell() { return this.icCount++; }
  keyId(node) {
    // Property key -> interned name id. Supports Identifier, string Literal,
    // and integer Literal (V8: o[1] === o["1"]).
    if (node.type === "Identifier") return this.intern(node.name);
    if (node.type === "Literal") {
      if (typeof node.value === "string") return this.intern(node.value);
      if (typeof node.value === "number" && Number.isInteger(node.value)) return this.intern(String(node.value));
    }
    fail("only identifier/string/integer-literal property keys supported", node);
  }
  fnValue(name) {
    if (!this.fnValueNames.includes(name)) this.fnValueNames.push(name);
  }

  run(program, entry) {
    if (!program || program.type !== "Program") fail("expected Program node");
    // Reserve the ids the runtime itself needs before user code interns names.
    this.intern("__proto__");
    this.intern("[object Object]");
    this.intern("length");
    this.intern("value");
    this.intern("get");
    this.intern("set");
    this.intern("number");
    this.intern("string");
    this.intern("boolean");
    this.intern("undefined");
    this.intern("object");
    this.intern("function");
    this.intern("hasOwnProperty");
    this.intern("toString");
    this.intern("valueOf");
    this.intern("propertyIsEnumerable");
    const fns = [], rest = [];
    for (const stmt of program.body || []) (stmt.type === "FunctionDeclaration" ? fns : rest).push(stmt);
    let effEntry = entry;
    if (rest.length) {
      if (effEntry) fail("entry provided but program has top-level statements", rest[0]);
      for (const s of rest) {
        if (!["VariableDeclaration", "ExpressionStatement", "IfStatement", "WhileStatement",
              "ForStatement", "ReturnStatement", "BlockStatement", "BreakStatement",
              "ContinueStatement"].includes(s.type)) fail(`top-level ${s.type} not supported`, s);
      }
      const bodyStmts = rest.slice();
      const last = bodyStmts[bodyStmts.length - 1];
      if (last && last.type === "ExpressionStatement") {
        bodyStmts[bodyStmts.length - 1] = { type: "ReturnStatement", argument: last.expression };
      }
      const kernel = {
        type: "FunctionDeclaration",
        id: { type: "Identifier", name: "__obj_kernel" },
        params: [],
        body: { type: "BlockStatement", body: bodyStmts },
      };
      fns.push(kernel);
      effEntry = { name: "__obj_kernel", args: [] };
    }
    if (!effEntry) fail("no entry and no top-level statements");
    for (const stmt of fns) {
      if (stmt.type !== "FunctionDeclaration") fail(`top-level ${stmt.type} not supported`, stmt);
      if (!stmt.id || !stmt.id.name) fail("anonymous functions not supported", stmt);
      if (this.functions.has(stmt.id.name)) fail(`duplicate function '${stmt.id.name}'`, stmt);
      this.functions.set(stmt.id.name, { node: stmt, synthetic: false });
      this.fnOrder.push(stmt.id.name);
    }
    if (this.repeatOverride && effEntry) effEntry = { ...effEntry, repeat: this.repeatOverride };
    // Codegen: user functions first (collects interns, IC cells, fn exprs).
    for (const name of this.fnOrder) this.functionDecl(name, this.functions.get(name).node);
    // Synthetic FunctionExpression bodies discovered during codegen.
    for (let i = 0; i < this.fnOrder.length; i++) {
      const name = this.fnOrder[i];
      const rec = this.functions.get(name);
      if (rec.synthetic && !rec.emitted) { rec.emitted = true; this.functionDecl(name, rec.node); }
    }
    emitObjRuntime(this);
    emitMain(this, effEntry);
    emitDataSection(this);
    const mine = [`; B"H - S5 data`, `.data`, ...this.dataLines,
                  `; B"H - S5 code`, `.code`, ...this.lines].join("\n");
    return `${heapAsm()}\n${mine}\n`;
  }

  // ---- function frames ----
  usesThisIn(node) {
    let found = false;
    const walk = (n) => {
      if (!n || found || typeof n.type !== "string") return;
      if (n.type === "FunctionDeclaration" || n.type === "FunctionExpression") return; // boundary
      if (n.type === "ThisExpression") { found = true; return; }
      for (const k of Object.keys(n)) {
        const v = n[k];
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v.type === "string") walk(v);
      }
    };
    walk(node.body);
    return found;
  }

  functionDecl(name, node) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) fail(`bad function name '${name}'`, node);
    const params = node.params || [];
    if (params.length > 6) fail("max 6 params supported", node);
    for (const p of params) if (p.type !== "Identifier") fail("only simple params", p);
    const seen = new Set(params.map(p => p.name));
    const localNames = [];
    const collect = (n) => {
      if (!n || typeof n.type !== "string") return;
      if (n.type === "VariableDeclaration") {
        for (const d of n.declarations) {
          if (d.id.type !== "Identifier") fail("destructuring not supported", d);
          if (!seen.has(d.id.name)) { seen.add(d.id.name); localNames.push(d.id.name); }
          if (d.init) collect(d.init);
        }
        return;
      }
      if (n.type === "FunctionDeclaration" || n.type === "FunctionExpression") return;
      for (const k of Object.keys(n)) {
        const v = n[k];
        if (Array.isArray(v)) v.forEach(collect);
        else if (v && typeof v.type === "string") collect(v);
      }
    };
    collect(node.body);
    this.locals = new Map();
    const allNames = [...params.map(p => p.name), ...localNames];
    let stackBytes = 0, regIdx = 0;
    for (const nm of allNames) {
      if (regIdx < PINNED.length) this.locals.set(nm, { reg: PINNED[regIdx++] });
      else { stackBytes += 8; this.locals.set(nm, { stackOff: stackBytes }); }
    }
    this.usesThis = this.usesThisIn(node);
    if (this.usesThis) { stackBytes += 8; this.thisSlot = stackBytes; }
    // Pad so RSP is 16-aligned after the prologue (CALLs inside stay aligned).
    while ((8 * regIdx + stackBytes) % 16 !== 0) stackBytes += 8;
    this.stackReserve = stackBytes;
    this.pinnedCount = regIdx;
    this.loopStack = [];

    this.emit(`${name}:`);
    this.emit(`PUSH RBP`);
    this.emit(`MOV RBP, RSP`);
    const usedPinned = PINNED.slice(0, regIdx);
    for (const r of usedPinned) this.emit(`PUSH ${r}`);
    if (stackBytes) this.emit(`SUB RSP, ${stackBytes}`);
    if (this.usesThis) this.emit(`MOV QWORD PTR [RBP-${this.thisSlot + usedPinned.length * 8}], R11`);
    params.forEach((p, i) => {
      const loc = this.locals.get(p.name);
      if (loc.reg) { if (ARG_REGS[i] !== loc.reg) this.emit(`MOV ${loc.reg}, ${ARG_REGS[i]}`); }
      else this.emit(`MOV QWORD PTR [RBP-${loc.stackOff + usedPinned.length * 8}], ${ARG_REGS[i]}`);
    });
    const epilogue = this.lbl("epilogue");
    this.epilogue = epilogue;
    this.emitBlock(node.body);
    // Fall off the end -> return undefined.
    this.emit(`MOV RAX, ${V_UNDEF}`);
    this.emit(`${epilogue}:`);
    if (stackBytes) this.emit(`ADD RSP, ${stackBytes}`);
    for (let i = usedPinned.length - 1; i >= 0; i--) this.emit(`POP ${usedPinned[i]}`);
    this.emit(`MOV RSP, RBP`);
    this.emit(`POP RBP`);
    this.emit(`RET`);
  }

  stackAddr(loc) { return `QWORD PTR [RBP-${loc.stackOff + this.pinnedCount * 8}]`; }
  locOf(name, node) {
    const loc = this.locals.get(name);
    if (!loc) fail(`undeclared variable '${name}'`, node);
    return loc;
  }
  loadLoc(loc) {
    if (loc.reg) { if (loc.reg !== "RAX") this.emit(`MOV RAX, ${loc.reg}`); }
    else this.emit(`MOV RAX, ${this.stackAddr(loc)}`);
  }
  storeLoc(loc) {
    if (loc.reg) this.emit(`MOV ${loc.reg}, RAX`);
    else this.emit(`MOV ${this.stackAddr(loc)}, RAX`);
  }

  // ---- statements ----
  emitBlock(node) {
    if (!node || node.type !== "BlockStatement") fail("expected block", node);
    for (const s of node.body || []) this.statement(s);
  }
  stmtInPlace(node) {
    if (node.type === "BlockStatement") { this.emitBlock(node); return; }
    this.statement(node);
  }
  statement(node) {
    switch (node.type) {
      case "VariableDeclaration":
        for (const d of node.declarations) {
          const loc = this.locOf(d.id.name, d);
          if (d.init) { this.expr(d.init); this.storeLoc(loc); }
          else { this.emit(`MOV RAX, ${V_UNDEF}`); this.storeLoc(loc); }
        }
        return;
      case "ExpressionStatement": this.exprVoid(node.expression); return;
      case "ReturnStatement":
        if (node.argument) this.expr(node.argument);
        else this.emit(`MOV RAX, ${V_UNDEF}`);
        this.emit(`JMP ${this.epilogue}`);
        return;
      case "IfStatement": {
        const elseLbl = this.lbl("else"), endLbl = this.lbl("endif");
        this.condJump(node.test, elseLbl, false);
        this.stmtInPlace(node.consequent);
        if (node.alternate) {
          this.emit(`JMP ${endLbl}`); this.emit(`${elseLbl}:`);
          this.stmtInPlace(node.alternate); this.emit(`${endLbl}:`);
        } else this.emit(`${elseLbl}:`);
        return;
      }
      case "WhileStatement": {
        const top = this.lbl("while"), end = this.lbl("wend");
        this.loopStack.push({ breakLbl: end, contLbl: top });
        this.emit(`${top}:`);
        this.condJump(node.test, end, false);
        this.stmtInPlace(node.body);
        this.emit(`JMP ${top}`); this.emit(`${end}:`);
        this.loopStack.pop();
        return;
      }
      case "ForStatement": {
        const top = this.lbl("for"), step = this.lbl("fstep"), end = this.lbl("fend");
        if (node.init) {
          if (node.init.type === "VariableDeclaration") {
            for (const d of node.init.declarations) {
              const loc = this.locOf(d.id.name, d);
              if (d.init) { this.expr(d.init); this.storeLoc(loc); }
              else { this.emit(`XOR RAX, RAX`); this.storeLoc(loc); }
            }
          } else this.exprVoid(node.init);
        }
        this.loopStack.push({ breakLbl: end, contLbl: step });
        this.emit(`${top}:`);
        if (node.test) this.condJump(node.test, end, false);
        this.stmtInPlace(node.body);
        this.emit(`${step}:`);
        if (node.update) this.exprVoid(node.update);
        this.emit(`JMP ${top}`); this.emit(`${end}:`);
        this.loopStack.pop();
        return;
      }
      case "BreakStatement": {
        const l = this.loopStack[this.loopStack.length - 1];
        if (!l) fail("break outside loop", node);
        this.emit(`JMP ${l.breakLbl}`); return;
      }
      case "ContinueStatement": {
        const l = this.loopStack[this.loopStack.length - 1];
        if (!l) fail("continue outside loop", node);
        this.emit(`JMP ${l.contLbl}`); return;
      }
      case "BlockStatement": this.emitBlock(node); return;
      default: fail(`statement ${node.type} not supported`, node);
    }
  }

  // ---- S1 truthiness (§13) ----
  // RAX = tagged value on entry. Jumps to falsyLbl iff the value is falsy:
  //   fixnum 0 | false/null/undefined/NaN | "" (smallstr len 0 or heap len 0)
  //   | double ±0/NaN. Everything else (incl. all objects/arrays) is truthy.
  emitTruthyTest(falsyLbl) {
    const t = this.lbl("tt");
    this.emit(`MOV R11, RAX`);
    this.emit(`AND R11, 7`);
    this.emit(`JZ ${t}_fix`);
    this.emit(`CMP R11, ${TAG_IMM}`);
    this.emit(`JE ${t}_imm`);
    this.emit(`CMP R11, ${TAG_SMALLSTR}`);
    this.emit(`JE ${t}_ss`);
    this.emit(`CMP R11, ${TAG_DOUBLE}`);
    this.emit(`JE ${t}_dbl`);
    // heapref: only strings can be falsy (length 0); flags u32 is always 0.
    this.emit(`MOV R11, RAX`);
    this.emit(`AND R11, -8`);
    this.emit(`MOV R10, [R11]`);
    this.emit(`CMP R10, ${T_STR}`);
    this.emit(`JNE ${t}_tru`);
    this.emit(`MOV R10, [R11+8]`);
    this.emit(`TEST R10, R10`);
    this.emit(`JZ ${falsyLbl}`);
    this.emit(`JMP ${t}_tru`);
    this.emit(`${t}_fix:`);
    this.emit(`TEST RAX, RAX`);
    this.emit(`JZ ${falsyLbl}`);
    this.emit(`JMP ${t}_tru`);
    this.emit(`${t}_imm:`);
    this.emit(`CMP RAX, ${V_TRU}`);
    this.emit(`JNE ${falsyLbl}`);
    this.emit(`JMP ${t}_tru`);
    this.emit(`${t}_ss:`);
    this.emit(`TEST RAX, ${3 << 3}`);
    this.emit(`JZ ${falsyLbl}`);
    this.emit(`JMP ${t}_tru`);
    this.emit(`${t}_dbl:`);
    this.emit(`MOV R11, RAX`);
    this.emit(`AND R11, -8`);
    this.emit(`MOV R11, [R11+16]`);   // f64 bits as integer
    this.emit(`SHL R11, 1`);
    this.emit(`JZ ${falsyLbl}`);       // ±0
    this.emit(`MOV R10, R11`);
    this.emit(`SHR R10, 53`);          // exponent to low bits
    this.emit(`CMP R10, 2047`);        // 0x7FF
    this.emit(`JNE ${t}_tru`);         // normal nonzero -> truthy
    this.emit(`SHL R11, 11`);          // mantissa to top
    this.emit(`JZ ${t}_tru`);          // Inf -> truthy
    this.emit(`JMP ${falsyLbl}`);      // NaN -> falsy
    this.emit(`${t}_tru:`);
  }

  // Jump to lbl when (truthy == wantTrue).
  condJump(node, lbl, wantTrue) {
    if (node.type === "UnaryExpression" && node.operator === "!") {
      this.condJump(node.argument, lbl, !wantTrue); return;
    }
    this.expr(node); // RAX = tagged value
    if (wantTrue) {
      const f = this.lbl("falsy");
      this.emitTruthyTest(f);
      this.emit(`JMP ${lbl}`);
      this.emit(`${f}:`);
    } else {
      this.emitTruthyTest(lbl);
    }
  }

  // Materialize a boolean immediate from a SETcc condition.
  emitBoolFromCmp(setcc) {
    const t = this.lbl("bt"), d = this.lbl("bd");
    this.emit(`${setcc} AL`);
    this.emit(`MOVZX RAX, AL`);
    this.emit(`CMP RAX, 1`);
    this.emit(`JE ${t}`);
    this.emit(`MOV RAX, ${V_FLS}`);
    this.emit(`JMP ${d}`);
    this.emit(`${t}:`);
    this.emit(`MOV RAX, ${V_TRU}`);
    this.emit(`${d}:`);
  }

  // Load an interned string (heapref) for id into RAX.
  loadStrRef(id) {
    this.emit(`LEA R10, [ob2_strtab]`);
    this.emit(`MOV RAX, [R10+${id * 8}]`);
  }

  exprVoid(node) {
    if (node.type === "UpdateExpression" && (node.operator === "++" || node.operator === "--")) {
      if (node.argument.type !== "Identifier") fail("only identifier ++/-- in void context", node);
      const loc = this.locOf(node.argument.name, node);
      const delta = node.operator === "++" ? 8 : -8; // fixnum tags: +/-1 == +/-8
      if (loc.reg) this.emit(`${delta > 0 ? "ADD" : "SUB"} ${loc.reg}, 8`);
      else { this.loadLoc(loc); this.emit(`${delta > 0 ? "ADD" : "SUB"} RAX, 8`); this.storeLoc(loc); }
      return;
    }
    this.expr(node);
  }

  hasCall(node) {
    if (!node || typeof node.type !== "string") return false;
    if (node.type === "CallExpression") return true;
    return Object.keys(node).some(k => {
      const v = node[k];
      if (Array.isArray(v)) return v.some(x => x && typeof x.type === "string" && this.hasCall(x));
      return v && typeof v.type === "string" && this.hasCall(v);
    });
  }

  // Compile expression, result (S1 tagged) in RAX.
  expr(node) {
    switch (node.type) {
      case "Literal": {
        if (typeof node.value === "number") {
          if (!Number.isInteger(node.value)) fail("only integer number literals (doubles deferred)", node);
          const bi = BigInt(node.value);
          if (bi < FIXNUM_MIN || bi > FIXNUM_MAX) fail("fixnum61 range exceeded", node);
          this.emit(`MOV RAX, ${bi * 8n}`);
          return;
        }
        if (typeof node.value === "string") {
          const s = node.value;
          if (s.length <= SSO_MAX_UNITS) {
            // Small string: inline immediate, no allocation.
            this.emit(`MOV RAX, ${smallString(s)}`);
          } else {
            this.loadStrRef(this.intern(s));
          }
          return;
        }
        if (typeof node.value === "boolean") {
          this.emit(`MOV RAX, ${node.value ? V_TRU : V_FLS}`);
          return;
        }
        if (node.value === null) { this.emit(`MOV RAX, ${V_NUL}`); return; }
        fail(`literal ${typeof node.value} not supported`, node);
        return;
      }
      case "Identifier": {
        if (node.name === "undefined") { this.emit(`MOV RAX, ${V_UNDEF}`); return; }
        const rec = this.functions.get(node.name);
        if (rec && !this.locals.get(node.name)) {
          // Function used as a value -> materialize the closure.
          this.fnValue(node.name);
          this.emit(`LEA R10, [ob2_fntab]`);
          this.emit(`MOV RAX, [R10+${this.fnValueNames.indexOf(node.name) * 8}]`);
          return;
        }
        this.loadLoc(this.locOf(node.name, node));
        return;
      }
      case "ThisExpression": {
        if (!this.usesThis) fail("this used but not spilled", node);
        this.emit(`MOV RAX, QWORD PTR [RBP-${this.thisSlot + this.pinnedCount * 8}]`);
        return;
      }
      case "ObjectExpression": emitObjLit(this, node); return;
      case "FunctionExpression": {
        const synth = `ob2_fnx_${this.labelN++}`;
        const params = node.params || [];
        this.functions.set(synth, { node: { ...node, id: { type: "Identifier", name: synth } }, synthetic: true });
        this.fnOrder.push(synth);
        this.fnValue(synth);
        // The closure is created at init; but the index is only known after
        // all fnValues are collected... use a runtime lookup by code address.
        // Simpler: create it here via runtime call.
        this.emit(`LEA RDI, [${synth}]`);
        this.emit(`CALL __ob2_make_closure`);
        return; // RAX = tagged closure
      }
      case "MemberExpression": {
        if (node.computed) { emitComputedGet(this, node); return; }
        if (node.object.type === "Super") fail("super not supported", node);
        const prop = node.property.type === "Identifier" ? node.property.name : fail("bad property", node);
        if (prop === "length") { emitLengthGet(this, node.object); return; }
        emitPropGet(this, node.object, this.intern(prop));
        return;
      }
      case "UnaryExpression": {
        const op = node.operator;
        if (op === "-") { this.expr(node.argument); this.emit(`NEG RAX`); return; }
        if (op === "+") { this.expr(node.argument); return; }
        if (op === "~") { this.expr(node.argument); this.emit(`SAR RAX, 3`); this.emit(`NOT RAX`); this.emit(`SHL RAX, 3`); return; }
        if (op === "!") {
          this.expr(node.argument);
          const f = this.lbl("notf"), d = this.lbl("notd");
          this.emitTruthyTest(f);
          this.emit(`MOV RAX, ${V_FLS}`);
          this.emit(`JMP ${d}`);
          this.emit(`${f}:`);
          this.emit(`MOV RAX, ${V_TRU}`);
          this.emit(`${d}:`);
          return;
        }
        if (op === "delete") {
          if (node.argument.type !== "MemberExpression") fail("delete only supports member expressions", node);
          emitDelete(this, node.argument);
          return;
        }
        if (op === "typeof") { emitTypeof(this, node.argument); return; }
        fail(`unary ${op} not supported`, node);
        return;
      }
      case "BinaryExpression": this.binary(node); return;
      case "AssignmentExpression": {
        const op = node.operator;
        if (!["=", "+=", "-=", "*="].includes(op)) fail(`assignment ${op} not supported`, node);
        if (node.left.type === "MemberExpression") {
          emitMemberAssign(this, node.left, node.right, op === "=" ? null : op.slice(0, -1));
          return;
        }
        if (node.left.type !== "Identifier") fail("bad lvalue", node);
        const loc = this.locOf(node.left.name, node.left);
        if (op === "=") { this.expr(node.right); this.storeLoc(loc); return; }
        this.loadLoc(loc);
        this.emit(`SUB RSP, 16`);
        this.emit(`MOV [RSP], RAX`);
        this.expr(node.right);
        this.emit(`MOV R10, RAX`);
        this.emit(`MOV RAX, [RSP]`);
        this.emit(`ADD RSP, 16`);
        this.taggedArith(op.slice(0, -1), node);
        this.storeLoc(loc);
        return;
      }
      case "UpdateExpression": {
        if (node.argument.type !== "Identifier") fail("only identifier ++/-- supported", node);
        const loc = this.locOf(node.argument.name, node.argument);
        const isInc = node.operator === "++";
        if (!node.prefix) this.loadLoc(loc);           // old value -> RAX
        if (loc.reg) {
          if (node.prefix) {
            this.emit(`${isInc ? "ADD" : "SUB"} ${loc.reg}, 8`);
            this.emit(`MOV RAX, ${loc.reg}`);
          } else this.emit(`${isInc ? "ADD" : "SUB"} ${loc.reg}, 8`);
        } else {
          if (node.prefix) { this.loadLoc(loc); this.emit(`${isInc ? "ADD" : "SUB"} RAX, 8`); this.storeLoc(loc); }
          else {
            this.emit(`SUB RSP, 16`); this.emit(`MOV [RSP], RAX`);
            this.emit(`${isInc ? "ADD" : "SUB"} RAX, 8`); this.storeLoc(loc);
            this.emit(`MOV RAX, [RSP]`); this.emit(`ADD RSP, 16`);
          }
        }
        return;
      }
      case "CallExpression": this.callExpr(node); return;
      case "ConditionalExpression": {
        const elseLbl = this.lbl("celse"), endLbl = this.lbl("cend");
        this.condJump(node.test, elseLbl, false);
        this.expr(node.consequent);
        this.emit(`JMP ${endLbl}`);
        this.emit(`${elseLbl}:`);
        this.expr(node.alternate);
        this.emit(`${endLbl}:`);
        return;
      }
      default: fail(`expression ${node.type} not supported`, node);
    }
  }

  // RAX = left (tagged), R10 = right (tagged) -> RAX = result (tagged).
  // Fixnum-only; overflow traps LOUD (no silent wraparound per S1 §3; the
  // arithmetic stream owns double-boxing). Division is truncating; / or % by
  // zero traps.
  taggedArith(op, node) {
    const ovf = this.lbl("ovf");
    switch (op) {
      case "+": this.emit(`ADD RAX, R10`); this.emit(`JO ${ovf}`); this.emit(`JMP ${ovf}_d`); break;
      case "-": this.emit(`SUB RAX, R10`); this.emit(`JO ${ovf}`); this.emit(`JMP ${ovf}_d`); break;
      case "*":
        this.emit(`SAR R10, 3`);
        this.emit(`IMUL RAX, R10`);
        this.emit(`JO ${ovf}`); this.emit(`JMP ${ovf}_d`); break;
      case "/": {
        // Truncating division. Trap on zero divisor or MIN/-1 overflow.
        const dz = this.lbl("dz");
        this.emit(`TEST R10, R10`);
        this.emit(`JE ${dz}`);
        this.emit(`SAR RAX, 3`); this.emit(`SAR R10, 3`);
        this.emit(`CMP RAX, ${FIXNUM_MIN}`);
        this.emit(`JNE ${dz}_ok`);
        this.emit(`CMP R10, -1`);
        this.emit(`JE ${ovf}`);
        this.emit(`${dz}_ok:`);
        this.emit(`CQO`); this.emit(`IDIV R10`); this.emit(`SHL RAX, 3`);
        this.emit(`JMP ${ovf}_d`);
        this.emit(`${dz}:`);
        this.emit(`CALL __ob2_trap`);
        break;
      }
      case "%": {
        const dz = this.lbl("dz");
        this.emit(`TEST R10, R10`);
        this.emit(`JE ${dz}`);
        this.emit(`SAR RAX, 3`); this.emit(`SAR R10, 3`);
        this.emit(`CQO`); this.emit(`IDIV R10`); this.emit(`MOV RAX, RDX`); this.emit(`SHL RAX, 3`);
        this.emit(`JMP ${ovf}_d`);
        this.emit(`${dz}:`);
        this.emit(`CALL __ob2_trap`);
        break;
      }
      case "&": this.emit(`AND RAX, R10`); return;
      case "|": this.emit(`OR RAX, R10`); return;
      case "^": this.emit(`XOR RAX, R10`); return;
      default: fail(`arith op ${op}`, node);
    }
    this.emit(`${ovf}:`);
    this.emit(`CALL __ob2_trap`);
    this.emit(`${ovf}_d:`);
  }

  binary(node) {
    const op = node.operator;
    if (op === "in") {
      if (node.left.type !== "Literal" ||
          !(typeof node.left.value === "string" ||
            (typeof node.left.value === "number" && Number.isInteger(node.left.value))))
        fail("'in' requires a string/integer literal left operand", node);
      const id = this.keyId(node.left);
      emitIn(this, node.right, id);
      return;
    }
    if (op === "==" || op === "!=") fail(`operator ${op} not supported (use ===)`, node);
    if (op === "===" || op === "!==") { emitStrictEq(this, node); return; }
    if (CMP_OPS[op]) {
      // Fixnum comparison -> boolean immediate.
      this.expr(node.left);
      this.emit(`SUB RSP, 16`);
      this.emit(`MOV [RSP], RAX`);
      this.expr(node.right);
      this.emit(`MOV R10, RAX`);
      this.emit(`MOV RAX, [RSP]`);
      this.emit(`ADD RSP, 16`);
      this.emit(`CMP RAX, R10`);
      this.emitBoolFromCmp(CMP_OPS[op]);
      return;
    }
    if (op === "&&" || op === "||") {
      const end = this.lbl("logic"), f = this.lbl("lz");
      this.expr(node.left);
      this.emitTruthyTest(f);
      if (op === "&&") {
        this.expr(node.right);
        this.emit(`JMP ${end}`);
        this.emit(`${f}:`);
      } else {
        this.emit(`JMP ${end}`);
        this.emit(`${f}:`);
        this.expr(node.right);
      }
      this.emit(`${end}:`);
      return;
    }
    if ((op === "<<" || op === ">>" || op === ">>>") &&
        node.right.type === "Literal" && Number.isInteger(node.right.value)) {
      const n = ((node.right.value % 32) + 32) % 32;
      this.expr(node.left);
      if (op === "<<") this.emit(`SHL RAX, ${n}`);
      else if (op === ">>") this.emit(`SAR RAX, ${n}`);
      else { this.emit(`SAR RAX, 3`); this.emit(`AND RAX, 4294967295`); this.emit(`SHR RAX, ${n}`); this.emit(`SHL RAX, 3`); }
      return;
    }
    if (["+", "-", "*", "/", "%", "&", "|", "^"].includes(op)) {
      this.expr(node.left);
      this.emit(`SUB RSP, 16`);
      this.emit(`MOV [RSP], RAX`);
      this.expr(node.right);
      this.emit(`MOV R10, RAX`);
      this.emit(`MOV RAX, [RSP]`);
      this.emit(`ADD RSP, 16`);
      this.taggedArith(op, node);
      return;
    }
    fail(`binary operator ${op} not supported`, node);
  }

  callExpr(node) {
    const args = node.arguments || [];
    if (args.length > 6) fail("max 6 call args", node);
    // Builtins: Object.keys(o), Object.defineProperty(o,k,desc).
    if (node.callee.type === "MemberExpression" && !node.callee.computed &&
        node.callee.object.type === "Identifier" && node.callee.object.name === "Object" &&
        node.callee.property.type === "Identifier") {
      const bname = node.callee.property.name;
      if (bname === "keys") {
        if (args.length !== 1) fail("Object.keys takes 1 arg", node);
        emitObjectKeys(this, args[0]);
        return;
      }
      if (bname === "defineProperty") {
        if (args.length !== 3) fail("Object.defineProperty takes 3 args", node);
        emitDefineProperty(this, args[0], args[1], args[2]);
        return;
      }
      fail(`Object.${bname} not supported`, node);
    }
    // Method call o.f(x).
    if (node.callee.type === "MemberExpression" && !node.callee.computed &&
        node.callee.property.type === "Identifier") {
      emitMethodCall(this, node.callee.object, this.intern(node.callee.property.name), args);
      return;
    }
    if (node.callee.type === "MemberExpression" && node.callee.computed) {
      fail("computed method calls not supported", node);
    }
    const evalArgs = () => {
      if (args.some(a => this.hasCall(a))) {
        for (const a of args) { this.expr(a); this.emit(`SUB RSP, 16`); this.emit(`MOV [RSP], RAX`); }
        for (let i = args.length - 1; i >= 0; i--) {
          this.emit(`MOV ${ARG_REGS[i]}, [RSP+${(args.length - 1 - i) * 16}]`);
        }
        this.emit(`ADD RSP, ${args.length * 16}`);
      } else {
        for (let i = 0; i < args.length; i++) {
          this.expr(args[i]);
          if (ARG_REGS[i] !== "RAX") this.emit(`MOV ${ARG_REGS[i]}, RAX`);
        }
      }
    };
    if (node.callee.type === "Identifier" && this.functions.has(node.callee.name) &&
        !this.locals.get(node.callee.name)) {
      // Direct call to a declared function.
      evalArgs();
      this.emit(`MOV R11, ${V_UNDEF}`);   // receiver = undefined
      this.emit(`CALL ${node.callee.name}`);
      return;
    }
    // Indirect call through a function-valued expression (must be a closure).
    this.expr(node.callee);
    this.emit(`SUB RSP, 16`);
    this.emit(`MOV [RSP], RAX`);
    evalArgs();
    this.emit(`MOV R10, [RSP]`);
    this.emit(`ADD RSP, 16`);
    const done = this.lbl("calldone");
    this.emit(`MOV R11, R10`);
    this.emit(`AND R11, 7`);
    this.emit(`CMP R11, ${TAG_HEAPREF}`);
    this.emit(`JNE ${done}_notfn`);
    this.emit(`MOV R11, R10`);
    this.emit(`AND R11, -8`);
    this.emit(`MOV R11, [R11]`);          // type (flags are 0)
    this.emit(`CMP R11, ${T_CLO}`);
    this.emit(`JNE ${done}_notfn`);
    this.emit(`MOV R10, R10`);
    this.emit(`AND R10, -8`);
    this.emit(`MOV R10, [R10+8]`);        // code ptr
    this.emit(`MOV R11, ${V_UNDEF}`);     // receiver = undefined
    this.emit(`CALL R10`);
    this.emit(`JMP ${done}`);
    this.emit(`${done}_notfn:`);
    this.emit(`CALL __ob2_trap`);         // V8 would throw TypeError
    this.emit(`${done}:`);
  }
}

// ===========================================================================
// Emitters (S1 object model). All take a `gen` facade.
// ===========================================================================

function protoNameId(gen) { return gen.intern("__proto__"); }

// RAX = new empty object (tagged).
function emitNewEmpty(gen) { gen.emit(`CALL __ob2_new_empty`); }

// Object literal. RAX = tagged object on exit.
export function emitObjLit(gen, node) {
  emitNewEmpty(gen);
  for (const prop of node.properties || []) {
    if (prop.type === "SpreadElement") fail("spread not supported", prop);
    if (prop.computed) fail("computed literal keys not supported", prop);
    const keyId = gen.keyId(prop.key);
    if (prop.kind === "init") {
      // Spill obj, eval value, __ob2_set_slow (handles __proto__).
      gen.emit(`SUB RSP, 16`);
      gen.emit(`MOV [RSP], RAX`);
      gen.expr(prop.value);
      gen.emit(`MOV RDX, RAX`);
      gen.emit(`MOV RDI, [RSP]`);
      gen.emit(`LEA R10, [ob2_strtab]`);
      gen.emit(`MOV RSI, [R10+${keyId * 8}]`);
      gen.emit(`XOR RCX, RCX`);
      gen.emit(`CALL __ob2_set_slow`);
      gen.emit(`MOV [RSP], RAX`);
      gen.emit(`MOV RAX, [RSP]`);
      gen.emit(`ADD RSP, 16`);
    } else if (prop.kind === "get" || prop.kind === "set") {
      // Accessor: build closure, then __ob2_define(kind=1).
      const synth = `ob2_fnx_${gen.labelN++}`;
      const fnode = prop.value;
      gen.functions.set(synth, { node: { ...fnode, id: { type: "Identifier", name: synth } }, synthetic: true });
      gen.fnOrder.push(synth);
      gen.emit(`SUB RSP, 32`);
      gen.emit(`MOV [RSP], RAX`);            // obj
      gen.emit(`LEA RDI, [${synth}]`);
      gen.emit(`CALL __ob2_make_closure`);   // RAX = closure
      gen.emit(`MOV [RSP+8], RAX`);          // closure
      gen.emit(`MOV RDI, [RSP]`);
      gen.emit(`LEA R10, [ob2_strtab]`);
      gen.emit(`MOV RSI, [R10+${keyId * 8}]`);
      gen.emit(`MOV RDX, 1`);                // kind = accessor
      if (prop.kind === "get") {
        gen.emit(`MOV RCX, [RSP+8]`);        // getter
        gen.emit(`XOR R8, R8`);              // setter = 0
      } else {
        gen.emit(`XOR RCX, RCX`);
        gen.emit(`MOV R8, [RSP+8]`);         // setter
      }
      gen.emit(`CALL __ob2_define`);
      gen.emit(`ADD RSP, 32`);               // RAX = new obj
    } else {
      fail(`property kind ${prop.kind} not supported`, prop);
    }
  }
}

// RAX = tagged object on entry; RAX = value on exit (IC fast path + slow).
export function emitPropGetRAX(gen, nameId) {
  const ic = gen.icCell();
  const slow = gen.lbl("gslow"), done = gen.lbl("gdone");
  gen.emit(`LEA R10, [ob2_ic_${ic}]`);
  gen.emit(`MOV R11, RAX`);
  gen.emit(`AND R11, 7`);
  gen.emit(`CMP R11, ${TAG_HEAPREF}`);
  gen.emit(`JNE ${slow}`);
  gen.emit(`MOV R11, RAX`);
  gen.emit(`AND R11, -8`);
  gen.emit(`MOV R11, [R11+8]`);          // shape ptr (meta)
  gen.emit(`CMP R11, [R10]`);
  gen.emit(`JNE ${slow}`);
  gen.emit(`MOV R11, [R10+16]`);         // kind
  gen.emit(`TEST R11, R11`);
  gen.emit(`JNZ ${slow}`);
  gen.emit(`MOV R11, [R10+8]`);          // slot
  gen.emit(`AND RAX, -8`);
  gen.emit(`MOV RAX, [RAX+R11*8+16]`);
  gen.emit(`JMP ${done}`);
  gen.emit(`${slow}:`);
  gen.emit(`MOV RDI, RAX`);
  gen.emit(`LEA R10, [ob2_strtab]`);
  gen.emit(`MOV RSI, [R10+${nameId * 8}]`);
  gen.emit(`LEA RDX, [ob2_ic_${ic}]`);
  gen.emit(`CALL __ob2_get_slow`);
  gen.emit(`${done}:`);
}

export function emitPropGet(gen, objNode, nameId) {
  gen.expr(objNode);
  emitPropGetRAX(gen, nameId);
}

// Property set with relocation writeback. RAX = value on entry AND exit.
// objNode: Identifier (local) or non-computed MemberExpression (one level).
export function emitPropSetValue(gen, objNode, nameId) {
  const ic = gen.icCell();
  const slow = gen.lbl("sslow"), done = gen.lbl("sdone");
  if (objNode.type === "Identifier") {
    const loc = gen.locOf(objNode.name, objNode);
    gen.emit(`SUB RSP, 16`);
    gen.emit(`MOV [RSP], RAX`);              // value
    gen.loadLoc(loc);                        // RAX = obj
    gen.emit(`LEA R10, [ob2_ic_${ic}]`);
    gen.emit(`MOV R11, RAX`);
    gen.emit(`AND R11, 7`);
    gen.emit(`CMP R11, ${TAG_HEAPREF}`);
    gen.emit(`JNE ${slow}`);
    gen.emit(`MOV R11, RAX`);
    gen.emit(`AND R11, -8`);
    gen.emit(`MOV R11, [R11+8]`);
    gen.emit(`CMP R11, [R10]`);
    gen.emit(`JNE ${slow}`);
    gen.emit(`MOV R11, [R10+16]`);
    gen.emit(`TEST R11, R11`);
    gen.emit(`JNZ ${slow}`);
    gen.emit(`MOV R11, [R10+8]`);            // slot
    gen.emit(`MOV RDX, [RSP]`);               // value
    gen.emit(`AND RAX, -8`);
    gen.emit(`MOV [RAX+R11*8+16], RDX`);      // in-place: no relocation
    gen.emit(`MOV RAX, [RSP]`);
    gen.emit(`ADD RSP, 16`);
    gen.emit(`JMP ${done}`);
    gen.emit(`${slow}:`);
    gen.emit(`MOV RDI, RAX`);                // obj
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${nameId * 8}]`);
    gen.emit(`MOV RDX, [RSP]`);              // value
    gen.emit(`LEA RCX, [ob2_ic_${ic}]`);
    gen.emit(`CALL __ob2_set_slow`);         // RAX = new obj (maybe relocated)
    gen.storeLoc(loc);                       // writeback
    gen.emit(`MOV RAX, [RSP]`);
    gen.emit(`ADD RSP, 16`);
    gen.emit(`${done}:`);
    return;
  }
  if (objNode.type === "MemberExpression" && !objNode.computed &&
      objNode.property.type === "Identifier") {
    const yId = gen.intern(objNode.property.name);
    gen.emit(`SUB RSP, 32`);
    gen.emit(`MOV [RSP+16], RAX`);            // value
    gen.expr(objNode.object);                 // RAX = E
    gen.emit(`MOV [RSP+8], RAX`);             // E
    emitPropGetRAX(gen, yId);                 // RAX = obj
    gen.emit(`MOV [RSP], RAX`);               // obj
    gen.emit(`LEA R10, [ob2_ic_${ic}]`);
    gen.emit(`MOV R11, RAX`);
    gen.emit(`AND R11, 7`);
    gen.emit(`CMP R11, ${TAG_HEAPREF}`);
    gen.emit(`JNE ${slow}`);
    gen.emit(`MOV R11, RAX`);
    gen.emit(`AND R11, -8`);
    gen.emit(`MOV R11, [R11+8]`);
    gen.emit(`CMP R11, [R10]`);
    gen.emit(`JNE ${slow}`);
    gen.emit(`MOV R11, [R10+16]`);
    gen.emit(`TEST R11, R11`);
    gen.emit(`JNZ ${slow}`);
    gen.emit(`MOV R11, [R10+8]`);
    gen.emit(`MOV RDX, [RSP+16]`);
    gen.emit(`AND RAX, -8`);
    gen.emit(`MOV [RAX+R11*8+16], RDX`);
    gen.emit(`MOV RAX, [RSP+16]`);
    gen.emit(`ADD RSP, 32`);
    gen.emit(`JMP ${done}`);
    gen.emit(`${slow}:`);
    gen.emit(`MOV RDI, [RSP]`);               // obj
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${nameId * 8}]`);
    gen.emit(`MOV RDX, [RSP+16]`);            // value
    gen.emit(`LEA RCX, [ob2_ic_${ic}]`);
    gen.emit(`CALL __ob2_set_slow`);         // RAX = newObj
    gen.emit(`MOV RDX, RAX`);                 // newObj
    gen.emit(`MOV RDI, [RSP+8]`);             // E
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${yId * 8}]`);
    gen.emit(`CALL __ob2_writeback`);         // E.y = newObj (data-only)
    gen.emit(`MOV RAX, [RSP+16]`);
    gen.emit(`ADD RSP, 32`);
    gen.emit(`${done}:`);
    return;
  }
  fail("unsupported set base (need Identifier or o.p member)", objNode);
}

// o.p = v / o.p OP= v. memberNode is a MemberExpression.
export function emitMemberAssign(gen, memberNode, rightNode, op) {
  if (memberNode.computed) { emitComputedAssign(gen, memberNode, rightNode, op); return; }
  const nameId = gen.keyId(memberNode.property);
  if (op === null) {
    gen.expr(rightNode);
    emitPropSetValue(gen, memberNode.object, nameId);
    return;
  }
  // o.p OP= v: only Identifier bases (single evaluation, no side effects).
  if (memberNode.object.type !== "Identifier") fail(`compound assign ${op}= needs identifier base`, memberNode);
  const loc = gen.locOf(memberNode.object.name, memberNode.object);
  gen.expr(rightNode);
  gen.emit(`SUB RSP, 16`);
  gen.emit(`MOV [RSP], RAX`);                // right
  gen.loadLoc(loc);
  emitPropGetRAX(gen, nameId);                // RAX = o.p
  gen.emit(`MOV R10, [RSP]`);                // right
  gen.emit(`ADD RSP, 16`);
  // RAX = left, R10 = right
  gen.emit(`SUB RSP, 16`);
  gen.emit(`MOV [RSP], RAX`);
  gen.emit(`MOV RAX, R10`);
  gen.emit(`MOV R10, [RSP]`);
  gen.emit(`ADD RSP, 16`);
  // now RAX=right, R10=left -> want RAX=left, R10=right
  gen.emit(`XCHG RAX, R10`);
  gen.taggedArith(op, memberNode);
  emitPropSetValue(gen, memberNode.object, nameId);
}

// Computed get: o[k].
export function emitComputedGet(gen, node) {
  const keyNode = node.property;
  if (keyNode.type === "Literal" && typeof keyNode.value === "number" && Number.isInteger(keyNode.value)) {
    const idx = keyNode.value;
    const notarr = gen.lbl("notarr"), done = gen.lbl("cgd");
    gen.expr(node.object);                    // RAX = obj
    gen.emit(`SUB RSP, 16`);
    gen.emit(`MOV [RSP], RAX`);
    gen.emit(`MOV R10, RAX`);
    gen.emit(`AND R10, 7`);
    gen.emit(`CMP R10, ${TAG_HEAPREF}`);
    gen.emit(`JNE ${notarr}`);
    gen.emit(`MOV R10, RAX`);
    gen.emit(`AND R10, -8`);
    gen.emit(`MOV R10, [R10]`);
    gen.emit(`CMP R10, ${T_ARR}`);
    gen.emit(`JNE ${notarr}`);
    gen.emit(`MOV RDI, [RSP]`);
    gen.emit(`MOV RSI, ${BigInt(idx) * 8n}`);
    gen.emit(`CALL __ob2_arr_get`);
    gen.emit(`JMP ${done}`);
    gen.emit(`${notarr}:`);
    gen.emit(`MOV RAX, [RSP]`);
    emitPropGetRAX(gen, gen.intern(String(idx)));
    gen.emit(`${done}:`);
    gen.emit(`ADD RSP, 16`);
    return;
  }
  if (keyNode.type === "Literal" && typeof keyNode.value === "string") {
    emitPropGet(gen, node.object, gen.intern(keyNode.value));
    return;
  }
  // General: key must be a fixnum array index, obj must be an array.
  const done = gen.lbl("cgd2");
  gen.expr(node.object);
  gen.emit(`SUB RSP, 16`);
  gen.emit(`MOV [RSP], RAX`);
  gen.expr(keyNode);                          // RAX = key
  gen.emit(`MOV RDI, [RSP]`);
  gen.emit(`MOV RSI, RAX`);
  gen.emit(`ADD RSP, 16`);
  gen.emit(`CALL __ob2_arr_get`);
  gen.emit(`${done}:`);
}

// Computed set: o[k] = v (value in RAX on entry).
function emitComputedSetValue(gen, objNode, keyNode) {
  // RAX = value on entry; RAX = value on exit. Identifier bases only.
  if (objNode.type !== "Identifier") fail("computed set needs identifier base", objNode);
  const loc = gen.locOf(objNode.name, objNode);
  if (keyNode.type === "Literal" && typeof keyNode.value === "number" && Number.isInteger(keyNode.value)) {
    const idx = keyNode.value;
    const notarr = gen.lbl("csna"), done = gen.lbl("csd");
    gen.emit(`SUB RSP, 32`);
    gen.emit(`MOV [RSP+16], RAX`);            // value
    gen.loadLoc(loc);                        // RAX = obj
    gen.emit(`MOV [RSP+8], RAX`);             // obj
    gen.emit(`MOV R10, RAX`);
    gen.emit(`AND R10, 7`);
    gen.emit(`CMP R10, ${TAG_HEAPREF}`);
    gen.emit(`JNE ${notarr}`);
    gen.emit(`MOV R10, RAX`);
    gen.emit(`AND R10, -8`);
    gen.emit(`MOV R10, [R10]`);
    gen.emit(`CMP R10, ${T_ARR}`);
    gen.emit(`JNE ${notarr}`);
    gen.emit(`MOV RDI, [RSP+8]`);
    gen.emit(`MOV RSI, ${BigInt(idx) * 8n}`);
    gen.emit(`MOV RDX, [RSP+16]`);
    gen.emit(`CALL __ob2_arr_set`);           // RAX = newArr
    gen.storeLoc(loc);                       // writeback
    gen.emit(`MOV RAX, [RSP+16]`);
    gen.emit(`ADD RSP, 32`);
    gen.emit(`JMP ${done}`);
    gen.emit(`${notarr}:`);
    // Object path with interned int-name; reuse the property set.
    gen.emit(`MOV RAX, [RSP+16]`);            // value
    gen.emit(`ADD RSP, 32`);
    emitPropSetValue(gen, objNode, gen.intern(String(idx)));
    gen.emit(`${done}:`);
    return;
  }
  if (keyNode.type === "Literal" && typeof keyNode.value === "string") {
    emitPropSetValue(gen, objNode, gen.intern(keyNode.value));
    return;
  }
  fail("computed set needs integer/string literal key (or array base)", keyNode);
}

function emitComputedAssign(gen, memberNode, rightNode, op) {
  if (memberNode.object.type !== "Identifier") fail("computed compound assign needs identifier base", memberNode);
  const loc = gen.locOf(memberNode.object.name, memberNode.object);
  const keyNode = memberNode.property;
  const isIntKey = keyNode.type === "Literal" && typeof keyNode.value === "number" && Number.isInteger(keyNode.value);
  gen.expr(rightNode);
  gen.emit(`SUB RSP, 16`);
  gen.emit(`MOV [RSP], RAX`);                // right
  gen.loadLoc(loc);                         // RAX = base
  if (isIntKey) {
    // array get with literal idx
    gen.emit(`MOV RDI, RAX`);
    gen.emit(`MOV RSI, ${BigInt(keyNode.value) * 8n}`);
    gen.emit(`CALL __ob2_arr_get`);          // RAX = old
  } else {
    fail("computed compound assign needs integer literal key", keyNode);
  }
  gen.emit(`MOV R10, [RSP]`);
  gen.emit(`ADD RSP, 16`);
  gen.emit(`SUB RSP, 16`);
  gen.emit(`MOV [RSP], RAX`);
  gen.emit(`MOV RAX, R10`);
  gen.emit(`MOV R10, [RSP]`);
  gen.emit(`ADD RSP, 16`);
  gen.emit(`XCHG RAX, R10`);                 // RAX=old, R10=right
  gen.taggedArith(op, memberNode);
  emitComputedSetValue(gen, memberNode.object, keyNode);
}

// length: array -> meta>>32; string -> units; object -> "length" prop.
export function emitLengthGet(gen, objNode) {
  const isarr = gen.lbl("isarr"), isstr = gen.lbl("isstr"), isobj = gen.lbl("isobj"), done = gen.lbl("lend");
  gen.expr(objNode);
  gen.emit(`MOV R10, RAX`);
  gen.emit(`AND R10, 7`);
  gen.emit(`CMP R10, ${TAG_HEAPREF}`);
  gen.emit(`JNE ${isobj}`);                  // non-heapref -> try prop (will trap)
  gen.emit(`MOV R10, RAX`);
  gen.emit(`AND R10, -8`);
  gen.emit(`MOV R11, [R10]`);
  gen.emit(`CMP R11, ${T_ARR}`);
  gen.emit(`JE ${isarr}`);
  gen.emit(`CMP R11, ${T_STR}`);
  gen.emit(`JE ${isstr}`);
  gen.emit(`CMP R11, ${T_OBJ}`);
  gen.emit(`JE ${isobj}`);
  gen.emit(`CALL __ob2_trap`);
  gen.emit(`${isarr}:`);
  gen.emit(`MOV RAX, [R10+8]`);
  gen.emit(`SHR RAX, 32`);
  gen.emit(`SHL RAX, 3`);
  gen.emit(`JMP ${done}`);
  gen.emit(`${isstr}:`);
  gen.emit(`MOV RAX, [R10+8]`);
  gen.emit(`SHL RAX, 3`);
  gen.emit(`JMP ${done}`);
  gen.emit(`${isobj}:`);
  emitPropGetRAX(gen, gen.intern("length"));
  gen.emit(`${done}:`);
}

// delete o.p -> V_TRUE (with writeback).
export function emitDelete(gen, memberNode) {
  if (memberNode.computed) fail("delete o[k] needs literal key", memberNode);
  const nameId = gen.keyId(memberNode.property);
  const objNode = memberNode.object;
  const done = gen.lbl("deld");
  if (objNode.type === "Identifier") {
    const loc = gen.locOf(objNode.name, objNode);
    gen.loadLoc(loc);
    gen.emit(`MOV RDI, RAX`);
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${nameId * 8}]`);
    gen.emit(`CALL __ob2_del`);
    gen.storeLoc(loc);
    gen.emit(`MOV RAX, ${V_TRU}`);
    gen.emit(`${done}:`);
    return;
  }
  if (objNode.type === "MemberExpression" && !objNode.computed && objNode.property.type === "Identifier") {
    const yId = gen.intern(objNode.property.name);
    gen.emit(`SUB RSP, 16`);
    gen.expr(objNode.object);
    gen.emit(`MOV [RSP], RAX`);              // E
    emitPropGetRAX(gen, yId);                // RAX = obj
    gen.emit(`MOV RDI, RAX`);
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${nameId * 8}]`);
    gen.emit(`CALL __ob2_del`);              // RAX = newObj
    gen.emit(`MOV RDX, RAX`);
    gen.emit(`MOV RDI, [RSP]`);
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${yId * 8}]`);
    gen.emit(`ADD RSP, 16`);
    gen.emit(`CALL __ob2_writeback`);
    gen.emit(`MOV RAX, ${V_TRU}`);
    gen.emit(`${done}:`);
    return;
  }
  fail("delete needs identifier or o.p base", objNode);
}

// "k" in o -> boolean immediate.
export function emitIn(gen, objNode, nameId) {
  gen.expr(objNode);
  gen.emit(`MOV RDI, RAX`);
  gen.emit(`LEA R10, [ob2_strtab]`);
  gen.emit(`MOV RSI, [R10+${nameId * 8}]`);
  gen.emit(`CALL __ob2_in`);
}

// Object.keys(o) -> S1 array of name strings.
export function emitObjectKeys(gen, objNode) {
  gen.expr(objNode);
  gen.emit(`MOV RDI, RAX`);
  gen.emit(`CALL __ob2_keys`);
}

// o.m(args): receiver + closure lookup.
export function emitMethodCall(gen, objNode, nameId, args) {
  gen.expr(objNode);
  gen.emit(`SUB RSP, 32`);
  gen.emit(`MOV [RSP], RAX`);                // obj
  emitPropGetRAX(gen, nameId);               // RAX = method
  const notfn = gen.lbl("notfn");
  gen.emit(`MOV R10, RAX`);
  gen.emit(`AND R10, 7`);
  gen.emit(`CMP R10, ${TAG_HEAPREF}`);
  gen.emit(`JNE ${notfn}`);
  gen.emit(`MOV R10, RAX`);
  gen.emit(`AND R10, -8`);
  gen.emit(`MOV R11, [R10]`);
  gen.emit(`CMP R11, ${T_CLO}`);
  gen.emit(`JNE ${notfn}`);
  gen.emit(`MOV R10, [R10+8]`);              // code
  gen.emit(`MOV [RSP+8], R10`);              // code
  // eval args
  if (args.some(a => gen.hasCall(a))) {
    for (const a of args) { gen.expr(a); gen.emit(`SUB RSP, 16`); gen.emit(`MOV [RSP], RAX`); }
    for (let i = args.length - 1; i >= 0; i--) {
      gen.emit(`MOV ${ARG_REGS[i]}, [RSP+${(args.length - 1 - i) * 16}]`);
    }
    gen.emit(`ADD RSP, ${args.length * 16}`);
  } else {
    for (let i = 0; i < args.length; i++) {
      gen.expr(args[i]);
      if (ARG_REGS[i] !== "RAX") gen.emit(`MOV ${ARG_REGS[i]}, RAX`);
    }
  }
  gen.emit(`MOV R10, [RSP+8]`);
  gen.emit(`MOV R11, [RSP]`);                // receiver
  gen.emit(`ADD RSP, 32`);
  gen.emit(`CALL R10`);
  const done = gen.lbl("mcdone");
  gen.emit(`JMP ${done}`);
  gen.emit(`${notfn}:`);
  gen.emit(`CALL __ob2_trap`);               // V8 would throw TypeError
  gen.emit(`${done}:`);
}

// Object.defineProperty(o, k, desc). Returns the (possibly relocated) object.
// desc must be an object literal with value/get/set.
export function emitDefineProperty(gen, objNode, keyNode, descNode) {
  const nameId = gen.keyId(keyNode);
  if (!descNode || descNode.type !== "ObjectExpression") fail("defineProperty desc must be an object literal", descNode);
  let valueNode = null, getterNode = null, setterNode = null;
  for (const p of descNode.properties || []) {
    if (p.computed || p.type === "SpreadElement") fail("bad desc property", p);
    const kn = p.key.type === "Identifier" ? p.key.name : (p.key.type === "Literal" ? String(p.key.value) : null);
    if (kn === "value" && p.kind === "init") valueNode = p.value;
    else if (kn === "get" && p.kind === "get") getterNode = p.value;
    else if (kn === "set" && p.kind === "set") setterNode = p.value;
    else fail(`defineProperty: unsupported descriptor key '${kn}'`, p);
  }
  const isAcc = !!(getterNode || setterNode);
  const doDefine = () => {
    // Stack: [RSP]=obj. Emits the descriptor values and calls __ob2_define.
    // RAX = new obj on exit.
    if (!isAcc) {
      gen.expr(valueNode || { type: "Identifier", name: "undefined" }); // RAX = value
      gen.emit(`MOV RCX, RAX`);
    } else {
      const mkClos = (fnode) => {
        const synth = `ob2_fnx_${gen.labelN++}`;
        gen.functions.set(synth, { node: { ...fnode, id: { type: "Identifier", name: synth } }, synthetic: true });
        gen.fnOrder.push(synth);
        gen.emit(`LEA RDI, [${synth}]`);
        gen.emit(`CALL __ob2_make_closure`);
      };
      if (getterNode) { mkClos(getterNode); gen.emit(`MOV RCX, RAX`); }
      else gen.emit(`XOR RCX, RCX`);
      if (setterNode) { mkClos(setterNode); gen.emit(`MOV R8, RAX`); }
      else gen.emit(`XOR R8, R8`);
    }
    gen.emit(`MOV RDI, [RSP]`);
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${nameId * 8}]`);
    gen.emit(`MOV RDX, ${isAcc ? 1 : 0}`);
    gen.emit(`CALL __ob2_define`);           // RAX = new obj
  };
  if (objNode.type === "Identifier") {
    const loc = gen.locOf(objNode.name, objNode);
    gen.loadLoc(loc);
    gen.emit(`SUB RSP, 16`);
    gen.emit(`MOV [RSP], RAX`);
    doDefine();
    gen.emit(`ADD RSP, 16`);
    gen.storeLoc(loc);
    return;
  }
  if (objNode.type === "MemberExpression" && !objNode.computed && objNode.property.type === "Identifier") {
    const yId = gen.intern(objNode.property.name);
    gen.emit(`SUB RSP, 16`);
    gen.expr(objNode.object);
    gen.emit(`MOV [RSP], RAX`);              // E
    emitPropGetRAX(gen, yId);
    gen.emit(`SUB RSP, 16`);
    gen.emit(`MOV [RSP], RAX`);              // obj
    doDefine();                              // uses [RSP]
    gen.emit(`MOV RDX, RAX`);
    gen.emit(`MOV RDI, [RSP+16]`);           // E
    gen.emit(`LEA R10, [ob2_strtab]`);
    gen.emit(`MOV RSI, [R10+${yId * 8}]`);
    gen.emit(`ADD RSP, 16`);
    gen.emit(`CALL __ob2_writeback`);
    gen.emit(`ADD RSP, 16`);
    // RAX = new obj (return value of defineProperty)
    gen.emit(`MOV RAX, RDX`);
    return;
  }
  fail("defineProperty needs identifier or o.p base", objNode);
}

// a === b / a !== b (S1 §12).
export function emitStrictEq(gen, node) {
  const isNe = node.operator === "!==";
  gen.expr(node.left);
  gen.emit(`SUB RSP, 16`);
  gen.emit(`MOV [RSP], RAX`);
  gen.expr(node.right);
  gen.emit(`MOV R10, RAX`);
  gen.emit(`MOV RAX, [RSP]`);
  gen.emit(`ADD RSP, 16`);
  const t = gen.lbl("eqt"), f = gen.lbl("eqf"), d = gen.lbl("eqd");
  gen.emit(`CMP RAX, ${V_NN}`);
  gen.emit(`JNE ${t}_nn`);
  gen.emit(`CMP R10, ${V_NN}`);
  gen.emit(`JE ${f}`);                       // NaN !== NaN, even bit-identical
  gen.emit(`${t}_nn:`);
  gen.emit(`CMP RAX, R10`);
  gen.emit(`JE ${t}`);                       // u64 equal -> true
  gen.emit(`MOV RDI, RAX`);
  gen.emit(`MOV RSI, R10`);
  gen.emit(`CALL __ob2_strict_eq`);          // RAX = V_TRU/V_FLS
  gen.emit(`JMP ${d}`);
  gen.emit(`${t}:`);
  gen.emit(`MOV RAX, ${V_TRU}`);
  gen.emit(`JMP ${d}`);
  gen.emit(`${f}:`);
  gen.emit(`MOV RAX, ${V_FLS}`);
  gen.emit(`${d}:`);
  if (isNe) {
    const nt = gen.lbl("neq"), nd = gen.lbl("neqd");
    gen.emit(`CMP RAX, ${V_TRU}`);
    gen.emit(`JE ${nt}`);
    gen.emit(`MOV RAX, ${V_TRU}`);
    gen.emit(`JMP ${nd}`);
    gen.emit(`${nt}:`);
    gen.emit(`MOV RAX, ${V_FLS}`);
    gen.emit(`${nd}:`);
  }
}

// typeof x (S1 §14).
export function emitTypeof(gen, argNode) {
  const t = gen.lbl("tof"), d = gen.lbl("tofd");
  gen.expr(argNode);
  gen.emit(`MOV R10, RAX`);
  gen.emit(`AND R10, 7`);
  gen.emit(`CMP R10, ${TAG_FIXNUM}`);
  gen.emit(`JE ${t}_num`);
  gen.emit(`CMP R10, ${TAG_DOUBLE}`);
  gen.emit(`JE ${t}_num`);
  gen.emit(`CMP R10, ${TAG_SMALLSTR}`);
  gen.emit(`JE ${t}_str`);
  gen.emit(`CMP R10, ${TAG_IMM}`);
  gen.emit(`JE ${t}_imm`);
  gen.emit(`MOV R10, RAX`);
  gen.emit(`AND R10, -8`);
  gen.emit(`MOV R10, [R10]`);
  gen.emit(`CMP R10, ${T_STR}`);
  gen.emit(`JE ${t}_str`);
  gen.emit(`CMP R10, ${T_CLO}`);
  gen.emit(`JE ${t}_fn`);
  gen.emit(`JMP ${t}_obj`);
  gen.emit(`${t}_num:`);
  gen.loadStrRef(gen.intern("number"));
  gen.emit(`JMP ${d}`);
  gen.emit(`${t}_str:`);
  gen.loadStrRef(gen.intern("string"));
  gen.emit(`JMP ${d}`);
  gen.emit(`${t}_fn:`);
  gen.loadStrRef(gen.intern("function"));
  gen.emit(`JMP ${d}`);
  gen.emit(`${t}_obj:`);
  gen.loadStrRef(gen.intern("object"));
  gen.emit(`JMP ${d}`);
  gen.emit(`${t}_imm:`);
  gen.emit(`CMP RAX, ${V_UNDEF}`);
  gen.emit(`JE ${t}_und`);
  gen.emit(`CMP RAX, ${V_NUL}`);
  gen.emit(`JE ${t}_obj`);                   // typeof null === "object"
  gen.emit(`CMP RAX, ${V_NN}`);
  gen.emit(`JE ${t}_num`);                   // typeof NaN === "number"
  gen.loadStrRef(gen.intern("boolean"));     // true/false
  gen.emit(`JMP ${d}`);
  gen.emit(`${t}_und:`);
  gen.loadStrRef(gen.intern("undefined"));
  gen.emit(`${d}:`);
}

// ===========================================================================
// Runtime (S1-conformant). Preserves RBX/R12-R15/RBP/RSP; clobbers the rest.
// Allocation via Stream 2's __awtsmoos_alloc_raw (S1 16-byte headers).
// ===========================================================================
function emitObjRuntime(gen) {
  const E = (s) => gen.emit(s);

  // ---- trap: loud abort (exit 99) ----
  E(`__ob2_trap:`);
  E(`MOV RDI, 99`);
  E(`MOV RAX, 60`);
  E(`SYSCALL`);

  // ---- __ob2_shape_alloc: RDI=N -> RAX=raw shape ptr (S1 type 8) ----
  E(`__ob2_shape_alloc:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`);
  E(`MOV RBX, RDI`);
  E(`MOV RSI, RBX`); E(`SHL RSI, 3`);   // 8N
  E(`MOV R12, RBX`); E(`SHL R12, 2`);   // 4N
  E(`ADD RSI, R12`);                     // 12N payload bytes
  E(`MOV RDI, ${T_SHP}`);
  E(`MOV RDX, RBX`);                     // meta = N
  E(`CALL __awtsmoos_alloc_raw`);
  E(`AND RAX, -8`);
  E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_streq: RDI=a, RSI=b (tagged strings) -> RAX=1/0 ----
  E(`__ob2_streq:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`);
  E(`MOV RBX, RDI`); E(`MOV R12, RSI`);
  E(`MOV R10, RBX`); E(`AND R10, 7`);
  E(`MOV R11, R12`); E(`AND R11, 7`);
  E(`CMP R10, ${TAG_SMALLSTR}`); E(`JE $ob2_sq_as`);
  E(`CMP R11, ${TAG_SMALLSTR}`); E(`JE $ob2_sq_swap`);
  E(`JMP $ob2_sq_hh`);
  E(`$ob2_sq_swap:`);
  E(`XCHG RBX, R12`);                    // now a=small, b=heap
  E(`$ob2_sq_as:`);
  E(`CMP R11, ${TAG_SMALLSTR}`); E(`JE $ob2_sq_ss`);
  // a smallstr, b heap
  E(`MOV R10, RBX`); E(`SHR R10, 3`); E(`AND R10, 3`);   // lenA
  E(`MOV R13, R12`); E(`AND R13, -8`);
  E(`MOV R11, [R13+8]`);                                     // lenB
  E(`CMP R10, R11`); E(`JNE $ob2_sq_no`);
  E(`XOR R14, R14`);
  E(`$ob2_sq_aloop:`);
  E(`CMP R14, R10`); E(`JGE $ob2_sq_yes`);
  E(`MOV RAX, RBX`);
  E(`MOV R11, R14`); E(`SHL R11, 4`); E(`ADD R11, 5`);
  E(`MOV RCX, R11`); E(`SHR RAX, CL`); E(`AND RAX, 65535`);
  E(`MOV R11, [R13+R14*2+16]`); E(`AND R11, 65535`);
  E(`CMP RAX, R11`); E(`JNE $ob2_sq_no`);
  E(`INC R14`); E(`JMP $ob2_sq_aloop`);
  E(`$ob2_sq_ss:`);
  E(`CMP RBX, R12`); E(`SETE AL`); E(`MOVZX RAX, AL`); E(`JMP $ob2_sq_ret`);
  E(`$ob2_sq_hh:`);
  // both heap
  E(`MOV R13, RBX`); E(`AND R13, -8`);
  E(`MOV R14, R12`); E(`AND R14, -8`);
  E(`MOV R10, [R13+8]`); E(`MOV R11, [R14+8]`);
  E(`CMP R10, R11`); E(`JNE $ob2_sq_no`);
  E(`XOR R11, R11`);
  E(`$ob2_sq_hloop:`);
  E(`CMP R11, R10`); E(`JGE $ob2_sq_yes`);
  E(`MOV RAX, [R13+R11*2+16]`); E(`AND RAX, 65535`);
  E(`MOV R12, [R14+R11*2+16]`); E(`AND R12, 65535`);
  E(`CMP RAX, R12`); E(`JNE $ob2_sq_no`);
  E(`INC R11`); E(`JMP $ob2_sq_hloop`);
  E(`$ob2_sq_yes:`); E(`MOV RAX, 1`); E(`JMP $ob2_sq_ret`);
  E(`$ob2_sq_no:`); E(`XOR RAX, RAX`);
  E(`$ob2_sq_ret:`);
  E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_shape_scan: RDI=shape(raw), RSI=name -> RAX=slot or -1 ----
  E(`__ob2_shape_scan:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`);
  E(`MOV RBX, RDI`); E(`MOV R12, RSI`);
  E(`MOV R13, [RBX+8]`);                 // N
  E(`XOR R14, R14`);
  E(`$ob2_ss_loop:`);
  E(`CMP R14, R13`); E(`JGE $ob2_ss_miss`);
  E(`MOV RDI, [RBX+R14*8+16]`);
  E(`MOV RSI, R12`);
  E(`CALL __ob2_streq`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_ss_hit`);
  E(`INC R14`); E(`JMP $ob2_ss_loop`);
  E(`$ob2_ss_hit:`);
  E(`MOV R10, R13`); E(`SHL R10, 3`);   // 8N
  E(`LEA R10, [RBX+R10+16]`);            // slots base
  E(`MOV RAX, [R10+R14*4]`);
  E(`SHL RAX, 32`); E(`SHR RAX, 32`);    // u32 slot (AND imm32 would sign-extend: no-op)
  E(`JMP $ob2_ss_ret`);
  E(`$ob2_ss_miss:`); E(`MOV RAX, -1`);
  E(`$ob2_ss_ret:`);
  E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_shape_intern: RDI=parent(raw), RSI=name, RDX=kind -> RAX=child(raw)
  // kind=0 (data): cached. kind=1 (accessor): always fresh (never shared, so
  // the runtime-side acc table keyed (shape,slot) stays unambiguous).
  // Cache entries are 32B: [parent, name, child, pad].
  E(`__ob2_shape_intern:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 24`);                  // keep RSP 16-aligned (8+8+40+24 = 80)
  E(`MOV RBX, RDI`);                 // parent
  E(`MOV [RSP], RSI`);               // name
  E(`MOV [RSP+8], RDX`);             // kind
  E(`CMP RDX, 1`); E(`JE $ob2_si_alloc`);
  E(`LEA R14, [ob2_trans]`);
  E(`LEA R10, [ob2_trans_count]`); E(`MOV R15, [R10]`);
  E(`MOV R10, R15`); E(`SHL R10, 5`);
  E(`ADD R10, R14`);                 // end
  E(`$ob2_si_loop:`);
  E(`CMP R14, R10`); E(`JGE $ob2_si_miss`);
  E(`MOV RAX, [R14]`); E(`CMP RAX, RBX`); E(`JNE $ob2_si_next`);
  E(`PUSH R10`); E(`PUSH R14`);
  E(`MOV RDI, [R14+8]`); E(`MOV RSI, [RSP+16]`);
  E(`CALL __ob2_streq`);
  E(`MOV R11, RAX`);
  E(`POP R14`); E(`POP R10`);
  E(`TEST R11, R11`); E(`JNZ $ob2_si_hit`);
  E(`$ob2_si_next:`);
  E(`ADD R14, 32`); E(`JMP $ob2_si_loop`);
  E(`$ob2_si_hit:`);
  E(`MOV RAX, [R14+16]`);
  E(`ADD RSP, 24`);
  E(`JMP $ob2_si_ret`);
  E(`$ob2_si_miss:`);
  E(`$ob2_si_alloc:`);
  E(`MOV R12, [RBX+8]`);             // R12 = N
  E(`LEA RDI, [R12+1]`);
  E(`CALL __ob2_shape_alloc`);       // preserves RBX,R12-R15
  E(`MOV R14, RAX`);                 // new shape
  E(`XOR R15, R15`);                 // i
  E(`$ob2_si_cpy:`);
  E(`CMP R15, R12`); E(`JGE $ob2_si_cpy2`);
  E(`MOV R10, [RBX+R15*8+16]`);
  E(`MOV [R14+R15*8+16], R10`);
  E(`INC R15`); E(`JMP $ob2_si_cpy`);
  E(`$ob2_si_cpy2:`);
  E(`CMP R12, 0`); E(`JE $ob2_si_cpy3`);
  E(`MOV R10, R12`); E(`SHL R10, 3`); E(`ADD R10, RBX`); E(`ADD R10, 16`); // parent slots
  E(`MOV R15, R12`); E(`ADD R15, 1`); E(`SHL R15, 3`); E(`ADD R15, R14`); E(`ADD R15, 16`); // child slots
  E(`MOV RAX, R12`); E(`ADD RAX, 1`); E(`SHR RAX, 1`); // ceil(N/2)
  E(`XOR R13, R13`);                 // j
  E(`$ob2_si_cpq:`);
  E(`CMP R13, RAX`); E(`JGE $ob2_si_cpy3`);
  E(`MOV R11, [R10+R13*8]`);
  E(`MOV [R15+R13*8], R11`);
  E(`INC R13`); E(`JMP $ob2_si_cpq`);
  E(`$ob2_si_cpy3:`);
  E(`MOV R10, [RSP]`);               // name
  E(`MOV [R14+R12*8+16], R10`);      // names[N] = name
  E(`MOV R10, R12`); E(`ADD R10, 1`); E(`SHL R10, 3`); E(`ADD R10, R14`); E(`ADD R10, 16`); // child slots
  E(`MOV R11, R12`); E(`SHL R11, 2`); // 4N
  E(`MOV [R10+R11], R12`);           // slots[N] = N (8B store into last slot+pad)
  E(`MOV RAX, R14`);
  E(`MOV R10, [RSP+8]`);
  E(`TEST R10, R10`); E(`JNZ $ob2_si_done`);   // kind==1: no cache
  E(`LEA R10, [ob2_trans_count]`); E(`MOV R11, [R10]`);
  E(`CMP R11, ${TRANS_CAP}`); E(`JGE $ob2_si_done`);
  E(`LEA R15, [ob2_trans]`);
  E(`MOV R10, R11`); E(`SHL R10, 5`); E(`ADD R10, R15`); // entry
  E(`MOV [R10], RBX`);
  E(`MOV R11, [RSP]`); E(`MOV [R10+8], R11`);
  E(`MOV [R10+16], RAX`);
  E(`LEA R10, [ob2_trans_count]`); E(`MOV R11, [R10]`); E(`INC R11`); E(`MOV [R10], R11`);
  E(`$ob2_si_done:`);
  E(`ADD RSP, 24`);
  E(`$ob2_si_ret:`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);


  // ---- __ob2_new_empty: -> RAX = tagged empty object ----
  E(`__ob2_new_empty:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`);
  E(`LEA R10, [ob2_shape0]`); E(`MOV RDX, [R10]`);
  E(`MOV RDI, ${T_OBJ}`);
  E(`XOR RSI, RSI`);
  E(`CALL __awtsmoos_alloc_raw`);
  E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_make_closure: RDI=code -> RAX = tagged closure ----
  E(`__ob2_make_closure:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`);
  E(`MOV RBX, RDI`);
  E(`MOV RDI, ${T_CLO}`);
  E(`XOR RSI, RSI`);
  E(`MOV RDX, RBX`);
  E(`CALL __awtsmoos_alloc_raw`);
  E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_acc_lookup: RDI=shape, RSI=slot -> RAX=entry or 0 ----
  // Entries are 32B: [shape, slot, getter, setter].
  E(`__ob2_acc_lookup:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`LEA R10, [ob2_acc]`);
  E(`LEA R11, [ob2_acc_count]`); E(`MOV R11, [R11]`);
  E(`MOV RAX, R11`); E(`SHL RAX, 5`); E(`ADD RAX, R10`);
  E(`$ob2_al_loop:`);
  E(`CMP R10, RAX`); E(`JGE $ob2_al_miss`);
  E(`CMP QWORD PTR [R10], RDI`); E(`JNE $ob2_al_next`);
  E(`CMP QWORD PTR [R10+8], RSI`); E(`JNE $ob2_al_next`);
  E(`MOV RAX, R10`); E(`JMP $ob2_al_ret`);
  E(`$ob2_al_next:`);
  E(`ADD R10, 32`); E(`JMP $ob2_al_loop`);
  E(`$ob2_al_miss:`); E(`XOR RAX, RAX`);
  E(`$ob2_al_ret:`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_acc_define: RDI=shape, RSI=slot, RDX=getter, RCX=setter ----
  // Merges: only non-zero args overwrite.
  E(`__ob2_acc_define:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`);
  E(`MOV RBX, RDI`); E(`MOV R12, RSI`); E(`MOV R13, RDX`); E(`MOV R14, RCX`);
  E(`CALL __ob2_acc_lookup`);            // RDI, RSI already set
  E(`TEST RAX, RAX`); E(`JNZ $ob2_ad_upd`);
  E(`LEA R10, [ob2_acc_count]`); E(`MOV R11, [R10]`);
  E(`CMP R11, ${ACC_CAP}`); E(`JGE $ob2_ad_trap`);
  E(`LEA R10, [ob2_acc]`);
  E(`MOV RAX, R11`); E(`SHL RAX, 5`); E(`ADD RAX, R10`);
  E(`MOV [RAX], RBX`); E(`MOV [RAX+8], R12`);
  E(`XOR R10, R10`); E(`MOV [RAX+16], R10`); E(`MOV [RAX+24], R10`);
  E(`LEA R10, [ob2_acc_count]`); E(`MOV R11, [R10]`); E(`INC R11`); E(`MOV [R10], R11`);
  E(`$ob2_ad_upd:`);
  E(`TEST R13, R13`); E(`JZ $ob2_ad_skg`);
  E(`MOV [RAX+16], R13`);
  E(`$ob2_ad_skg:`);
  E(`TEST R14, R14`); E(`JZ $ob2_ad_sks`);
  E(`MOV [RAX+24], R14`);
  E(`$ob2_ad_sks:`);
  E(`JMP $ob2_ad_ret`);
  E(`$ob2_ad_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_ad_ret:`);
  E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_proto_of: RDI=objPtr(raw) -> RAX=protoPtr(raw) or 0 ----
  E(`__ob2_proto_of:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`LEA R10, [ob2_proto]`);
  E(`LEA R11, [ob2_proto_count]`); E(`MOV R11, [R11]`);
  E(`MOV RAX, R11`); E(`SHL RAX, 4`); E(`ADD RAX, R10`);
  E(`$ob2_po_loop:`);
  E(`CMP R10, RAX`); E(`JGE $ob2_po_miss`);
  E(`CMP QWORD PTR [R10], RDI`); E(`JNE $ob2_po_next`);
  E(`MOV RAX, [R10+8]`); E(`JMP $ob2_po_ret`);
  E(`$ob2_po_next:`);
  E(`ADD R10, 16`); E(`JMP $ob2_po_loop`);
  E(`$ob2_po_miss:`);
  E(`LEA R10, [ob2_objproto]`); E(`MOV RAX, [R10]`);
  E(`AND RAX, -8`);
  E(`$ob2_po_ret:`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_set_proto: RDI=objPtr(raw), RSI=protoPtr(raw) ----
  E(`__ob2_set_proto:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`);
  E(`MOV RBX, RDI`); E(`MOV R12, RSI`);
  E(`LEA R10, [ob2_proto]`);
  E(`LEA R11, [ob2_proto_count]`); E(`MOV R11, [R11]`);
  E(`MOV RAX, R11`); E(`SHL RAX, 4`); E(`ADD RAX, R10`);
  E(`$ob2_sp_loop:`);
  E(`CMP R10, RAX`); E(`JGE $ob2_sp_miss`);
  E(`CMP QWORD PTR [R10], RBX`); E(`JNE $ob2_sp_next`);
  E(`MOV [R10+8], R12`); E(`JMP $ob2_sp_ret`);
  E(`$ob2_sp_next:`);
  E(`ADD R10, 16`); E(`JMP $ob2_sp_loop`);
  E(`$ob2_sp_miss:`);
  E(`CMP R11, ${PROTO_CAP}`); E(`JGE $ob2_sp_trap`);
  E(`LEA R10, [ob2_proto]`);
  E(`MOV RAX, R11`); E(`SHL RAX, 4`); E(`ADD RAX, R10`); // entry = base+count*16
  E(`MOV [RAX], RBX`); E(`MOV [RAX+8], R12`);
  E(`LEA R10, [ob2_proto_count]`); E(`MOV R11, [R10]`); E(`INC R11`); E(`MOV [R10], R11`);
  E(`JMP $ob2_sp_ret`);
  E(`$ob2_sp_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_sp_ret:`);
  E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_proto_remap: RDI=oldPtr(raw), RSI=newPtr(raw) ----
  E(`__ob2_proto_remap:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`);
  E(`MOV RBX, RDI`); E(`MOV R12, RSI`);
  E(`LEA R10, [ob2_proto]`);
  E(`LEA R11, [ob2_proto_count]`); E(`MOV R11, [R11]`);
  E(`MOV RAX, R11`); E(`SHL RAX, 4`); E(`ADD RAX, R10`);
  E(`$ob2_pr_loop:`);
  E(`CMP R10, RAX`); E(`JGE $ob2_pr_ret`);
  E(`CMP QWORD PTR [R10], RBX`); E(`JNE $ob2_pr_next`);
  E(`MOV [R10], R12`);
  E(`JMP $ob2_pr_ret`);
  E(`$ob2_pr_next:`);
  E(`ADD R10, 16`); E(`JMP $ob2_pr_loop`);
  E(`$ob2_pr_ret:`);
  E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_get_slow: RDI=obj, RSI=name, RDX=icCell -> RAX=value ----
  E(`__ob2_get_slow:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 56`);                  // obj,name,icCell,objPtr,shape,slot
  E(`MOV [RSP], RDI`);
  E(`MOV [RSP+8], RSI`);
  E(`MOV [RSP+16], RDX`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_gs_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`); E(`MOV [RSP+24], R10`);
  E(`LEA R10, [ob2_strtab]`); E(`MOV RDI, [R10]`);   // "__proto__" id 0
  E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_streq`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_gs_proto`);
  E(`MOV R10, [RSP+24]`); E(`MOV R10, [R10+8]`); E(`MOV [RSP+32], R10`); // shape
  E(`MOV RDI, R10`); E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JE $ob2_gs_chain`);
  E(`MOV [RSP+40], RAX`);            // slot
  E(`MOV RDI, [RSP+32]`); E(`MOV RSI, RAX`);
  E(`CALL __ob2_acc_lookup`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_gs_acc`);
  E(`MOV R10, [RSP+16]`); E(`TEST R10, R10`); E(`JZ $ob2_gs_noic`);
  E(`MOV R11, [RSP+32]`); E(`MOV [R10], R11`);
  E(`MOV R11, [RSP+40]`); E(`MOV [R10+8], R11`);
  E(`XOR R11, R11`); E(`MOV [R10+16], R11`);
  E(`$ob2_gs_noic:`);
  E(`MOV R10, [RSP+24]`); E(`MOV R11, [RSP+40]`);
  E(`MOV RAX, [R10+R11*8+16]`);
  E(`JMP $ob2_gs_ret`);
  E(`$ob2_gs_acc:`);
  E(`MOV R10, [RAX+16]`);            // getter
  E(`TEST R10, R10`); E(`JZ $ob2_gs_undef`);
  E(`MOV R11, R10`); E(`AND R11, -8`); E(`MOV R10, [R11+8]`);
  E(`MOV R11, [RSP]`);               // receiver = original obj
  E(`CALL R10`);
  E(`JMP $ob2_gs_ret`);
  E(`$ob2_gs_undef:`);
  E(`MOV RAX, ${V_UNDEF}`);
  E(`JMP $ob2_gs_ret`);
  E(`$ob2_gs_proto:`);
  E(`MOV RDI, [RSP+24]`);
  E(`CALL __ob2_proto_of`);
  E(`TEST RAX, RAX`); E(`JZ $ob2_gs_pnull`);
  E(`OR RAX, 1`); E(`JMP $ob2_gs_ret`);
  E(`$ob2_gs_pnull:`);
  E(`MOV RAX, ${V_NUL}`);
  E(`JMP $ob2_gs_ret`);
  E(`$ob2_gs_chain:`);
  E(`MOV RDI, [RSP+24]`);
  E(`CALL __ob2_proto_of`);
  E(`$ob2_gs_cloop:`);
  E(`TEST RAX, RAX`); E(`JZ $ob2_gs_undef`);
  E(`MOV [RSP+24], RAX`);
  E(`MOV R10, [RAX+8]`); E(`MOV [RSP+32], R10`);
  E(`MOV RDI, R10`); E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JE $ob2_gs_cnext`);
  E(`MOV [RSP+40], RAX`);
  E(`MOV RDI, [RSP+32]`); E(`MOV RSI, RAX`);
  E(`CALL __ob2_acc_lookup`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_gs_pacc`);
  E(`MOV R10, [RSP+24]`); E(`MOV R11, [RSP+40]`);
  E(`MOV RAX, [R10+R11*8+16]`);
  E(`JMP $ob2_gs_ret`);
  E(`$ob2_gs_pacc:`);
  E(`MOV R10, [RAX+16]`);
  E(`TEST R10, R10`); E(`JZ $ob2_gs_undef`);
  E(`MOV R11, R10`); E(`AND R11, -8`); E(`MOV R10, [R11+8]`);
  E(`MOV R11, [RSP]`);
  E(`CALL R10`);
  E(`JMP $ob2_gs_ret`);
  E(`$ob2_gs_cnext:`);
  E(`MOV RDI, [RSP+24]`);
  E(`CALL __ob2_proto_of`);
  E(`JMP $ob2_gs_cloop`);
  E(`$ob2_gs_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_gs_ret:`);
  E(`ADD RSP, 56`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_set_slow: RDI=obj, RSI=name, RDX=value, RCX=icCell -> RAX=newObj ----
  E(`__ob2_set_slow:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 56`);                  // obj,name,value,icCell,objPtr,shape,slot
  E(`MOV [RSP], RDI`);
  E(`MOV [RSP+8], RSI`);
  E(`MOV [RSP+16], RDX`);
  E(`MOV [RSP+24], RCX`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_ss_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`); E(`MOV [RSP+32], R10`);
  E(`LEA R10, [ob2_strtab]`); E(`MOV RDI, [R10]`);
  E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_streq`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_ss_proto`);
  E(`MOV R10, [RSP+32]`); E(`MOV R10, [R10+8]`); E(`MOV [RSP+40], R10`); // shape
  E(`MOV RDI, R10`); E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JE $ob2_ss_add`);
  E(`MOV [RSP+48], RAX`);            // slot
  E(`MOV RDI, [RSP+40]`); E(`MOV RSI, RAX`);
  E(`CALL __ob2_acc_lookup`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_ss_acc`);
  E(`MOV R10, [RSP+32]`); E(`MOV R11, [RSP+48]`); E(`MOV R12, [RSP+16]`);
  E(`MOV [R10+R11*8+16], R12`);      // in-place data store
  E(`MOV R10, [RSP+24]`); E(`TEST R10, R10`); E(`JZ $ob2_ss_noic`);
  E(`MOV R11, [RSP+40]`); E(`MOV [R10], R11`);
  E(`MOV R11, [RSP+48]`); E(`MOV [R10+8], R11`);
  E(`XOR R11, R11`); E(`MOV [R10+16], R11`);
  E(`$ob2_ss_noic:`);
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_ss_ret`);
  E(`$ob2_ss_acc:`);
  E(`MOV R10, [RAX+24]`);            // setter
  E(`TEST R10, R10`); E(`JZ $ob2_ss_noset`);
  E(`MOV R11, R10`); E(`AND R11, -8`); E(`MOV R10, [R11+8]`);
  E(`MOV RDI, [RSP+16]`);            // value arg
  E(`MOV R11, [RSP]`);               // receiver
  E(`CALL R10`);
  E(`$ob2_ss_noset:`);
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_ss_ret`);
  E(`$ob2_ss_proto:`);
  E(`MOV R10, [RSP+16]`);            // value
  E(`CMP R10, ${V_NUL}`); E(`JE $ob2_ss_pnull`);
  E(`MOV R11, R10`); E(`AND R11, 7`); E(`CMP R11, ${TAG_HEAPREF}`); E(`JNE $ob2_ss_pret`);
  E(`MOV R11, R10`); E(`AND R11, -8`); E(`MOV R11, [R11]`);
  E(`CMP R11, ${T_OBJ}`); E(`JNE $ob2_ss_pret`);   // non-object proto ignored
  E(`AND R10, -8`);
  E(`MOV RDI, [RSP+32]`); E(`MOV RSI, R10`);
  E(`CALL __ob2_set_proto`);
  E(`JMP $ob2_ss_pret`);
  E(`$ob2_ss_pnull:`);
  E(`MOV RDI, [RSP+32]`); E(`XOR RSI, RSI`);
  E(`CALL __ob2_set_proto`);
  E(`$ob2_ss_pret:`);
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_ss_ret`);
  E(`$ob2_ss_add:`);
  E(`MOV R15, [RSP+40]`);            // old shape
  E(`MOV R12, [R15+8]`);             // N
  E(`MOV RDI, R15`); E(`MOV RSI, [RSP+8]`); E(`XOR RDX, RDX`);
  E(`CALL __ob2_shape_intern`);      // RAX = newShape
  E(`MOV R15, RAX`);
  E(`MOV RDI, ${T_OBJ}`);
  E(`MOV RSI, R12`); E(`ADD RSI, 1`); E(`SHL RSI, 3`);
  E(`MOV RDX, R15`);
  E(`CALL __awtsmoos_alloc_raw`);    // RAX = tagged newObj
  E(`MOV R14, RAX`);
  E(`MOV R10, R14`); E(`AND R10, -8`); // newRaw
  E(`MOV R11, [RSP+32]`);            // oldPtr
  E(`XOR R13, R13`);
  E(`$ob2_ss_cpy:`);
  E(`CMP R13, R12`); E(`JGE $ob2_ss_cpy2`);
  E(`MOV RAX, [R11+R13*8+16]`);
  E(`MOV [R10+R13*8+16], RAX`);
  E(`INC R13`); E(`JMP $ob2_ss_cpy`);
  E(`$ob2_ss_cpy2:`);
  E(`MOV RAX, [RSP+16]`);
  E(`MOV [R10+R12*8+16], RAX`);      // values[N] = value
  E(`MOV RDI, [RSP+32]`); E(`MOV RSI, R10`);
  E(`CALL __ob2_proto_remap`);
  E(`MOV R10, [RSP+24]`); E(`TEST R10, R10`); E(`JZ $ob2_ss_anoic`);
  E(`MOV [R10], R15`);
  E(`MOV [R10+8], R12`);
  E(`XOR R11, R11`); E(`MOV [R10+16], R11`);
  E(`$ob2_ss_anoic:`);
  E(`MOV RAX, R14`);
  E(`JMP $ob2_ss_ret`);
  E(`$ob2_ss_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_ss_ret:`);
  E(`ADD RSP, 56`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_writeback: RDI=base, RSI=name, RDX=value (data-only, no-op if missing/accessor) ----
  E(`__ob2_writeback:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`);
  E(`MOV RBX, RDI`); E(`MOV R12, RSI`); E(`MOV R13, RDX`);
  E(`MOV R10, RBX`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_wb_ret`);
  E(`MOV R10, RBX`); E(`AND R10, -8`);
  E(`MOV R11, [R10+8]`);
  E(`MOV RDI, R11`); E(`MOV RSI, R12`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JE $ob2_wb_ret`);
  E(`PUSH RAX`);
  E(`MOV R10, RBX`); E(`AND R10, -8`); E(`MOV RDI, [R10+8]`);
  E(`MOV RSI, [RSP]`);
  E(`CALL __ob2_acc_lookup`);
  E(`POP R11`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_wb_ret`);
  E(`MOV R10, RBX`); E(`AND R10, -8`);
  E(`MOV [R10+R11*8+16], R13`);
  E(`$ob2_wb_ret:`);
  E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_shape_without: RDI=shape, RSI=skipSlot -> RAX=newShape ----
  // Rebuilds via interning (data) / fresh (accessor), preserving kinds.
  E(`__ob2_shape_without:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 40`);                  // shape,skip,N,cur,i
  E(`MOV [RSP], RDI`); E(`MOV RBX, RDI`);
  E(`MOV [RSP+8], RSI`);
  E(`MOV R10, [RBX+8]`); E(`MOV [RSP+16], R10`);   // N
  E(`LEA R10, [ob2_shape0]`); E(`MOV R10, [R10]`); E(`MOV [RSP+24], R10`); // cur
  E(`XOR R10, R10`); E(`MOV [RSP+32], R10`);       // i
  E(`$ob2_sw_loop:`);
  E(`MOV R14, [RSP+32]`);
  E(`MOV R15, [RSP+16]`);
  E(`CMP R14, R15`); E(`JGE $ob2_sw_done`);
  E(`CMP R14, [RSP+8]`); E(`JE $ob2_sw_next`);
  E(`MOV R10, [RBX+R14*8+16]`);      // name
  E(`MOV R15, R10`);                 // save (acc_lookup preserves R15)
  E(`MOV RDI, RBX`); E(`MOV RSI, R14`);
  E(`CALL __ob2_acc_lookup`);
  E(`MOV R10, R15`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_sw_acc`);
  E(`MOV RDI, [RSP+24]`); E(`MOV RSI, R10`); E(`XOR RDX, RDX`);
  E(`CALL __ob2_shape_intern`);
  E(`MOV [RSP+24], RAX`);
  E(`JMP $ob2_sw_next`);
  E(`$ob2_sw_acc:`);
  E(`MOV R12, [RAX+16]`);            // getter
  E(`MOV R13, [RAX+24]`);            // setter
  E(`MOV RDI, [RSP+24]`); E(`MOV RSI, R10`); E(`MOV RDX, 1`);
  E(`CALL __ob2_shape_intern`);      // fresh; preserves R12/R13
  E(`MOV [RSP+24], RAX`);            // cur = new
  E(`MOV R10, [RAX+8]`); E(`DEC R10`); // newSlot
  E(`MOV RDI, RAX`); E(`MOV RSI, R10`); E(`MOV RDX, R12`); E(`MOV RCX, R13`);
  E(`CALL __ob2_acc_define`);
  E(`$ob2_sw_next:`);
  E(`MOV R14, [RSP+32]`); E(`INC R14`); E(`MOV [RSP+32], R14`);
  E(`JMP $ob2_sw_loop`);
  E(`$ob2_sw_done:`);
  E(`MOV RAX, [RSP+24]`);
  E(`ADD RSP, 40`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_del: RDI=obj, RSI=name -> RAX=newObj (tagged) ----
  E(`__ob2_del:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 56`);                  // obj,name,objPtr,shape,slot,newShape,newRaw
  E(`MOV [RSP], RDI`); E(`MOV [RSP+8], RSI`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_dl_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`); E(`MOV [RSP+16], R10`);
  E(`LEA R10, [ob2_strtab]`); E(`MOV RDI, [R10]`);
  E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_streq`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_dl_noop`);   // delete __proto__: no-op
  E(`MOV R10, [RSP+16]`); E(`MOV R10, [R10+8]`); E(`MOV [RSP+24], R10`);
  E(`MOV RDI, R10`); E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JE $ob2_dl_noop`);
  E(`MOV [RSP+32], RAX`);
  E(`MOV RDI, [RSP+24]`); E(`MOV RSI, RAX`);
  E(`CALL __ob2_shape_without`);
  E(`MOV [RSP+40], RAX`);
  E(`MOV R12, [RAX+8]`);             // newN
  E(`MOV RDI, ${T_OBJ}`);
  E(`MOV RSI, R12`); E(`SHL RSI, 3`);
  E(`MOV RDX, [RSP+40]`);
  E(`CALL __awtsmoos_alloc_raw`);
  E(`MOV R15, RAX`);                 // tagged newObj
  E(`MOV R10, RAX`); E(`AND R10, -8`); E(`MOV [RSP+48], R10`); // newRaw
  E(`MOV R11, [RSP+16]`);            // oldPtr
  E(`MOV R12, [RSP+24]`); E(`MOV R12, [R12+8]`); // oldN
  E(`MOV R13, [RSP+32]`);            // skip
  E(`XOR RAX, RAX`);                 // i
  E(`XOR R14, R14`);                 // j
  E(`$ob2_dl_cpy:`);
  E(`CMP RAX, R12`); E(`JGE $ob2_dl_cpy2`);
  E(`CMP RAX, R13`); E(`JE $ob2_dl_skip`);
  E(`MOV RDX, [R11+RAX*8+16]`);
  E(`MOV R10, [RSP+48]`);
  E(`MOV [R10+R14*8+16], RDX`);
  E(`INC R14`);
  E(`$ob2_dl_skip:`);
  E(`INC RAX`); E(`JMP $ob2_dl_cpy`);
  E(`$ob2_dl_cpy2:`);
  E(`MOV RDI, [RSP+16]`); E(`MOV RSI, [RSP+48]`);
  E(`CALL __ob2_proto_remap`);
  E(`MOV RAX, R15`);
  E(`JMP $ob2_dl_ret`);
  E(`$ob2_dl_noop:`);
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_dl_ret`);
  E(`$ob2_dl_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_dl_ret:`);
  E(`ADD RSP, 56`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_in: RDI=obj, RSI=name -> RAX=V_TRU/V_FLS ----
  E(`__ob2_in:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`);
  E(`SUB RSP, 40`);                  // obj,name,objPtr,shape
  E(`MOV [RSP], RDI`); E(`MOV [RSP+8], RSI`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_in_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`); E(`MOV [RSP+16], R10`);
  E(`LEA R10, [ob2_strtab]`); E(`MOV RDI, [R10]`);
  E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_streq`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_in_yes`);    // "__proto__" in o -> true
  E(`MOV R10, [RSP+16]`); E(`MOV R10, [R10+8]`); E(`MOV [RSP+24], R10`);
  E(`MOV RDI, R10`); E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JNE $ob2_in_yes`);
  E(`MOV RDI, [RSP+16]`);
  E(`CALL __ob2_proto_of`);
  E(`$ob2_in_cloop:`);
  E(`TEST RAX, RAX`); E(`JZ $ob2_in_no`);
  E(`MOV [RSP+16], RAX`);
  E(`MOV R10, [RAX+8]`); E(`MOV [RSP+24], R10`);
  E(`MOV RDI, R10`); E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JNE $ob2_in_yes`);
  E(`MOV RDI, [RSP+16]`);
  E(`CALL __ob2_proto_of`);
  E(`JMP $ob2_in_cloop`);
  E(`$ob2_in_yes:`); E(`MOV RAX, ${V_TRU}`); E(`JMP $ob2_in_ret`);
  E(`$ob2_in_no:`); E(`MOV RAX, ${V_FLS}`); E(`JMP $ob2_in_ret`);
  E(`$ob2_in_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_in_ret:`);
  E(`ADD RSP, 40`);
  E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_array_index: RDI=nameStr(heap) -> RAX=index or -1 ----
  // Canonical array index: "0".."4294967294", no leading zeros.
  E(`__ob2_array_index:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH R12`); E(`PUSH R13`);
  E(`MOV R10, RDI`); E(`AND R10, -8`);
  E(`MOV R11, [R10+8]`);             // len
  E(`TEST R11, R11`); E(`JZ $ob2_ai_no`);
  E(`CMP R11, 10`); E(`JG $ob2_ai_no`);
  E(`XOR RAX, RAX`);                 // value
  E(`XOR R12, R12`);                 // i
  E(`$ob2_ai_loop:`);
  E(`CMP R12, R11`); E(`JGE $ob2_ai_chk`);
  E(`MOV R13, [R10+R12*2+16]`); E(`AND R13, 65535`);
  E(`CMP R13, 48`); E(`JL $ob2_ai_no`);
  E(`CMP R13, 57`); E(`JG $ob2_ai_no`);
  E(`SUB R13, 48`);
  E(`IMUL RAX, RAX, 10`);
  E(`ADD RAX, R13`);
  E(`CMP RAX, 4294967294`); E(`JG $ob2_ai_no`);
  E(`INC R12`); E(`JMP $ob2_ai_loop`);
  E(`$ob2_ai_chk:`);
  E(`CMP R11, 1`); E(`JE $ob2_ai_yes`);
  E(`MOV R13, [R10+16]`); E(`AND R13, 65535`);
  E(`CMP R13, 48`); E(`JE $ob2_ai_no`);   // leading zero
  E(`$ob2_ai_yes:`);
  E(`JMP $ob2_ai_ret`);
  E(`$ob2_ai_no:`); E(`MOV RAX, -1`);
  E(`$ob2_ai_ret:`);
  E(`POP R13`); E(`POP R12`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_keys: RDI=obj -> RAX=S1 array of name strings (V8 order) ----
  E(`__ob2_keys:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 40`);                  // obj,shape,N,ni,arr
  E(`MOV [RSP], RDI`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_ky_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`);
  E(`MOV R11, [R10+8]`); E(`MOV [RSP+8], R11`); // shape
  E(`MOV R12, [R11+8]`); E(`MOV [RSP+16], R12`); // N
  // pass 1: collect (index,name) into static buffers
  E(`XOR R13, R13`);                 // ni
  E(`XOR R14, R14`);                 // i
  E(`$ob2_ky_p1:`);
  E(`CMP R14, R12`); E(`JGE $ob2_ky_sort`);
  E(`MOV RBX, [RSP+8]`);
  E(`MOV RDI, [RBX+R14*8+16]`);      // name
  E(`PUSH R14`); E(`PUSH R13`); E(`PUSH R12`);
  E(`CALL __ob2_array_index`);
  E(`MOV R15, RAX`);
  E(`POP R12`); E(`POP R13`); E(`POP R14`);
  E(`CMP R15, -1`); E(`JE $ob2_ky_p1n`);
  E(`CMP R13, 1024`); E(`JGE $ob2_ky_trap`);
  E(`LEA R10, [ob2_keys_idx]`);
  E(`MOV [R10+R13*8], R15`);
  E(`MOV RBX, [RSP+8]`);
  E(`MOV R10, [RBX+R14*8+16]`);
  E(`LEA R11, [ob2_keys_nm]`);
  E(`MOV [R11+R13*8], R10`);
  E(`INC R13`);
  E(`$ob2_ky_p1n:`);
  E(`INC R14`); E(`JMP $ob2_ky_p1`);
  E(`$ob2_ky_sort:`);
  E(`MOV [RSP+24], R13`);            // ni
  // insertion sort by index (R13 small)
  E(`MOV R14, 1`);
  E(`$ob2_ky_so:`);
  E(`CMP R14, R13`); E(`JGE $ob2_ky_alloc`);
  E(`LEA R10, [ob2_keys_idx]`);
  E(`MOV R15, [R10+R14*8]`);         // key
  E(`LEA R10, [ob2_keys_nm]`);
  E(`MOV RBX, [R10+R14*8]`);         // name
  E(`MOV R11, R14`);
  E(`$ob2_ky_si:`);
  E(`CMP R11, 0`); E(`JE $ob2_ky_sdone`);
  E(`LEA R10, [ob2_keys_idx]`);
  E(`MOV R12, [R10+R11*8-8]`);
  E(`CMP R12, R15`); E(`JLE $ob2_ky_sdone`);
  E(`MOV [R10+R11*8], R12`);
  E(`LEA R10, [ob2_keys_nm]`);
  E(`MOV R12, [R10+R11*8-8]`);
  E(`MOV [R10+R11*8], R12`);
  E(`DEC R11`); E(`JMP $ob2_ky_si`);
  E(`$ob2_ky_sdone:`);
  E(`LEA R10, [ob2_keys_idx]`);
  E(`MOV [R10+R11*8], R15`);
  E(`LEA R10, [ob2_keys_nm]`);
  E(`MOV [R10+R11*8], RBX`);
  E(`INC R14`); E(`JMP $ob2_ky_so`);
  E(`$ob2_ky_alloc:`);
  E(`MOV R12, [RSP+16]`);            // N
  E(`MOV RDI, ${T_ARR}`);
  E(`MOV RSI, R12`); E(`SHL RSI, 3`);
  E(`MOV RAX, R12`); E(`SHL RAX, 32`); E(`OR RAX, R12`); // meta=(len<<32)|cap
  E(`MOV RDX, RAX`);
  E(`CALL __awtsmoos_alloc_raw`);    // RAX tagged
  E(`MOV [RSP+32], RAX`);
  E(`MOV R15, RAX`); E(`AND R15, -8`); // arrPtr
  // write sorted index names
  E(`MOV R13, [RSP+24]`);            // ni
  E(`XOR R14, R14`);
  E(`$ob2_ky_w1:`);
  E(`CMP R14, R13`); E(`JGE $ob2_ky_w2`);
  E(`LEA R10, [ob2_keys_nm]`);
  E(`MOV R10, [R10+R14*8]`);
  E(`MOV [R15+R14*8+16], R10`);
  E(`INC R14`); E(`JMP $ob2_ky_w1`);
  E(`$ob2_ky_w2:`);
  // pass 2: string names in shape order
  E(`MOV RBX, [RSP+8]`);
  E(`MOV R12, [RSP+16]`);
  E(`XOR R11, R11`);                 // i
  E(`$ob2_ky_p2:`);
  E(`CMP R11, R12`); E(`JGE $ob2_ky_ret`);
  E(`MOV RDI, [RBX+R11*8+16]`);
  E(`PUSH R11`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH RBX`); E(`PUSH R12`);
  E(`CALL __ob2_array_index`);
  E(`MOV R10, RAX`);
  E(`POP R12`); E(`POP RBX`); E(`POP R14`); E(`POP R13`); E(`POP R11`);
  E(`CMP R10, -1`); E(`JNE $ob2_ky_p2n`);
  E(`MOV R10, [RBX+R11*8+16]`);
  E(`MOV [R15+R13*8+16], R10`);
  E(`INC R13`);
  E(`$ob2_ky_p2n:`);
  E(`INC R11`); E(`JMP $ob2_ky_p2`);
  E(`$ob2_ky_ret:`);
  E(`MOV RAX, [RSP+32]`);
  E(`ADD RSP, 40`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);
  E(`$ob2_ky_trap:`); E(`CALL __ob2_trap`);

  // ---- __ob2_arr_get: RDI=arr, RSI=idx(fixnum) -> RAX=value ----
  E(`__ob2_arr_get:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_ag_trap`);
  E(`MOV R10, RSI`); E(`AND R10, 7`); E(`JNZ $ob2_ag_trap`);   // idx must be fixnum
  E(`MOV R10, RDI`); E(`AND R10, -8`);
  E(`MOV R11, [R10]`); E(`CMP R11, ${T_ARR}`); E(`JNE $ob2_ag_trap`);
  E(`MOV R11, RSI`); E(`SAR R11, 3`);            // i
  E(`CMP R11, 0`); E(`JL $ob2_ag_undef`);        // negative -> undefined
  E(`MOV RAX, [R10+8]`); E(`SHR RAX, 32`);      // len
  E(`CMP R11, RAX`); E(`JGE $ob2_ag_undef`);
  E(`MOV RAX, [R10+R11*8+16]`);
  E(`CMP RAX, ${V_HLE}`); E(`JNE $ob2_ag_ret`);
  E(`$ob2_ag_undef:`); E(`MOV RAX, ${V_UNDEF}`);
  E(`$ob2_ag_ret:`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);
  E(`$ob2_ag_trap:`); E(`CALL __ob2_trap`);

  // ---- __ob2_arr_set: RDI=arr, RSI=idx(fixnum), RDX=value -> RAX=newArr ----
  E(`__ob2_arr_set:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 40`);                  // arr,idx,val,arrPtr,newArr
  E(`MOV [RSP], RDI`); E(`MOV [RSP+8], RSI`); E(`MOV [RSP+16], RDX`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_as_trap`);
  E(`MOV R10, RSI`); E(`AND R10, 7`); E(`JNZ $ob2_as_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`); E(`MOV [RSP+24], R10`);
  E(`MOV R11, [R10]`); E(`CMP R11, ${T_ARR}`); E(`JNE $ob2_as_trap`);
  E(`MOV R11, RSI`); E(`SAR R11, 3`);
  E(`CMP R11, 0`); E(`JL $ob2_as_trap`);        // negative index: trap (subset)
  E(`MOV RBX, R11`);                 // i
  E(`MOV R12, [R10+8]`);             // meta
  E(`MOV R13, R12`); E(`SHR R13, 32`);          // len
  E(`MOV R14, R12`); E(`SHL R14, 32`); E(`SHR R14, 32`); // cap = meta low32
  E(`CMP RBX, R14`); E(`JGE $ob2_as_grow`);
  // in-place: store; extend len if needed
  E(`MOV R10, [RSP+24]`); E(`MOV R11, [RSP+16]`);
  E(`MOV [R10+RBX*8+16], R11`);
  E(`CMP RBX, R13`); E(`JL $ob2_as_done`);
  E(`MOV R11, RBX`); E(`ADD R11, 1`);          // newLen = i+1
  E(`SHL R11, 32`); E(`OR R11, R14`);          // meta = (newLen<<32)|cap
  E(`MOV [R10+8], R11`);
  E(`$ob2_as_done:`);
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_as_ret`);
  E(`$ob2_as_grow:`);
  // newCap = max(cap*2, i+1); newLen = i+1
  E(`MOV R15, R14`); E(`SHL R15, 1`);          // cap*2
  E(`MOV R10, RBX`); E(`ADD R10, 1`);          // i+1
  E(`CMP R15, R10`); E(`JGE $ob2_as_nc`);
  E(`MOV R15, R10`);
  E(`$ob2_as_nc:`);
  E(`MOV RDI, ${T_ARR}`);
  E(`MOV RSI, R15`); E(`SHL RSI, 3`);
  E(`MOV RDX, R10`); E(`SHL RDX, 32`); E(`OR RDX, R15`); // meta=(newLen<<32)|newCap
  E(`CALL __awtsmoos_alloc_raw`);              // RAX tagged
  E(`MOV [RSP+32], RAX`);
  E(`MOV R11, RAX`); E(`AND R11, -8`);         // newPtr
  E(`MOV R12, [RSP+24]`);                      // oldPtr
  E(`MOV R13, R14`);                           // old cap (count to copy)
  E(`XOR R14, R14`);
  E(`$ob2_as_cp:`);
  E(`CMP R14, R13`); E(`JGE $ob2_as_fill`);
  E(`MOV R10, [R12+R14*8+16]`);
  E(`MOV [R11+R14*8+16], R10`);
  E(`INC R14`); E(`JMP $ob2_as_cp`);
  E(`$ob2_as_fill:`);
  // fill [oldCap..newCap) with HOLE, then store value at i
  E(`MOV R10, ${V_HLE}`);
  E(`$ob2_as_fl:`);
  E(`CMP R14, R15`); E(`JGE $ob2_as_st`);
  E(`MOV [R11+R14*8+16], R10`);
  E(`INC R14`); E(`JMP $ob2_as_fl`);
  E(`$ob2_as_st:`);
  E(`MOV R10, [RSP+16]`);
  E(`MOV [R11+RBX*8+16], R10`);
  E(`MOV RAX, [RSP+32]`);
  E(`JMP $ob2_as_ret`);
  E(`$ob2_as_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_as_ret:`);
  E(`ADD RSP, 40`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_arr_setlen: RDI=arr, RSI=newLen(fixnum) -> RAX=newArr ----
  E(`__ob2_arr_setlen:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 40`);
  E(`MOV [RSP], RDI`); E(`MOV [RSP+8], RSI`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_al_trap`);
  E(`MOV R10, RSI`); E(`AND R10, 7`); E(`JNZ $ob2_al_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`); E(`MOV [RSP+16], R10`);
  E(`MOV R11, [R10]`); E(`CMP R11, ${T_ARR}`); E(`JNE $ob2_al_trap`);
  E(`MOV RBX, RSI`); E(`SAR RBX, 3`);          // n
  E(`CMP RBX, 0`); E(`JL $ob2_al_trap`);       // negative -> trap (V8 RangeError)
  E(`MOV R12, [R10+8]`);
  E(`MOV R13, R12`); E(`SHR R13, 32`);         // len
  E(`MOV R14, R12`); E(`SHL R14, 32`); E(`SHR R14, 32`); // cap
  E(`CMP RBX, R14`); E(`JG $ob2_al_grow`);
  // fits: update meta; hole-fill truncated tail
  E(`MOV R10, RBX`); E(`SHL R10, 32`); E(`OR R10, R14`);
  E(`MOV R11, [RSP+16]`); E(`MOV [R11+8], R10`);
  E(`CMP RBX, R13`); E(`JGE $ob2_al_done`);
  E(`MOV R10, ${V_HLE}`);
  E(`$ob2_al_hf:`);
  E(`CMP RBX, R13`); E(`JGE $ob2_al_done`);
  E(`MOV [R11+RBX*8+16], R10`);
  E(`INC RBX`); E(`JMP $ob2_al_hf`);
  E(`$ob2_al_done:`);
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_al_ret`);
  E(`$ob2_al_grow:`);
  // grow to cap = n (exact)
  E(`MOV R15, RBX`);                           // newCap = n
  E(`MOV RDI, ${T_ARR}`);
  E(`MOV RSI, R15`); E(`SHL RSI, 3`);
  E(`MOV RDX, RBX`); E(`SHL RDX, 32`); E(`OR RDX, R15`);
  E(`CALL __awtsmoos_alloc_raw`);
  E(`MOV [RSP+24], RAX`);
  E(`MOV R11, RAX`); E(`AND R11, -8`);
  E(`MOV R12, [RSP+16]`);
  E(`MOV R13, R14`);                           // copy cap elems
  E(`XOR R14, R14`);
  E(`$ob2_al_cp:`);
  E(`CMP R14, R13`); E(`JGE $ob2_al_fl2`);
  E(`MOV R10, [R12+R14*8+16]`);
  E(`MOV [R11+R14*8+16], R10`);
  E(`INC R14`); E(`JMP $ob2_al_cp`);
  E(`$ob2_al_fl2:`);
  E(`MOV R10, ${V_HLE}`);
  E(`$ob2_al_f2:`);
  E(`CMP R14, R15`); E(`JGE $ob2_al_dn2`);
  E(`MOV [R11+R14*8+16], R10`);
  E(`INC R14`); E(`JMP $ob2_al_f2`);
  E(`$ob2_al_dn2:`);
  E(`MOV RAX, [RSP+24]`);
  E(`JMP $ob2_al_ret`);
  E(`$ob2_al_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_al_ret:`);
  E(`ADD RSP, 40`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_define: RDI=obj, RSI=name, RDX=kind, RCX=v/getter, R8=setter -> RAX=newObj ----
  E(`__ob2_define:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`); E(`PUSH R15`);
  E(`SUB RSP, 88`);                  // obj,name,kind,vg,setter,objPtr,shape,slot,newShape,skip,oldN
  E(`MOV [RSP], RDI`); E(`MOV [RSP+8], RSI`); E(`MOV [RSP+16], RDX`);
  E(`MOV [RSP+24], RCX`); E(`MOV [RSP+32], R8`);
  E(`MOV R10, RDI`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_df_trap`);
  E(`MOV R10, RDI`); E(`AND R10, -8`); E(`MOV [RSP+40], R10`);
  E(`MOV R10, [R10+8]`); E(`MOV [RSP+48], R10`); // shape
  E(`MOV RDI, R10`); E(`MOV RSI, [RSP+8]`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JE $ob2_df_add`);
  E(`MOV [RSP+56], RAX`);            // slot
  E(`MOV RDI, [RSP+48]`); E(`MOV RSI, RAX`);
  E(`CALL __ob2_acc_lookup`);
  E(`MOV R14, RAX`);
  E(`MOV R10, [RSP+16]`);            // kind
  E(`TEST R14, R14`); E(`JNZ $ob2_df_isacc`);
  E(`TEST R10, R10`); E(`JNZ $ob2_df_rebuild`);
  E(`MOV R10, [RSP+40]`); E(`MOV R11, [RSP+56]`); E(`MOV R12, [RSP+24]`);
  E(`MOV [R10+R11*8+16], R12`);      // in-place data update
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_df_ret`);
  E(`$ob2_df_isacc:`);
  E(`TEST R10, R10`); E(`JZ $ob2_df_rebuild`);
  E(`MOV RDI, [RSP+48]`); E(`MOV RSI, [RSP+56]`);
  E(`MOV RDX, [RSP+24]`); E(`MOV RCX, [RSP+32]`);
  E(`CALL __ob2_acc_define`);        // merge
  E(`MOV RAX, [RSP]`);
  E(`JMP $ob2_df_ret`);
  E(`$ob2_df_rebuild:`);
  E(`MOV RAX, [RSP+56]`);
  E(`MOV [RSP+72], RAX`);            // skip = slot
  E(`MOV RDI, [RSP+48]`); E(`MOV RSI, RAX`);
  E(`CALL __ob2_shape_without`);
  E(`MOV [RSP+48], RAX`);            // shape = base
  E(`JMP $ob2_df_add2`);
  E(`$ob2_df_add:`);
  E(`MOV RAX, -1`); E(`MOV [RSP+72], RAX`); // skip = -1
  E(`$ob2_df_add2:`);
  E(`MOV R10, [RSP+48]`); E(`MOV R10, [R10+8]`); E(`MOV [RSP+80], R10`); // oldN
  E(`MOV RDI, [RSP+48]`); E(`MOV RSI, [RSP+8]`); E(`MOV RDX, [RSP+16]`);
  E(`CALL __ob2_shape_intern`);      // RAX = newShape
  E(`MOV RBX, RAX`);                 // newShape (RBX reusable now)
  E(`MOV R12, [RAX+8]`);             // newN
  E(`MOV RDI, ${T_OBJ}`);
  E(`MOV RSI, R12`); E(`SHL RSI, 3`);
  E(`MOV RDX, RBX`);
  E(`CALL __awtsmoos_alloc_raw`);
  E(`MOV R15, RAX`);                 // tagged newObj
  E(`MOV R10, RAX`); E(`AND R10, -8`); E(`MOV [RSP+64], R10`); // newRaw
  E(`MOV R11, [RSP+40]`);            // oldPtr
  E(`MOV R12, [RSP+80]`);            // oldN
  E(`MOV R13, [RSP+72]`);            // skip
  E(`XOR RAX, RAX`);                 // i
  E(`XOR R14, R14`);                 // j
  E(`$ob2_df_cpy:`);
  E(`CMP RAX, R12`); E(`JGE $ob2_df_cpy2`);
  E(`CMP RAX, R13`); E(`JE $ob2_df_skip`);
  E(`MOV RDX, [R11+RAX*8+16]`);
  E(`MOV R10, [RSP+64]`);
  E(`MOV [R10+R14*8+16], RDX`);
  E(`INC R14`);
  E(`$ob2_df_skip:`);
  E(`INC RAX`); E(`JMP $ob2_df_cpy`);
  E(`$ob2_df_cpy2:`);
  // R14 = j = newN-1: destination slot for the new prop
  E(`MOV R10, [RSP+64]`);            // newRaw
  E(`MOV R11, [RSP+16]`);            // kind
  E(`TEST R11, R11`); E(`JNZ $ob2_df_accv`);
  E(`MOV R11, [RSP+24]`);            // vg
  E(`MOV [R10+R14*8+16], R11`);
  E(`JMP $ob2_df_remap`);
  E(`$ob2_df_accv:`);
  E(`MOV R11, ${V_UNDEF}`);
  E(`MOV [R10+R14*8+16], R11`);
  E(`MOV RDI, RBX`);                 // newShape
  E(`MOV RSI, R14`);                 // slot
  E(`MOV RDX, [RSP+24]`);            // getter
  E(`MOV RCX, [RSP+32]`);            // setter
  E(`CALL __ob2_acc_define`);
  E(`$ob2_df_remap:`);
  E(`MOV RDI, [RSP+40]`); E(`MOV RSI, [RSP+64]`);
  E(`CALL __ob2_proto_remap`);
  E(`MOV RAX, R15`);
  E(`JMP $ob2_df_ret`);
  E(`$ob2_df_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_df_ret:`);
  E(`ADD RSP, 88`);
  E(`POP R15`); E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_strict_eq: RDI=a, RSI=b -> RAX=V_TRU/V_FLS (S1 §12) ----
  // Emitter handles: both-NaN -> false; u64-equal -> true. Here a != b.
  E(`__ob2_strict_eq:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`);
  E(`MOV RBX, RDI`); E(`MOV R12, RSI`);
  E(`MOV R10, RBX`); E(`AND R10, 7`);
  E(`MOV R11, R12`); E(`AND R11, 7`);
  E(`CMP R10, R11`); E(`JNE $ob2_eq_cross`);
  E(`CMP R10, ${TAG_DOUBLE}`); E(`JE $ob2_eq_dbl`);
  E(`CMP R10, ${TAG_HEAPREF}`); E(`JE $ob2_eq_hr`);
  E(`JMP $ob2_eq_false`);            // fixnum/imm/smallstr, a!=b
  E(`$ob2_eq_cross:`);
  E(`CMP R10, ${TAG_FIXNUM}`); E(`JE $ob2_eq_t0`);
  E(`CMP R10, ${TAG_DOUBLE}`); E(`JNE $ob2_eq_false`);
  E(`CMP R11, ${TAG_FIXNUM}`); E(`JNE $ob2_eq_false`);
  E(`MOV R10, R12`); E(`MOV R11, RBX`);   // f=R12, d=RBX
  E(`JMP $ob2_eq_fd`);
  E(`$ob2_eq_t0:`);
  E(`CMP R11, ${TAG_DOUBLE}`); E(`JNE $ob2_eq_false`);
  E(`MOV R10, RBX`); E(`MOV R11, R12`);   // f=RBX, d=R12
  E(`$ob2_eq_fd:`);
  E(`TEST R10, R10`); E(`JNZ $ob2_eq_false`); // fixnum must be 0
  E(`MOV R10, R11`); E(`AND R10, -8`); E(`MOV R10, [R10+16]`);
  E(`SHL R10, 1`); E(`JZ $ob2_eq_true`);  // ±0
  E(`JMP $ob2_eq_false`);
  E(`$ob2_eq_dbl:`);
  E(`MOV R10, RBX`); E(`AND R10, -8`); E(`MOV R10, [R10+16]`);
  E(`MOV R11, R12`); E(`AND R11, -8`); E(`MOV R11, [R11+16]`);
  E(`MOV RAX, R10`); E(`SHL RAX, 1`);
  E(`MOV RDX, R11`); E(`SHL RDX, 1`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_eq_d1`);
  E(`TEST RDX, RDX`); E(`JNZ $ob2_eq_false`);
  E(`JMP $ob2_eq_true`);              // both ±0
  E(`$ob2_eq_d1:`);
  E(`TEST RDX, RDX`); E(`JZ $ob2_eq_false`);
  E(`MOV RAX, R10`); E(`SHR RAX, 52`); E(`AND RAX, 2047`);
  E(`CMP RAX, 2047`); E(`JNE $ob2_eq_d2`);
  E(`MOV RAX, R10`); E(`SHL RAX, 12`); E(`TEST RAX, RAX`); E(`JNZ $ob2_eq_false`); // NaN
  E(`$ob2_eq_d2:`);
  E(`MOV RAX, R11`); E(`SHR RAX, 52`); E(`AND RAX, 2047`);
  E(`CMP RAX, 2047`); E(`JNE $ob2_eq_d3`);
  E(`MOV RAX, R11`); E(`SHL RAX, 12`); E(`TEST RAX, RAX`); E(`JNZ $ob2_eq_false`); // NaN
  E(`$ob2_eq_d3:`);
  E(`CMP R10, R11`); E(`JE $ob2_eq_true`);
  E(`JMP $ob2_eq_false`);
  E(`$ob2_eq_hr:`);
  E(`MOV R10, RBX`); E(`AND R10, -8`); E(`MOV R10, [R10]`);
  E(`MOV R11, R12`); E(`AND R11, -8`); E(`MOV R11, [R11]`);
  E(`CMP R10, ${T_STR}`); E(`JNE $ob2_eq_false`);
  E(`CMP R11, ${T_STR}`); E(`JNE $ob2_eq_false`);
  E(`MOV RDI, RBX`); E(`MOV RSI, R12`);
  E(`CALL __ob2_streq`);
  E(`TEST RAX, RAX`); E(`JZ $ob2_eq_false`);
  E(`JMP $ob2_eq_true`);
  E(`$ob2_eq_false:`); E(`MOV RAX, ${V_FLS}`); E(`JMP $ob2_eq_ret`);
  E(`$ob2_eq_true:`); E(`MOV RAX, ${V_TRU}`);
  E(`$ob2_eq_ret:`);
  E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- Object.prototype methods (closures; R11=receiver, RDI..=args) ----
  E(`__ob2_m_hasown:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`);
  E(`MOV RBX, R11`); E(`MOV R12, RDI`);
  E(`MOV R10, RBX`); E(`AND R10, 7`); E(`CMP R10, ${TAG_HEAPREF}`); E(`JNE $ob2_mh_f`);
  E(`MOV R10, RBX`); E(`AND R10, -8`); E(`MOV RDI, [R10+8]`);
  E(`MOV RSI, R12`);
  E(`CALL __ob2_shape_scan`);
  E(`CMP RAX, -1`); E(`JE $ob2_mh_f`);
  E(`MOV RAX, ${V_TRU}`); E(`JMP $ob2_mh_r`);
  E(`$ob2_mh_f:`); E(`MOV RAX, ${V_FLS}`);
  E(`$ob2_mh_r:`);
  E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  E(`__ob2_m_tostring:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`LEA R10, [ob2_strtab]`);
  E(`MOV RAX, [R10+${gen.intern("[object Object]") * 8}]`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  E(`__ob2_m_valueof:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`MOV RAX, R11`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  E(`__ob2_m_pienum:`);
  E(`JMP __ob2_m_hasown`);           // all props enumerable

  // ---- __ob2_make_objproto ----
  E(`__ob2_make_objproto:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`);
  E(`LEA R10, [ob2_shape0]`); E(`MOV RBX, [R10]`);
  E(`LEA R10, [ob2_strtab]`);
  for (const mname of ["hasOwnProperty", "toString", "valueOf", "propertyIsEnumerable"]) {
    const mid = gen.intern(mname);
    E(`MOV RDI, RBX`); E(`MOV RSI, [R10+${mid * 8}]`); E(`XOR RDX, RDX`);
    E(`CALL __ob2_shape_intern`);
    E(`MOV RBX, RAX`);
  }
  E(`MOV RDI, ${T_OBJ}`); E(`MOV RSI, 32`); E(`MOV RDX, RBX`);
  E(`CALL __awtsmoos_alloc_raw`);
  E(`MOV R12, RAX`);                 // tagged
  E(`MOV R13, RAX`); E(`AND R13, -8`); // raw
  E(`LEA RDI, [__ob2_m_hasown]`); E(`CALL __ob2_make_closure`); E(`MOV [R13+16], RAX`);
  E(`LEA RDI, [__ob2_m_tostring]`); E(`CALL __ob2_make_closure`); E(`MOV [R13+24], RAX`);
  E(`LEA RDI, [__ob2_m_valueof]`); E(`CALL __ob2_make_closure`); E(`MOV [R13+32], RAX`);
  E(`LEA RDI, [__ob2_m_pienum]`); E(`CALL __ob2_make_closure`); E(`MOV [R13+40], RAX`);
  E(`LEA R10, [ob2_objproto]`); E(`MOV [R10], R12`);
  E(`MOV RDI, R13`); E(`XOR RSI, RSI`);
  E(`CALL __ob2_set_proto`);         // Object.prototype's proto = null
  E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_init ----
  E(`__ob2_init:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`); E(`PUSH R14`);
  E(`XOR RDI, RDI`);
  E(`CALL __ob2_shape_alloc`);
  E(`LEA R10, [ob2_shape0]`); E(`MOV [R10], RAX`);
  // interned strings -> heap strings
  for (let id = 0; id < gen.internList.length; id++) {
    const name = gen.internList[id];
    const nq = Math.ceil((name.length * 2) / 8);
    E(`MOV RDI, ${T_STR}`);
    E(`MOV RSI, ${name.length * 2}`);
    E(`MOV RDX, ${name.length}`);
    E(`CALL __awtsmoos_alloc_raw`);
    E(`MOV R12, RAX`); E(`AND R12, -8`);
    E(`LEA R10, [ob2_sdata_${id}]`);
    for (let q = 0; q < nq; q++) {
      E(`MOV R13, [R10+${q * 8}]`);
      E(`MOV [R12+${16 + q * 8}], R13`);
    }
    E(`LEA R10, [ob2_strtab]`);
    E(`MOV [R10+${id * 8}], RAX`);
  }
  E(`CALL __ob2_make_objproto`);
  // function-value closures
  for (let fi = 0; fi < gen.fnValueNames.length; fi++) {
    E(`LEA RDI, [${gen.fnValueNames[fi]}]`);
    E(`CALL __ob2_make_closure`);
    E(`LEA R10, [ob2_fntab]`);
    E(`MOV [R10+${fi * 8}], RAX`);
  }
  E(`POP R14`); E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- output helpers ----
  E(`__ob2_write:`);                 // RDI=ptr, RSI=len
  E(`MOV RDX, RSI`); E(`MOV RSI, RDI`); E(`MOV RDI, 1`); E(`MOV RAX, 1`); E(`SYSCALL`); E(`RET`);

  E(`__ob2_print_int:`);             // RDI=int64
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`);
  E(`MOV RAX, RDI`);
  E(`LEA R12, [ob2_numbuf]`); E(`ADD R12, 64`);
  E(`MOV RBX, R12`);
  E(`MOV R13, 0`);
  E(`CMP RAX, 0`); E(`JGE $ob2_pi_pos`);
  E(`NEG RAX`); E(`MOV R13, 1`);
  E(`$ob2_pi_pos:`);
  E(`MOV R10, 10`);
  E(`$ob2_pi_loop:`);
  E(`XOR RDX, RDX`); E(`DIV R10`);
  E(`ADD RDX, 48`);
  E(`DEC RBX`); E(`MOV BYTE PTR [RBX], DL`);
  E(`TEST RAX, RAX`); E(`JNZ $ob2_pi_loop`);
  E(`CMP R13, 0`); E(`JE $ob2_pi_done`);
  E(`DEC RBX`); E(`MOV BYTE PTR [RBX], 45`);
  E(`$ob2_pi_done:`);
  E(`MOV RDI, RBX`); E(`MOV RSI, R12`); E(`SUB RSI, RBX`);
  E(`CALL __ob2_write`);
  E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);

  // ---- __ob2_print_val: RDI=tagged -> prints JS-literal form ----
  E(`__ob2_print_val:`);
  E(`PUSH RBP`); E(`MOV RBP, RSP`);
  E(`PUSH RBX`); E(`PUSH R12`); E(`PUSH R13`);
  E(`MOV RBX, RDI`);
  E(`MOV R10, RBX`); E(`AND R10, 7`);
  E(`JZ $ob2_pv_fix`);
  E(`CMP R10, ${TAG_IMM}`); E(`JE $ob2_pv_imm`);
  E(`CMP R10, ${TAG_SMALLSTR}`); E(`JE $ob2_pv_ss`);
  E(`CMP R10, ${TAG_HEAPREF}`); E(`JE $ob2_pv_hr`);
  E(`JMP $ob2_pv_trap`);
  E(`$ob2_pv_fix:`);
  E(`SAR RBX, 3`); E(`MOV RDI, RBX`); E(`CALL __ob2_print_int`); E(`JMP $ob2_pv_nl`);
  E(`$ob2_pv_imm:`);
  E(`CMP RBX, ${V_TRU}`); E(`JE $ob2_pv_true`);
  E(`CMP RBX, ${V_FLS}`); E(`JE $ob2_pv_false`);
  E(`CMP RBX, ${V_UNDEF}`); E(`JE $ob2_pv_undef`);
  E(`CMP RBX, ${V_NUL}`); E(`JE $ob2_pv_null`);
  E(`JMP $ob2_pv_trap`);
  E(`$ob2_pv_true:`); E(`LEA RDI, [ob2_c_true]`); E(`MOV RSI, 4`); E(`CALL __ob2_write`); E(`JMP $ob2_pv_nl`);
  E(`$ob2_pv_false:`); E(`LEA RDI, [ob2_c_false]`); E(`MOV RSI, 5`); E(`CALL __ob2_write`); E(`JMP $ob2_pv_nl`);
  E(`$ob2_pv_undef:`); E(`LEA RDI, [ob2_c_undef]`); E(`MOV RSI, 9`); E(`CALL __ob2_write`); E(`JMP $ob2_pv_nl`);
  E(`$ob2_pv_null:`); E(`LEA RDI, [ob2_c_null]`); E(`MOV RSI, 4`); E(`CALL __ob2_write`); E(`JMP $ob2_pv_nl`);
  E(`$ob2_pv_ss:`);
  // smallstr: len=(v>>3)&3, units from bit 5; print low byte of each (ASCII tests)
  E(`MOV R12, RBX`); E(`SHR R12, 3`); E(`AND R12, 3`);
  E(`MOV R13, RBX`); E(`SHR R13, 5`);
  E(`XOR R10, R10`);
  E(`$ob2_pv_sslp:`);
  E(`CMP R10, R12`); E(`JGE $ob2_pv_nl`);
  E(`MOV RAX, R13`); E(`AND RAX, 255`);
  E(`LEA RDI, [ob2_chbuf]`); E(`MOV BYTE PTR [RDI], AL`);
  E(`MOV RSI, 1`); E(`CALL __ob2_write`);
  E(`SHR R13, 16`);
  E(`INC R10`); E(`JMP $ob2_pv_sslp`);
  E(`$ob2_pv_hr:`);
  E(`MOV R12, RBX`); E(`AND R12, -8`);
  E(`MOV R10, [R12]`); E(`CMP R10, ${T_STR}`); E(`JNE $ob2_pv_trap`);
  E(`MOV R13, [R12+8]`);             // len units
  E(`LEA R12, [R12+16]`);
  E(`XOR R10, R10`);
  E(`$ob2_pv_hlp:`);
  E(`CMP R10, R13`); E(`JGE $ob2_pv_nl`);
  E(`MOV RAX, [R12+R10*2]`); E(`AND RAX, 255`);
  E(`LEA RDI, [ob2_chbuf]`); E(`MOV BYTE PTR [RDI], AL`);
  E(`MOV RSI, 1`); E(`CALL __ob2_write`);
  E(`INC R10`); E(`JMP $ob2_pv_hlp`);
  E(`$ob2_pv_nl:`);
  E(`LEA RDI, [ob2_c_nl]`); E(`MOV RSI, 1`); E(`CALL __ob2_write`);
  E(`JMP $ob2_pv_ret`);
  E(`$ob2_pv_trap:`); E(`CALL __ob2_trap`);
  E(`$ob2_pv_ret:`);
  E(`POP R13`); E(`POP R12`); E(`POP RBX`);
  E(`MOV RSP, RBP`); E(`POP RBP`); E(`RET`);
} // end emitObjRuntime

// ===========================================================================
// Main entry + data section + public API
// ===========================================================================

function emitMain(gen, entry) {
  const E = (s) => gen.emit(s);
  E(`start:`);
  E(`CALL __ob2_init`);
  if (entry && entry.args) {
    entry.args.forEach((a, i) => E(`MOV ${ARG_REGS[i]}, ${BigInt(a) * 8n}`));
  }
  if (entry && entry.repeat) {
    E(`MOV RBX, ${entry.repeat}`);
    E(`$ob2_rep:`);
    E(`CALL ${entry.name}`);
    E(`DEC RBX`);
    E(`JNZ $ob2_rep`);
  } else {
    E(`CALL ${entry.name}`);
  }
  E(`MOV RDI, RAX`);
  E(`CALL __ob2_print_val`);
  E(`MOV RAX, 60`);
  E(`XOR RDI, RDI`);
  E(`SYSCALL`);
}

function emitDataSection(gen) {
  const D = (s) => gen.emitData(s);
  for (let i = 0; i < gen.icCount; i++) D(`ob2_ic_${i}: ${zb(24)}`);
  if (gen.internList.length) D(`ob2_strtab: ${zb(8 * gen.internList.length)}`);
  else D(`ob2_strtab: ${zb(8)}`);
  gen.internList.forEach((name, id) => {
    const bs = utf16Bytes(name);
    D(`ob2_sdata_${id}: ${bs.length ? bs.join(",") : zb(8)}`);
  });
  D(`ob2_shape0: ${dq(0)}`);
  D(`ob2_objproto: ${dq(0)}`);
  D(`ob2_trans: ${zb(32 * TRANS_CAP)}`);
  D(`ob2_trans_count: ${dq(0)}`);
  D(`ob2_proto: ${zb(16 * PROTO_CAP)}`);
  D(`ob2_proto_count: ${dq(0)}`);
  D(`ob2_acc: ${zb(32 * ACC_CAP)}`);
  D(`ob2_acc_count: ${dq(0)}`);
  D(`ob2_keys_idx: ${zb(8 * 1024)}`);
  D(`ob2_keys_nm: ${zb(8 * 1024)}`);
  D(`ob2_fntab: ${zb(8 * Math.max(1, gen.fnValueNames.length))}`);
  D(`ob2_c_true: "true"`);
  D(`ob2_c_false: "false"`);
  D(`ob2_c_undef: "undefined"`);
  D(`ob2_c_null: "null"`);
  D(`ob2_c_nl: "\\n"`);
  D(`ob2_chbuf: ${zb(8)}`);
  D(`ob2_numbuf: ${zb(64)}`);
}

export { ObjAsmGen };

/**
 * Transpile JS (dynamic-object subset) to S1-conformant x86_64 assembly.
 * @param {string} jsSource
 * @param {{name: string, args: number[]}|null} entry
 * @returns {Promise<{asm: string}>}
 */
export async function transpileObjJsToAsm(jsSource, entry, opts) {
  const Parser = await require("../../MerkavaASTParser/parser-core.js");
  const program = new Parser(String(jsSource)).parse();
  const g = new ObjAsmGen();
  if (opts && opts.repeat) g.repeatOverride = opts.repeat;
  const asm = g.run(program, entry);
  return { asm };
}

/**
 * Compile JS straight to a native binary via the S1 dynamic-object backend.
 * The kernel's return value is printed in JS-literal form (number, true,
 * false, undefined, null, string).
 * @param {string} jsSource
 * @param {{name: string, args: number[]}|null} entry
 * @param {object} [opts] - {repeat: n}
 * @returns {Promise<{path, asm, compileMs}>}
 */
export async function compileObjKernel(jsSource, entry, opts) {
  const t0 = Date.now();
  const { asm } = await transpileObjJsToAsm(jsSource, entry, opts);
  const out = await compileNativeAsm(asm, "linux-x64-static");
  const compileMs = Date.now() - t0;
  const { chmodSync, mkdirSync, writeFileSync } = await import("fs");
  const { tmpdir } = await import("os");
  const { join } = await import("path");
  const WORK = join(tmpdir(), "merkava-obj-native");
  mkdirSync(WORK, { recursive: true });
  const path = join(WORK, `o${process.pid}_${Date.now() % 1000000}`);
  writeFileSync(path, Buffer.from(out.bytes));
  chmodSync(path, 0o755);
  return { path, asm, compileMs };
}

// "name(1, 2)" -> {name, args}
export function parseObjEntry(entryCall) {
  const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*$/.exec(String(entryCall));
  if (!m) throw new Error(`jsObj: bad entry '${entryCall}'`);
  const args = m[2].trim() === "" ? [] : m[2].split(",").map(s => {
    const v = Number(s.trim());
    if (!Number.isInteger(v)) throw new Error(`jsObj: entry arg '${s}' must be an integer`);
    return v;
  });
  if (args.length > 6) throw new Error("jsObj: max 6 entry args");
  return { name: m[1], args };
}
