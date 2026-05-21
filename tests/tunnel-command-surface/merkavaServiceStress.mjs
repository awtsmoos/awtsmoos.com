// B"H
import assert from "assert";
import { simulateRuntime } from "../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js";

function text(result) {
  return [
    result?.error,
    result?.stack,
    ...(result?.errors || []).map(e => e.message + " " + (e.stack || "")),
    ...(result?.stackTraces || [])
  ].filter(Boolean).join(" ");
}

async function fails(name, files, match, entry = "app.js", extra = {}) {
  const got = await simulateRuntime({ runtime: "browser", engine: "merkava", entry, files, ...extra });
  assert.equal(got.ok, false, name + " should fail");
  assert(match.test(text(got)), name + " mismatch: " + text(got));
}

await fails("service-syntax", { "app.js": "function bad( {" }, /Unexpected|token|Syntax/i);
await fails("service-duplicate", { "app.js": "let y=1; let y=2;" }, /declared|Identifier|Syntax/i);
await fails("service-reference", { "app.js": "nope.call();" }, /nope|Reference/i);
await fails("service-html", { "index.html": "<script>let z=1; let z=2;</script>" }, /declared|Identifier|Syntax/i, "index.html");

const ok = await simulateRuntime({ runtime: "browser", engine: "merkava", entry: "app.js", files: { "app.js": "window.serviceOk = 1;" } });
assert.equal(ok.ok, true);
console.log("B'H merkava service stress ok");
