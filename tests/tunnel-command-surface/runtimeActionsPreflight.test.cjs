// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildRuntimeActions } = require("../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");

async function run(payload) {
  const actions = buildRuntimeActions({ config: { root: __dirname }, payload });
  return await actions.simulateRuntime();
}

async function main() {
  const dir = path.join(__dirname, "fixture-runtime-action");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "bad.js"), "function broken( {");
  fs.writeFileSync(path.join(dir, "dup.js"), "let a = 1; let a = 2;");

  const syntax = await run({ p: "fixture-runtime-action/bad.js" });
  assert.equal(syntax.ok, false);
  assert.equal(syntax.error, "runtime_preflight_failed");

  const dup = await run({ p: "fixture-runtime-action/dup.js" });
  assert.equal(dup.ok, false);
  assert.equal(dup.diagnostics[0].kind, "syntax");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
