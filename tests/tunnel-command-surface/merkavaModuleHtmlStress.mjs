// B"H
import assert from "assert";
import { simulateRuntime } from "../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js";

function text(result) {
  return [
    ...(result?.errors || []).map(e => e.message + " " + (e.stack || "")),
    ...(result?.stackTraces || [])
  ].join(" ");
}

async function fails(name, files, entry, match, extra = {}) {
  const got = await simulateRuntime({ runtime: "browser", engine: "merkava", files, entry, ...extra });
  assert.equal(got.ok, false, name + " should fail");
  assert(match.test(text(got)), name + " mismatch: " + text(got));
}

await fails("module-child-syntax", {
  "app.js": "import './child.js';",
  "child.js": "export const nope = ;"
}, "app.js", /Unexpected|Syntax|token/i);

await fails("module-child-duplicate", {
  "app.js": "import './child.js';",
  "child.js": "let q=1; let q=2; export const ok = q;"
}, "app.js", /declared|Identifier|Syntax/i);

await fails("html-external-script", {
  "index.html": "<script src='bad.js'></script>",
  "bad.js": "let h=1; let h=2;"
}, "index.html", /declared|Identifier|Syntax/i);

const ok = await simulateRuntime({ runtime: "browser", engine: "merkava", entry: "index.html", files: {
  "index.html": "<script src='good.js'></script>",
  "good.js": "window.fromHtml = 5;"
} });
assert.equal(ok.ok, true);
console.log("B'H merkava module/html stress ok");
