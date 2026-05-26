// B"H
import { parseCpp } from "./parser.js";
import { compileC } from "../../../../apps/compiler/c/compiler.js";
import { createCustomAsmApp } from "../../../../apps/compiler/compiler_asm.js";
import { linkAndBuild } from "../../../../apps/compiler/linker.js";

/**
 * B"H
 * Lowers focused C++ into the existing Awtsmoos C compiler subset.
 *
 * Chapter 4: C++ descends the ladder into C, keeping class methods as named
 * functions so the current Windows x64 path can already breathe on them.
 *
 * @param {string} source C++ source.
 * @returns {{ast: object, cSource: string}} AST plus lowered C source.
 */
export function compileCppToC(source = "") {
  const ast = parseCpp(source);
  const lines = [];
  for (const imp of ast.imports) lines.push(`import "${imp.dll}" ${imp.func};`);
  for (const fn of ast.functions) lines.push(emitFunction(fn));
  for (const cls of ast.classes) {
    lines.push(`struct ${cls.name} { int __awtsmoos_cpp_tag; };`);
    for (const member of cls.members) lines.push(emitFunction(member, cls.name));
  }
  for (const ns of ast.namespaces) {
    for (const item of ns.body) {
      if (item.type === "Function") lines.push(emitFunction(item, ns.name));
      if (item.type === "Class") {
        lines.push(`struct ${ns.name}_${item.name} { int __awtsmoos_cpp_tag; };`);
        for (const member of item.members) lines.push(emitFunction(member, `${ns.name}_${item.name}`));
      }
    }
  }
  return { ast, cSource: lines.join("\n\n") + "\n" };
}

/**
 * B"H
 * Compiles focused C++ into Awtsmoos assembly through the C bridge.
 *
 * @param {string} source C++ source.
 * @returns {{ast: object, cSource: string, asmSource: string}} Lowering result.
 */
export function compileCppToAsm(source = "") {
  const lowered = compileCppToC(source);
  return { ...lowered, asmSource: compileC(lowered.cSource) };
}

/**
 * B"H
 * Compiles focused C++ into the existing Windows x64 PE artifact.
 *
 * @param {string} source C++ source.
 * @returns {{ast: object, cSource: string, asmSource: string, artifact: object, executable: Blob}}
 */
export function compileCppToWindows64(source = "") {
  const compiled = compileCppToAsm(source);
  const artifact = createCustomAsmApp(compiled.asmSource);
  const executable = linkAndBuild(artifact, artifact.mode || "console");
  return { ...compiled, artifact, executable };
}

function emitFunction(fn, prefix = "") {
  const name = prefix ? `${prefix}_${fn.name}` : fn.name;
  const params = fn.params.map(param => `${emitType(param.type)} ${param.name}`).join(", ");
  return `${emitType(fn.returnType)} ${name}(${params}) {\n${fn.body.statements.map(emitStatement).join("\n")}\n}`;
}

function emitStatement(statement) {
  const map = {
    Return: () => `  return ${statement.expression || "0"};`,
    Declaration: () => `  ${emitType(statement.varType)} ${statement.name}${statement.init ? " = " + statement.init : ""};`,
    Expression: () => `  ${statement.expression};`
  };
  return (map[statement.type] || map.Expression)();
}

function emitType(type) {
  return `${type.name}${"*".repeat(type.pointer)}`;
}
