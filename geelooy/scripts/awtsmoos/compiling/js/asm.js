// B"H
// Merkava JS→Native, direct-assembly backend.
//
// Integer-subset JavaScript -> portable x86_64 assembly -> real machine code
// via the self-hosted Awtsmoos assembler + ELF writer. Register-resident
// codegen: locals pinned to callee-saved registers, tight loops with zero
// memory traffic, comparisons fused directly into jumps.
//
// This is the tier that beats V8: no interpreter, no type guards, no GC
// write barriers, no deopt machinery — just the hot loop in registers.
//
// Subset: same as transpile.js (integer arithmetic, functions, loops).
// Differences from the C backend: for-init declarations are fine here,
// casts are unnecessary, 64-bit literals are native.

import { createRequire } from "module";
import { compileNativeAsm } from "../native/compiler.js";

const require = createRequire(import.meta.url);

const PINNED = ["RBX", "R12", "R13", "R14", "R15"]; // callee-saved, max 5 reg locals
const ARG_REGS = ["RDI", "RSI", "RDX", "RCX", "R8", "R9"];
const SCRATCH = ["R10", "R11"]; // caller-saved expression temps (dead across calls)

const INT64_MIN = -(2n ** 63n);
const INT64_MAX = 2n ** 63n - 1n;

function fail(msg, node) {
  const where = node && node.start !== undefined ? ` at offset ${node.start}` : "";
  throw new Error(`jsAsm: ${msg}${where}`);
}

// Comparison -> {setcc, jumpIfTrue, jumpIfFalse} for signed 64-bit.
const CMP_OPS = {
  "<":  { set: "SETL",  jt: "JL",  jf: "JGE" },
  "<=": { set: "SETLE", jt: "JLE", jf: "JG" },
  ">":  { set: "SETG",  jt: "JG",  jf: "JLE" },
  ">=": { set: "SETGE", jt: "JGE", jf: "JL" },
  "==": { set: "SETE",  jt: "JE",  jf: "JNE" },
  "!=": { set: "SETNE", jt: "JNE", jf: "JE" },
};

// ---------------------------------------------------------------------------
// Native tier v2 (stream 7): codegen extension registry.
//
// Streams building new value domains (strings, arrays, objects, JSON) plug in
// here WITHOUT touching the integer core below. Each extension registers
// handlers for any of four dispatch points:
//
//   literal(gen, node) — node is an ESTree Literal. Return true if fully
//                        handled (value in RAX).
//   binary(gen, node)  — node is an ESTree BinaryExpression. Return true if
//                        handled (e.g. string '+' concatenation).
//   member(gen, node)  — node is an ESTree MemberExpression. Return true if
//                        handled (e.g. heap-object property load).
//   call(gen, node)    — node is an ESTree CallExpression. Return true if
//                        handled (e.g. runtime-helper calls).
//
// Contract: handlers run BEFORE the integer core at each dispatch point and
// must return a strict `true` only when they emitted complete code leaving the
// result in RAX. Anything else (falsy return, or no handler for the hook)
// falls through to the integer core, whose behavior is unchanged when no
// extension is registered. Registration order decides priority;
// re-registering a name replaces the previous handlers.
//
// Helpers for extensions (on the AsmGen instance passed as `gen`):
//   gen.extensionData(name, text) — a top-level .data chunk, emitted once per
//                                   name (string bytes, bump-pointer qwords).
//   gen.extensionCode(name, text) — a top-level .code chunk (runtime helpers),
//                                   emitted once per name, after driverFns().
//   gen.emit / gen.lbl / gen.expr / gen.exprVoid / gen.locOf / ... — the full
//     AsmGen surface. The RAX-result and R10/R11-scratch conventions apply.
// ---------------------------------------------------------------------------
const codegenExtensions = [];
const EXT_HOOK_NAMES = ["literal", "binary", "member", "call"];

export function registerCodegenExtension(name, handlers) {
  if (typeof name !== "string" || !name) fail("extension name must be a non-empty string");
  if (!handlers || typeof handlers !== "object") fail(`extension '${name}': handlers must be an object`);
  for (const k of Object.keys(handlers)) {
    if (!EXT_HOOK_NAMES.includes(k)) fail(`extension '${name}': unknown hook '${k}' (want ${EXT_HOOK_NAMES.join("|")})`);
    if (typeof handlers[k] !== "function") fail(`extension '${name}': hook '${k}' must be a function`);
  }
  const i = codegenExtensions.findIndex(e => e.name === name);
  if (i >= 0) codegenExtensions[i] = { name, handlers };
  else codegenExtensions.push({ name, handlers });
  return name;
}

export function unregisterCodegenExtension(name) {
  const i = codegenExtensions.findIndex(e => e.name === name);
  if (i >= 0) codegenExtensions.splice(i, 1);
  return i >= 0;
}

export function listCodegenExtensions() {
  return codegenExtensions.map(e => e.name);
}

// Exit code the native binary uses to signal a tiering bailout: the operation
// hit a case the integer core cannot represent exactly (overflow, inexact
// division, uncompiled call, ...). The host re-runs the call interpreted.
export const MERKAVA_BAILOUT_EXIT = 42;
// Double-safe-integer bound: |result| > this needs a bailout, because int64
// and IEEE-754 semantics can diverge there even without x86 overflow.
export const MERKAVA_SAFE_INT_MAX = 9007199254740991;

class AsmGen {
  constructor() {
    this.lines = [];
    this.labelN = 0;
    this.functions = new Set();
    this.locals = new Map();   // name -> {reg} | {stackOff}
    this.loopStack = [];       // {breakLbl, contLbl}
    this.stackReserve = 0;
    // Stream 7: tiering flags (off by default — the integer core's default
    // codegen is byte-identical with them off).
    this.checkedArithmetic = false; // overflow/safe-range/div bailout traps
    this.nativeDepthGuard = false;  // native call-depth guard (tiering)
    this.entryNargs = 0;            // argv-mode arg count (tiering)
    this.extData = [];              // extension .data chunks
    this.extCode = [];              // extension .code chunks
    this.extSeen = new Set();       // dedup keys for the above
  }

  // Stream 7: run extension handlers for a dispatch hook. The first handler
  // returning strict true wins (result in RAX); anything else falls through
  // to the integer core.
  extensionHook(hook, node) {
    if (!codegenExtensions.length) return false;
    for (const ext of codegenExtensions) {
      const fn = ext.handlers[hook];
      if (typeof fn !== "function") continue;
      let handled = false;
      try { handled = fn(this, node) === true; }
      catch (e) { throw new Error(`jsAsm: extension '${ext.name}' hook '${hook}' failed: ${e && e.message}`); }
      if (handled) return true;
    }
    return false;
  }

  // Stream 7: extension-contributed top-level asm, emitted once per name.
  extensionData(name, text) {
    if (this.extSeen.has("data:" + name)) return;
    this.extSeen.add("data:" + name);
    this.extData.push(text);
  }
  extensionCode(name, text) {
    if (this.extSeen.has("code:" + name)) return;
    this.extSeen.add("code:" + name);
    this.extCode.push(text);
  }
  extensionSections() {
    if (!this.extData.length && !this.extCode.length) return "";
    const L = [];
    for (const chunk of this.extData) { L.push(".data", chunk); }
    L.push(".code");
    for (const chunk of this.extCode) L.push(chunk);
    L.push(".code");
    return L.join("\n");
  }

