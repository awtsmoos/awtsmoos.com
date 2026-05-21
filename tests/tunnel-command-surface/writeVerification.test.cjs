// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { verifyJsFile, verifyJsRuntime } = require("../../geelooy/apps/tunnel/agent/tools/fs/jsWriteVerifier.js");

async function main() {
  const dir = path.join(__dirname, "fixture-write-checks");
  fs.mkdirSync(dir, { recursive: true });
  const syntaxBad = path.join(dir, "syntax-bad.js");
  const runtimeBad = path.join(dir, "runtime-bad.js");
  const good = path.join(dir, "good.js");

  fs.writeFileSync(syntaxBad, "function broken( {");
  fs.writeFileSync(runtimeBad, "missingRuntimeThing();");
  fs.writeFileSync(good, "window.goodWrite = 1;");

  assert.equal(verifyJsFile(syntaxBad).ok, false);
  assert.equal(verifyJsFile(syntaxBad, { checkSyntax: false }), null);

  const runtime = await verifyJsRuntime(runtimeBad, { runtimeCheck: true });
  assert.equal(runtime.ok, false);
  assert(/missingRuntimeThing|Reference/i.test(JSON.stringify(runtime)));

  const pass = await verifyJsRuntime(good, { runtimeCheck: true });
  assert.equal(pass.ok, true);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
