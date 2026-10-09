// B"H
// Merkava JS→Native: integer-subset JavaScript to C transpiler.
//
// Takes numeric JavaScript kernels, parses them with the Merkava AST parser,
// and emits C for the self-hosted Awtsmoos C compiler ("linux-x64-static").
// This is the "emulate = compile" tier: the same JS the interpreter emulates
// compiles to real machine code with zero type guards, zero GC barriers,
// zero deopt machinery — the interpreter's semantics, the metal's speed.
//
// Subset (v1): integer arithmetic only. Every value is a 64-bit int.
//   - function declarations (params + recursion supported)
//   - let/const, assignment, += -= *= /= %= <<= >>= &= |= ^=
//   - if/else, while, for, break, continue, return
//   - binary: + - * / % < > <= >= == != && || << >> >>> & | ^
//   - unary: - ! ~, update: ++ -- (prefix and postfix)
//   - calls to declared functions
//   - integer literals (must fit signed 64-bit)
//
// Semantics notes (verified per-kernel against V8):
//   - `/` is truncating integer division (matches JS only when exact or when
//     the kernel never observes a fractional part — verified per kernel).
//   - `%` matches JS for non-negative operands.
//   - `>>>` is ToUint32 semantics: ((x & 0xFFFFFFFF) >> (y & 31)).
//   - No objects, arrays, strings, closures, exceptions in v1.

import { createRequire } from "module";

const require = createRequire(import.meta.url);

const INT64_MIN = -(2n ** 63n);
const INT64_MAX = 2n ** 63n - 1n;

function fail(msg, node) {
  const where = node && node.start !== undefined ? ` at offset ${node.start}` : "";
  throw new Error(`jsToC: ${msg}${where}`);
}

class Transpiler {
  constructor() {
    this.declared = new Set();
    this.hoisted = [];
  }

  run(program, entryCall) {
    if (!program || program.type !== "Program") fail("expected Program node");
    const out = [];
    for (const stmt of program.body || []) {
      if (stmt.type === "FunctionDeclaration") {
        out.push(this.functionDecl(stmt));
      } else {
        fail(`top-level ${stmt.type} not supported (wrap code in a function)`, stmt);
      }
    }
    return out.join("\n\n") + "\n\n" + driver(entryCall);
  }