  // Stream 7: checked-arithmetic guards. The tiering maintains the invariant
  // that every value in a register is a safe integer (|v| <= 2^53-1):
  // arguments are marshal-checked, literals are analysis-checked, and every
  // op below traps unless its result is safe. Under that invariant ADD/SUB
  // can never wrap int64 (|a+b| <= 2^54-2 < 2^63), so the safe-range check
  // alone is exact — no overflow flag needed (the assembler has no JO).
  // A trap means "the interpreter computes this in doubles"; the host
  // re-runs the whole call interpreted (exit 42). R11 is the scratch.
  checkedIntResult() { this.checkedIntResultReg("RAX"); }
  checkedIntResultReg(reg) {
    if (!this.checkedArithmetic) return;
    this.emit(`MOV R11, ${MERKAVA_SAFE_INT_MAX}`);
    this.emit(`CMP ${reg}, R11`);
    this.emit(`JG $jsa_bailout_trap`);
    this.emit(`NEG R11`);
    this.emit(`CMP ${reg}, R11`);
    this.emit(`JL $jsa_bailout_trap`);
  }
  // Stream 7: checked multiply. RAX=a, R10=b (safe ints). The 64-bit product
  // can wrap, so it is verified by division: writing p = a*b - k*2^64, if
  // k != 0 then p/a != b or p%a != 0 (since |k*2^64/a| >= 2^11 > 0 and a
  // divides k*2^64 only when the quotient differs). a==0 is exact directly.
  // The IDIV is fault-free: |p| < 2^63, 1 <= |a| <= 2^53. Result in RAX.
  checkedMul() {
    const done = this.lbl("muldone");
    this.emit(`PUSH R10`);              // save b
    this.emit(`PUSH RAX`);              // save a
    this.emit(`IMUL RAX, R10`);         // RAX = p (maybe wrapped)
    this.emit(`MOV R11, RAX`);          // R11 = p
    this.emit(`POP RAX`);               // RAX = a
    this.emit(`CMP RAX, 0`);
    this.emit(`JE ${done}`);            // a==0: p==0 exact, RAX already 0
    this.emit(`MOV R10, R11`);          // R10 = p
    this.emit(`MOV R11, RAX`);          // R11 = a (divisor)
    this.emit(`MOV RAX, R10`);          // RAX = p (dividend)
    this.emit(`CQO`);
    this.emit(`IDIV R11`);              // RAX = p/a, RDX = rem
    this.emit(`CMP RDX, 0`);
    this.emit(`JNE $jsa_bailout_trap`);
    this.emit(`CMP RAX, QWORD PTR [RSP]`); // quotient == b?
    this.emit(`JNE $jsa_bailout_trap`);
    this.emit(`MOV RAX, R10`);          // RAX = p
    this.emit(`${done}:`);
    this.emit(`POP R11`);               // discard saved b
  }
  // Stream 7: checked division guards. R10 = divisor, RAX = dividend.
  // Traps on division by zero (JS: ±Infinity/NaN) and INT64_MIN / -1 (x86
  // fault; JS: 2^63). Callers add the inexact-division check (RDX != 0).
  emitDivGuards() {
    if (!this.checkedArithmetic) return;
    const ok = this.lbl("divok");
    this.emit(`CMP R10, 0`);
    this.emit(`JZ $jsa_bailout_trap`);
    this.emit(`CMP R10, -1`);
    this.emit(`JNE ${ok}`);
    this.emit(`MOV R11, -9223372036854775808`);
    this.emit(`CMP RAX, R11`);
    this.emit(`JE $jsa_bailout_trap`);
    this.emit(`${ok}:`);
  }
  // Stream 7: ToInt32 mask of RAX (resp. reg): SHL 32 then SAR 32 sign-extends
  // the low 32 bits, exactly JS ToInt32 for safe-integer inputs.
  toInt32RAX() {
    this.emit(`SHL RAX, 32`);
    this.emit(`SAR RAX, 32`);
  }

  emit(s) { this.lines.push(s); }
  lbl(prefix) { return `$jsa_${prefix}_${this.labelN++}`; }

  run(program, entry) {
    if (!program || program.type !== "Program") fail("expected Program node");
    // Split: function declarations stay top-level; other statements are
    // auto-wrapped into a __merkava_kernel function (last expression -> return).
    const fns = [], rest = [];
    for (const stmt of program.body || []) (stmt.type === "FunctionDeclaration" ? fns : rest).push(stmt);
    let effEntry = entry;
    if (rest.length) {
      if (effEntry) fail("entry provided but program has top-level statements", rest[0]);
      for (const s of rest) if (s.type === "FunctionDeclaration") fail("unreachable", s);
      const bodyStmts = rest.map(s => {
        if (s.type === "VariableDeclaration" || s.type === "ExpressionStatement" ||
            s.type === "IfStatement" || s.type === "WhileStatement" || s.type === "ForStatement" ||
            s.type === "ReturnStatement" || s.type === "BlockStatement" ||
            s.type === "BreakStatement" || s.type === "ContinueStatement") return s;
        fail(`top-level ${s.type} not supported`, s);
      });
      const last = bodyStmts[bodyStmts.length - 1];
      if (last && last.type === "ExpressionStatement") {
        bodyStmts[bodyStmts.length - 1] = { type: "ReturnStatement", argument: last.expression };
      }
      fns.push({
        type: "FunctionDeclaration",
        id: { type: "Identifier", name: "__merkava_kernel" },
        params: [],
        body: { type: "BlockStatement", body: bodyStmts },
      });
      effEntry = { name: "__merkava_kernel", args: [] };
    }
    if (this.repeatOverride && effEntry) effEntry = { ...effEntry, repeat: this.repeatOverride };
    for (const stmt of fns) {
      if (stmt.type !== "FunctionDeclaration") fail(`top-level ${stmt.type} not supported`, stmt);
      if (!stmt.id || !stmt.id.name) fail("anonymous functions not supported", stmt);
      this.functions.add(stmt.id.name);
    }
    this.emit(`; B"H`);
    this.emit(`.code`);
    this.emit(`start:`);
    this.emit(`CALL main`);
    this.emit(`MOV RDI, RAX`);
    this.emit(`MOV RAX, 60`);
    this.emit(`SYSCALL`);
    for (const stmt of fns) this.functionDecl(stmt);
    // Stream 7: the argv parser helper is emitted only when the entry actually
    // takes runtime argv (tiering); default output is unchanged.
    this.emit(driverFns(!!(effEntry && effEntry.args === "argv")));
    // Stream 7: tiering support. The bailout trampoline exits(42); the host
    // treats that as "re-run this call in the interpreter". Emitted whenever
    // any trap can reference it (checked arithmetic or the depth guard).
    if (this.checkedArithmetic || this.nativeDepthGuard) {
      this.emit(`$jsa_bailout_trap:`);
      this.emit(`MOV RAX, 60`);
      this.emit(`MOV RDI, ${MERKAVA_BAILOUT_EXIT}`);
      this.emit(`SYSCALL`);
    }
    if (this.nativeDepthGuard) {
      this.emit(`.data`);
      this.emit(`__tier_depth: 0, 0, 0, 0, 0, 0, 0, 0`);
      this.emit(`.code`);
    }
    const extSections = this.extensionSections();
    if (extSections) this.emit(extSections);
    this.emit(mainFn(effEntry, this.functions, { nargs: this.entryNargs }));
    return this.lines.join("\n");
  }

