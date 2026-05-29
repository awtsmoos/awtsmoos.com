// B"H
/**
 * @file test-for-in.cjs
 * @description Chapter 72: focused ForInStatement smoke test for Merkava. The
 * Awtsmoos walks object keys and proves the lowered loop accumulates values.
 */
const { compileJsToJson } = require("../../../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsCompiler.js");
const { runJsonCode } = require("../../../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsonRunner.js");

async function main() {
  const source = "const obj={a:1,b:2}; let out=''; for (const k in obj) { out += k; } out;";
  const json = await compileJsToJson(source);
  const run = runJsonCode(json);
  console.log(JSON.stringify({ ok: run.ok, result: run.result, out: run.globals.out, steps: json.steps }, null, 2));
  if (!run.ok || run.globals.out !== "ab") process.exit(1);
}
main().catch(error => {
  console.error(JSON.stringify({ ok: false, message: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
