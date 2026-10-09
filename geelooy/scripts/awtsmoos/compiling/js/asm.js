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

class AsmGen {
  constructor() {
    this.lines = [];
    this.labelN = 0;
    this.functions = new Set();
    this.locals = new Map();   // name -> {reg} | {stackOff}
    this.loopStack = [];       // {breakLbl, contLbl}
    this.stackReserve = 0;
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
    this.emit(driverFns());
    this.emit(mainFn(effEntry, this.functions));
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
      if (desc.kind === "local" && desc.loc.reg) this.emit(`${ins} ${desc.loc.reg}`);
      else {
        this.loadDesc(desc, node.argument);
        this.emit(`${ins} RAX`);
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
            if (r !== "RAX") this.emit(`MOV RAX, ${r}`);
          } else {
            if (r !== "RAX") this.emit(`MOV RAX, ${r}`);
            this.emit(`${ins} ${r}`);
          }
        } else {
          this.loadDesc(desc, node.argument);
          if (!node.prefix) this.emit(`PUSH RAX`); // save old value
          this.emit(delta === 1 ? `INC RAX` : `DEC RAX`);
          this.storeDesc(desc);
          if (!node.prefix) this.emit(`POP RAX`);  // old value
        }
        return;
      }
      case "UnaryExpression": {
        const op = node.operator;
        if (op === "-") { this.expr(node.argument); this.emit(`NEG RAX`); return; }
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
  arithOp(op, node) {
    switch (op) {
      case "+": this.emit(`ADD RAX, R10`); return;
      case "-": this.emit(`SUB RAX, R10`); return;
      case "*": this.emit(`IMUL RAX, R10`); return;
      case "/": this.emit(`CQO`); this.emit(`IDIV R10`); return;
      case "%": this.emit(`CQO`); this.emit(`IDIV R10`); this.emit(`MOV RAX, RDX`); return;
      case "&": this.emit(`AND RAX, R10`); return;
      case "|": this.emit(`OR RAX, R10`); return;
      case "^": this.emit(`XOR RAX, R10`); return;
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
        this.emit(`CQO`);
        this.emit(`IDIV R10`);
        if (aop === "%") this.emit(`MOV RAX, RDX`);
        this.emit(`MOV ${loc.reg}, RAX`);
        return;
      }
      if ((aop === "<<" || aop === ">>" || aop === ">>>") &&
          rhsNode.type === "Literal" && Number.isInteger(rhsNode.value)) {
        const n = ((rhsNode.value % 64) + 64) % 64;
        if (aop === "<<") this.emit(`SHL ${loc.reg}, ${n}`);
        else if (aop === ">>") this.emit(`SAR ${loc.reg}, ${n}`);
        else { this.emit(`AND ${loc.reg}, 4294967295`); this.emit(`SAR ${loc.reg}, ${n}`); }
        if (wantValue) this.emit(`MOV RAX, ${loc.reg}`);
        return;
      }
      if (["+", "-", "*", "&", "|", "^"].includes(aop)) {
        this.expr(rhsNode);               // RAX = b
        const mop = { "+": "ADD", "-": "SUB", "*": "IMUL", "&": "AND", "|": "OR", "^": "XOR" }[aop];
        this.emit(`${mop} ${loc.reg}, RAX`);
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
      const n = ((node.right.value % 64) + 64) % 64;
      this.expr(node.left);
      if (op === "<<") this.emit(`SHL RAX, ${n}`);
      else if (op === ">>") this.emit(`SAR RAX, ${n}`);
      else { this.emit(`AND RAX, 4294967295`); this.emit(`SAR RAX, ${n}`); }
      return;
    }
    const MOP = { "+": "ADD", "-": "SUB", "*": "IMUL", "&": "AND", "|": "OR", "^": "XOR" };
    const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
    const immOk = (o) => !o.isImm || o.immFits32;
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
    if (r && immOk(r) && MOP[op]) {
      this.expr(node.left);           // RAX (calls safe: R10/R11 unused here)
      this.emit(`${MOP[op]} RAX, ${r.text}`);
      return;
    }
    // Fast: commutative, left simple, right complex -> compile right, op in place.
    if (l && immOk(l) && ["+", "*", "&", "|", "^"].includes(op)) {
      this.expr(node.right);
      this.emit(`${MOP[op]} RAX, ${l.text}`);
      return;
    }
    // Fast: simple reg left for - / / %.
    if (l && !l.isImm && (op === "-" || op === "/" || op === "%")) {
      this.expr(node.right);          // RAX = b
      this.emit(`MOV R10, RAX`);
      this.emit(`MOV RAX, ${l.text}`); // RAX = a
      if (op === "-") this.emit(`SUB RAX, R10`);
      else { this.emit(`CQO`); this.emit(`IDIV R10`); if (op === "%") this.emit(`MOV RAX, RDX`); }
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
function driverFns() {
  return [
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
  ].join("\n");
}

// entry = {name, args: [ints], repeat?: n}
function mainFn(entry, functions) {
  if (!functions.has(entry.name)) throw new Error(`jsAsm: entry '${entry.name}' not declared`);
  const repeat = Math.max(1, entry.repeat | 0 || 1);
  const L = [
    `main:`,
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`,
  ];
  if (repeat > 1) L.push(`MOV R12, ${repeat}`, `$repeat:`);
  entry.args.forEach((a, i) => {
    L.push(`MOV ${ARG_REGS[i]}, ${a}`);
  });
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
  return { asm: g.run(program, entry) };
}

/**
 * Compile JS straight to a native binary via the direct-asm backend.
 * @param {string} jsSource
 * @param {object|null} entry - {name, args} or null (auto-detect)
 * @param {object} [opts] - {repeat: n} run the entry n times per process (amortizes spawn)
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
