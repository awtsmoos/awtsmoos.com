// B"H
const assert = require("assert");
const path = require("path");

function requireFromRoot(rel) {
  return require(path.join(process.cwd(), rel));
}

/**
 * B"H
 * Chapter 1: A false garment named `op: undefined` tried to hide the living
 * expression. The compiler tore the veil, and the Awtsmoos-lit `window` stood
 * clean before the bytecode gate.
 *
 * @returns {object} Proof that wrapper nodes normalize and compile.
 */
function assertValueWrapperCompiles() {
  const { compileJsonCode, normalizeTree } = requireFromRoot("geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsonCompiler.js");
  const wrappedWindow = { op: undefined, value: { get: "window" } };
  const program = {
    steps: [{
      op: "if",
      test: { op: "sneq", args: [wrappedWindow, { const: "undefined" }] },
      consequent: [{ op: "set", name: "seen", value: { const: true } }],
      alternate: []
    }]
  };
  const normalized = normalizeTree(program);
  assert.deepEqual(normalized.steps[0].test.args[0], { get: "window" });
  const compiled = compileJsonCode(program);
  assert.equal(compiled.meta.kind, "merkava-json");
  assert.ok(compiled.bytecode.length > 0);
  return { ok: true, bytecodeBytes: compiled.bytecode.length, constants: compiled.constants.length };
}

(() => {
  const valueWrapper = assertValueWrapperCompiles();
  console.log(JSON.stringify({ ok: true, valueWrapper }, null, 2));
})();
