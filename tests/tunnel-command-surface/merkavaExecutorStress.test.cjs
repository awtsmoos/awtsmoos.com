// B"H
const assert = require("assert");
const { RuntimeAssembler } = require("../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js");

async function exec(files, entry = "app.js", options = {}) {
  const a = new RuntimeAssembler({ runtime: "browser", files, entry, ...options });
  return await a.run(entry);
}

function text(result) {
  return [result?.result?.error, result?.result?.stack, result?.console]
    .filter(Boolean).join(" ");
}

async function fails(name, files, match, entry = "app.js", options = {}) {
  const got = await exec(files, entry, options);
  assert.equal(got.ok, false, name + " should fail");
  assert(match.test(text(got)), name + " error mismatch: " + text(got));
}

async function main() {
  await fails("broken-function", { "app.js": "function x( {" }, /Unexpected|token|Syntax/i);
  await fails("duplicate-let", { "app.js": "let x=1; let x=2;" }, /declared|Identifier|Syntax/i);
  await fails("reference-error", { "app.js": "missingThing.now();" }, /missingThing|Reference/i);
  await fails("throw-error", { "app.js": "throw new Error('boom')" }, /boom/);
  await fails("unresolved-module", { "app.js": "import './missing.js';" }, /Unresolved module|missing/i, "app.js", { module: true });
  await fails("html-bad-script", { "index.html": "<script>let a=1; let a=2;</script>" }, /declared|Identifier|Syntax/i, "index.html");
  const ok = await exec({ "app.js": "window.ok = 1;" });
  assert.equal(ok.ok, true);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