  functionDecl(node) {
    const name = node.id.name;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) fail(`bad function name '${name}'`, node);
    const params = node.params || [];
    if (params.length > 6) fail("max 6 params supported", node);
    for (const p of params) if (p.type !== "Identifier") fail("only simple params", p);
    // Pre-pass: collect all locals (function-scoped for v1). Object literals
    // with fixed integer fields become stack-allocated fixed-shape objects
    // (compile-time hidden classes: field -> fixed stack offset).
    const localNames = [];
    const objInits = new Map(); // name -> {fields: [names], node}
    const seen = new Set(params.map(p => p.name));
    const isObjInit = (d) => d.init && d.init.type === "ObjectExpression";
    const collect = (n) => {
      if (!n || typeof n.type !== "string") return;
      if (n.type === "VariableDeclaration") {
        for (const d of n.declarations) {
          if (d.id.type !== "Identifier") fail("destructuring not supported", d);
          if (!seen.has(d.id.name)) {
            seen.add(d.id.name); localNames.push(d.id.name);
            if (isObjInit(d)) {
              const fields = [];
              for (const prop of d.init.properties || []) {
                if (prop.type !== "Property" || prop.computed ||
                    (prop.key.type !== "Identifier" && prop.key.type !== "Literal"))
                  fail("only fixed identifier fields in object literals", prop);
                const fname = prop.key.type === "Identifier" ? prop.key.name : String(prop.key.value);
                if (fields.includes(fname)) fail(`duplicate field '${fname}'`, prop);
                fields.push(fname);
              }
              objInits.set(d.id.name, { fields, node: d.init });
            }
          } else if (isObjInit(d)) {
            fail(`object literal re-init of '${d.id.name}' not supported (declare once)`, d);
          }
          if (d.init) collect(d.init);
        }
        return;
      }
      if (n.type === "FunctionDeclaration") return; // nested fns not supported anyway
      for (const k of Object.keys(n)) {
        const v = n[k];
        if (Array.isArray(v)) v.forEach(collect);
        else if (v && typeof v.type === "string") collect(v);
      }
    };
    collect(node.body);
    // Allocate: objects always on the stack (fixed shape); scalars to pinned
    // regs first, rest to stack.
    this.locals = new Map();
    const allNames = [...params.map(p => p.name), ...localNames];
    let stackBytes = 0;
    let regIdx = 0;
    for (const nm of allNames) {
      const oi = objInits.get(nm);
      if (oi) {
        const fieldOff = {};
        for (const f of oi.fields) { stackBytes += 8; fieldOff[f] = stackBytes; }
        this.locals.set(nm, { obj: true, fieldOff });
        continue;
      }
      if (regIdx < PINNED.length) { this.locals.set(nm, { reg: PINNED[regIdx++] }); }
      else { stackBytes += 8; this.locals.set(nm, { stackOff: stackBytes }); }
    }
    this.stackReserve = stackBytes;
    this.loopStack = [];
    this.objInits = objInits;