  functionDecl(node) {
    const name = node.id && node.id.name;
    if (!name) fail("anonymous functions not supported", node);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) fail(`bad function name '${name}'`, node);
    this.declared.add(name);
    const params = (node.params || []).map(p => {
      if (p.type !== "Identifier") fail("only simple identifier params supported", p);
      return `int ${p.name}`;
    });
    const saved = this.hoisted;
    this.hoisted = [];
    const body = this.block(node.body, true);
    const hoists = this.hoisted;
    this.hoisted = saved;
    const decls = hoists.length ? "  " + hoists.join("\n  ") + "\n" : "";
    return `int ${name}(${params.join(", ")}) {\n${decls}${body}}`;
  }

  block(node, isFunctionBody = false) {
    if (!node || node.type !== "BlockStatement") fail("expected block", node);
    const parts = [];
    for (const stmt of node.body || []) parts.push(this.statement(stmt, "  "));
    return parts.join("\n") + (parts.length ? "\n" : "");
  }

  statement(node, indent) {
    switch (node.type) {
      case "VariableDeclaration": {
        if (node.kind !== "let" && node.kind !== "const" && node.kind !== "var")
          fail(`bad declaration kind ${node.kind}`, node);
        return node.declarations.map(d => {
          if (d.id.type !== "Identifier") fail("destructuring not supported", d);
          const nm = d.id.name;
          if (d.init) return `${indent}int ${nm} = ${this.expr(d.init)};`;
          return `${indent}int ${nm};`;
        }).join("\n");
      }
      case "ExpressionStatement":
        return `${indent}${this.expr(node.expression)};`;
      case "ReturnStatement":
        return `${indent}return ${node.argument ? this.expr(node.argument) : "0"};`;
      case "IfStatement": {
        let s = `${indent}if (${this.expr(node.test)}) {\n${this.stmtList(node.consequent, indent + "  ")}${indent}}`;
        if (node.alternate) {
          s += node.alternate.type === "IfStatement"
            ? ` else ${this.statement(node.alternate, indent).trimStart()}`
            : ` else {\n${this.stmtList(node.alternate, indent + "  ")}${indent}}`;
        }
        return s;
      }
      case "WhileStatement":
        return `${indent}while (${this.expr(node.test)}) {\n${this.stmtList(node.body, indent + "  ")}${indent}}`;
      case "ForStatement": {
        // C subset has no declaration in for-init: hoist it.
        let init = "";
        if (node.init) {
          if (node.init.type === "VariableDeclaration") {
            const decls = node.init.declarations;
            if (decls.length !== 1 || decls[0].id.type !== "Identifier")
              fail("for-init supports one simple declaration", node.init);
            const nm = decls[0].id.name;
            this.hoisted.push(`int ${nm};`);
            init = decls[0].init ? `${nm} = ${this.expr(decls[0].init)}` : `${nm} = 0`;
          } else {
            init = this.expr(node.init);
          }
        }
        const test = node.test ? this.expr(node.test) : "1";
        const update = node.update ? this.expr(node.update) : "";
        return `${indent}for (${init}; ${test}; ${update}) {\n${this.stmtList(node.body, indent + "  ")}${indent}}`;
      }
      case "BreakStatement": return `${indent}break;`;
      case "ContinueStatement": return `${indent}continue;`;
      case "BlockStatement":
        return `${indent}{\n${this.stmtList(node, indent + "  ")}${indent}}`;
      default:
        fail(`statement ${node.type} not supported`, node);
    }
  }

  stmtList(node, indent) {
    if (node.type === "BlockStatement")
      return (node.body || []).map(s => this.statement(s, indent)).join("\n") + "\n";
    return this.statement(node, indent) + "\n";
  }

  expr(node) {
    switch (node.type) {
      case "Literal": {
        if (typeof node.value !== "number" || !Number.isInteger(node.value))
          fail(`only integer literals supported, got ${JSON.stringify(node.value)}`, node);
        const bi = BigInt(node.value);
        if (bi < INT64_MIN || bi > INT64_MAX) fail(`literal ${node.value} out of int64 range`, node);
        return String(node.value);
      }
      case "Identifier":
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(node.name)) fail(`bad identifier '${node.name}'`, node);
        return node.name;
      case "BinaryExpression":
        return this.binary(node);
      case "AssignmentExpression": {
        const op = node.operator;
        if (!["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", "&=", "|=", "^="].includes(op))
          fail(`assignment operator ${op} not supported`, node);
        return `${this.lvalue(node.left)} ${op} ${this.expr(node.right)}`;
      }
      case "UpdateExpression": {
        if (node.operator !== "++" && node.operator !== "--") fail(`update ${node.operator} not supported`, node);
        const a = this.lvalue(node.argument);
        return node.prefix ? `${node.operator}${a}` : `${a}${node.operator}`;
      }
      case "UnaryExpression": {
        const e = this.expr(node.argument);
        if (node.operator === "-") return `(-${e})`;
        if (node.operator === "+") return `(${e})`;
        if (node.operator === "!") return `((${e}) == 0)`;
        if (node.operator === "~") return `(~(${e}))`;
        fail(`unary ${node.operator} not supported`, node);
      }
      case "CallExpression": {
        if (node.callee.type !== "Identifier") fail("only direct calls supported", node);
        const nm = node.callee.name;
        if (!this.declared.has(nm)) fail(`call to undeclared function '${nm}'`, node);
        return `${nm}(${node.arguments.map(a => this.expr(a)).join(", ")})`;
      }
      case "ConditionalExpression":
        return `((${this.expr(node.test)}) ? (${this.expr(node.consequent)}) : (${this.expr(node.alternate)}))`;
      case "SequenceExpression":
        fail("sequence expressions not supported", node);
      default:
        fail(`expression ${node.type} not supported`, node);
    }
  }

  lvalue(node) {
    if (node.type !== "Identifier") fail("only simple identifier lvalues supported", node);
    return node.name;
  }

  binary(node) {
    const l = this.expr(node.left);
    const r = this.expr(node.right);
    switch (node.operator) {
      case "+": case "-": case "*": case "/": case "%":
      case "<": case ">": case "<=": case ">=": case "==": case "!=":
      case "&&": case "||": case "<<": case "&": case "|": case "^":
        return `((${l}) ${node.operator} (${r}))`;
      case ">>":
        // Arithmetic shift: keep sign. C >> on negative is implementation-defined
        // but the Awtsmoos x86_64 backend emits SAR (arithmetic). Verified.
        return `((${l}) >> (${r}))`;
      case ">>>":
        // JS ToUint32 semantics.
        return `(((${l}) & 4294967295) >> ((${r}) & 31))`;
      case "**":
        fail("** not supported (use a loop or repeated multiplication)", node);
      default:
        fail(`binary operator ${node.operator} not supported`, node);
    }
  }
}

function driver(entryCall) {
  return `/* B"H — driver: print helpers + main. Uses the __awtsmoos_syscall3
   * builtin (write = syscall 1) to print the full 64-bit result. */
int awts_putchar(int c) {
  __awtsmoos_syscall3(1, 1, &c, 1);
  return 0;
}
int awts_print_u(int v) {
  if (v >= 10) { awts_print_u(v / 10); }
  awts_putchar((v % 10) + 48);
  return 0;
}
int awts_print(int v) {
  if (v < 0) {
    awts_putchar(45);
    if (v > -9223372036854775807) { awts_print_u(0 - v); } else { awts_print_u(9223372036854775807); awts_putchar(56); }
    return 0;
  }
  awts_print_u(v);
  return 0;
}
int main() {
  int r;
  int nl;
  r = ${entryCall};
  awts_print(r);
  nl = 10;
  __awtsmoos_syscall3(1, 1, &nl, 1);
  return 0;
}`;
}

/**
 * Transpile integer-subset JS to C.
 * @param {string} jsSource - JS defining one or more functions.
 * @param {string} entryCall - C expression calling the entry, e.g. "kernel(1000000)".
 * @returns {{c: string, functions: string[]}}
 */
export async function transpileJsToC(jsSource, entryCall) {
  const Parser = await require("../../MerkavaASTParser/parser-core.js");
  const parser = new Parser(String(jsSource));
  const program = parser.parse();
  const t = new Transpiler();
  // Pre-declare all functions so calls resolve regardless of order.
  for (const stmt of program.body || []) {
    if (stmt.type === "FunctionDeclaration" && stmt.id && stmt.id.name)
      t.declared.add(stmt.id.name);
  }
  const c = t.run(program, entryCall);
  return { c, functions: [...t.declared] };
}