    this.emit(`${name}:`);
    this.emit(`PUSH RBP`);
    this.emit(`MOV RBP, RSP`);
    // Stream 7: native call-depth guard (tiering). The interpreter limits
    // expression nesting, not call depth; unbounded native recursion would
    // segfault the child instead of throwing. Guard at 1000 nested native
    // calls: deeper bails to the interpreter, which enforces its own limit —
    // observable behavior stays identical, legitimate recursion unaffected.
    if (this.nativeDepthGuard) {
      this.emit(`MOV R11, QWORD PTR [__tier_depth]`);
      this.emit(`INC R11`);
      this.emit(`CMP R11, 1000`);
      this.emit(`JG $jsa_bailout_trap`);
      this.emit(`MOV QWORD PTR [__tier_depth], R11`);
    }
    const usedPinned = PINNED.slice(0, regIdx);
    for (const r of usedPinned) this.emit(`PUSH ${r}`);
    if (stackBytes) this.emit(`SUB RSP, ${stackBytes}`);
    params.forEach((p, i) => {
      const loc = this.locals.get(p.name);
      if (loc.reg) { if (ARG_REGS[i] !== loc.reg) this.emit(`MOV ${loc.reg}, ${ARG_REGS[i]}`); }
      else this.emit(`MOV QWORD PTR [RBP-${loc.stackOff + usedPinned.length * 8}], ${ARG_REGS[i]}`);
    });
    const epilogue = this.lbl("epilogue");
    this.epilogue = epilogue;
    this.pinnedCount = usedPinned.length;
    this.emitBlock(node.body);
    this.emit(`${epilogue}:`);
    if (this.nativeDepthGuard) {
      this.emit(`MOV R11, QWORD PTR [__tier_depth]`);
      this.emit(`DEC R11`);
      this.emit(`MOV QWORD PTR [__tier_depth], R11`);
    }
    if (stackBytes) this.emit(`ADD RSP, ${stackBytes}`);
    for (let i = usedPinned.length - 1; i >= 0; i--) this.emit(`POP ${usedPinned[i]}`);
    this.emit(`MOV RSP, RBP`);
    this.emit(`POP RBP`);
    this.emit(`RET`);
  }

  // frame offset of a stack local, accounting for pushed pinned regs.
  stackAddr(loc) {
    return `QWORD PTR [RBP-${loc.stackOff + this.pinnedCount * 8}]`;
  }

  // address of an object field.
  fieldAddr(loc, field, node) {
    if (!loc.obj) fail(`'${field}' accessed on non-object`, node);
    const off = loc.fieldOff[field];
    if (off === undefined) fail(`unknown field '${field}'`, node);
    return `QWORD PTR [RBP-${off + this.pinnedCount * 8}]`;
  }

  locOf(name, node) {
    const loc = this.locals.get(name);
    if (!loc) fail(`undeclared variable '${name}'`, node);
    return loc;
  }

  emitBlock(node) {
    if (!node || node.type !== "BlockStatement") fail("expected block", node);
    for (const s of node.body || []) this.statement(s);
  }

  stmtInPlace(node) {
    // A statement that is not a block (loop bodies, if branches).
    if (node.type === "BlockStatement") { this.emitBlock(node); return; }
    this.statement(node);
  }

  statement(node) {
    switch (node.type) {
      case "VariableDeclaration": {
        for (const d of node.declarations) {
          const loc = this.locOf(d.id.name, d);
          if (d.init) this.initLoc(loc, d.init);
        }
        return;
      }
      case "ExpressionStatement":
        this.exprVoid(node.expression); // result discarded
        return;
      case "ReturnStatement":
        if (node.argument) this.expr(node.argument);
        else this.emit(`MOV RAX, 0`);
        this.emit(`JMP ${this.epilogue}`);
        return;
      case "IfStatement": {
        const elseLbl = this.lbl("else");
        const endLbl = this.lbl("endif");
        this.condJump(node.test, elseLbl, false); // jump to else when false
        this.stmtInPlace(node.consequent);
        if (node.alternate) {
          this.emit(`JMP ${endLbl}`);
          this.emit(`${elseLbl}:`);
          this.stmtInPlace(node.alternate);
          this.emit(`${endLbl}:`);
        } else {
          this.emit(`${elseLbl}:`);
        }
        return;
      }
      case "WhileStatement": {
        const top = this.lbl("while");
        const end = this.lbl("wend");
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
        const top = this.lbl("for");
        const step = this.lbl("fstep");
        const end = this.lbl("fend");
        if (node.init) {
          if (node.init.type === "VariableDeclaration") {
            for (const d of node.init.declarations) {
              this.initLoc(this.locOf(d.id.name, d), d.init || { type: "Literal", value: 0 });
            }
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
      case "BlockStatement":
        this.emitBlock(node);
        return;
      default:
        fail(`statement ${node.type} not supported`, node);
    }
  }

  storeLoc(loc) {
    if (loc.obj) fail("cannot store a scalar into an object local (assign obj.field instead)");
    if (loc.reg) this.emit(`MOV ${loc.reg}, RAX`);
    else this.emit(`MOV ${this.stackAddr(loc)}, RAX`);
  }

  // Shared init: literal fast path; object literals fill fixed field slots.
  initLoc(loc, initNode) {
    if (loc.obj) {
      if (!initNode || initNode.type !== "ObjectExpression")
        fail("object local requires an object literal initializer", initNode);
      for (const prop of initNode.properties || []) {
        const fname = prop.key.type === "Identifier" ? prop.key.name : String(prop.key.value);
        this.expr(prop.value); // -> RAX
        this.emit(`MOV ${this.fieldAddr(loc, fname, prop)}, RAX`);
      }
      return;
    }
    if (initNode.type === "Literal" && typeof initNode.value === "number" &&
        Number.isInteger(initNode.value)) {
      const bi = BigInt(initNode.value);
      if (bi < INT64_MIN || bi > INT64_MAX) fail(`literal out of int64 range`, initNode);
      const fits32 = bi >= -2147483648n && bi <= 2147483647n;
      if (loc.reg) { this.emit(`MOV ${loc.reg}, ${initNode.value}`); return; }
      if (fits32) { this.emit(`MOV ${this.stackAddr(loc)}, ${initNode.value}`); return; }
    }
    this.expr(initNode); // -> RAX
    this.storeLoc(loc);
  }

  loadLoc(loc) {
    if (loc.obj) fail("cannot load an object local as a scalar (use obj.field)");
    if (loc.reg) { if (loc.reg !== "RAX") this.emit(`MOV RAX, ${loc.reg}`); }
    else this.emit(`MOV RAX, ${this.stackAddr(loc)}`);
  }

  // Simple operand: returns asm text (register name or immediate) or null.
  // Immediates are only offered when they fit signed 32-bit (x86 CMP/arithmetic
  // cannot encode imm64; larger constants go through MOV+register).
  simpleOperand(node) {
    if (node.type === "Literal" && typeof node.value === "number" && Number.isInteger(node.value)) {
      const bi = BigInt(node.value);
      if (bi >= INT64_MIN && bi <= INT64_MAX) {
        const fits32 = bi >= -2147483648n && bi <= 2147483647n;
        return { text: String(node.value), isImm: true, immFits32: fits32, value: bi };
      }
      return null;
    }
    if (node.type === "Identifier") {
      const loc = this.locals.get(node.name);
      if (loc && !loc.obj && loc.reg) return { text: loc.reg, isImm: false, immFits32: false, value: null };
    }
    return null;
  }

  // Compile condition; jump to lbl when the condition is (wantTrue? true : false).
  // Fuses comparisons directly into jumps — no boolean materialization.
  condJump(node, lbl, wantTrue) {
    if (node.type === "BinaryExpression" && CMP_OPS[node.operator]) {
      const info = CMP_OPS[node.operator];
      const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
      if (l && r && !(l.isImm && r.isImm) &&
          (!l.isImm || l.immFits32) && (!r.isImm || r.immFits32)) {
        // CMP supports reg/reg, reg/imm32 (not imm/reg or imm/imm).
        if (!l.isImm) this.emit(`CMP ${l.text}, ${r.text}`);
        else {
          // imm <reg>: flip the comparison.
          const flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=" };
          const finfo = CMP_OPS[flip[node.operator]];
          this.emit(`CMP ${r.text}, ${l.text}`);
          this.emit(`${wantTrue ? finfo.jt : finfo.jf} ${lbl}`);
          return;
        }
        this.emit(`${wantTrue ? info.jt : info.jf} ${lbl}`);
        return;
      }
      this.expr(node.left);            // RAX = left
      this.emit(`PUSH RAX`);
      this.expr(node.right);           // RAX = right
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
    this.expr(node); // RAX = value
    this.emit(`TEST RAX, RAX`);
    this.emit(`${wantTrue ? "JNZ" : "JZ"} ${lbl}`);
  }

  // Expression in void context (value discarded): skips dead value copies.
  exprVoid(node) {
    if (node.type === "UpdateExpression" &&
        (node.operator === "++" || node.operator === "--")) {
      const desc = this.lvalue(node.argument);
      const ins = node.operator === "++" ? "INC" : "DEC";
      if (desc.kind === "local" && desc.loc.reg) {
        this.emit(`${ins} ${desc.loc.reg}`);
        this.checkedIntResultReg(desc.loc.reg); // stream 7: no-op unless checked
      }
      else {
        this.loadDesc(desc, node.argument);
        this.emit(`${ins} RAX`);
        this.checkedIntResult(); // stream 7: no-op unless checked
        this.storeDesc(desc);
      }
      return;
    }
    if (node.type === "AssignmentExpression") {
      const desc = this.lvalue(node.left);
      if (node.operator === "=") { this.expr(node.right); this.storeDesc(desc); return; }
      this.compoundAssign(desc, node.operator.slice(0, -1), node.right, false, node);
      return;
    }
    this.expr(node);
  }

  // True if the expression tree contains any call (arg registers unsafe
  // for direct MOV: a nested call would clobber RDI/RSI/... mid-sequence).
  hasCall(node) {
    if (!node || typeof node.type !== "string") return false;
    if (node.type === "CallExpression") return true;
    return Object.keys(node).some(k => {
      const v = node[k];
      if (Array.isArray(v)) return v.some(x => x && typeof x.type === "string" && this.hasCall(x));
      return v && typeof v.type === "string" && this.hasCall(v);
    });
  }

  // Compile expression, result in RAX. R10/R11 scratch (dead across calls
  // by construction: live only inside one binary-op evaluation).
  expr(node) {
    switch (node.type) {
      case "Literal": {
        // Stream 7: extension dispatch (e.g. string literals). Falls through
        // to the integer core when no extension claims the node.
        if (this.extensionHook("literal", node)) return;
        if (typeof node.value !== "number" || !Number.isInteger(node.value))
          fail(`only integer literals, got ${JSON.stringify(node.value)}`, node);
        const bi = BigInt(node.value);
        if (bi < INT64_MIN || bi > INT64_MAX) fail(`literal out of int64 range`, node);
        this.emit(`MOV RAX, ${node.value}`);
        return;
      }
      case "Identifier":
        this.loadLoc(this.locOf(node.name, node));
        return;
      case "MemberExpression": {
        // Stream 7: extension dispatch (e.g. heap-object property access).
        if (this.extensionHook("member", node)) return;
        // obj.field load (non-computed, fixed shape).
        if (node.computed || node.object.type !== "Identifier" || node.property.type !== "Identifier")
          fail("only obj.field access supported", node);
        const oloc = this.locOf(node.object.name, node.object);
        this.emit(`MOV RAX, ${this.fieldAddr(oloc, node.property.name, node)}`);
        return;
      }
      case "BinaryExpression":
        this.binary(node);
        return;
      case "AssignmentExpression": {
        const op = node.operator;
        if (!["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", "&=", "|=", "^="].includes(op))
          fail(`assignment operator ${op} not supported`, node);
        const desc = this.lvalue(node.left);
        if (op === "=") {
          this.expr(node.right);
          this.storeDesc(desc);
          return; // RAX already holds the value (JS assignment value)
        }
        this.compoundAssign(desc, op.slice(0, -1), node.right, true, node);
        return;
      }
      case "UpdateExpression": {
        const desc = this.lvalue(node.argument);
        const delta = node.operator === "++" ? 1 : node.operator === "--" ? -1 : fail(`bad update`, node);
        const ins = delta === 1 ? "INC" : "DEC";
        if (desc.kind === "local" && desc.loc.reg) {
          const r = desc.loc.reg;
          if (node.prefix) {
            this.emit(`${ins} ${r}`);
            this.checkedIntResultReg(r); // stream 7: no-op unless checked
            if (r !== "RAX") this.emit(`MOV RAX, ${r}`);
          } else {
            if (r !== "RAX") this.emit(`MOV RAX, ${r}`);
            this.emit(`${ins} ${r}`);
            this.checkedIntResultReg(r); // stream 7: no-op unless checked
          }
        } else {
          this.loadDesc(desc, node.argument);
          if (!node.prefix) this.emit(`PUSH RAX`); // save old value
          this.emit(delta === 1 ? `INC RAX` : `DEC RAX`);
          this.checkedIntResult(); // stream 7: no-op unless checked
          this.storeDesc(desc);
          if (!node.prefix) this.emit(`POP RAX`);  // old value
        }
        return;
      }
      case "UnaryExpression": {
        const op = node.operator;
        if (op === "-") {
          this.expr(node.argument);
          this.emit(`NEG RAX`);
          // Stream 7: no checked trap needed — negating a safe integer is
          // always a safe integer (INT64_MIN is unreachable under the
          // safe-int invariant).
          return;
        }
        if (op === "+") { this.expr(node.argument); return; }
        if (op === "~") { this.expr(node.argument); this.emit(`NOT RAX`); return; }
        if (op === "!") {
          this.expr(node.argument);
          this.emit(`TEST RAX, RAX`);
          this.emit(`SETZ AL`);
          this.emit(`MOVZX RAX, AL`);
          return;
        }
        fail(`unary ${op} not supported`, node);
      }
      case "CallExpression": {
        // Stream 7: extension dispatch (e.g. runtime-helper calls).
        if (this.extensionHook("call", node)) return;
        if (node.callee.type !== "Identifier") fail("only direct calls", node);
        const nm = node.callee.name;
        if (!this.functions.has(nm)) fail(`call to undeclared '${nm}'`, node);
        const args = node.arguments || [];
        if (args.length > 6) fail("max 6 call args", node);
        if (args.some(a => this.hasCall(a))) {
          // Nested calls: stack discipline (arg regs unsafe mid-sequence).
          for (const a of args) { this.expr(a); this.emit(`PUSH RAX`); }
          for (let i = args.length - 1; i >= 0; i--) this.emit(`POP ${ARG_REGS[i]}`);
        } else {
          // No calls in args: evaluate left-to-right straight into the arg
          // registers. (Safe: call-free evaluation uses only RAX/R10/R11 and
          // the stack, never the arg registers.)
          for (let i = 0; i < args.length; i++) {
            this.expr(args[i]);
            if (ARG_REGS[i] !== "RAX") this.emit(`MOV ${ARG_REGS[i]}, RAX`);
          }
        }
        this.emit(`CALL ${nm}`);
        return; // RAX = result
      }
      case "ConditionalExpression": {
        const elseLbl = this.lbl("celse");
        const endLbl = this.lbl("cend");
        this.condJump(node.test, elseLbl, false);
        this.expr(node.consequent);
        this.emit(`JMP ${endLbl}`);
        this.emit(`${elseLbl}:`);
        this.expr(node.alternate);
        this.emit(`${endLbl}:`);
        return;
      }
      default:
        fail(`expression ${node.type} not supported`, node);
    }
  }

  lvalue(node) {
    if (node.type === "Identifier") return { kind: "local", loc: this.locOf(node.name, node) };
    if (node.type === "MemberExpression" && !node.computed &&
        node.object.type === "Identifier" && node.property.type === "Identifier") {
      const loc = this.locOf(node.object.name, node.object);
      if (!loc.obj) fail(`property access on non-object '${node.object.name}'`, node);
      const field = node.property.name;
      if (loc.fieldOff[field] === undefined) fail(`unknown field '${field}'`, node);
      return { kind: "field", loc, field };
    }
    fail("only identifier and obj.field lvalues supported", node);
  }

  storeDesc(desc) {
    if (desc.kind === "local") { this.storeLoc(desc.loc); return; }
    this.emit(`MOV ${this.fieldAddr(desc.loc, desc.field)}, RAX`);
  }

  loadDesc(desc, node) {
    if (desc.kind === "local") { this.loadLoc(desc.loc); return; }
    this.emit(`MOV RAX, ${this.fieldAddr(desc.loc, desc.field, node)}`);
  }

  // RAX = n (signed 64) on entry; RAX = n % d on exit. d > 0, fits 32 bits.
  // Barrett reduction: q = mulhi(|n|, μ), r = |n| - q*d, correct by loop.
  // μ = floor(2^64/d). Branchless abs via sign mask; no IDIV (~10cy vs ~30).
  barrettMod(d) {
    const mu = (1n << 64n) / BigInt(d); // BigInt, fits 64 bits for d >= 1
    const corr = this.lbl("bcorr"), cdone = this.lbl("bcdone");
    this.emit(`MOV R11, RAX`);          // orig n
    this.emit(`SAR R11, 63`);           // mask = 0 or -1
    this.emit(`XOR RAX, R11`);
    this.emit(`SUB RAX, R11`);          // RAX = |n| (INT64_MIN wraps to 2^63, fine)
    this.emit(`PUSH RAX`);              // save |n| (MUL clobbers RAX)
    this.emit(`MOV R10, ${mu}`);        // Barrett magic
    this.emit(`MUL R10`);               // RDX:RAX = |n|*μ, RDX = q
    this.emit(`IMUL R10, RDX, ${d}`);   // R10 = q*d
    this.emit(`POP RAX`);               // RAX = |n|
    this.emit(`SUB RAX, R10`);          // RAX = r >= 0
    this.emit(`${corr}:`);              // correction: essentially never iterates
    this.emit(`CMP RAX, ${d}`);
    this.emit(`JL ${cdone}`);
    this.emit(`SUB RAX, ${d}`);
    this.emit(`JMP ${corr}`);
    this.emit(`${cdone}:`);
    this.emit(`XOR RAX, R11`);
    this.emit(`SUB RAX, R11`);          // reapply sign: r or -r
  }

  // RAX = left, R10 = right on entry; result in RAX.
  // Stream 7: in checked mode, integer ops trap on overflow/unsafe results,
  // division traps on zero / INT64_MIN/-1 / inexact, and bitwise ops apply
  // JS ToInt32 semantics to both operands first.
  arithOp(op, node) {
    const ck = this.checkedArithmetic;
    const ckBit = ck && (op === "&" || op === "|" || op === "^");
    switch (op) {
      case "+": this.emit(`ADD RAX, R10`); this.checkedIntResult(); return;
      case "-": this.emit(`SUB RAX, R10`); this.checkedIntResult(); return;
      case "*":
        if (ck) { this.checkedMul(); this.checkedIntResult(); }
        else this.emit(`IMUL RAX, R10`);
        return;
      case "/":
        this.emitDivGuards();          // R10 = divisor; traps on 0, INT64_MIN/-1
        this.emit(`CQO`); this.emit(`IDIV R10`);
        if (ck) { this.emit(`CMP RDX, 0`); this.emit(`JNE $jsa_bailout_trap`); } // inexact
        return;
      case "%":
        this.emitDivGuards();
        this.emit(`CQO`); this.emit(`IDIV R10`); this.emit(`MOV RAX, RDX`); return;
      case "&": case "|": case "^": {
        if (ckBit) {
          this.emit(`SHL RAX, 32`); this.emit(`SAR RAX, 32`); // ToInt32 both
          this.emit(`SHL R10, 32`); this.emit(`SAR R10, 32`);
        }
        this.emit(`${{ "&": "AND", "|": "OR", "^": "XOR" }[op]} RAX, R10`);
        return;
      }
      case "<<": case ">>": case ">>>":
        fail(`variable ${op} not supported in v1 (use constant shift)`, node);
      default: fail(`arith op ${op}`, node);
    }
  }

  // Compound assignment core. wantValue=false skips materializing the
  // assignment value in RAX (void context).
  compoundAssign(desc, aop, rhsNode, wantValue, node) {
    const loc = desc.kind === "local" ? desc.loc : null;
    if (loc && loc.reg) {
      // Fast path: op directly on the register. No push/pop, no reload.
      if (aop === "/" || aop === "%") {
        // Barrett for constant positive 32-bit divisor.
        if (aop === "%" && rhsNode.type === "Literal" && typeof rhsNode.value === "number" &&
            Number.isInteger(rhsNode.value) && rhsNode.value !== 0) {
          const d = BigInt(rhsNode.value < 0 ? -rhsNode.value : rhsNode.value);
          if (d === 1n) { this.emit(`MOV ${loc.reg}, 0`); if (wantValue) this.emit(`XOR RAX, RAX`); return; }
          if (d <= 2147483647n) {
            this.emit(`MOV RAX, ${loc.reg}`);
            this.barrettMod(d);
            this.emit(`MOV ${loc.reg}, RAX`);
            return;
          }
        }
        this.expr(rhsNode);               // RAX = b
        this.emit(`MOV R10, RAX`);
        this.emit(`MOV RAX, ${loc.reg}`);
        this.emitDivGuards();             // stream 7: traps on 0, INT64_MIN/-1
        this.emit(`CQO`);
        this.emit(`IDIV R10`);
        if (aop === "/" && this.checkedArithmetic) { this.emit(`CMP RDX, 0`); this.emit(`JNE $jsa_bailout_trap`); } // inexact
        else if (aop === "%") this.emit(`MOV RAX, RDX`);
        this.emit(`MOV ${loc.reg}, RAX`);
        return;
      }
      if ((aop === "<<" || aop === ">>" || aop === ">>>") &&
          rhsNode.type === "Literal" && Number.isInteger(rhsNode.value)) {
        // Stream 7: checked mode = JS shift-count (mod 32) + ToInt32 operand.
        const ck = this.checkedArithmetic;
        const n = ck ? ((rhsNode.value % 32) + 32) % 32 : ((rhsNode.value % 64) + 64) % 64;
        if (ck) { this.emit(`SHL ${loc.reg}, 32`); this.emit(`SAR ${loc.reg}, 32`); }
        if (aop === "<<") {
          this.emit(`SHL ${loc.reg}, ${n}`);
          if (ck) { this.emit(`SHL ${loc.reg}, 32`); this.emit(`SAR ${loc.reg}, 32`); }
        }
        else if (aop === ">>") this.emit(`SAR ${loc.reg}, ${n}`);
        else { this.emit(`AND ${loc.reg}, 4294967295`); this.emit(`SAR ${loc.reg}, ${n}`); }
        if (wantValue) this.emit(`MOV RAX, ${loc.reg}`);
        return;
      }
      if (["+", "-", "*", "&", "|", "^"].includes(aop)) {
        const ck = this.checkedArithmetic;
        const ckBit = ck && (aop === "&" || aop === "|" || aop === "^");
        this.expr(rhsNode);               // RAX = b
        if (ckBit) {
          this.emit(`SHL ${loc.reg}, 32`); this.emit(`SAR ${loc.reg}, 32`); // ToInt32 both
          this.emit(`SHL RAX, 32`); this.emit(`SAR RAX, 32`);
        }
        if (ck && aop === "*") {
          this.emit(`MOV R10, RAX`);        // R10 = b
          this.emit(`MOV RAX, ${loc.reg}`); // RAX = a
          this.checkedMul();
          this.checkedIntResult();
          this.emit(`MOV ${loc.reg}, RAX`);
        } else {
          const mop = { "+": "ADD", "-": "SUB", "*": "IMUL", "&": "AND", "|": "OR", "^": "XOR" }[aop];
          this.emit(`${mop} ${loc.reg}, RAX`);
          if (ck && (aop === "+" || aop === "-")) this.checkedIntResultReg(loc.reg);
        }
        if (wantValue) this.emit(`MOV RAX, ${loc.reg}`);
        return;
      }
      fail(`compound ${aop}= with register lhs not supported`, node);
    }
    // Stack-local or object-field lhs: load/op/store.
    this.loadDesc(desc, node);             // RAX = a
    this.emit(`PUSH RAX`);
    this.expr(rhsNode);                   // RAX = b
    this.emit(`MOV R10, RAX`);
    this.emit(`POP RAX`);                 // RAX = a, R10 = b
    this.arithOp(aop, node);              // RAX = a OP b
    this.storeDesc(desc);
  }

  binary(node) {
    const op = node.operator;
    // Stream 7: extension dispatch (e.g. string '+' concatenation). Falls
    // through to the integer core when no extension claims the node.
    if (this.extensionHook("binary", node)) return;
    if (CMP_OPS[op]) {
      // Boolean materialization: (a < b) -> 0/1.
      const info = CMP_OPS[op];
      const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
      if (l && r && !(l.isImm && r.isImm) &&
          (!l.isImm || l.immFits32) && (!r.isImm || r.immFits32)) {
        if (!l.isImm) { this.emit(`CMP ${l.text}, ${r.text}`); this.emit(`${info.set} AL`); }
        else {
          const flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=" };
          const finfo = CMP_OPS[flip[op]];
          this.emit(`CMP ${r.text}, ${l.text}`); this.emit(`${finfo.set} AL`);
        }
        this.emit(`MOVZX RAX, AL`);
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
      return;
    }
    if (op === "&&" || op === "||") {
      // JS value semantics: a && b -> a if falsy else b; a || b -> a if truthy else b.
      const end = this.lbl("logic");
      this.expr(node.left);
      this.emit(`TEST RAX, RAX`);
      this.emit(`${op === "&&" ? "JZ" : "JNZ"} ${end}`);
      this.expr(node.right);
      this.emit(`${end}:`);
      return;
    }
    // Constant shifts.
    if ((op === "<<" || op === ">>" || op === ">>>") &&
        node.right.type === "Literal" && Number.isInteger(node.right.value)) {
      // Stream 7: checked mode uses JS shift-count semantics (mod 32) and
      // ToInt32 operands; unchecked keeps the v1 64-bit behavior.
      const ck = this.checkedArithmetic;
      const n = ck ? ((node.right.value % 32) + 32) % 32
                   : ((node.right.value % 64) + 64) % 64;
      this.expr(node.left);
      if (ck) this.toInt32RAX();
      if (op === "<<") {
        this.emit(`SHL RAX, ${n}`);
        if (ck) { this.emit(`SHL RAX, 32`); this.emit(`SAR RAX, 32`); } // wrap to 32 bits
      }
      else if (op === ">>") this.emit(`SAR RAX, ${n}`);
      else { this.emit(`AND RAX, 4294967295`); this.emit(`SAR RAX, ${n}`); }
      return;
    }
    const MOP = { "+": "ADD", "-": "SUB", "*": "IMUL", "&": "AND", "|": "OR", "^": "XOR" };
    const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
    const immOk = (o) => !o.isImm || o.immFits32;
    // LEA peephole: (reg*C)+K -> single LEA (1cy vs IMUL+ADD). C in {3,5,9}.
    // Stream 7: skipped in checked mode (LEA sets no overflow flags; the
    // general path below carries the bailout guards instead).
    if (!this.checkedArithmetic &&
        (op === "+" || (op === "-" && node.left.type === "BinaryExpression" && node.left.operator === "*"))) {
      const mulNode = op === "+" ?
        (node.left.type === "BinaryExpression" && node.left.operator === "*" ? node.left :
         node.right.type === "BinaryExpression" && node.right.operator === "*" ? node.right : null) :
        node.left;
      const kNode = mulNode === node.left ? node.right : node.left;
      if (mulNode && kNode.type === "Literal" && Number.isInteger(kNode.value)) {
        const ml = this.simpleOperand(mulNode.left), mr = this.simpleOperand(mulNode.right);
        const regOp = ml && !ml.isImm ? ml : (mr && !mr.isImm ? mr : null);
        const cOp = ml && ml.isImm ? ml : (mr && mr.isImm ? mr : null);
        if (regOp && cOp && cOp.value > 0n) {
          const C = Number(cOp.value);
          let K = BigInt(kNode.value);
          if (op === "-") K = -K;
          if (K >= -2147483648n && K <= 2147483647n && [3, 5, 9].includes(C)) {
            const R = regOp.text, ks = K >= 0n ? `+${K}` : `${K}`;
            const mem = C === 3 ? `[${R}+${R}*2${ks}]` :
                        C === 5 ? `[${R}+${R}*4${ks}]` : `[${R}+${R}*8${ks}]`;
            this.emit(`LEA RAX, ${mem}`);
            return;
          }
        }
      }
    }
    // Barrett: n % constant — strength-reduced, no IDIV.
    if (op === "%" && r && r.isImm && r.value !== 0n) {
      const d = r.value < 0n ? -r.value : r.value;
      if (d === 1n) { this.expr(node.left); this.emit(`XOR RAX, RAX`); return; }
      if (d <= 2147483647n) {
        this.expr(node.left);             // RAX = n (R10/R11 dead here)
        this.barrettMod(d);
        return;
      }
    }
    // Fast: right is reg/imm32 -> compile left, op in place.
    // Stream 7: checked bitwise ops (& | ^) need ToInt32 on both operands, and
    // checked multiply needs the verify-by-division sequence, so they skip
    // these fast paths and use the general path below.
    const ckBit = this.checkedArithmetic && (op === "&" || op === "|" || op === "^");
    const ckMul = this.checkedArithmetic && op === "*";
    if (r && immOk(r) && MOP[op] && !ckBit && !ckMul) {
      this.expr(node.left);           // RAX (calls safe: R10/R11 unused here)
      this.emit(`${MOP[op]} RAX, ${r.text}`);
      if (this.checkedArithmetic) this.checkedIntResult(); // + - only here
      return;
    }
    // Fast: commutative, left simple, right complex -> compile right, op in place.
    if (l && immOk(l) && ["+", "*", "&", "|", "^"].includes(op) && !ckBit && !ckMul) {
      this.expr(node.right);
      this.emit(`${MOP[op]} RAX, ${l.text}`);
      if (this.checkedArithmetic) this.checkedIntResult(); // + only here
      return;
    }
    // Fast: simple reg left for - / / %.
    if (l && !l.isImm && (op === "-" || op === "/" || op === "%")) {
      this.expr(node.right);          // RAX = b
      this.emit(`MOV R10, RAX`);
      this.emit(`MOV RAX, ${l.text}`); // RAX = a
      if (op === "-") { this.emit(`SUB RAX, R10`); this.checkedIntResult(); }
      else {
        this.emitDivGuards();          // traps on 0 and INT64_MIN/-1 (checked only)
        this.emit(`CQO`); this.emit(`IDIV R10`);
        if (op === "/" && this.checkedArithmetic) { this.emit(`CMP RDX, 0`); this.emit(`JNE $jsa_bailout_trap`); } // inexact
        else if (op === "%") this.emit(`MOV RAX, RDX`);
      }
      return;
    }
    // General: left -> RAX, push, right -> RAX, R10 = right, pop left.
    // (Right-immediate division: IDIV needs a register divisor; setting R10
    // from an immediate touches no RAX, so no push/pop is needed.)
    if ((op === "/" || op === "%") && r && r.isImm && r.immFits32) {
      this.expr(node.left);           // RAX (R10/R11 dead here)
      this.emit(`MOV R10, ${r.text}`);
      this.arithOp(op, node);
      return;
    }
    this.expr(node.left);
    this.emit(`PUSH RAX`);
    this.expr(node.right);
    this.emit(`MOV R10, RAX`);
    this.emit(`POP RAX`);
    this.arithOp(op, node);
  }
}

function frameOff(stackOff, pinnedCount) {
  return stackOff + pinnedCount * 8;
}

// B"H: print helpers (unsigned recursion) + signed entry, all in asm.
// includeParseArg: also emit __merkava_parse_arg (tiering argv mode).
function driverFns(includeParseArg) {
  const out = [
    `awts_putchar:`,          // RDI = byte
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH R12`,
    `MOV R12, RDI`,
    `PUSH R12`,              // char byte at [RSP] (low byte)
    `MOV RAX, 1`,            // sys_write
    `MOV RDI, 1`,
    `MOV RSI, RSP`,
    `MOV RDX, 1`,
    `SYSCALL`,
    `ADD RSP, 8`,
    `POP R12`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `awts_print_u:`,         // RDI = unsigned value
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`,
    `MOV R12, RDI`,
    `CMP R12, 10`,
    `JL $ppu_one`,
    `MOV RAX, R12`,
    `CQO`,
    `MOV RCX, 10`,
    `IDIV RCX`,              // RAX = quo, RDX = rem
    `PUSH RDX`,
    `MOV RDI, RAX`,
    `CALL awts_print_u`,
    `POP RDX`,
    `MOV R12, RDX`,
    `$ppu_one:`,
    `ADD R12, 48`,
    `MOV RDI, R12`,
    `CALL awts_putchar`,
    `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `awts_print:`,           // RDI = signed value
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`,
    `MOV R12, RDI`,
    `CMP R12, 0`,
    `JGE $pp_nonneg`,
    `MOV RDI, 45`,
    `CALL awts_putchar`,
    `MOV RAX, R12`,
    `NEG RAX`,
    `MOV RDI, RAX`,
    `CALL awts_print_u`,
    `JMP $pp_done`,
    `$pp_nonneg:`,
    `MOV RDI, R12`,
    `CALL awts_print_u`,
    `$pp_done:`,
    `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
  ];
  // B"H stream 7: argv decimal parser for tiering. RDI = NUL-terminated
  // ASCII ("-123") -> RAX = signed int64. The host only passes safe-integer
  // argv, so no overflow guard is needed here. Emitted only in argv mode so
  // default compilations are byte-identical to before.
  if (includeParseArg) out.push(
    ``,
    `__merkava_parse_arg:`,
    `XOR RAX, RAX`,
    `XOR R10, R10`,              // sign flag
    `MOVZX R11, BYTE PTR [RDI]`,
    `CMP R11, 45`,              // '-'
    `JNE $pap_digits`,
    `MOV R10, 1`,
    `INC RDI`,
    `$pap_digits:`,
    `MOVZX R11, BYTE PTR [RDI]`,
    `TEST R11, R11`,
    `JZ $pap_done`,
    `SUB R11, 48`,
    `IMUL RAX, RAX, 10`,
    `ADD RAX, R11`,
    `INC RDI`,
    `JMP $pap_digits`,
    `$pap_done:`,
    `TEST R10, R10`,
    `JZ $pap_ret`,
    `NEG RAX`,
    `$pap_ret:`,
    `RET`,
  );
  return out.join("\n");
}

// entry = {name, args: [ints]} | {name, args: "argv"} (tiering: runtime argv)
// opts = {nargs} for argv mode.
function mainFn(entry, functions, opts) {
  if (!functions.has(entry.name)) throw new Error(`jsAsm: entry '${entry.name}' not declared`);
  const repeat = Math.max(1, entry.repeat | 0 || 1);
  const L = [
    `main:`,
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`,
  ];
  if (repeat > 1) L.push(`MOV R12, ${repeat}`, `$repeat:`);
  if (entry.args === "argv") {
    // B"H stream 7: tiering passes arguments on the process command line.
    // At process entry RSP -> argc; `start: CALL main` pushes the return
    // address, then the prologue pushes RBP/RBX/R12, so at this point
    // RBP+16 -> argc, RBP+24 -> argv[0], and argv[i+1] is at [RBP+32+8i].
    // Results are stacked first because RDI is both the parse input and
    // arg0's register.
    const nargs = (opts && opts.nargs | 0) || 0;
    if (nargs > 6) throw new Error("jsAsm: max 6 entry args");
    for (let i = 0; i < nargs; i++) {
      L.push(`MOV RDI, QWORD PTR [RBP+${32 + 8 * i}]`);
      L.push(`CALL __merkava_parse_arg`);
      L.push(`PUSH RAX`);
    }
    for (let i = nargs - 1; i >= 0; i--) L.push(`POP ${ARG_REGS[i]}`);
  } else {
    entry.args.forEach((a, i) => {
      L.push(`MOV ${ARG_REGS[i]}, ${a}`);
    });
  }
  L.push(`CALL ${entry.name}`);
  if (repeat > 1) {
    L.push(`DEC R12`, `JNZ $repeat`);
    // RAX holds the last call's result; re-run once more is unnecessary.
  }
  L.push(`MOV RDI, RAX`);
  L.push(`CALL awts_print`);
  L.push(`MOV RDI, 10`);
  L.push(`CALL awts_putchar`);
  L.push(`MOV RAX, 0`);
  L.push(`POP R12`, `POP RBX`);
  L.push(`MOV RSP, RBP`, `POP RBP`, `RET`);
  return L.join("\n");
}

/**
 * Transpile JS to portable x86_64 assembly.
 * @param {string} jsSource
 * @param {{name: string, args: number[]}} entry
 * @returns {Promise<{asm: string}>}
 */
export async function transpileJsToAsm(jsSource, entry, opts) {
  const Parser = await require("../../MerkavaASTParser/parser-core.js");
  const program = new Parser(String(jsSource)).parse();
  const g = new AsmGen();
  if (opts && opts.repeat) g.repeatOverride = opts.repeat;
  // Stream 7: tiering flags. checkedArithmetic emits bailout traps (exit 42)
  // wherever int64 and IEEE-754 semantics can diverge; nativeDepthGuard adds
  // a native call-depth guard; nargs feeds argv-mode entry parsing.
  if (opts && opts.checkedArithmetic) g.checkedArithmetic = true;
  if (opts && opts.nativeDepthGuard) g.nativeDepthGuard = true;
  if (opts && opts.nargs) g.entryNargs = opts.nargs | 0;
  return { asm: g.run(program, entry) };
}

/**
 * Compile JS straight to a native binary via the direct-asm backend.
 * @param {string} jsSource
 * @param {object|null} entry - {name, args} or null (auto-detect)
 * @param {object} [opts] - {repeat: n} run the entry n times per process
 *   (amortizes spawn); {checkedArithmetic: true} emit bailout traps (exit 42)
 *   on int64-overflow / unsafe-double-range / div-by-zero / inexact-division;
 *   {nativeDepthGuard: true} trap past 1000 nested native calls;
 *   entry.args may be the string "argv" (with opts.nargs) to take arguments
 *   from the process command line instead of baked-in immediates.
 * @returns {Promise<{path, asm, compileMs}>}
 */
export async function compileJsToNativeAsm(jsSource, entry, opts) {
  const t0 = Date.now();
  const { asm } = await transpileJsToAsm(jsSource, entry, opts);
  const out = await compileNativeAsm(asm, "linux-x64-static");
  const compileMs = Date.now() - t0;
  const { chmodSync, mkdirSync, writeFileSync } = await import("fs");
  const { tmpdir } = await import("os");
  const { join } = await import("path");
  const WORK = join(tmpdir(), "merkava-js-native");
  mkdirSync(WORK, { recursive: true });
  const path = join(WORK, `a${process.pid}_${Date.now() % 1000000}`);
  writeFileSync(path, Buffer.from(out.bytes));
  chmodSync(path, 0o755);
  return { path, asm, compileMs };
}

// Entry-arg parsing helper: "kernel(1000000)" -> {name, args}
export function parseEntry(entryCall) {
  const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*$/.exec(String(entryCall));
  if (!m) throw new Error(`jsAsm: bad entry '${entryCall}'`);
  const args = m[2].trim() === "" ? [] : m[2].split(",").map(s => {
    const v = Number(s.trim());
    if (!Number.isInteger(v)) throw new Error(`jsAsm: entry arg '${s}' must be an integer`);
    return v;
  });
  if (args.length > 6) throw new Error("jsAsm: max 6 entry args");
  return { name: m[1], args };
}
